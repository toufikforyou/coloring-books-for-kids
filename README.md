<div align="center">

# 🖍️ Coloring Books for Kids

**Type a theme and a child's name, and get a printable coloring book made just for them.**

"Magical forest animals, for Lily": a personal cover with her name, then up to ten pages of simple
line drawings, downloaded as an A4 PDF that's ready to print.

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](#how-its-built)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](#how-its-built)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](#run-it-locally)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20%2B%20Imagen-4285F4?logo=googlegemini&logoColor=white)](#how-it-works)

</div>

---

## Why it's fun

Store-bought coloring books are about someone else's favourite things. Kids light up when the book is
about *their* idea, a dinosaur birthday party or a space trip with their cat, and when their own name is on the cover.

This app makes that book on the spot: thick, clean black outlines with no colour or shading, just the way
coloring pages should be. There's also a friendly chatbot alongside it that kids can talk to while the pages are drawn.

## How it works

1. **Choose a theme**, for example *magical forest animals*.
2. **Add the child's name**, for example *Lily*.
3. **Pick how many pages,** from 1 to 10.
4. **Generate.** The app plans a cover and a scene for every page, then draws each one.
5. **Download the PDF:** one image per A4 page, with margins, so it prints cleanly at home.

Under the hood, generation happens in two steps:

```text
theme + name + page count
        │
        ▼
Gemini 2.5 Flash ──▶ a cover prompt (with the child's name) + one prompt per page, as structured JSON
        │
        ▼
Imagen 4 ──────────▶ a coloring-page image for the cover and each page
        │
        ▼
jsPDF ─────────────▶ <name>_<theme>_coloring_book.pdf
```

**The chatbot** runs on Gemini 2.5 Flash with instructions to be friendly, patient and encouraging, and to use
simple words a child understands.

## Run it locally

You'll need Node.js 18+ and a [Gemini API key](https://aistudio.google.com/apikey) with access to Imagen.

```bash
git clone https://github.com/toufikforyou/coloring-books-for-kids.git
cd coloring-books-for-kids
npm install
```

Create a file called `.env.local` in the project folder:

```env
GEMINI_API_KEY=your-key-here
```

Then start it:

```bash
npm run dev
```

> **Keep your key private.** Vite builds `GEMINI_API_KEY` into the JavaScript that runs in the browser.
> That's fine on your own machine, but don't deploy this build to a public site with your real key.
> For a public version, move the Gemini calls behind a small server so the key never reaches the browser.
> Image generation with Imagen is billed by Google per image.

## How it's built

| | |
|---|---|
| **UI** | React 19, TypeScript, Tailwind CSS (via CDN) |
| **Build** | Vite 6 |
| **AI** | `@google/genai`: Gemini 2.5 Flash for prompts and chat, Imagen 4 for the drawings |
| **PDF** | jsPDF |

```text
App.tsx                           layout: generator and chatbot
components/
├── ColoringBookGenerator.tsx     the form, the preview grid and the PDF download
└── ChatBot.tsx                   the kid-friendly chat
services/geminiService.ts         prompt planning, image generation, chat session
```

## Ideas for later

- A "make it simpler" option for younger kids, with thicker lines and bigger shapes.
- Print two pages per sheet to save paper.
- A small backend, so the app can go online without exposing an API key.

## Author

Built by **MH TOUFIK** · [@toufikforyou](https://github.com/toufikforyou) · [toufikforyou.dev](https://www.toufikforyou.dev)
