#!/usr/bin/env python3
"""Build a private Lexis IELTS article pack from locally owned PDFs.

The generated pack may contain full copyrighted passages, so it is written to
private/ by default. Do not publish the generated files to a public site.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

from pypdf import PdfReader


DEFAULT_PDFS = [
    f"/Users/jiangyanming/Desktop/雅思阅读/题4-20/题4-20/剑{i}真题.pdf"
    for i in range(4, 21)
]


PASSAGE_RE = re.compile(
    r"\bR\s*E\s*A\s*D\s*(?:I\s*)?N\s*G\s+P\s*A\s*S\s*S\s*A\s*G\s*E\s+([123I])\b",
    re.I,
)
QUESTION_RE = re.compile(
    r"\bQuestions?\s+\d+(?:\s*[–—-]\s*\d+)?\b|\bWrite your answers?\b",
    re.I,
)


def book_number(path: Path) -> int | None:
    name = path.name
    m = re.search(r"剑\s*20|剑20|IELTS\s*20|Test[1-4]", name, re.I)
    if m and "20" in m.group(0):
        return 20
    m = re.search(
        r"【\s*(\d{1,2})\s*】|剑\s*(\d{1,2})\s*真题|剑桥雅思真题\s*(\d{1,2})|IELTS\s*(\d{1,2})",
        name,
        re.I,
    )
    if not m:
        return None
    return int(next(g for g in m.groups() if g))


def test_number_from_filename(path: Path) -> int | None:
    m = re.search(r"Test\s*([1-4])", path.stem, re.I)
    return int(m.group(1)) if m else None


def page_texts(path: Path) -> list[str]:
    try:
        texts = page_texts_pdfjs(path)
        if sum(len(t) for t in texts) > 0:
            return texts
    except Exception as exc:
        print(f"pdfjs_failed={path.name}:{exc}", file=sys.stderr)

    try:
        reader = PdfReader(str(path))
        out = []
        for page in reader.pages:
            try:
                out.append(page.extract_text() or "")
            except Exception:
                out.append("")
        return out
    except Exception as exc:
        print(f"pypdf_failed={path.name}:{exc}", file=sys.stderr)
        return []


def page_texts_pdfjs(path: Path) -> list[str]:
    runtime_root = Path("/Users/jiangyanming/.cache/codex-runtimes/codex-primary-runtime/dependencies")
    node = runtime_root / "node/bin/node"
    if not node.exists():
        found = shutil.which("node")
        if not found:
            raise RuntimeError("node not found")
        node = Path(found)
    pdfjs_root = runtime_root / "node/node_modules/pdfjs-dist"
    if not pdfjs_root.exists():
        raise RuntimeError("pdfjs-dist not found")

    script = r"""
