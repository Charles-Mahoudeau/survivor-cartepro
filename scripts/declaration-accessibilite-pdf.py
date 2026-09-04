#!/usr/bin/env python3
"""Renders the accessibility declaration as print-ready HTML.

The PDF sent to the legal adviser is generated from
`docs/legal/declaration-accessibilite.md`, which stays the single source. Run
both steps after any change to the declaration:

    python3 scripts/declaration-accessibilite-pdf.py \\
        docs/legal/declaration-accessibilite.md /tmp/declaration.html
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \\
        --headless=new --disable-gpu --no-pdf-header-footer \\
        --print-to-pdf=docs/legal/declaration-accessibilite.pdf \\
        file:///tmp/declaration.html

Only the constructs the declaration actually uses are handled: headings,
blockquote, bullet and ordered lists with continuation lines, paragraphs,
horizontal rules, bold, inline code, markdown links and autolinks. A paragraph
whose every line is indented is an address: its line breaks are kept.
"""
import html
import io
import re
import sys


def inline(text: str) -> str:
    out = html.escape(text, quote=False)
    out = re.sub(r"`([^`]+)`", r"<code>\1</code>", out)
    out = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', out)
    out = re.sub(r"&lt;(https?://[^&\s]+)&gt;", r'<a href="\1">\1</a>', out)
    return out


BULLET = re.compile(r"^- (.*)$")
ORDERED = re.compile(r"^(\d+)\. (.*)$")
HEADING = re.compile(r"^(#{1,4}) (.*)$")


def convert(src: str) -> str:
    lines = src.split("\n")
    out: list[str] = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]

        if not line.strip():
            i += 1
            continue

        if line.strip() == "---":
            out.append("<hr>")
            i += 1
            continue

        m = HEADING.match(line)
        if m:
            level = len(m.group(1))
            out.append(f"<h{level}>{inline(m.group(2))}</h{level}>")
            i += 1
            continue

        if line.startswith("> "):
            block = []
            while i < n and lines[i].startswith(">"):
                block.append(lines[i][2:] if lines[i].startswith("> ") else "")
                i += 1
            out.append(f"<blockquote>{inline(' '.join(block).strip())}</blockquote>")
            continue

        if BULLET.match(line) or ORDERED.match(line):
            ordered = bool(ORDERED.match(line))
            tag = "ol" if ordered else "ul"
            items: list[str] = []
            while i < n:
                cur = lines[i]
                m_item = ORDERED.match(cur) if ordered else BULLET.match(cur)
                if m_item:
                    items.append(m_item.group(2) if ordered else m_item.group(1))
                    i += 1
                    continue
                # ligne de continuation : indentee et non vide
                if cur.strip() and cur[0] in " \t" and items:
                    items[-1] += " " + cur.strip()
                    i += 1
                    continue
                break
            body = "".join(f"<li>{inline(item)}</li>" for item in items)
            out.append(f"<{tag}>{body}</{tag}>")
            continue

        # paragraphe : jusqu'a une ligne vide ou un autre bloc
        block = []
        raw_block = []
        while i < n:
            cur = lines[i]
            if not cur.strip() or cur.strip() == "---":
                break
            if HEADING.match(cur) or BULLET.match(cur) or ORDERED.match(cur):
                break
            if cur.startswith(">"):
                break
            block.append(cur.strip())
            raw_block.append(cur)
            i += 1
        if block:
            # un bloc dont toutes les lignes sont indentees est une adresse :
            # ses retours a la ligne portent du sens, on les garde
            if all(raw[0] in " \t" for raw in raw_block):
                body = "<br>".join(inline(part) for part in block)
                out.append(f'<p class="adresse">{body}</p>')
            else:
                out.append(f"<p>{inline(' '.join(block))}</p>")

    return "\n".join(out)


CSS = """
@page { size: A4; margin: 20mm 18mm 18mm 18mm; }
* { box-sizing: border-box; }
body {
  font-family: "Marianne", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 10.5pt; line-height: 1.55; color: #1a1a2e; margin: 0;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  font-variant-ligatures: none;
}
h1 {
  font-size: 20pt; line-height: 1.2; margin: 0 0 4mm; color: #1b3a6b;
  border-bottom: 2px solid #1b3a6b; padding-bottom: 3mm;
}
h2 {
  font-size: 13pt; margin: 8mm 0 3mm; color: #1b3a6b;
  break-after: avoid; page-break-after: avoid;
}
h3 {
  font-size: 11pt; margin: 6mm 0 2mm; color: #1a1a2e;
  break-after: avoid; page-break-after: avoid;
}
p { margin: 0 0 3mm; text-align: justify; }
ul, ol { margin: 0 0 4mm; padding-left: 6mm; }
li { margin-bottom: 2mm; text-align: left; }
a { overflow-wrap: anywhere; }
p.adresse {
  margin: 2mm 0 3mm 4mm; text-align: left;
  break-before: avoid; page-break-before: avoid;
  break-inside: avoid; page-break-inside: avoid;
}
ul, ol { break-inside: auto; }
li { break-inside: avoid; page-break-inside: avoid; }
blockquote {
  margin: 0 0 6mm; padding: 3mm 4mm; background: #eef1f7;
  border-left: 3px solid #1b3a6b; font-size: 9.5pt; color: #33405c;
  text-align: left;
}
code {
  font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 9pt;
  background: #f0f0ee; padding: 0.5mm 1mm; border-radius: 2px;
}
a { color: #1b3a6b; }
strong { font-weight: 700; }
hr { border: 0; border-top: 1px solid #dde1ea; margin: 6mm 0; }
.marque {
  display: flex; align-items: center; gap: 3mm; margin-bottom: 6mm;
  padding-bottom: 4mm; border-bottom: 1px solid #dde1ea;
}
.tricolore { display: flex; height: 9mm; }
.tricolore span { display: block; width: 2mm; height: 9mm; }
.tricolore .bleu { background: #002395; }
.tricolore .blanc { background: #fff; border-top: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8; }
.tricolore .rouge { background: #ED2939; }
.marque .texte { font-size: 9pt; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: #1b3a6b; line-height: 1.25; }
.marque .sous { font-size: 7pt; font-weight: 400; letter-spacing: 0.14em;
  color: #6b7280; text-transform: uppercase; }
"""

ENTETE = """<div class="marque">
  <div class="tricolore"><span class="bleu"></span><span class="blanc"></span><span class="rouge"></span></div>
  <div>
    <div class="texte">République<br>Française</div>
    <div class="sous">Ministère du Job et Bonheur</div>
  </div>
</div>"""


def main() -> int:
    source, target = sys.argv[1], sys.argv[2]
    md = io.open(source, encoding="utf-8").read()
    page = (
        '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
        "<title>Déclaration d’accessibilité — Ticket Tout</title>"
        f"<style>{CSS}</style></head><body>{ENTETE}\n{convert(md)}</body></html>"
    )
    io.open(target, "w", encoding="utf-8").write(page)
    print(f"HTML écrit : {target} ({len(page)} octets)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
