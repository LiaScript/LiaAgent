<!-- Part of data/liascript-cheat-sheet.md (see the index there). -->

## 3) Text, Lists, Quotes, Alerts & Citations

```lia
Normal text with **bold** and *italic*.

- List item 1
- List item 2

> Quote / Key takeaway
```

**Tip:** Use short paragraphs and learner-friendly phrasing.

---

### Alerts

LiaScript supports GitHub/GitLab-style alert blocks. Alerts are written as blockquotes whose first line contains an alert marker.

```lia
> [!NOTE]
> Useful background information or a neutral hint.

> [!TIP]
> Practical advice or a helpful shortcut.

> [!IMPORTANT]
> Information that learners must not miss.

> [!WARNING]
> A warning about possible mistakes or risks.

> [!CAUTION]
> Strong caution about negative consequences.
```

**Supported alert types:**

- `NOTE`
- `TIP`
- `IMPORTANT`
- `WARNING`
- `CAUTION`

**Custom titles are allowed** by adding text after the alert type:

```lia
> [!NOTE] Keep this in mind
> This alert uses a custom title.
```

An emoji or icon in the custom title can be used to visually override or emphasize the default alert icon:

```lia
> [!WARNING] ⚠️ Proceed with caution
> This action cannot be undone.
```

**Best practices**

- Use alerts sparingly.
- Prefer `NOTE` for neutral explanations.
- Use `TIP` for practical advice.
- Use `IMPORTANT`, `WARNING`, and `CAUTION` only when the distinction matters.
- Alerts are blockquotes, so every line of the alert should start with `>`.

---

### Citations

LiaScript citations are also written as blockquotes. A citation consists of a quote followed by a separate citation line starting with `--`.

```lia
> “Live as if you were to die tomorrow.
> Learn as if you were to live forever.”
>
> -- Mahatma Gandhi
```

The line beginning with `--` is interpreted as the citation/source line.

**Pattern:**

```lia
> Quoted or referenced text.
>
> -- Author, source, year, or reference
```

**Examples:**

```lia
> “The medium is the message.”
>
> -- Marshall McLuhan
```

```lia
> Historical sources should always be interpreted in their political,
> social, and cultural context.
>
> -- Course note, Source Analysis
```

**Best practices**

- Keep citations short and readable.
- Use the `--` line only for the source or attribution.
- Leave an empty blockquote line `>` between the quote and the citation.
- Do not use citations as a replacement for bibliographies or full references.
- For long sources, combine a short citation block with a separate reference list.

---
