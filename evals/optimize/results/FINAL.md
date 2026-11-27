# Abschlussbericht – Selbstoptimierender Benchmark, Pilot `create-outline`

Branch `experiment/agent-instruction-optimization`. `main` und die Original-Taskdatei sind unverändert;
alle Varianten liegen als Overlay unter `evals/optimize/candidates/`.

## Ablauf

| Runde | Varianten | Läufe | Ergebnis |
|---|---|---|---|
| Generation 1 | base, c1-md (kompaktes Markdown), c2-yaml, c3-ail (Notation) | 40 (5 Szenarien × 2) | c3 Pareto, c2 ausgeschlossen (R16 fehlt), c1 mehr kritische Verstöße → `g1.md` |
| Generation 2 | d1-preview, d2-levels, d3-both (auf c3) | 30 | gezielte Schwächen behoben, Erfolgsquote nicht gestiegen → `g2.md` |
| Schlussprüfung | base, c3, d3 auf h1, h2 (zurückgehalten) | 12 | siehe unten |

Insgesamt 82 Agentenläufe plus 12 Richter-Instanzen. Alle Läufe über Subagenten in Claude Code.

## Schlussprüfung (Holdout)

| | base | c3 | d3 |
|---|---|---|---|
| Erfolg (keine kritische Verletzung, alle Code-Prüfungen) | 2/4 | 3/4 | 3/4 |
| gelesene Instruktionen (Wörter, Median h1/h2) | 14.127 / 14.127 | 13.180 / 12.839 | 13.020 / 13.361 |
| Tokens (Median h1/h2) | 134.813 / 133.815 | 135.775 / 129.075 | 138.545 / 131.825 |
| `preview_complete` | 0/4 | 3/4 | **4/4** |
| `one_action` | 2/4 | 2/4 | **4/4** |
| `your_words` | 2/4 | 2/4 | **4/4** |
| `save_confirm` (kritisch) | 2/4 | 4/4 | 3/4 |

Die Holdout-Szenarien bestätigen die Richtung aus dem Training: beide Kandidaten sind besser als das
Original. d3 erfüllt die meisten Richterfragen, c3 hat die wenigsten kritischen Verstöße. Mit 4 Läufen je
Variante ist der Unterschied zwischen c3 und d3 nicht entscheidbar; der zu `base` ist gleichgerichtet über
Training (70 % → 80 %) und Holdout (50 % → 75 %).

Gemeinsamer Fehler aller drei Varianten in h1: Der Kursrahmen sagt „allein am Smartphone“, trotzdem fragen
die Agenten, ob jemand zusehen kann (`ask_only_missing`). Das ist eine Lücke in der Regel selbst, keine
Folge der Darstellung.

## Antworten auf die Forschungsfragen

**1. Welche Darstellung ist am zuverlässigsten?**
Die kompakte Notation mit Legende (c3, AIL) und ihr Nachfolger d3. YAML (c2) verlor eine zeitliche Regel
(„Inhaltsfragen vor der Speicherbestätigung“, R16) und wurde ausgeschlossen: Schlüssel-Wert-Strukturen
tragen keine Reihenfolge. Kompaktes Markdown (c1) sparte gleich viel, hatte aber mehr kritische Verstöße.
Bei 10 Läufen je Variante ist der Vorsprung von c3 gegenüber c1 schwach belegt.

**2. Wie weit lassen sich die Anweisungen wirklich verkleinern?**
Die Datei selbst gar nicht: c3 hat 1.196 Wörter, das Original 1.053, d3 1.376. Was schrumpft, ist das,
was der Agent liest: −8 bis −10 % (14.278 → 12.839 Wörter im Training). Die Ersparnis kommt aus dem
**Leseplan**, nicht aus der Kürze: c3 ersetzt das vollständige Lesen von `data/chat-dialog.md` durch die
neun Regeln, die diese Aufgabe braucht, und liest andere Blätter nur in Teilen.

**3. Was wird über den gesamten Workflow eingespart?**
Bei `create-outline`: rund 1.400 gelesene Wörter und im Training ~6 % Tokens (138k → 130k Median); im
Holdout schwankt der Token-Vorteil zwischen −4 % und +3 %. Die Taskdatei ist nur ~8 % dessen, was der Agent
liest (CLAUDE.md, Persona, Regelblätter, Vorlagen, Journal machen den Rest). Selbst eine halb so lange
Taskdatei spart darum höchstens ~4 %. Hochgerechnet auf den Workflow lohnt sich der Ansatz dort, wo
Aufgaben ganze Regelblätter lesen, aber nur wenige Regeln brauchen.

