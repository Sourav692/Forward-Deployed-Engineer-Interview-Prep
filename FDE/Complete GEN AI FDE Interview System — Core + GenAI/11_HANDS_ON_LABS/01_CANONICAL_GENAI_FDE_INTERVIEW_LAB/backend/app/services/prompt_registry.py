import json
from pathlib import Path
from backend.app.models.schemas import PromptMetadata

PROMPT_DIR = Path(__file__).resolve().parents[2] / "prompts"


class PromptNotFound(ValueError):
    pass


class PromptRegistry:
    def __init__(self, prompt_dir: Path = PROMPT_DIR):
        self.prompt_dir = prompt_dir

    def load(self, name: str, version: str = "v1") -> dict:
        path = self.prompt_dir / f"{name}.{version}.json"
        if not path.exists():
            raise PromptNotFound(f"Prompt {name}:{version} not found")
        return json.loads(path.read_text(encoding="utf-8"))

    def metadata(self, name: str, version: str = "v1") -> PromptMetadata:
        payload = self.load(name, version)
        return PromptMetadata(**payload["metadata"])

    def list_prompts(self) -> list[str]:
        return sorted(path.stem for path in self.prompt_dir.glob("*.json"))
