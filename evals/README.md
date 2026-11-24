# Prüfstrecke (evals)

Misst, ob eine Änderung an den Specs den Agenten besser macht, bevor sie nach `main` kommt. Jede Idee ist ein
Branch („Variante“), alle Varianten laufen durch dieselben Szenarien, mehrmals, und werden gleich bewertet.

## Ablauf

```bash
# 1. Läufe vorbereiten: je Szenario × Variante × Wiederholung ein frischer Projektordner
node evals/run.mjs prepare --variants base=main,e1=experiment/e1-record-change --reps 3 --out evals/.runs/e1

# 2. Agenten laufen lassen – ohne Oberfläche, mit Trace (Lesemenge und Tokens werden daraus gemessen)
node evals/run.mjs exec --out evals/.runs/e1 --parallel 2 \
  --cmd "claude -p --output-format stream-json --verbose --permission-mode acceptEdits"
#    (oder: node evals/run.mjs list --out … und die PROMPT.md-Dateien von Hand bzw. mit Subagenten ausführen)

# 3. Bewerten: Code-Prüfungen, Lesemenge, Bericht – und anonymisierte Pakete für den LLM-Richter
node evals/grade.mjs --out evals/.runs/e1
#    Richter: je Paket in <out>/judge-pack/<id>/ die Fragen aus evals/judges/<name>.md beantworten,
#    Ergebnis als <out>/judge-results/<id>.json speichern, dann grade.mjs noch einmal → report.md
```

`<out>/report.md` zeigt je Szenario eine Spalte pro Variante: jede Prüfung als „bestanden / Läufe“, die
Richter-Fragen, gelesene Spec-Wörter, Tokens und Dauer (Mittel und Spanne).

## Bausteine

| Datei | Inhalt |
|---|---|
| `scenarios/<id>/scenario.json` | Ausgangslage (Fixture + Änderungen), Befehl, vorgegebene Antworten der Lehrkraft, Code-Prüfungen |
| `checks.mjs` | die Code-Prüfungen – deterministisch, je eine Fehlerart |
| `judges/<name>.md` | binäre Fragen für den LLM-Richter (je eine Fehlerart) – nur was Code nicht prüfen kann |
| `run.mjs` | `prepare` · `exec` · `list` |
| `grade.mjs` | Bewertung, Lesemenge (aus `trace.jsonl`, sonst aus `TRANSCRIPT.md`), Richter-Pakete, Bericht |
| `experiments/` | eine `HYPOTHESIS.md` je Experiment (Vorlage: `experiments/TEMPLATE.md`) |

Grundsätze:

- **Code vor Richter.** Was ein Skript prüfen kann, prüft ein Skript. Beispiel `quiz-balanced`: Es fand
  genau die zwei Läufe, die ein blinder LLM-Richter wegen einer zu langen richtigen Antwort bemängelt hatte.
- **Ein Maßstab für alle.** Validator und Prüfungen kommen aus dem Checkout der Prüfstrecke, nicht aus der
  Variante – sonst misst jede Variante mit ihrem eigenen Lineal.
- **Gleiche Ausgangslage.** Fixture und vorgegebene Antworten sind für alle Varianten identisch; die
  Variante liefert nur ihre Specs.
- **Mehrere Läufe.** Agenten arbeiten jedes Mal etwas anders – mindestens 3 Läufe je Zelle; Spannen ansehen,
  nicht nur Mittelwerte.
- **Richter abgleichen.** Bevor die Richter-Fragen zählen, einmal gegen die Urteile der Lehrkraft aus einem
  Tandem-Test prüfen (stimmen sie überein?).

## Abgleich (24.11.2026)

An den acht quick-fix-Läufen des Skills-Pilots nachbewertet (`docs/levers/runs` auf `experiment/levers-tasks`):

- `quiz-balanced` fällt in genau den zwei Läufen durch, die ein blinder LLM-Richter damals wegen einer noch zu
  langen richtigen Antwort bemängelt hatte; die zwei anderen bestehen.
- Der Richter (`judges/quick-fix.md`) findet „Material vor Speichern geschrieben“ im selben Lauf wie damals.
- Die Code-Prüfung ist bei der Quiz-Qualität strenger als der Richter – darum zählt sie, nicht der Richter.

## Grenzen

- Szenarien laufen im Terminal-Modus. Vorschau-Chat, `liadev` und echte Subagenten brauchen eine Umgebung
  mit DevServer – dafür bleibt der Tandem-Test.
- Ohne Trace (Läufe von Hand) kommt die Lesemenge aus der Selbstauskunft des Agenten in `TRANSCRIPT.md`.
- Die Läufe selbst kosten Tokens: ein quick-fix-Lauf liegt bei etwa 170.000.

## Neues Szenario

Ordner unter `scenarios/` mit `scenario.json` (Felder wie in `quickfix-quiz`), Fixture-Dateien daneben oder
aus `specs/dashboard/fixtures/`. Eine neue Prüfung kommt als Funktion nach `checks.mjs` (`id` → `{ pass, detail }`).

## Szenarien

| Szenario | Lage | Was es prüft |
|---|---|---|
| `quickfix-typo` | Lernseite geprüft und freigegeben, ein Tippfehler | Änderung bleibt auf der Folie, Nachprüfung offen, Kurs nicht veröffentlichbar |
| `quickfix-quiz` | wie oben, noch nicht freigegeben; Quiz verrät die Antwort | dazu: Antworten gleich lang (`quiz-balanced`) |
| `quickfix-second-change` | schon einmal nach der Prüfung geändert (Nachprüfung offen), jetzt ein Tippfehler | zweite datierte Zeile, „2 Punkte seither geändert“, nichts doppelt (`changed-count`) |
