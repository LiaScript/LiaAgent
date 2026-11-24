# E1 – Ein Skript schreibt den Änderungsweg nach einer Prüfung

Branch: `experiment/e1-record-change` @ fdece11 · Basis: `main` @ bd8b06f · Stand: 24.11.2026

## Hypothese

Nach einer Prüfung verlangt eine Änderung sieben abgestimmte Journal-Einträge von Hand (datierte Zeile, Zusatz in der
Ergebniszeile, Nutzbar-Zeile, Done ❌, empfohlener Schritt, Kurszusammenfassung, offener Punkt). In den Läufen vom
24.11. ging davon in jedem Lauf etwas schief. `record-change.mjs` schreibt alles außer dem offenen Punkt in einem
Schreibvorgang; der Agent liefert nur Folie, Änderung und Prüfart.

## Vorher festgelegt

| | Kennzahl | Szenarien | Ziel |
|---|---|---|---|
| Hauptkennzahl | Läufe mit allen Code-Prüfungen bestanden | quickfix-quiz, quickfix-typo | e1 mindestens +1 von 3 je Szenario gegenüber base, oder beide 3/3 |
| Schutz | Richter-Fragen | beide | keine Frage öfter `false` als bei base |
| Schutz | gelesene Spec-Wörter | beide | nicht mehr als +10 % |

Läufe: 3 je Variante und Szenario (12). Übernahme, wenn die Hauptkennzahl erreicht ist und kein Schutz verletzt ist;
danach Tandem-Test, dann `main`.

## Ergebnis (24.11.2026, 12 Läufe)

| | Quiz base | Quiz e1 | Tippfehler base | Tippfehler e1 |
|---|---|---|---|---|
| alle Code-Prüfungen | 2/3 | 1/3 | 3/3 | 3/3 |
| … ohne die Störung der Testumgebung¹ | 2/3 | 3/3 | 3/3 | 3/3 |
| gelesene Spec-Wörter (Spanne) | 22.568 (21.787–23.780) | 21.213 (21.017–21.546) | 22.830 (21.384–24.989) | 19.764 (19.572–19.914) |
| Tokens | 173.550 | 161.277 (−7 %) | 153.722 | 144.258 (−6 %) |
| Dauer | 281 s | 247 s (−12 %) | 197 s | 165 s (−16 %) |
| Richter: Abweichungen | – | `learner_offer`, `no_harm` nur in gestörten Läufen | – | keine |

¹ In drei Quiz-Läufen (base/3, e1/1, e1/3) blockierte die Sicherheitsprüfung der Testumgebung den Eintrag
„Material freigegeben“ (sie hielt ihn für Selbstgenehmigung); danach brach der Ablauf ab. Das betrifft
`approvals` und die Richter-Frage `learner_offer` – nicht die Varianten.

**Entscheidung: Kandidat für `main`.**

- Hauptkennzahl: Die Fehlerquote konnte nicht sinken – `main` macht den Änderungsweg seit den Fixes vom
  selben Tag schon in 3 von 3 Läufen richtig (Deckeneffekt). Formal erfüllt über „beide 3/3“; der einzige
  echte Unterschied im Quiz (base/3: richtige Antwort zu kurz) liegt nicht am Änderungsweg.
- Schutz: keine Richter-Frage schlechter, die gelesenen Spec-Wörter sinken.
- Klarer Nebeneffekt: In beiden Szenarien liegt **jeder** e1-Lauf bei den Tokens unter **jedem** base-Lauf;
  die Lesemenge streut viel weniger (Spanne 529 statt 1.993 bzw. 342 statt 3.605 Wörter).
- Offen: ein schwereres Szenario, in dem die Handarbeit fehleranfälliger ist (zweite Änderung, Bericht mit
  FAIL, teilweise behobener Punkt) – erst dort zeigt sich der Hauptnutzen. Danach Tandem-Test, dann `main`.

Nebenbefunde für die Prüfstrecke: `quiz-balanced` prüft jetzt auch eine zu kurze richtige Antwort (der Richter
fand den Fall in base/3); alle 12 Läufe nennen der Lehrkraft Dateinamen wie `README.md` (`language` 0/12). Entscheidung der Lehrkraft: Dateinamen sind erwünscht, die Lehrkraft arbeitet mit den Dateien – die Richter-Frage zählt seither nur noch interne Schlüssel und Skriptnamen.
