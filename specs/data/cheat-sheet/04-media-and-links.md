<!-- Part of data/liascript-cheat-sheet.md (see the index there). -->

## 5) Media: Images, Audio, Video, oEmbed

Multimedia links can be included locally (relative paths) or externally (URLs).

```lia
![Alt text](assets/img/pic.jpg "Optional image caption")

?[Audio / Link text](assets/audio/intro.mp3 "Optional audio caption")

!?[Video / Link text](https://www.youtube.com/watch?v=dQw4w9WgXcQ "Optional video caption")

??[oEmbed / Link text](https://example.org/resource "Optional oEmbed caption")
```

**Encode link targets.** LiaScript ends a link or image target at the first
`(` — also balanced parentheses, which CommonMark allows — and a bare URL keeps
its full text but gets a cut-off address. In every link and image target
percent-encode `(` as `%28`, `)` as `%29` and spaces as `%20`, and write a bare
URL as `[label](encoded URL)`:

```lia
![A leaf with jagged edges](https://commons.wikimedia.org/wiki/Special:FilePath/Leaf_%28example%29.jpg?width=330)
```

**Image size.** A style comment directly after the image (same line) sets its
display size; it also works inside quiz options. Images that are answer options
of one question get a height limit so the question and all options fit one
screen of the target device; a large page photo may get one too:

```lia
Which picture shows a ripe fruit?

- [( )] ![Picture 1: …](https://example.org/a.jpg)<!-- style="max-height: 30vh" -->
- [(X)] ![Picture 2: …](https://example.org/b.jpg)<!-- style="max-height: 30vh" -->

![A wide landscape photo](https://example.org/c.jpg)<!-- style="width: 30%" -->
```

Request a matching file size from the collection, too: Wikimedia Commons
serves only standard thumbnail widths (e.g. `?width=330` for answer options and
small pictures, `?width=500` for page photos); other widths are rounded up to a
much larger file or rejected.

A `vh` limit does not guarantee the fit: the page header, the introduction and
the question do not shrink with the window, and image-only options stand one
below the other. Whether a question fits is known only from a measurement at the
learners' window size (the check script's viewport report) or from a look at the
learners' device (`data/chat-checks.md` → Say how you checked).

**Accessibility (A11y)**

- Meaningful alt text and descriptive filenames.
- For external videos: provide a brief summary.

---

**Galleries** can be created by adding multiple media elements in sequence:

```lia
![Alt text](assets/img/pic.jpg "Optional image caption")
?[Audio / Link text](assets/audio/intro.mp3 "Optional audio caption")
!?[Video / Link text](https://www.youtube.com/watch?v=dQw4w9WgXcQ "Optional video caption")
??[oEmbed / Link text](https://example.org/resource "Optional oEmbed caption")
```

---


### Link targets

In every Markdown link or image target — chat, material,
  and journal fields such as `__File:__`, `__Page:__`, `__Candidates:__` —
  percent-encode `(` as `%28`, `)` as `%29` and spaces as `%20`; write a bare
  URL as `[label](encoded URL)`. LiaScript cuts a target at the first
  unencoded `(` (file names from photo collections often contain one), and the
  chat cannot replace a sent message with a broken image.
