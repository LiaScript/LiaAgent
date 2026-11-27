# Selbstoptimierende Instruktionen – Benchmark

Branch `experiment/agent-instruction-optimization` (ab `develop`; `main` bleibt unverändert). Pilotaufgabe:
`:create-outline`. Ziel: herausfinden, welche **Darstellung** der Instruktionen ein Agent mit wenig Tokens, geringen
Kosten und hoher Zuverlässigkeit ausführt – ohne feste Kompressionsquote.

Der Benchmark baut auf der Prüfstrecke `evals/` auf (gleiche Läufe, Prüfungen, Richter); hier liegt nur, was die
Optimierung dazu braucht.

```
evals/optimize/
  README.md                     dieses Dokument
  config.json                   Generationen, Varianten je Runde, Wiederholungen, Szenarien (Training / Holdout)
  requirements/create-outline.md  R1–R26: verbindliche Anforderungen mit Quelle, Gewicht (K/W/N) und Prüfung
  fixtures/                     Ausgangs-Journale (make.mjs baut sie reproduzierbar aus dem leeren Journal)
  candidates/<id>/              eine Instruktionsvariante
    overlay/specs/tasks/…       Ersatzdateien (über den Stand gelegt; das Original bleibt unverändert)
    NOTES.md                    was die Variante ändert (vom Optimierungsagenten)
    coverage.json               R-ID → Fundstelle in der Variante (vom unabhängigen Evaluator)
  optimize.mjs                  Evaluator: Erfolg, kritische Verstöße, Kosten, Pareto-Front, Rückmeldung
evals/scenarios/outline-*/      die Szenarien (s1–s5 Training, h1–h2 zurückgehaltene Validierung)
evals/judges/create-outline.md  der blinde Richter (Fragen = J-Anforderungen)
```

## Rollen

| Rolle | Wer | Ein- und Ausgabe |
|---|---|---|
| Optimierungsagent | Subagent mit Prompt `prompts/optimizer.md` | liest Original, Anforderungen, `feedback.md` der letzten Runde → schreibt `candidates/<id>/` |
| Abdeckungsprüfer (Evaluator, statisch) | unabhängiger Subagent | liest Variante + Anforderungen → `coverage.json`; eine fehlende K-Anforderung schließt die Variante aus |
| Testagenten | je Lauf ein frischer Agent in eigenem Projektordner | `PROMPT.md` (Szenario, vorgegebene Antworten) → `journal.md`, `TRANSCRIPT.md`, Trace |
| Evaluator (dynamisch) | `evals/grade.mjs` + Richter + `optimize.mjs` | Code-Prüfungen, Richterfragen, Tokens/Kosten/Zeit → `optimize.json`, `optimize.md`, `feedback.md` |

Die Holdout-Szenarien (`set: holdout`) laufen nur zur Schlussbewertung und erscheinen nie in `feedback.md`.

## Ablauf einer Generation

```bash
# 1. Läufe vorbereiten: Original (base) und die Kandidaten der Runde, je Szenario × Wiederholung ein Projektordner
node evals/run.mjs prepare --out <out> --reps 2 \
  --scenarios outline-s1-complete,outline-s2-missing-goals,outline-s3-vague-goals,outline-s4-unrealistic-time,outline-s5-revise \
  --variants base=<ref>,c1=<ref>+evals/optimize/candidates/c1-md,c2=<ref>+evals/optimize/candidates/c2-yaml,c3=<ref>+evals/optimize/candidates/c3-ail
# 2. Läufe ausführen (Adapter unten)
# 3. Bewerten: Code-Prüfungen und Richterpakete, Richter ausführen, dann erneut grade
node evals/grade.mjs --out <out>
# 4. Auswerten: Pareto-Front und Rückmeldung für die nächste Generation
node evals/optimize/optimize.mjs --out <out> --baseline base
```

## Adapter

| Adapter | Befehl | Was er misst |
|---|---|---|
| Claude Code | `node evals/run.mjs exec --out <out> --cmd "claude -p --output-format stream-json --verbose --permission-mode acceptEdits"` | Tokens getrennt (Eingabe, Cache gelesen, Cache geschrieben, Ausgabe), Kosten in USD, Dauer, jede gelesene Datei |
| Codex | `node evals/run.mjs exec --out <out> --cmd "codex exec --json --full-auto"` | Tokens (Eingabe inkl. gecachter, gecacht, Ausgabe); Kosten aus Preisliste nachzurechnen |
| Subagent | `node evals/run.mjs list --out <out>`, je Ordner ein Subagent mit `PROMPT.md` | nur Gesamt-Tokens und Dauer (vom Harness), Lesemenge aus `TRANSCRIPT.md` |

`grade.mjs` liest `trace.jsonl` beider CLI-Formate (Claude-Code-`result`-Ereignis; Codex `token_count` /
`turn.completed`). **Kalter und warmer Cache:** derselbe Lauf zweimal kurz hintereinander (`--reps 2`, nacheinander,
nicht parallel); der erste ist kalt, der zweite liest die gemeinsamen Präfixe (CLAUDE.md, Aufgabe) aus dem Cache –
`cache_read_tokens` trennt beides.

## Grenzen dieser Umgebung (Stand 27.11.2026)

- `claude -p` endet hier mit einem API-Fehler, `codex` ist nicht installiert: Läufe gehen über **Subagenten** desselben
  Modells. Damit fehlen Cache-Aufschlüsselung und Kosten; gemessen werden Gesamt-Tokens (inkl. erneut gesendetem
  Kontext), Dauer, Werkzeugaufrufe und die Lesemenge laut Transkript.
- Ein Vergleich Claude ↔ Codex braucht eine Umgebung mit beiden CLIs; die Adapter sind dafür vorbereitet.
- Instruktions-Tokens sind geschätzt (Zeichen / 4); ein Tokenizer ist offline nicht verfügbar.

## Auswahlregel

Pareto über (Erfolgsquote ↑, Tokens je erfolgreichem Lauf ↓, tatsächlich gelesene Instruktionen ↓ – die Dateigröße der Variante wird getrennt ausgewiesen) auf den Trainingsszenarien.
Vorher ausgeschlossen: jede Variante, der laut `coverage.json` eine K-Anforderung fehlt, und jede mit mehr
kritischen Verstößen als das Original. Eine billige Variante gewinnt nie allein durch Kürze.
