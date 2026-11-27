# develop gegen main – 27.11.2026

`develop` @ 5dfb776 (E10b, E12, E14, E15, E16 und die Regel-Klarstellungen) gegen `origin/main` @ bd8b06f,
am selben Tag, gleiche Ausgangsdateien, 2 Läufe je Variante und Szenario. Lauf `/home/claude/runs/final`.

| Szenario | Tokens main | develop | | Dauer main | develop | | Code-Prüfungen main · develop |
|---|---|---|---|---|---|---|---|
| Gliederung (Übersicht im Zwischenspeicher) | 129.289 | 121.165 | −6,3 % | 218 s | 207 s | −5,2 % | 2/2 · 2/2 |
| Quiz-Korrektur mit Freigabe | 179.198 | 153.958 | −14,1 % | 281 s | 267 s | −5,0 % | 1/2 · 2/2 |
| Tippfehler-Korrektur | 164.931 | 115.429 | −30,0 % | 221 s | 132 s | −40,3 % | 2/2 · 2/2 |
| kurze Nachprüfung | 189.837 | 119.889 | −36,8 % | 228 s | 118 s | −48,2 % | 0/2 · 2/2 |
| **Summe** | 663.254 | 510.440 | **−23,0 %** | 947 s | 723 s | **−23,7 %** | 5/8 · 8/8 |

Gelesene Spec-Wörter (Median): Gliederung 14.111 → 11.702, Quiz 23.047 → 17.739, Tippfehler 21.667 → 12.430,
Nachprüfung 30.490 → 15.973.

Fehlgeschlagene Prüfungen nur auf `main`: einmal blieb die richtige Quiz-Antwort erkennbar kürzer
(`quiz-balanced`); bei der Nachprüfung notierte keiner der beiden Läufe die alte Vorlese-Lücke als offenen Punkt
(`finding-point`) – `main` hat dafür weder `add-point.mjs` noch die Klarstellung aus E15.
