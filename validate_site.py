from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent


class SiteAudit(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.references: list[tuple[str, str]] = []
        self.images = 0
        self.images_without_alt: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"] or "")
        for attribute in ("href", "src"):
            if values.get(attribute):
                self.references.append((attribute, values[attribute] or ""))
        if tag == "img":
            self.images += 1
            if "alt" not in values:
                self.images_without_alt.append(values.get("src", "unknown image") or "unknown image")


def main() -> None:
    html_path = ROOT / "index.html"
    html = html_path.read_text(encoding="utf-8")
    audit = SiteAudit()
    audit.feed(html)

    errors: list[str] = []
    duplicate_ids = sorted({item for item in audit.ids if audit.ids.count(item) > 1})
    if duplicate_ids:
        errors.append(f"Duplicate IDs: {', '.join(duplicate_ids)}")

    known_ids = set(audit.ids)
    for attribute, reference in audit.references:
        if reference.startswith("#"):
            if reference != "#" and reference[1:] not in known_ids:
                errors.append(f"Missing fragment target: {reference}")
            continue

        parsed = urlparse(reference)
        if parsed.scheme or reference.startswith("//"):
            continue
        local_path = ROOT / parsed.path
        if not local_path.exists():
            errors.append(f"Missing local {attribute}: {reference}")

    if audit.images_without_alt:
        errors.append(f"Images missing alt text: {', '.join(audit.images_without_alt)}")
    if "TODO" in html or "Lorem ipsum" in html:
        errors.append("Placeholder content remains in index.html")

    required_files = ["styles.css", "script.js", "robots.txt", "sitemap.xml", ".nojekyll"]
    for filename in required_files:
        if not (ROOT / filename).exists():
            errors.append(f"Missing required file: {filename}")

    if errors:
        raise SystemExit("\n".join(f"ERROR: {error}" for error in errors))

    print(
        f"Site audit passed: {len(known_ids)} unique IDs, "
        f"{len(audit.references)} references, {audit.images} accessible images."
    )


if __name__ == "__main__":
    main()