**4. Unterscheiden sich Claude und Codex?**
Nicht gemessen. Codex ist hier nicht installiert, `claude -p` läuft in dieser Umgebung nicht; alle Läufe
gingen über Claude-Subagenten. Die Adapter sind vorbereitet (`evals/grade.mjs` liest Claude-Code-
`stream-json` mit Cache und Kosten sowie Codex-`token_count`/`turn.completed`). Cache- und Kostenzahlen
fehlen aus demselben Grund.

**5. Lohnt sich eine AIL, oder reicht kompaktes Markdown?**
Die Notation selbst bringt keine Ersparnis (Symbole zählen fast wie Wörter, die Legende kostet Platz). Sie
lohnt sich als **Disziplin**: jede Regel wird zu einer prüfbaren Zeile, Verbote stehen als `!`, der
Leseplan in einer Zeile. Dasselbe lässt sich in kompaktem Markdown schreiben, wenn man den Leseplan und
die eingebetteten Regeln übernimmt. Empfehlung: kein neues Format einführen, sondern die Taskdateien um
einen expliziten Leseplan ergänzen und Regeln aus Blättern einbetten, wenn eine Aufgabe nur wenige braucht.

**6. Welche Regeln sind unverzichtbar, welche redundant?**
- Unverzichtbar (ihr Fehlen oder Abschwächen erzeugte sofort Verstöße): Inhaltsfragen vor der
  Speicherbestätigung (R16), Vorschau in gespeicherter Fassung ohne „wie oben“ (R21; ohne explizite Regel
  1/10 bis 3/10), eine Handlung je Ziel *und je Stufe* (R13), Bestätigung genau einmal (R20).
- Redundant für diese Aufgabe: die vollständige Lektüre von `chat-dialog.md` (nur §1 wird gebraucht) und
  die Regel „neue Schreibregel für alle Einheiten“ (von `create-outline` aus nicht erreichbar).
- Neu entdeckt: die Regel „nicht fragen, was der Rahmen schon sagt“ greift bei „allein“ nicht; und nach
  „Speichern“ korrigieren Agenten aller Varianten gelegentlich nach und fragen erneut – das braucht eine
  eigene Regel („nach dem Speichern nur noch melden, nicht erneut bestätigen lassen“).

## Fehlversuche

- **YAML (c2):** verliert Reihenfolge-Regeln, ausgeschlossen.
- **Dateigröße als Maß:** irreführend; ersetzt durch gelesene Wörter laut Transkript.
- **d2 ohne Vorschau-Regel:** `preview_complete` fällt auf 1/10 – Fehler wandern zur ungeregelten Stelle.
- **Generation 2 insgesamt:** gezielte Fixes wirken, aber neue Fehlerquellen (Erweiterungsstufen ohne
  sichtbaren Schritt) heben den Gewinn auf; die Erfolgsquote steigt nicht.
- **Prüf-Infrastruktur:** Fixture s5 ohne Kapitelfolie (alle Läufe scheiterten am Validator, Lauf
  wiederholt); Label-Umbenennung in s5 bei allen Varianten (Prüfung gelockert, Befund notiert);
  Coverage-Prüfer uneinig bei gleichem Wortlaut (d2 vs d3).
- **Ausführung:** 10 Läufe scheiterten am Limit paralleler Subagenten und wurden neu gestartet.

## Grenzen

- Kleine Stichproben (10 Läufe je Variante im Training, 4 im Holdout): Unterschiede von einem Lauf sind
  Rauschen. Belastbar sind nur große gleichgerichtete Effekte einzelner Richterfragen.
- Ein Modell (Claude), ein Richter-Modell; Richter von g1 und g2 waren verschiedene Instanzen.
- Gesamt-Tokens der Subagenten enthalten Kontext-Wiederholungen; Cache und Kosten nicht messbar.

## Empfehlung

1. `d3-both` als Grundlage für eine überarbeitete `create-outline.md` nehmen, in kompaktem Markdown statt
   Notation umgeschrieben, plus zwei neue Regeln (Rahmen „allein“ → keine Personenfrage; nach dem Speichern
   keine zweite Bestätigung). Dann einmal gegen `base` mit 3 Wiederholungen messen, bevor es nach `develop`
   geht.
2. Das Leseplan-Muster auf die Aufgaben übertragen, die ganze Regelblätter lesen.
3. Codex-Vergleich nachholen, sobald Codex-CLI und ein API-Budget verfügbar sind.
