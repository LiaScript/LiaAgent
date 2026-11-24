# E3 – Cheat-Sheet nach Konstrukt geteilt

Branch: `experiment/e3-cheat-sheet-split` · Basis: `develop` @ 777e7ba · Stand: 24.11.2026

## Hypothese

Das LiaScript-Cheat-Sheet hat rund 840 Zeilen in einer Datei. Wer nur eine Folie prüft (kurze Nachprüfung,
Quiz-Änderung), liest heute oft die ganze Datei. Geteilt in einen Index und elf Teile, mit der Regel „für einen
engen Umfang nur `00-checks.md` und die Teile der betroffenen Konstrukte“, sollte die gelesene Menge bei engen
Aufgaben sinken – ohne dass eine Prüfung etwas übersieht.

## Vorher festgelegt

| | Kennzahl | Szenarien | Ziel |
|---|---|---|---|
| Hauptkennzahl | gelesene Spec-Wörter (Median) | `recheck-short`, `quickfix-quiz` | mindestens −15 % gegenüber `base` |
| Schutz | Läufe mit allen Code-Prüfungen bestanden | alle | nicht weniger als `base` |
| Schutz | Richter-Fragen | alle | keine Frage öfter `false` als bei `base` |
| Schutz | Tokens gesamt | `quickfix-typo`, `quickfix-second-change` | nicht mehr als +10 % (dort liest kaum jemand im Cheat-Sheet) |

Läufe: 3 je Variante und Szenario. Übernahme nach `develop`, wenn die Hauptkennzahl das Ziel erreicht und kein
Schutz verletzt ist.

## Ergebnis

(nach dem Lauf)
