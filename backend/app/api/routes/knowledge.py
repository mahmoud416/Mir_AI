"""
MIR Backend — Knowledge Base Routes
POST /api/v1/knowledge/import  (admin-protected)
GET  /api/v1/knowledge
GET  /api/v1/knowledge/{record_id}
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status

from app.core.security import require_admin
from app.schemas.api import ImportJobOut, KBListResponse, KBRecordOut
from app.services.dataset_import_service import DatasetImportService
from app.services.knowledge_service import KnowledgeService

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])
_kb_service = KnowledgeService()
_import_service = DatasetImportService()


import json

@router.post(
    "/import",
    response_model=ImportJobOut,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Import a dataset file (admin only)",
    description=(
        "Upload a JSONL, JSON, or CSV file to import into the dataset_records collection. "
        "Requires the `X-Admin-Token` header. "
        "Duplicate records (by content hash) are skipped automatically."
    ),
    dependencies=[Depends(require_admin)],
)
async def import_dataset(
    file: UploadFile = File(..., description="JSONL, JSON, or CSV dataset file"),
    file_type: str = Form(
        default="jsonl",
        description="File format: jsonl | json | csv",
    ),
    field_mapping: str | None = Form(
        default=None,
        description="Optional JSON string of field mappings, e.g. {'question': 'title_ar', 'answer': 'description_ar'}",
    ),
) -> ImportJobOut:
    content = await file.read()
    filename = file.filename or "upload"
    mapping: dict | None = None
    if field_mapping:
        try:
            mapping = json.loads(field_mapping)
        except Exception:
            pass
    return await _import_service.import_file(filename, content, file_type, mapping)


@router.get(
    "",
    response_model=KBListResponse,
    summary="List knowledge base records",
)
async def list_knowledge(
    category: str | None = Query(default=None),
    language: str | None = Query(default=None),
    is_verified: bool | None = Query(default=None),
    search: str | None = Query(default=None, description="Full-text search"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> KBListResponse:
    return await _kb_service.list_records(
        category=category,
        language=language,
        is_verified=is_verified,
        search=search,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{record_id}",
    response_model=KBRecordOut,
    summary="Get a knowledge base record by ID",
)
async def get_knowledge_record(record_id: str) -> KBRecordOut:
    return await _kb_service.get_record(record_id)
