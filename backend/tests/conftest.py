"""
MIR Backend — Test Configuration
Shared fixtures and pytest configuration.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.fixture(scope="session")
def app():
    """Create the FastAPI app with MongoDB mocked out."""
    db = _build_mock_db()
    with patch("app.db.database.connect_db", new_callable=AsyncMock), \
         patch("app.db.database.disconnect_db", new_callable=AsyncMock), \
         patch("app.db.database._db", db), \
         patch("app.db.database.get_db", return_value=db), \
         patch("app.db.database.get_db_or_none", return_value=db):
        from app.main import app as _app
        yield _app


@pytest.fixture(scope="session")
def client(app):
    """Synchronous test client."""
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


def _build_mock_db():
    db = MagicMock()
    for col in ("conversations", "messages", "tickets", "knowledge_base",
                 "dataset_records", "import_jobs"):
        col_mock = MagicMock()
        col_mock.insert_one = AsyncMock(return_value=MagicMock(inserted_id="abc"))
        col_mock.find_one = AsyncMock(return_value=None)
        col_mock.update_one = AsyncMock()
        col_mock.count_documents = AsyncMock(return_value=0)
        col_mock.find = MagicMock(return_value=_async_cursor([]))
        col_mock.find_one_and_update = AsyncMock(return_value=None)
        setattr(db, col, col_mock)
    return db


@pytest.fixture
def mock_db():
    """Return a MagicMock that mimics AsyncIOMotorDatabase."""
    return _build_mock_db()


def _async_cursor(items):
    """Create an async iterable mock."""
    class _Cursor:
        def __init__(self):
            self._items = items

        def sort(self, *args, **kwargs):
            return self

        def skip(self, n):
            return self

        def limit(self, n):
            return self

        def __aiter__(self):
            return self._aiter()

        async def _aiter(self):
            for item in self._items:
                yield item

    return _Cursor()
