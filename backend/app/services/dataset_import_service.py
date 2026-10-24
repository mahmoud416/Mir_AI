"""
MIR Backend — Dataset Import Service
Ingests JSONL, JSON array, and CSV files into the dataset_records collection.
Prevents duplicates via SHA-256 content hash.
"""

from __future__ import annotations

import csv
import hashlib
import io
import json
import logging
import uuid
from datetime import UTC, datetime
from typing import Any

from app.models.documents import DatasetRecord, ImportJobDocument, ImportJobStatus
from app.repositories.knowledge_repo import KnowledgeRepository
from app.schemas.api import ImportJobOut

logger = logging.getLogger(__name__)

# Expected fields in a dataset record with extensive aliases
_RECORD_ID_ALIASES = ("ticket_id", "record_id", "id", "ticket_number", "id_str")
_QUESTION_ALIASES = (
    "question", "q", "query", "title_ar", "title", "subject", "problem",
    "issue", "summary", "العنوان", "السؤال", "القضية", "input"
)
_ANSWER_ALIASES = (
    "answer", "a", "response", "solution", "resolution", "description_ar",
    "description", "details", "body", "الحل", "الإجابة", "الوصف", "output"
)
_CATEGORY_ALIASES = ("category_path", "category_level_1", "category", "type", "topic", "الفئة")
_LANGUAGE_ALIASES = ("dialect", "language", "lang", "اللغة")


def _content_hash(question: str, answer: str, record_id: str = "") -> str:
    normalized = f"{record_id.strip()}|{question.strip().lower()}|{answer.strip().lower()}"
    return hashlib.sha256(normalized.encode()).hexdigest()


def _extract_field(raw: dict[str, Any], aliases: tuple[str, ...], custom_mapping: dict[str, str] | None = None, field_key: str = "") -> str:
    if custom_mapping and field_key in custom_mapping:
        mapped_key = custom_mapping[field_key]
        if mapped_key in raw and raw[mapped_key] is not None:
            return str(raw[mapped_key]).strip()

    for alias in aliases:
        if alias in raw and raw[alias] is not None:
            val = str(raw[alias]).strip()
            if val:
                return val
    return ""


def _normalize_record(
    raw: dict[str, Any],
    custom_mapping: dict[str, str] | None = None,
) -> tuple[str, str, str, str, str, str, list[str]] | None:
    """
    Extract (record_id, question, answer, category, language, record_type, tags) from a raw dict.
    Returns None if neither question nor answer can be identified.
    """
    record_id = _extract_field(raw, _RECORD_ID_ALIASES, custom_mapping, "record_id")
    question = _extract_field(raw, _QUESTION_ALIASES, custom_mapping, "question")
    answer = _extract_field(raw, _ANSWER_ALIASES, custom_mapping, "answer")

    # If only one is present, handle gracefully
    if not question and not answer:
        return None
    if not question:
        question = answer[:80]
    if not answer:
        answer = question

    category = _extract_field(raw, _CATEGORY_ALIASES, custom_mapping, "category") or "general"
    language = _extract_field(raw, _LANGUAGE_ALIASES, custom_mapping, "language")
    if not language:
        # Detect Arabic
        full_text = f"{question} {answer}"
        ar_count = sum(1 for c in full_text if "\u0600" <= c <= "\u06ff")
        language = "ar" if ar_count > len(full_text) * 0.1 else "en"

    is_qa = any(k in raw for k in ("answer", "solution", "resolution", "response", "الحل", "الإجابة"))
    record_type = "qa" if is_qa else "ticket"

    tags: list[str] = []
    if isinstance(raw.get("tags"), list):
        tags.extend(str(t) for t in raw["tags"] if t)
    elif isinstance(raw.get("labels_json"), dict) and isinstance(raw["labels_json"].get("tags"), list):
        tags.extend(str(t) for t in raw["labels_json"]["tags"] if t)

    return record_id, question, answer, category, language, record_type, tags


