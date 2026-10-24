"""
MIR Backend — Logging Configuration
Structured JSON logging for production; pretty-print for development.
"""

from __future__ import annotations

import logging
import sys

from app.core.config import get_settings


def configure_logging() -> None:
    settings = get_settings()
    level = getattr(logging, settings.log_level, logging.INFO)

    # Remove existing handlers to avoid duplication during hot-reload
    root = logging.getLogger()
    root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)

    if settings.app_env == "production":
        fmt = '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":%(message)s}'
    else:
        fmt = "%(asctime)s [%(levelname)-8s] %(name)s: %(message)s"

    handler.setFormatter(logging.Formatter(fmt))
    root.addHandler(handler)
    root.setLevel(level)

    # Suppress noisy third-party loggers
    for noisy in ("motor", "pymongo", "httpx", "httpcore"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