import { pathToFileURL } from 'url';
globalThis.console.warn = () => {};
const pdfPath = process.argv[2];
const pdfjsRoot = process.argv[3].replace(/\/$/, '');
const pdfjsLib = await import(pathToFileURL(pdfjsRoot + '/legacy/build/pdf.mjs').href);
const doc = await pdfjsLib.getDocument({
  url: pdfPath,
  disableWorker: true,
  cMapUrl: pdfjsRoot + '/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: pdfjsRoot + '/standard_fonts/',
  verbosity: pdfjsLib.VerbosityLevel.ERRORS
}).promise;
const pages = [];
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const tc = await page.getTextContent();
  pages.push(tc.items.map(item => item.str || '').join(' '));
}
process.stdout.write(JSON.stringify(pages));
"""
    proc = subprocess.run(
        [str(node), "--input-type=module", "-", str(path), str(pdfjs_root)],
        input=script,
        text=True,
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError((proc.stderr or proc.stdout).strip()[:500])
    return json.loads(proc.stdout or "[]")


def normalize_text(text: str) -> str:
    text = text.replace("\x00", " ").replace("\ufeff", " ")
    text = text.replace("�", " ")
    text = re.sub(r"[\u200b-\u200f]", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def parse_passage_no(value: str) -> int:
    return 1 if value.upper() == "I" else int(value)


def is_real_passage_heading(text: str, match: re.Match[str]) -> bool:
    window = text[match.start() : match.start() + 420]
    return bool(re.search(r"(?is)You\s+shou?ld\s+spend\s+about\s+20\s+minutes", window))


def clean_page_for_passage(text: str, passage_no: int, is_start: bool) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if is_start:
        m = next((x for x in PASSAGE_RE.finditer(text) if is_real_passage_heading(text, x)), None)
        if m:
            text = text[m.end() :]
    text = re.sub(r"(?i)\bTest\s+[1-4]\b", "\n", text)
    text = re.sub(r"(?i)\bReading\b", "\n", text)
    text = PASSAGE_RE.sub("\n", text)
    text = re.sub(
        r"(?is)You\s+should\s+spend\s+about\s+20\s+minutes\s+on\s+Q?\s*uestions?.{0,260}?(?:below|following pages?)\.?",
        "\n",
        text,
    )
    text = re.sub(r"(?i)\bwhich are based on Reading Passage\s+[123]\s+(?:below|on the following pages?)\.?", "\n", text)
    text = re.sub(r"(?m)^\s*\d{1,3}\s*$", "", text)
    return normalize_text(text)


def trim_question_tail(content: str) -> str:
    matches = list(QUESTION_RE.finditer(content))
    for match in matches:
        before = content[: match.start()]
        before_words = len(re.findall(r"[A-Za-z]+(?:['’-][A-Za-z]+)?", before))
        if before_words >= 430:
            return normalize_text(before)
    return normalize_text(content)


def guess_title(content: str, fallback: str) -> str:
    lines = [line.strip(" -–—:：") for line in content.splitlines() if line.strip()]
    bad = re.compile(r"^(A|B|C|D|E|F|G|H|I|J)\s*$|^Part\s+\d+$|^Section\s+\d+$", re.I)
    for line in lines[:10]:
        if bad.match(line):
            continue
        if len(line) < 4 or len(line) > 100:
            continue
        if re.search(r"\b(paragraph|answer sheet|boxes|choose|complete)\b", line, re.I):
            continue
        return line
    return fallback


def extract_articles(path: Path) -> tuple[list[dict], dict]:
    book = book_number(path)
    texts = page_texts(path)
    starts = []
    for idx, text in enumerate(texts):
        for m in PASSAGE_RE.finditer(text):
            if not is_real_passage_heading(text, m):
                continue
            starts.append((idx, parse_passage_no(m.group(1))))
            break

    explicit_test = test_number_from_filename(path)
    academic_starts = []
    test = explicit_test or 0
    for idx, passage in starts:
        if passage == 1 and not explicit_test:
            test += 1
        if explicit_test:
            test = explicit_test
        if 1 <= test <= 4:
            academic_starts.append((idx, test, passage))
        if not explicit_test and len([s for s in academic_starts if s[2] == 3]) >= 4:
            break

    articles = []
    for pos, (start_idx, test_no, passage_no) in enumerate(academic_starts):
        if explicit_test:
            end_idx = len(texts)
        elif pos + 1 < len(academic_starts):
            end_idx = academic_starts[pos + 1][0]
        else:
            end_idx = min(len(texts), start_idx + 5)

        parts = []
        for page_idx in range(start_idx, end_idx):
            cleaned = clean_page_for_passage(texts[page_idx], passage_no, page_idx == start_idx)
            if cleaned:
                parts.append(cleaned)
        content = trim_question_tail("\n\n".join(parts))
        word_count = len(re.findall(r"[A-Za-z]+(?:['’-][A-Za-z]+)?", content))
        if not book:
            source_book = "Cambridge IELTS Reading"
        else:
            source_book = f"Cambridge IELTS {book} Reading"
        fallback = f"Test {test_no} - Passage {passage_no}"
        title_guess = guess_title(content, fallback)
        title = f"Test {test_no} - Passage {passage_no}: {title_guess}"
        if word_count >= 250:
            articles.append(
                {
                    "id": f"ielts_{book or 'x'}_t{test_no}_p{passage_no}",
                    "book": source_book,
                    "title": title,
                    "content": content,
                    "source": path.name,
                    "createdAt": 1700000000000 + (book or 0) * 10000 + test_no * 100 + passage_no,
                    "updatedAt": 1700000000000 + (book or 0) * 10000 + test_no * 100 + passage_no,
                }
            )

    report = {
        "file": str(path),
        "book": book,
        "pages": len(texts),
        "textChars": sum(len(t) for t in texts),
        "passageMarkers": len(starts),
        "articles": len(articles),
        "status": "ok" if len(articles) >= (3 if explicit_test else 12) else "needs_ocr_or_manual_check",
    }
    return articles, report


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdfs", nargs="*", type=Path, help="PDF files to include")
    parser.add_argument("--out-dir", type=Path, default=Path("private"))
    parser.add_argument("--merge-pack", action="append", type=Path, default=[], help="Existing local pack JSON to merge")
    args = parser.parse_args()

    pdfs = args.pdfs or [Path(p) for p in DEFAULT_PDFS]
    args.out_dir.mkdir(parents=True, exist_ok=True)

    all_articles = []
    reports = []
    seen_ids = set()
    for pdf in pdfs:
        if not pdf.exists():
            reports.append({"file": str(pdf), "status": "missing"})
            continue
        articles, report = extract_articles(pdf)
        for article in articles:
            if article["id"] in seen_ids:
                continue
            seen_ids.add(article["id"])
            all_articles.append(article)
        reports.append(report)

    for merge_pack in args.merge_pack:
        if not merge_pack.exists():
            reports.append({"file": str(merge_pack), "status": "merge_pack_missing"})
            continue
        try:
            existing_pack = json.loads(merge_pack.read_text(encoding="utf-8"))
            merged = 0
            for article in existing_pack.get("articles", []):
                article_id = article.get("id")
                if not article_id or article_id in seen_ids:
                    continue
                seen_ids.add(article_id)
                all_articles.append(article)
                merged += 1
            reports.append({"file": str(merge_pack), "status": "merged", "articles": merged})
        except Exception as exc:
            reports.append({"file": str(merge_pack), "status": "merge_failed", "error": str(exc)})

    all_articles.sort(
        key=lambda a: (
            book_number(Path(a.get("source", ""))) or 0,
            a["createdAt"],
            a["title"],
        )
    )
    pack = {
        "type": "lexis_article_pack",
        "title": "剑桥雅思阅读合集（本地私用）",
        "version": 1,
        "generatedBy": "tools/make_ielts_pack.py",
        "articles": all_articles,
    }
    json_path = args.out_dir / "ielts-reading-article-pack.local.json"
    js_path = args.out_dir / "ielts-reading-article-pack.local.js"
    report_path = args.out_dir / "ielts-extraction-report.json"
    json_path.write_text(json.dumps(pack, ensure_ascii=False, indent=2), encoding="utf-8")
    js_path.write_text(
        "window.LEXIS_IELTS_ARTICLE_PACK = "
        + json.dumps(pack, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    report_path.write_text(json.dumps(reports, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"articles={len(all_articles)}")
    print(f"json={json_path}")
    print(f"js={js_path}")
    print(f"report={report_path}")
    missing = [r for r in reports if r.get("status") != "ok"]
    if missing:
        print("needs_attention=" + ",".join(Path(r["file"]).name for r in missing))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
