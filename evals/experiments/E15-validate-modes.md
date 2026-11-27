# E15 – `validate-course` liest nach Modus

Branch: `experiment/e15-validate-modes` · Basis: `develop` @ 6161615 (mit E10b, E14) · Stand: 27.11.2026

## Hypothese

Aus der Bestandsaufnahme aller Aufgaben (gemessene Lesevorgänge der bisherigen Läufe): `validate-course.md`
(5.204 Wörter) ist die schwerste Aufgabe. Jede Einheitenprüfung liest die Gesamtkursprüfung mit (1.430 Wörter),
und die kurze Nachprüfung liest dazu Prüfliste, Zeitschätzung, Sitzungstypen, Skelett und Methoden vollständig,
obwohl sie nur die geänderten Seiten prüft. Ein Leseplan nach Modus spart dort ohne Qualitätsverlust.

## Änderung

- Gesamtkursprüfung nach `tasks/validate-course-full.md` (wörtlich), gelesen nur im Kursmodus und für „One unit,
  one run“ (dessen kurze Nachprüfung nur, wenn ein neuer Befund die Kurszusammenfassung ändert).
- Leseplan in den Inputs: kurze Nachprüfung nur `validate-syntax.md`, `result_rules` + `recheckExplain`, die Typ-
  und Methodenpunkte der geänderten Seiten und die Regelblätter; andere Dateien nur, wenn ein neuer, von der
  Änderung verursachter Befund sie braucht. „Concerns only“: Bericht und Regelblätter.
- Nachgeschärft nach dem ersten Lauf: Ein Problem auf einer geänderten Seite, das die Änderung nicht verursacht hat,
  ist ein Befund außerhalb der Änderung (`add-point.mjs`, nicht beheben) – so wie es Original-Läufe und Richter
  schon verstanden; die alte Formulierung ließ beides zu.
- `check-specs.mjs` prüft beide Dateien als eine Regelmenge; `grade.mjs` überspringt Ordner in der Leseliste.
- Neues Szenario `validate-course-mini` (Kursmodus).

## Ergebnis

Läufe `/home/claude/runs/e15`, `e15b`, `e15c` (Nachschärfung), blinder Richter.

| Szenario | develop | E15 (nachgeschärft) |
|---|---|---|
| kurze Nachprüfung: Tokens (Mittel) | 152.524 (5 Läufe) | 130.936 (4 Läufe, −14 %) |
| kurze Nachprüfung: Spec-Wörter (Median) | ~25.000 | 16.099 (−35 %) |
| kurze Nachprüfung: Code-Prüfungen | 5/5 | 4/4 |
| kurze Nachprüfung: Richter scope/result/material/outside | 5/5 · 5/5 · 5/5 · 3/4 | 4/4 · 4/4 · 4/4 · 4/4 |
| Korrektur mit Freigabe: Spec-Wörter | 22.809 | 20.858 (−9 %), Tokens gleich (Rauschen) |
| Gesamtkursprüfung: Verhalten | Datei vollständig gelesen | neue Datei gefunden und befolgt, gleich viel gelesen |

Vor der Nachschärfung (5 Läufe) ging ein E15-Lauf den langen Weg: Er wertete eine alte Vorlese-Lücke auf der
geänderten Seite als neuen Befund und behob sie (Richter: 5 Fragen `false`). Nach der Nachschärfung trat das in
4 Läufen nicht mehr auf. Kleine Ausrutscher (ein Agentenname, eine Empfehlung ohne Schritt) kommen in beiden
Varianten vereinzelt vor.

Die Prüfung `material-unchanged` passt nicht zum Kursmodus (er behebt mechanische Fehler nach Bestätigung) und ist
im Szenario `validate-course-mini` entfernt.

## Bewertung

**Übernehmen.** Die kurze Nachprüfung – sie folgt auf jede Korrektur – wird um 14 % günstiger und liest ein Drittel
weniger, bei gleicher Qualität. Die Nachschärfung der Befund-Regel ist auch ohne Leseplan eine Klarstellung.
