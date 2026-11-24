<!-- Part of data/liascript-cheat-sheet.md (see the index there). -->

## 14) Audio-Supported Sections

The animation pattern `{{|>}}` creates a play button. When clicked, the section below is read aloud via TTS.

```lia
    {{|>}}
This section will be read aloud when the play button is clicked.
```

**Note:** The `narrator` in the header defines the voice for speech output; without it LiaScript reads with a default English voice, whatever `language:` says. Embedded snippets (e.g. a chat message with `{{|>}}`) need their own header comment with `narrator:` and `language:`. The narrator can be overridden per section:

```lia
...

## Section 3
<!--
narrator: English UK Female
-->

    --{{1}}--
I will be read aloud in English during the first animation step.

    {{|> Russian Female 1-2}}
This section will be read in Russian when the play button is clicked, visible only between animation steps 1 and 2.
```

---
