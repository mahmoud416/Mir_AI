# MIR — IT Support Assistant Backend

> AI-powered IT helpdesk backend built with **FastAPI**, **Motor** (async MongoDB), and configurable AI providers (OpenAI, Gemini, Anthropic, or demo mode).

---

## Table of Contents
1. [Quick Start (Windows PowerShell)](#quick-start)
2. [Project Structure](#project-structure)
3. [API Reference](#api-reference)
4. [Configuration](#configuration)
5. [Feature Status](#feature-status)
6. [Running Tests](#running-tests)
7. [Importing a Dataset](#importing-a-dataset)
8. [SAP Integration](#sap-integration)

---

## Quick Start

> All commands use **Windows PowerShell** from the `backend/` directory.

### 1. Navigate to the backend folder

```powershell
cd C:\Users\mahmo\Pictures\Mir\backend
```

### 2. Create and activate a virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

> If PowerShell blocks script execution, run first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### 3. Install dependencies

```powershell
pip install -e ".[dev]"
```

### 4. Configure environment variables

```powershell
Copy-Item .env.example .env
notepad .env
```

Fill in at minimum:
- `MONGODB_URI` — your MongoDB Atlas connection string
- `AI_PROVIDER` and `AI_API_KEY` — or leave as `demo` to run without an AI key

### 5. Start the development server

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Open the API docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app factory and lifespan
│   ├── core/
│   │   ├── config.py              # Settings (pydantic-settings)
│   │   ├── logging.py             # Structured logging
│   │   └── security.py            # Admin token auth
│   ├── api/
│   │   └── routes/
│   │       ├── chat.py            # POST /api/v1/chat
│   │       ├── tickets.py         # /api/v1/tickets CRUD
│   │       ├── knowledge.py       # /api/v1/knowledge + import
│   │       └── health.py          # GET /health
│   ├── models/
│   │   └── documents.py           # MongoDB document Pydantic models
│   ├── schemas/
│   │   └── api.py                 # Request/response schemas
│   ├── services/
│   │   ├── chat_service.py        # Chat orchestration + AI
│   │   ├── ticket_service.py      # Ticket lifecycle
│   │   ├── knowledge_service.py   # KB read/write
│   │   └── dataset_import_service.py  # File ingestion
│   ├── repositories/
│   │   ├── conversation_repo.py   # MongoDB: conversations + messages
│   │   ├── ticket_repo.py         # MongoDB: tickets
│   │   └── knowledge_repo.py      # MongoDB: KB + dataset_records
│   ├── db/
│   │   └── database.py            # Motor client, indexes
│   └── integrations/
│       ├── ai_provider.py         # OpenAI / Gemini / Anthropic / Demo
│       └── sap_adapter.py         # SAP stub (not yet implemented)
├── tests/
│   ├── conftest.py
│   ├── test_health.py
│   ├── test_chat.py
│   ├── test_tickets.py
│   ├── test_import.py
│   └── test_ai_provider.py
├── .env.example
├── pyproject.toml
└── README.md
```

---

## API Reference

### Health

| Method | Endpoint  | Description              |
|--------|-----------|--------------------------|
| GET    | `/health` | Application health check |

### Chat

| Method | Endpoint                                      | Description                  |
|--------|-----------------------------------------------|------------------------------|
| POST   | `/api/v1/chat`                                | Send a message               |
| GET    | `/api/v1/conversations/{id}`                  | Get a conversation           |
| GET    | `/api/v1/conversations/{id}/messages`         | Get messages                 |

**Example — Send a message:**
```json
POST /api/v1/chat
{
  "message": "My Microsoft account password is expired.",
  "account_type": "work_school"
}
```

**Response:**
```json
{
  "conversation_id": "3f7a2c1d-...",
  "message": {
    "id": "9a1b...",
    "role": "assistant",
    "content": "Here are the steps to reset your work account password...",
    "timestamp": "2025-01-01T10:00:00Z"
  },
  "suggested_actions": [
    {
      "id": "escalate",
      "label": "Create a support ticket",
      "label_ar": "إنشاء تذكرة دعم",
      "type": "escalate"
    }
  ],
  "is_demo": true
}
```

### Tickets

| Method | Endpoint                      | Description           |
|--------|-------------------------------|-----------------------|
| POST   | `/api/v1/tickets`             | Create a ticket       |
| GET    | `/api/v1/tickets`             | List tickets          |
| GET    | `/api/v1/tickets/{id}`        | Get a ticket          |
| PATCH  | `/api/v1/tickets/{id}`        | Update status/priority|

### Knowledge Base

| Method | Endpoint                       | Auth Required         | Description          |
|--------|--------------------------------|-----------------------|----------------------|
| POST   | `/api/v1/knowledge/import`     | X-Admin-Token header  | Upload dataset file  |
| GET    | `/api/v1/knowledge`            | —                     | List KB records      |
| GET    | `/api/v1/knowledge/{id}`       | —                     | Get a KB record      |

---

## Configuration

| Variable         | Description                                         | Default         |
|------------------|-----------------------------------------------------|-----------------|
| `APP_ENV`        | `development` or `production`                       | `development`   |
| `MONGODB_URI`    | MongoDB Atlas connection string                     | *(required)*    |
| `MONGODB_DATABASE` | Database name                                     | `mir_db`        |
| `AI_PROVIDER`    | `openai`, `gemini`, `anthropic`, or `demo`          | `demo`          |
| `AI_API_KEY`     | API key for the selected provider                   | *(empty = demo)*|
| `CORS_ORIGINS`   | Comma-separated allowed frontend URLs               | `localhost:5173`|
| `ADMIN_TOKEN`    | Token for `X-Admin-Token` header (import endpoint)  | *(set a strong value)*|
| `SAP_BASE_URL`   | SAP base URL (leave blank until confirmed)          | *(empty)*       |

---

## Feature Status

| Feature                   | Status                          |
|---------------------------|---------------------------------|
| Chat (demo AI)            | ✅ Functional                   |
| Chat (OpenAI / Gemini / Anthropic) | ✅ Functional (needs key) |
| MongoDB persistence       | ✅ Functional (Atlas connected) |
| Ticket management         | ✅ Functional (mongodb_demo)    |
| Knowledge base CRUD       | ✅ Functional                   |
| Dataset import (JSONL/JSON/CSV) | ✅ Functional             |
| Arabic language support   | ✅ Functional                   |
| SAP integration           | 🔴 Not implemented (stub only)  |
| Real password reset       | 🔴 Not implemented (safety)     |

---

## Running Tests

```powershell
cd C:\Users\mahmo\Pictures\Mir\backend
.\.venv\Scripts\Activate.ps1
pytest -v
```

With coverage:
```powershell
pytest --cov=app --cov-report=term-missing
```

---

## Importing a Dataset

The JSONL file at `server/dataset_clean.jsonl` can be imported via the API.

### Using the Swagger UI
1. Open http://localhost:8000/docs
2. Navigate to **Knowledge Base → POST /api/v1/knowledge/import**
3. Click **Authorize** and enter `X-Admin-Token: mir-admin-dev-token`
4. Upload the file with `file_type=jsonl`

### Using PowerShell (curl equivalent)
```powershell
$token = "mir-admin-dev-token"
$filePath = "C:\Users\mahmo\Pictures\Mir\server\dataset_clean.jsonl"

Invoke-RestMethod `
  -Uri "http://localhost:8000/api/v1/knowledge/import" `
  -Method Post `
  -Headers @{ "X-Admin-Token" = $token } `
  -Form @{
    file = Get-Item $filePath
    file_type = "jsonl"
  }
```

---

## SAP Integration

The SAP adapter (`app/integrations/sap_adapter.py`) defines the interface contract but does **not** make real calls. Before enabling:

1. Confirm the SAP product and version (S/4HANA, BTP, Service Cloud, etc.)
2. Identify the available API type (OData v2/v4, REST, SOAP, RFC)
3. Confirm the authentication method (OAuth 2.0, Basic, X-CSRF, mTLS)
4. Obtain a sandbox environment URL and test credentials
5. Define the required service account permissions

Only after all five items are confirmed should the adapter be implemented.
