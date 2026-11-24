<!-- Part of data/liascript-cheat-sheet.md (see the index there). -->

## 10) Quizzes & Interaction

**Single Choice**

```lia
Who composed the 9th Symphony?

- [( )] Mozart
- [(X)] __Beethoven__
- [( )] Haydn
```

**Multiple Choice**

```lia
Select all Baroque composers.

- [[X]] Bach
- [[X]] Handel
- [[ ]] Debussy
```

**Matrix Quiz (graded, for matching tasks)**

```lia
Which article belongs to the word?

- [[der] [die] [das]]
- [ ( )  (X)  ( ) ]  Frau
- [ (X)  ( )  ( ) ]  Mann
- [ ( )  ( )  (X) ]  Kind
```

- The first line holds the column labels; each row starts with `(` (one answer per row) or `[` (several answers per row) and ends with the row label.
- This is a **quiz** with a solution. The matrix under Surveys (10b) looks similar but has no solution — never use it for a task with a right answer.

**Text Quiz**

```lia
Composer of the 9th:

[[Beethoven]]
```

**Open Question**

```lia
?[Briefly explain: Why was the Marseillaise politically significant?]
```

**Tips**

- One question = one learning goal.
- Optional feedback (explanation after the answer).

**Quizzes for young learners / self-checks**

Pick the pattern by the didactics. **Hint instead of solution** (no automatic solution): no `data-max-trials`.

```lia
Which one is right?

<!-- data-hint-button="1" data-solution-button="false" -->
- [( )] option A
- [(X)] option B
[[?]] a hint in plain words
```

**Solution after n tries** (the didactics allow it): `data-max-trials` plus a feedback line for the shown solution.

```lia
Which one is right?

<!-- data-hint-button="1" data-max-trials="2" data-solution-button="false" data-text-resolved="Here is the solution – look at it again." -->
- [( )] option A
- [(X)] option B
[[?]] a hint in plain words
```

- **The comment goes directly above the first answer line, not above the question.** An attribute comment belongs to the block that follows it; above the question it sets attributes on the question paragraph and the quiz ignores it. For a gap text it goes directly above the paragraph with the gaps.
- Hints are their own lines after the options (`[[?]] …` or `- [[?]] …`), not indented under an option.
- `data-hint-button="1"`: hint button after the 1st wrong try; `data-max-trials="2"`: the solution is shown automatically after the 2nd wrong try.
- `data-solution-button="false"` hides the "show solution" button. **Without it the button is visible from the start**, also when `data-max-trials` is set.
- Free-text tasks: always `data-solution-button="false"`.
- Read answer options aloud with inline playback on the option (`{|>}{option text}`) instead of repeating them in the question text. Hint texts the same way where the target group needs read-aloud: `- [[?]] {|>}{Hint text}` — the play button appears when the hint is shown.
- Every option has its own text (two equal options make the quiz unsolvable); an option that waits for an image carries a neutral word ("picture 1"), never the answer.
- **No surface cues:** only understanding may find the answer. Options of one question are about equally long (the correct one never clearly the longest), built the same way (same subject, same grammatical form, the same first word where the others share one), and the correct one changes its position from question to question. Gap cards carry no article, case ending or capital letter that tells their gap — the article stays in the sentence. A sentence with gaps is not also written out as its own line on the page. `check-material.mjs` reports what it can measure ("Answer patterns").
- **No matrix quiz in practice or self-check for young learners:** after a wrong check the matrix marks every row red, so the child cannot see which row is wrong. Use one single-choice question per row instead. Elsewhere: no table or matrix quiz wider than 3 short columns; on narrow screens prefer several single-choice questions.
- **Feedback lines in the learners' words — required for young learners.** The player's default lines ("The correct answer has not been given yet") are not written for children. Define them once as header macros and set them on every quiz (since LiaScript 2.0: `data-text-solved`, `data-text-failed`, `data-text-resolved` — inline Markdown or a single emoji; an empty value hides the line):

  ```lia
  <!--
  @ok: Right! ⭐
  @notyet: Not quite yet. Tap the light bulb 💡.
  -->
  ```

  (in the course language) and `<!-- data-text-solved="@ok" data-text-failed="@notyet" … -->` above the first option. A "light bulb" in such a line only where the quiz has a `[[?]]` hint. Surveys have no such attributes.
- **Surveys answer with a fixed line:** after submitting, the player shows its own thank-you sentence (German: „Vielen Dank für dein Feedback!“) that cannot be changed. For young learners, an estimate or opinion question as a survey gets one sentence before it that says what happens ("When you have tapped, the page says thank you. Then go on."), or the text after it continues the thought ("Did you guess more than 100? Read on!").
- Before writing the first quiz of a course, read the `liascript-syntax` skill's quiz part when it is installed (`data/skills.md`).

**Controls as learners see them**

| Control | What the page shows |
|---|---|
| read aloud (block or inline) | a small play triangle ▶ (⏸ while playing) without text — in a small box before a block, in a circle before an inline text or option |
| hint (`[[?]]`) | a light bulb without text, after the first wrong check |
| check | a button with the player's word for "check" (translated by the player), followed by the number of checks |
| solution | hidden with `data-solution-button="false"` |

- Learner texts, plans and the companion name a control by what the page shows, or show the symbol itself ("tap ▶", translated) — never "speaker", "loudspeaker" or another icon the page does not have. The tooltips are not visible on touch screens.
- A hint appears only when the learner taps the light bulb: say so in plans and texts ("after a wrong try the light bulb gives a hint", translated) — never "a hint comes after the first mistake".

---
