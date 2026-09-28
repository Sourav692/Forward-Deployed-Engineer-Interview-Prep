import json
import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(message)s",
        stream=sys.stdout,
    )


def log_event(event_name: str, **fields) -> None:
    safe_fields = {key: value for key, value in fields.items() if key not in {"raw_question", "raw_answer"}}
    logging.getLogger("genai_fde_lab").info(json.dumps({"event": event_name, **safe_fields}, sort_keys=True))
