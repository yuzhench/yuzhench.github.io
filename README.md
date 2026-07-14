# Yuzhen Chen — Personal Website

Static site (plain HTML + CSS + a little JS). No build step.

## Preview locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages
```bash
git init && git add . && git commit -m "personal website"
git branch -M main
git remote add origin https://github.com/yuzhench/yuzhench.github.io.git
git push -u origin main
```
Repo must be named `yuzhench.github.io` → served at https://yuzhench.github.io

## Files to replace (currently gray placeholders)
| Path | What it should be |
|---|---|
| `images/avatar.jpg` | your profile photo (square, ≥400×400) |
| `images/pubs/*.jpg` | one thumbnail per paper (≈510×300, teaser figure) |
| `images/logos/*.png` | Harvard / UMich / ROAHM logos (square-ish) |
| `files/CV.pdf` | your CV |

## Text marked `TODO` in index.html
- exact title/department/advisor at Harvard
- Education degrees + years
- Experience entries + years
- Honors & Awards
- Services / Teaching
- News dates
