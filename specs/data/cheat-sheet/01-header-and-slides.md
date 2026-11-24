<!-- Part of data/liascript-cheat-sheet.md (see the index there). -->

## 1) Course Metadata (Header)

```lia
<!--
author:   Firstname Lastname
email:    user@example.org
version:  1.0.0
language: en
narrator: English Female
comment:  Short description of the course
-->
```

**Notes**

- `language` and `narrator` define TTS/voice output.
- `comment` may be used as an abstract or summary.

---

## 2) Structure: Headings & Sections

```lia
# Main Title (Course Title Page)
## Section
### Subsection
```

**Rules**

- Only one `#` heading per file (the course title).
- Use hierarchical structure logically; avoid “jumps” in heading levels.

---

### Additional Rule: Subheadings within a Slide

- Each `#`, `##` and `###` heading **always starts a new slide** — the heading depth is the slide hierarchy (a `###` is a sub-slide of the `##` above it).

- Use bare `###` only where a new (sub-)slide is wanted, e.g. the parts of a unit in single-file mode (`templates/session-material.yaml` → `heading_levels`).

- Subheadings from `####` down to `######` are only allowed if **embedded** inside:

  - an **HTML block** (`<div>…</div>` or a semantic wrapper such as `<section>…</section>`)
  - a **list** (`-`, `*`)
  - a **blockquote** (`>`)

- A “naked” `####`-or-deeper subheading outside such containers counts as a new slide/segment and is therefore **not allowed**.

**Allowed patterns:**

```lia
## Slide 1

### Bare subsection directly under the slide — no container needed

<div>
#### One level deeper — must be embedded
</div>
```

```lia
## Slide 2

### Bare subsection — fine on its own

<section>
#### Subsection embedded in a semantic <section> wrapper
</section>
```

```lia
## Slide 3

- List with content
  - #### Subheading inside a list
```

```lia
## Slide 4

> #### Subheading in a blockquote
```

**Not allowed (`####`-or-deeper outside of containers):**

```lia
## Slide 5

### Bare subsection — fine
#### Subheading without container   ❌
```

---