class DatasetImportService:

    def __init__(self) -> None:
        self._repo = KnowledgeRepository()

    async def import_file(
        self,
        filename: str,
        content: bytes,
        file_type: str,
        field_mapping: dict[str, str] | None = None,
    ) -> ImportJobOut:
        """
        Import a dataset file and return the import job summary.
        file_type: 'jsonl' | 'json' | 'csv'
        """
        job = ImportJobDocument(
            id=str(uuid.uuid4()),
            filename=filename,
            file_type=file_type,
            status=ImportJobStatus.running,
        )
        await self._repo.create_import_job(job)
        logger.info("Import job started: id=%s file=%s type=%s", job.id, filename, file_type)

        try:
            records = self._parse_file(content, file_type)
            job.total = len(records)

            # Process in batches of 100 for high performance
            batch_size = 100
            for i in range(0, len(records), batch_size):
                chunk = records[i:i + batch_size]
                candidates: list[DatasetRecord] = []
                hashes: list[str] = []

                for raw in chunk:
                    normalized = _normalize_record(raw, field_mapping)
                    if normalized is None:
                        job.failed += 1
                        if len(job.errors) < 50:
                            job.errors.append(f"Missing question/answer fields: {list(raw.keys())[:5]}")
                        continue

                    rec_id, q, a, cat, lang, r_type, tags = normalized
                    chash = _content_hash(q, a, rec_id)
                    hashes.append(chash)
                    candidates.append(DatasetRecord(
                        id=str(uuid.uuid4()),
                        import_job_id=job.id,
                        content_hash=chash,
                        record_id=rec_id or None,
                        record_type=r_type,
                        question=q,
                        answer=a,
                        category=cat,
                        language=lang,
                        tags=tags,
                        raw=raw,
                    ))

                if candidates:
                    existing = await self._repo.get_existing_hashes(hashes)
                    to_insert = []
                    seen_in_batch = set()
                    for cand in candidates:
                        if cand.content_hash in existing or cand.content_hash in seen_in_batch:
                            job.skipped += 1
                        else:
                            seen_in_batch.add(cand.content_hash)
                            to_insert.append(cand)

                    if to_insert:
                        try:
                            count = await self._repo.insert_dataset_records_batch(to_insert)
                            job.imported += count
                        except Exception as exc:
                            job.failed += len(to_insert)
                            if len(job.errors) < 50:
                                job.errors.append(f"Batch insert error: {exc}")

            job.status = ImportJobStatus.completed
            job.completed_at = datetime.now(UTC)

        except Exception as exc:
            logger.error("Import job failed: id=%s error=%s", job.id, exc, exc_info=True)
            job.status = ImportJobStatus.failed
            job.errors.append(str(exc))

        finally:
            await self._repo.update_import_job(
                job.id,
                {
                    "status": job.status.value,
                    "total": job.total,
                    "imported": job.imported,
                    "skipped": job.skipped,
                    "failed": job.failed,
                    "errors": job.errors[-50:],  # cap errors stored
                    "completed_at": job.completed_at,
                },
            )

        logger.info(
            "Import job done: id=%s imported=%d skipped=%d failed=%d",
            job.id, job.imported, job.skipped, job.failed,
        )
        return self._job_to_out(job)

    def _parse_file(self, content: bytes, file_type: str) -> list[dict[str, Any]]:
        text = content.decode("utf-8-sig", errors="replace")

        if file_type == "jsonl":
            records = []
            for line in text.splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError as exc:
                    logger.warning("Skipping malformed JSONL line: %s", exc)
            return records

        if file_type == "json":
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return parsed
            if isinstance(parsed, dict):
                # Try common wrapper keys
                for key in ("data", "records", "items", "results", "questions", "tickets"):
                    if key in parsed and isinstance(parsed[key], list):
                        return parsed[key]
                return [parsed]
            raise ValueError("JSON file must be an array or object with a known wrapper key.")

        if file_type == "csv":
            reader = csv.DictReader(io.StringIO(text))
            return [row for row in reader]

        raise ValueError(f"Unsupported file type: {file_type}")

    async def _process_record(
        self,
        job: ImportJobDocument,
        raw: dict[str, Any],
        custom_mapping: dict[str, str] | None = None,
    ) -> None:
        normalized = _normalize_record(raw, custom_mapping)
        if normalized is None:
            job.failed += 1
            job.errors.append(
                f"Missing question/answer fields in record: {list(raw.keys())[:5]}"
            )
            return

        record_id, question, answer, category, language, record_type, tags = normalized
        chash = _content_hash(question, answer, record_id)

        try:
            if await self._repo.record_exists(chash):
                job.skipped += 1
                return

            record = DatasetRecord(
                id=str(uuid.uuid4()),
                import_job_id=job.id,
                content_hash=chash,
                record_id=record_id or None,
                record_type=record_type,
                question=question,
                answer=answer,
                category=category,
                language=language,
                tags=tags,
                raw=raw,
            )
            await self._repo.insert_dataset_record(record)
            job.imported += 1

        except Exception as exc:
            job.failed += 1
            job.errors.append(str(exc))
            logger.warning("Failed to insert record: %s", exc)

    @staticmethod
    def _job_to_out(job: ImportJobDocument) -> ImportJobOut:
        return ImportJobOut(
            id=job.id,
            filename=job.filename,
            file_type=job.file_type,
            status=job.status.value,
            total=job.total,
            imported=job.imported,
            skipped=job.skipped,
            failed=job.failed,
            errors=job.errors,
            created_at=job.created_at,
            updated_at=job.updated_at,
            completed_at=job.completed_at,
        )
