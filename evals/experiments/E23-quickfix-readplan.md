# E23 – Leseplan für quick-fix, festes Testdatum, Typ ohne Ablaufplan

Branch: `experiment/e23-quickfix-readplan` · Basis: `experiment/e20-statechart` (E22) · Stand: 27.11.2026 · Läufe: `/home/claude/runs/e23`

## Änderungen

- **quick-fix liest weniger:** seltene Fälle (Freigabe nach Durchsicht, Design-Track, Aufruf aus einer anderen Task) in
  `data/quick-fix-cases.md`, nur der zutreffende Teil; `chat-dialog.md` nur §1 (§2 nur mit offenem MCP-Gate);
  `journal-links.md` nur „Field keys“; `validate-syntax.md` nur die Prüfpunkte der geänderten Zeilen. CLAUDE.md und
  `agent-links.md` erlauben Regelblätter „by part:“, wenn die Inputs es so sagen.
- **Festes Testdatum:** `now.mjs → currentDate()` liest `.cache/now.txt` oder `LIAAGENT_NOW`; `record-change`,
  `close-recheck`, `derive-dashboard`, `localize-journal` nutzen es. Der Harness schreibt das Szenario-Datum.
- **Typ ohne Ablaufplan** (`data/session-types.md`, Schritt 5): der eine Session-Typ, sonst ohne Type/Method prüfen,
  nie mitten in der Korrektur fragen, die Lücke einmal am Ende nennen.
- Nach dem Richter: die Freigabe ändert in der Kurszusammenfassung nur die Zeile, die die Freigabe als offen nennt.

## Ergebnis (je 3 Läufe, E22 → E23)

| Szenario | Tokens | Dauer | Spec-Wörter | Code-Prüfungen | Richter |
|---|---|---|---|---|---|
| Tippfehler, 1 Einheit | 113.921 → 104.858 (−8,0 %) | 123 → 107 s (−13 %) | 12.928 → 9.150 (−29 %) | alle / alle | alle / alle |
| Tippfehler, 4 Einheiten | 113.360 → 107.021 (−5,6 %) | 116 → 119 s | 11.757 → 8.949 (−24 %) | alle / alle | alle / alle |
| Quiz mit Freigabe | 126.448 → 119.527 (−5,5 %) | 188 → 178 s (−5 %) | 11.728 → 12.425 | alle / alle | 29/30 → 29/30 |

Richter-Abweichungen: E22 nannte einmal einen Skriptnamen in einer Nachricht (`language`); E23 schrieb einmal bei der
Freigabe ein Urteil zur Kursübereinstimmung in die Kurszusammenfassung (`no_harm`) – die Regel ist jetzt enger.

**Datum:** alle 9 E23-Läufe datieren mit dem Szenario-Tag (24.11.), alle 9 E22-Läufe mit der Systemuhr (27.11.).

**Beobachtung:** In 3 von 9 E23-Tippfehler-Läufen las der Agent beim Start das Journal ganz oder teilweise vor dem
Status-Skript (gleichzeitig mit CLAUDE.md), in E22 in keinem. Die Aktivierungsregel ist in beiden gleich; vermutlich
Zufall beim parallelen ersten Lesen – im Blick behalten. Die Einsparung gilt trotz dieser Mehrlesungen.
Harness: die Läufe lasen ihre Anweisung aus `PROMPT.md` (beide Varianten gleich).
