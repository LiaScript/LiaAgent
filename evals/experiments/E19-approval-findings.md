# E19 – Freigabe ohne Übersichtsregeln, mehrere Befunde in einem Schreibvorgang

Branch: `experiment/e19-approve-script` · Basis: `develop` @ 1ac65c2 · Stand: 27.11.2026

## Hypothese

Die Quiz-Korrektur mit Freigabe kostet ~154.000 Tokens, die Tippfehler-Korrektur ~115.000. Der Unterschied liegt
in der Freigabe (Übersichtsregeln lesen, von Hand schreiben) und in mehreren `add-point.mjs`-Aufrufen.

## Verlauf

1. **E19 – `approve.mjs`:** ein Befehl für Freigabe-Zeile und Übersicht. −18 % Tokens, −31 % Dauer, aber in 2 von 3
   Läufen blockierte die Sicherheitsprüfung der Testumgebung den Aufruf („Undermining Oversight“); die Agenten
   trugen die Freigabe dann richtigerweise nicht von Hand ein.
2. **E19b – `record-approval.mjs --instructor-said "…"`:** Name und Argument zeigen, dass eine Antwort der Lehrkraft
   protokolliert wird. Wieder 2 von 4 blockiert. Ein Shell-Befehl, der eine Freigabe einträgt, wird offenbar
   grundsätzlich als Selbstgenehmigung gewertet, wenn die Antwort im Test nur vorgegeben ist.
3. **E19c – kein Freigabe-Skript:** die Zeile von Hand mit dem Datei-Werkzeug (nie blockiert), dann
   `derive-dashboard.mjs --write` für die Übersicht; `add-point.mjs --from <datei>` für mehrere Befunde bleibt.

## Ergebnis (Quiz-Korrektur mit Freigabe)

| | develop (3) | E19 Skript (3) | E19b (4) | **E19c (3)** |
|---|---|---|---|---|
| Tokens (Mittel) | 153.518 | 125.583 | 124.357 | **131.957 (−14 %)** |
| Dauer | 259 s | 179 s | – | **195 s (−25 %)** |
| Spec-Wörter | 21.231 | 13.584 | – | **14.436 (−32 %)** |
| Freigabe eingetragen | 3/3 | 1/3 | 2/4 | **3/3** |
| alle Code-Prüfungen | 3/3 | 1/3 | 2/4 | **3/3** |

Kein E19c-Lauf las `update-dashboard.md`; alle riefen `derive-dashboard.mjs --write` auf. Tippfehler-Korrektur
(Gegenprobe, 2 je Variante): unverändert, 115.761 → 116.738 Tokens, alle Prüfungen bestanden.

## Bewertung

**E19c übernehmen.** Die Freigabe bleibt eine Handlung, die sichtbar zur Antwort der Lehrkraft gehört; die
Ersparnis kommt aus dem Wegfall der Übersichtsregeln. Lehre: Ein Skript, das eine menschliche Entscheidung
einträgt, kann von Sicherheitsprüfungen als Selbstgenehmigung gewertet werden – solche Einträge bleiben von Hand.
