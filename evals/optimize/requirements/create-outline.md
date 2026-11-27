# Verbindliche Anforderungen: `create-outline`

Quelle: `specs/tasks/create-outline.md` (Stand `develop` @ 2a3df09) und die Stellen, auf die er verweist:
`templates/course-outline.yaml`, `data/chat-dialog.md` §1, `data/journal-links.md`, `tasks/update-dashboard.md`.
Jede Variante muss **alle** Anforderungen enthalten (statische Prüfung, `coverage`), jeder Lauf wird an den
prüfbaren gemessen (Code-Prüfung `C`, Richter `J`).

Gewicht: **K** = kritisch (eine Verletzung schließt eine Variante aus, egal wie billig sie ist), **W** = wichtig,
**N** = nachrangig.

| ID | Anforderung | Quelle | Gewicht | Prüfung |
|---|---|---|---|---|
| R1 | Kursrahmen (`## Course Context`) lesen; Zeilen „Für die Gliederung: …“ (oder zu Lernzielen) sind Eingaben der Lehrkraft: daraus starten, nie erneut fragen | Schritt 1 | K | J `reuse_given` |
| R2 | Fehlende Ziele erst im Gesprächsverlauf suchen (`find.mjs` in `.chats`), dann fragen | Schritt 1 | N | – (kein Chatverlauf im Test) |
| R3 | Titel und Zielgruppe aus dem Kursrahmen übernehmen; nur fragen, was fehlt oder widersprüchlich ist | Schritt 2 | W | J `ask_only_missing` |
| R4 | Mit Skill `creativity`: einmal anbieten (strukturiertes Interview als Standard) | Schritt 2 | N | – (Skill nicht installiert) |
| R5 | Zeitumfang aus dem Kursrahmen vorbefüllen; je Kurstyp: Vorlesungsreihe/Workshop Pflicht, Selbstlernkurs optional, Einzelstunde entfällt | Schritt 3 | W | C `outline-filled` (Feld Zeit), J |
| R6 | Abstract (Themen, Inhalt, Nutzen) erheben | Schritt 4 | W | C `outline-filled` |
| R7 | 3–5 konkrete Lernziele | Schritt 5 | K | C `outline-filled` (3–5 Ziele) |
| R8 | Vom Ziel der Lehrkraft ausgehen und ihr Verb behalten; fehlt es, zuerst danach fragen („Was sollen die Lernenden am Ende können?“) | Schritt 5 | K | J `goal_first` |
| R9 | Selbstprüfung **vor** dem ersten Vorschlag; sie darf ergänzen, nie still streichen; jede Änderung in einer Zeile nennen; vor dem Streichen/Ersetzen fragen | Schritt 5 | K | J `no_silent_drop` |
| R10 | Beobachtbarkeit: für jedes Ziel sagen, wie es sichtbar wird (im Material oder durch eine Person); sonst beobachtbaren Schritt oder Anlass ergänzen, Verb nicht tauschen | Schritt 5 | K | J `observable` |
| R11 | Prüfung durch eine Person braucht eine geplante gemeinsame Phase mit Minuten in der Zeitprüfung (Lernende × Minuten ≤ Phase, sonst „nur Stichprobe“); allein/mit Kopfhörern: kein Partner, außer geplant → Phase oder Aufnahme vorschlagen | Schritt 5 | W | J `person_check_phase` |
| R12 | Jede Stufe zählt: Selbstprüfung auch für ergänzte Ziele und Basis-/Erweiterungsstufen; konkretisiertes Ziel als „Ihre Worte → Vorschlag“ in einer Zeile | Schritt 5 | W | J `your_words` |
| R13 | Ein Handeln pro Ziel; Ziele mit zwei Verben teilen | Schritt 5 | W | J `one_action` |
| R14 | Passt zu den Lernenden: Sprachstand, Vorwissen, Förderbedarf; Sprachkomponente wo nötig; heterogene Gruppen: Basis- und Erweiterungsstufe in Alltagswörtern, nie ein Schulstufen-Wort (nie „Grundstufe“) | Schritt 5 | W | C `no-stage-word`, J `levels` |
| R15 | Passt zur Zeit: kurze Liste Sitzung → Ziel → Selbstprüfung (Tabelle höchstens 3 Spalten), alle genannten Zeitschätzungen eingerechnet; passt es nicht, vorschlagen, was wegfällt; nach jeder Überarbeitung wiederholen; offene Lücke → `decisions` der Übersicht | Schritt 5 | K | J `time_check`, C `time-gap-recorded` (Szenario s4) |
| R16 | Inhaltsfragen **vor** der Speicherbestätigung, nie im selben Formular; alles Gespeicherte vorher als Text; eigene Ergänzungen sind Inhaltsfragen, nie erst in der Speichervorschau | Schritt 5, chat-dialog §1 | K | J `content_before_save` |
| R17 | Logo-Wunsch → Gestaltungsassistent nach dem Speichern | Schritt 6 | N | – |
| R18 | `templates/course-outline.yaml` füllen; beim Ergänzen einer bestehenden Gliederung jede Zeile wörtlich behalten | Schritt 7 | K | C `outline-kept` (Szenario s5) |
| R19 | Einzeldatei mit mehreren Einheiten: Titelfolie einmal vorn, jede Einheit beginnt mit ihrer Kapitelfolie | Schritt 7 | N | – |
| R20 | Vor dem Speichern: Übersichtsentwurf, dann die Gliederung so zeigen, wie die Lehrkraft sie liest, mit „Speichern“ / „Etwas ändern“ (einzige Schreibbestätigung) | Schritt 8 | K | J `save_confirm` |
| R21 | Die Vorschau nennt jeden offenen Punkt und Schritttext, den der Entwurf ergänzt/entfernt; Ungenanntes, das das Skript meldet, im ✅-Satz korrigieren | Schritt 8, chat-dialog §1 | W | J `preview_complete` |
| R22 | Die Vorschau enthält jedes Feld der Vorlage im gespeicherten Wortlaut; Übernommenes darf eine Zeile sein; Sammelaussagen müssen für jedes Element stimmen | Schritt 8 | W | J `preview_complete` |
| R23 | Speichern = Inhalt von `## Outline` ersetzen nach dem `layout` der Vorlage (fette Labels in Kurssprache mit `data-key`, keine Unterüberschriften, Ziele nummeriert mit eingerückter Unterliste) | Schritt 8, Vorlage | K | C `outline-filled`, `validator-ok` |
| R24 | Danach Übersicht aktualisieren (`update-dashboard`); veraltete Aussagen in fremden Abschnitten → `decisions`, nie still ändern; danach suchen (`find.mjs`) | Schritt 9 | W | C `validator-ok`, `foreign-untouched` |
| R25 | Eine abgeschlossene Freigabe bleibt; die Aufgabe fragt nie erneut danach und legt keinen Freigabe-Punkt an | Schritt 9 | W | C `approvals` (Szenario s5) |
| R26 | Sprache: Kurssprache, Anrede aus dem Kursrahmen, keine internen Schlüssel oder Skriptnamen in Nachrichten | Rahmen | W | J `language` |

Nicht prüfbar in dieser Umgebung (kein Chatverlauf, kein Skill, kein Logo-Wunsch): R2, R4, R17, R19 – sie bleiben
in der statischen Abdeckungsprüfung jeder Variante.
