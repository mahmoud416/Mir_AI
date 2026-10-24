"""
MIR Backend — Dataset Import Service Unit Tests
"""

from __future__ import annotations

import json
import pytest
from unittest.mock import AsyncMock, patch


@pytest.fixture
def import_service():
    with patch("app.services.dataset_import_service.KnowledgeRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.create_import_job = AsyncMock()
        repo_instance.update_import_job = AsyncMock()
        repo_instance.record_exists = AsyncMock(return_value=False)
        repo_instance.get_existing_hashes = AsyncMock(return_value=set())
        repo_instance.insert_dataset_record = AsyncMock()
        repo_instance.insert_dataset_records_batch = AsyncMock(side_effect=lambda docs: len(docs))

        from app.services.dataset_import_service import DatasetImportService
        svc = DatasetImportService()
        svc._repo = repo_instance
        yield svc, repo_instance


@pytest.mark.asyncio
async def test_import_jsonl_basic(import_service):
    svc, repo = import_service
    content = b'{"question": "How to reset password?", "answer": "Go to account.live.com"}\n'
    result = await svc.import_file("test.jsonl", content, "jsonl")
    assert result.imported == 1
    assert result.failed == 0
    assert result.skipped == 0


@pytest.mark.asyncio
async def test_import_jsonl_dedup(import_service):
    svc, repo = import_service
    repo.get_existing_hashes = AsyncMock(side_effect=lambda hashes: set(hashes))
    content = b'{"question": "How to reset password?", "answer": "Go to account.live.com"}\n'
    result = await svc.import_file("test.jsonl", content, "jsonl")
    assert result.skipped == 1
    assert result.imported == 0


@pytest.mark.asyncio
async def test_import_malformed_jsonl(import_service):
    svc, repo = import_service
    content = b'{"question": "ok", "answer": "yes"}\n{bad json}\n'
    result = await svc.import_file("test.jsonl", content, "jsonl")
    assert result.imported == 1  # first line ok


@pytest.mark.asyncio
async def test_import_missing_fields(import_service):
    svc, repo = import_service
    content = b'{"irrelevant": "field"}\n'
    result = await svc.import_file("test.jsonl", content, "jsonl")
    assert result.failed == 1
    assert result.imported == 0


@pytest.mark.asyncio
async def test_import_json_array(import_service):
    svc, repo = import_service
    data = [
        {"question": "MFA not working", "answer": "Use backup code"},
        {"question": "Account locked", "answer": "Contact IT admin"},
    ]
    content = json.dumps(data).encode()
    result = await svc.import_file("test.json", content, "json")
    assert result.imported == 2


@pytest.mark.asyncio
async def test_import_csv(import_service):
    svc, repo = import_service
    content = b"question,answer,category\nHow to unlock?,Contact admin,account\n"
    result = await svc.import_file("test.csv", content, "csv")
    assert result.imported == 1
