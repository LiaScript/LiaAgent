# Leichte Stränge: Mini-Kurs, Umwandeln, Template – und der Chat als Gedächtnis

Stand: 2026-11-11 · Status: Entwurf zur Freigabe

## 1. Absicht

Der Teaching-Agent kennt heute nur einen Weg: Kurskontext → Gliederung → Didaktik → Templates → Agenda →
Sessions → Material → Prüfung → Veröffentlichen. Für viele Anliegen ist das zu schwer. Wer nur eine kleine
README mit Übersicht, ein paar Folien und Quizzen will, ein PDF in einen interaktiven LiaScript-Kurs
umwandeln oder ein Template bauen möchte, bekommt ein 330-Zeilen-Journal mit Abschnitten, die er nie
braucht – und der Agent liest sie trotzdem bei jedem Befehl. Das kostet Zeit, Tokens und Übersicht.

Ziel sind **leichte Stränge**: eigene, kurze Entwicklungswege für typische kleine Anliegen. Sie nutzen
**dasselbe Journal**, aber Abschnitte, die der Strang nicht braucht, ruhen mit dem Vermerk „bei Bedarf“.
Wächst das Vorhaben, wird ein Abschnitt einfach aktiviert – nichts wird umgebaut.

Dazu kommt eine Lücke, die alle Wege betrifft: Nach einem Neustart weiß der Agent nicht mehr, was im Chat
besprochen, aber noch nicht gespeichert wurde. Der Chat liegt bereits in `.chats/` und wird von liadev
fortgeführt; der Agent soll ihn als Gedächtnis nutzen.

## 2. Ziele, Nicht-Ziele, Anti-Ziele

**Ziele**
- Am Anfang fragt der Agent, was die Lehrkraft vorhat, und wählt danach den Strang.
- Drei leichte Stränge: **Mini-Kurs**, **Umwandeln**, **Template**.
- Ein neuer Abschnittszustand **`later`** („bei Bedarf“) für Journal-Abschnitte, die der Strang nicht braucht.
- Der Agent knüpft nach einem Neustart am Chat an.

**Nicht-Ziele (jetzt)**
- Keine zweite Journal-Vorlage, keine eigene „leichte“ Journal-Datei.
- Kein neuer Agent. Die vier Agenten (Teaching, Artist, Learner, Development) bleiben.
- Der volle Kursweg ändert sich nur an zwei Stellen: die Strangfrage am Anfang und das Chat-Gedächtnis.
- Diese Ideen kommen später, nicht in diesem Vorhaben: Kurs übersetzen, nur Design ändern (Artist allein),
  nur veröffentlichen/exportieren (Development allein), fremden Kurs prüfen (Bericht statt Journal).
  Der Aufbau aus diesem Entwurf (Strang + `later`) soll sie später ohne Umbau aufnehmen können.

**Anti-Ziele** (wäre ein Fehlschlag, auch wenn es technisch läuft)
- Ein leichter Strang schreibt still ins Journal oder in Material – die Regel „gespeichert wird erst nach
  Bestätigung“ gilt unverändert.
- Je Strang eine andere Journal-Struktur, so dass Wachsen einen Umbau oder eine Migration braucht.
- „Bei Bedarf“ wirkt auf die Lehrkraft wie ein Fehler oder etwas Vergessenes (rote Markierung, „fehlt“).
- Ein Mini-Kurs ohne jedes Lernziel – der Agent bleibt kritischer Sparringspartner; 1–3 Lernziele sind
  auch im kleinsten Strang Pflicht.
- Beim Umwandeln wird fremdes Material (Webseiten, Verlagsfolien) ungefragt komplett übernommen.
- Das Chat-Gedächtnis überschreibt, was im Journal steht, oder trägt alte Chat-Inhalte ungefragt ein.

## 3. Feste Rahmenbedingungen

- Alle Regeln aus `CLAUDE.md` und `specs/data/agent-links.md` gelten: MCP-Gate, Dialog im Vorschau-Chat,
  Bestätigungsstufen, nur die erlaubten Shell-Befehle, Journal nur über Datei-Edit / `write_section` /
  Zeilenersetzer, keine Persona-Daten aus Tests in `specs/` (`node specs/check-specs.mjs`).
- Abschnittsüberschriften bleiben unverändert (auch übersetzte Suffixe).
- Die Übersicht (`## Dashboard`) bleibt abgeleiteter Zustand: `derive-dashboard.mjs` / `write-dashboard.mjs`.
- Erste Begrüßung bleibt kurz mit genau einem Link (`data/chat-wording.md` → First contact).
- Template-Bau braucht weiterhin den Skill `liascript-templates` (`develop-template.md` Schritt 0).

## 4. Die Strangwahl

**Wo:** als erste Frage von `:init-course` (Formular im Vorschau-Chat, im Terminal nummerierte Optionen).
`start` bleibt unverändert: Es legt das leere Journal an und begrüßt mit genau einem Link „Kurs starten“.
*(Entscheidung des Entwurfs: So bleibt die Regel „genau ein Link beim ersten Kontakt“ bestehen, und das
leere Journal muss nicht wissen, welcher Strang kommt.)*

**Die Frage** in Lehrkraft-Sprache, etwa „Was haben Sie vor?“:
1. Einen Kurs planen (mehrere Einheiten, mit Lernzielen, Didaktik, Material) → **voller Weg** (wie heute)
2. Etwas Kleines: eine Seite mit Übersicht, ein paar Folien und Quizzen → **Mini-Kurs**
3. Vorhandenes Material (PDF, Folien, Webseite) in einen interaktiven Kurs verwandeln → **Umwandeln**
4. Ein Template bauen oder ein bestehendes anpassen → **Template**
5. Einen vorhandenen LiaScript-Kurs verbessern → wie heute `improve-existing` / `:analyze-existing`

**Mini-Kurs ersetzt „einzelne Stunde“.** *(Entscheidung der Lehrkraft.)* Der heutige Kurstyp
`single-lesson` wird bei neuen Kursen nicht mehr angeboten; wer eine einzelne Stunde will, nimmt den
Mini-Kurs und kann Didaktik bei Bedarf hinzunehmen. Die Fragen 3a/3b von `:init-course` laufen nur noch im
vollen Weg und ohne die Option „eine einzelne Stunde“. Bestehende Journale mit `single-lesson` bleiben
gültig und verhalten sich wie heute (Strang `full`). `:scaffold` bleibt die Schnellspur des vollen Wegs und
fragt nicht nach dem Strang. *(Letzteres Entscheidung des Entwurfs.)*

Was die Lehrkraft schon im Chat gesagt hat, wird genutzt (heutige Regel „Reuse what is known“): Ist der
Strang daraus klar, schlägt der Agent ihn vor statt neu zu fragen.

**Gespeichert** wird der Strang im `## Course Context` als eigenes Feld (z. B. `__Track:__ full | mini |
convert | template`; genaue Feldform ist Sache des Bauenden, sie muss für `journal-model.mjs` lesbar sein).
Fehlt das Feld (alte Journale), gilt `full`.

Nach der Wahl setzt derselbe Speichervorgang die `later`-Vermerke (Abschnitt 5) für den Strang. Das ist
Teil der Zusammenfassung, die die Lehrkraft bestätigt – kein eigener Schreibschritt.

## 5. Zustand `later` – „bei Bedarf“

### Bedeutung

`later` heißt: Dieser Abschnitt wird für den aktuellen Strang nicht gebraucht, ist aber nicht vergessen.
Er unterscheidet sich bewusst von `optional`:

| | `optional` (heute) | `later` (neu) |
|---|---|---|
| in der Übersicht | als Angebot sichtbar (Karte/Schritt) | höchstens eine eingeklappte Zeile „Bei Bedarf: …“ |
| zählt mit | nein | nein |
| kann `next` sein | ja, als Angebot | nie |
| Agent liest Abschnitt | ja, wenn die Aufgabe ihn nennt | nein |
| Prüfung meldet „fehlt“ | nein | nein |

Sichtbarer Text für die Lehrkraft: „bei Bedarf“ / „when needed“ (über das Sprachpaket lokalisiert).

### Form im Journal

Direkt unter der unveränderten Überschrift steht ein maschinenlesbarer Vermerk plus ein kurzer sichtbarer
Satz mit einem Aktivierungslink, zum Beispiel:

```markdown
## Didactics

<!-- state: later -->
_Bei Bedarf – für diesen Kurs noch nicht nötig._ [➕ hinzunehmen](agent:teaching/activate-section?section=didactics) `:activate-section didactics`
```

Die genaue Syntax entscheidet der Bauende. Anforderungen:
- `journal-model.mjs` erkennt den Vermerk eindeutig, ohne Sprachabhängigkeit.
- Der sichtbare Satz ist lokalisiert und klingt nicht nach Fehler.
- Der Vermerk funktioniert für `##`-Abschnitte; für `###`-Unterabschnitte unter `## Agents`
  (z. B. `### Learner Personas`) ebenfalls.
- `localize-journal.mjs` und `migrate-journal.mjs` lassen den Vermerk unangetastet.

### Wer was tut

- **`journal-model.mjs`**: liefert je Abschnitt `later: true/false`.
- **`derive-dashboard.mjs`**: Prozessschritte zu `later`-Abschnitten bekommen den Zustand `later`; sie werden
  nicht gezählt, nie `next`, und erscheinen gesammelt als eine eingeklappte Zeile. Die Prozessschritte des
  Strangs (Abschnitt 7) ersetzen die heutige feste Schrittliste.
- **`validate-journal.mjs`**: meldet `later`-Abschnitte nicht als fehlend oder leer; meldet aber einen
  Fehler, wenn ein `later`-Abschnitt trotzdem Inhalt hat (halb aktiviert).
- **`check-specs.mjs`**: prüft, dass keine Aufgabe eines Strangs einen dort `later` gesetzten Abschnitt als
  Pflichteingabe nennt.
- **`dashboard.js` / `dashboard.css`**: Darstellung der Zeile „Bei Bedarf“.
- **`templates/project-dashboard.yaml`**: `later` als erlaubter Zustand.
- **Agenten**: Aktivierungsschritte (`CLAUDE.md` → On Activation, `teaching-agent.yaml` Startreihenfolge)
  lesen `later`-Abschnitte nicht. Aufgaben, die einen `later`-Abschnitt als Eingabe nennen, behandeln ihn
  als leer und dürfen nicht nach seinem Inhalt fragen – stattdessen bieten sie die Aktivierung an, wenn er
  wirklich gebraucht wird.

### Aktivieren (Wachsen)

- Neuer Befehl des Teaching-Agenten, z. B. `:activate-section {section}` (Name ist Sache des Bauenden).
  Er entfernt den Vermerk, setzt den leeren Standardinhalt aus `specs/templates/journal.md` ein und startet
  die passende Aufgabe (Didaktik → `:create-didactics` usw.). Bestätigungsstufe: „im Chat bestätigen“.
- Der Agent **bietet** die Aktivierung von sich aus an, wenn er merkt, dass ein Abschnitt nötig wird –
  z. B. Mini-Kurs mit mehr als etwa sechs Folien oder einem zweiten Thema → Gliederung/Lernziele bzw.
  Wechsel auf den vollen Weg. Er aktiviert nie still.
- Wechsel des ganzen Strangs (z. B. Mini → voll): Strang-Feld ändern und die Vermerke des neuen Strangs
  setzen bzw. entfernen, in einer bestätigten Änderung. Nie wird Inhalt gelöscht.

## 6. Chat als Gedächtnis (alle Stränge, auch der volle Weg)

**Heute:** `read_chat` wird beim Start nur genutzt, um eine offene Nachricht, ein offenes Formular oder
unbeantwortete Klicks zu bedienen (`agent-links.md` → On start and after a gap). Was davor besprochen
wurde, holt sich der Agent nicht zurück. `read_chat` liefert standardmäßig die letzten 50 Einträge; der Chat
übersteht Neustarts (`.chats/<id>.json`, in test4 eine Datei mit 447 Einträgen über sieben Tage).

**Neu:** Beim Start und nach einer Pause (gleiche Auslöser wie heute) liest der Agent zusätzlich den
letzten Abschnitt des Chats und macht sich ein Bild:
- Worüber wurde zuletzt gesprochen, in welchem Befehl / Strang?
- Was wurde entschieden und **gespeichert** (im Journal bzw. in der Ergebnisdatei wiederzufinden)?
- Was wurde entschieden oder vorgeschlagen, aber **nicht gespeichert**?
- Welche Frage ist offen geblieben?

**Wie weit zurück:** höchstens die letzten 50 Einträge (Standard von `read_chat`); weniger, wenn danach
schon gespeichert wurde – maßgeblich ist der letzte Eintrag, der eine Speicherung bestätigt. Was älter ist,
gilt nur, wenn es im Journal steht. *(Entscheidung des Entwurfs; die Lehrkraft hat die Frage offen gelassen.)*

**Speichermarke:** Jede Chat-Nachricht, die eine Speicherung bestätigt, trägt eine unsichtbare, feste Marke
im Markdown (z. B. `<!-- saved: <Abschnitt/Datei> -->`; genaue Form Sache des Bauenden). Die Regel steht
einmal zentral bei der Speicherbestätigung (`data/chat-dialog.md`), nicht in jeder Aufgabe. liadev und
`read_chat` werden dafür nicht geändert. *(Entscheidung des Entwurfs, nach der Prüfung: Raten aus dem Text
wäre zu unzuverlässig.)*

**Verhalten:**
- Anknüpfen mit einem Satz statt einer neuen Begrüßung („Zuletzt haben wir die Quizfragen zu Folie 3
  besprochen …“), dann der nächste Schritt als Link. Die heutige Begrüßungsregel (nur bei leerem Chat oder
  nach etwa einer Stunde) bleibt; das Anknüpfen ersetzt dann die Begrüßung.
- Ungespeicherte Entscheidungen: **anbieten** zu speichern, nie still eintragen.
- Widerspruch zwischen Chat und Journal: das Journal gilt; der Agent nennt den Unterschied und fragt.
- Formulare von vor dem Neustart sind geschlossen (Verhalten von liadev) – der Agent fragt neu, statt auf
  eine alte Antwort zu warten.
- Ohne MCP-Gate (nur Terminal) entfällt das; der Agent liest dann wie heute nur das Journal.

**Wo:** eine Regel in `data/agent-links.md` (On start and after a gap), Verweis in
`teaching-agent.yaml` Startreihenfolge, `tasks/start.md` und `tasks/open-chat.md`; für die anderen drei
Agenten über ihre gemeinsame Regel „Same as the Teaching-Agent“.

## 7. Die Stränge

### Übersicht: welche Abschnitte je Strang aktiv sind

| Abschnitt | voll | Mini-Kurs | Umwandeln: übertragen | Umwandeln: neu aufbauen | Template |
|---|---|---|---|---|---|
| Course Context | ✓ | ✓ (kurz) | ✓ + Quelle | ✓ + Quelle | ✓ (kurz) |
| Outline | ✓ | ✓ (kurz: 1–3 Lernziele + Folienliste) | later | ✓ | later |
| Didactics | ✓ | later | later | later | later |
| Visual Identity | ✓ | later | ✓ | ✓ | later |
| Templates | ✓ | later | bei Bedarf aktiviert | bei Bedarf aktiviert | ✓ (Brief) |
| Agenda | ✓ | later | later | later | later |
| Sessions | ✓ | ✓ (genau Einheit 1) | ✓ (genau Einheit 1) | ✓ (genau Einheit 1) | later |
| Agents → Learner Personas | ✓ | later | later | later | later |
| Validation | ✓ | ✓ | ✓ | ✓ | later |
| Publishing | optional | optional | optional | optional | ✓ |
| Analysis Status | nur improve-existing | later | later | later | later |
| Notes Backup | ✓ | ✓ | ✓ | ✓ | ✓ |

*(Entscheidung des Entwurfs, im Einzelfall vom Bauenden anpassbar, solange die Anti-Ziele gelten.)*

Jeder Strang hat seine eigene Liste von Prozessschritten in der Übersicht (siehe unten). Ergebnisdatei:
`single-file` (`README.md` im Projekt), wie es `data/file-structure-modes.md` schon kennt.

**Die eine README ist Einheit 1.** *(Entscheidung des Entwurfs, nach der Prüfung.)* Mini-Kurs und
Umwandeln führen ihre `README.md` als einzige Einheit in `## Sessions` (Einheit 1, ohne
Planungsskizze-Pflicht und ohne Promote-Schritt). So bleiben Prüfbericht (`#### Validation Report`),
Erledigt/Freigabe, `unitState`/`unitAction` und die Befehle mit Nummer (`:validate-course 1`,
`:quick-fix 1 …`, `:try-as-learner 1`, `check-material.mjs`) unverändert nutzbar – es gibt kein zweites
Zustandsmodell ohne Einheiten. `## Validation` hält wie heute nur die Kurs-Zusammenfassung.
Schlägt der Agent beim Umwandeln einer sehr großen Quelle mehrere Dateien vor, ist das ein Wechsel auf den
vollen Weg (`multi-file`, Agenda aktivieren) und wird als solcher angeboten.

### 7.1 Mini-Kurs

**Für:** eine Seite mit Übersicht, ein paar Folien (etwa 3–6) und Quizzen. Eine Einheit, ein Link.

**Ablauf (Teaching-Agent):**
1. Kurzes Gespräch, ein bis zwei Runden: Thema, Lernende, Umfang, was die Lernenden am Ende können sollen.
   Der Agent besteht auf 1–3 Lernzielen und hakt nach, wenn sie vage sind.
2. Speichern (eine Bestätigung): kurzer Kurskontext, kurze Gliederung (Lernziele + Folienliste mit je einem
   Satz), `later`-Vermerke.
3. Material: der Agent schreibt die `README.md` (Übersicht, Folien, Quizze) im Stil von
   `:coauthor-materials`, aber für eine Datei und ohne Session-Skelett / Promote-Schritt.
4. Prüfen: `check-material.mjs` + Syntaxprüfung; Bericht in `## Validation`.
5. Angebot: einmal als Lernende ausprobieren (`:try-as-learner`), danach optional Veröffentlichen.

**Prozessschritte in der Übersicht:** Rahmen & Lernziele → Material schreiben → Prüfen → (Veröffentlichen, optional).

**Wachsen:** wird es mehr als etwa sechs Folien oder kommt ein zweites Thema, bietet der Agent den
Wechsel auf den vollen Weg an (Abschnitt 5, Aktivieren).

### 7.2 Umwandeln

**Für:** eine Quelle – PDF, PowerPoint/Folien oder Webseite (URL) – wird zu einem interaktiven
LiaScript-Kurs.

**Ablauf:**
1. **Teaching-Agent – Quelle sichten.** Die Lehrkraft gibt die Quelle (Datei im Projekt oder URL). Der Agent
   sagt in zwei, drei Sätzen, was drinsteckt: Umfang, Gliederung, Bilder, vorhandene Aufgaben,
   Sprechernotizen.
2. **Rechte klären.** Eine Frage: Ist das eigenes Material bzw. darf es so verwendet werden? Bei fremden
   Webseiten / Verlagsmaterial schlägt der Agent „neu aufbauen“ mit eigenen Formulierungen und
   Quellenangabe vor, statt zu kopieren.
3. **Weg wählen** (Formular):
   - **Übertragen:** Inhalt und Reihenfolge bleiben; passende Stellen werden interaktiv (Quiz aus
     vorhandenen Fragen, Aufklappen statt Lösungsfolie, Animation statt Folienaufbau, Vorlesetext aus
     Sprechernotizen).
   - **Neu aufbauen:** Die Quelle ist Grundlage. Der Agent schlägt Lernziele und eine neue Gliederung vor,
     kürzt und ordnet um.
4. Speichern (eine Bestätigung): Kurskontext mit Quelle (Datei/URL) und Weg; beim Neu-Aufbauen die
   Gliederung; `later`-Vermerke.
5. **Artist-Agent – Aussehen.** Farben, Schriften, Logo aus der Quelle übernehmen (`liascript-theming`,
   wenn installiert) → `## Visual Identity`; Bilder aus der Quelle übernehmen oder ersetzen über die
   heutigen Bildschritte (`create-image`).
6. **Teaching-Agent – Material.** `README.md` schreiben (bei sehr großen Quellen schlägt er mehrere Dateien
   vor). Braucht eine Interaktion etwas, das LiaScript nicht selbst kann: `:suggest-templates` anbieten
   (aktiviert `## Templates`).
7. **Development-Agent – nur bei Bedarf:** eigenes Template (über den Template-Strang-Ablauf) oder Export
   bzw. Veröffentlichen am Ende.
8. **Tester:** `check-material.mjs` + Syntaxprüfung, dann ein kurzer Durchgang aus Sicht der Lernenden
   (Learner-Agent `review-as-persona` ohne gespeicherte Persona – mit einer im Gespräch beschriebenen
   Zielgruppe – oder `:try-as-learner`).

**Am Stück.** *(Entscheidung der Lehrkraft.)* Die Schritte 5–8 laufen wie bei `:build-session` als
Unterschritte eines Durchgangs, mit **einer** Bestätigung zu Beginn (nach Schritt 4), die alle
Schreibvorgänge des Durchgangs abdeckt; jeder Unterschritt liest nur den eigenen Teil des Journals. Am Ende
sieht die Lehrkraft Ergebnis und Prüfbericht und kann korrigieren (`:quick-fix 1 …`). Einzige Rückfrage
unterwegs: Ist das Aussehen der Quelle unklar (z. B. PDF ohne erkennbare Farben/Schriften), fragt der
Artist-Agent einmal kurz nach. Git, Veröffentlichen und externe Browser-Sitzungen bleiben auch hier im
Terminal zu bestätigen und sind nicht Teil des Durchgangs. Wie bei `:build-session` gilt eine Schleifen-
Obergrenze (Iteration Pattern aus `CLAUDE.md`): bleibt die Prüfung nach der Obergrenze rot, berichtet der
Agent die offenen Punkte statt weiterzumachen.

**Prozessschritte in der Übersicht:** Quelle & Weg → (Gliederung, nur neu aufbauen) → Aussehen → Material → Prüfen & Ausprobieren → (Veröffentlichen, optional).

**Quellen lesen:** PDF über das Lese-Werkzeug des Agenten (Seiten); Webseiten über das Web-Werkzeug des
Agenten; PowerPoint (`.pptx`) braucht einen Weg, Text, Notizen, Bilder und Farben herauszuholen. Welcher
Weg (Skill, Projektskript, Umweg über PDF) ist Sache des Bauenden – er muss aber in die Liste der erlaubten
Befehle passen bzw. dort ergänzt werden.

### 7.3 Template

**Für:** ein neues LiaScript-Template bauen oder ein bestehendes anpassen und auf GitHub veröffentlichen.

**Ablauf:**
1. **Teaching-Agent** stellt die Strangfrage und speichert in **einer** Bestätigung einen verkürzten
   `:init-course`-Stand: Sprache bzw. Sprachpaket, `language:`-Kopf, Strang-Feld, kurzer Kurskontext
   (Zweck des Templates), `later`-Vermerke. Dann übergibt er an den Development-Agenten
   (`agent:development/switch`), der **komplett übernimmt**. *(Entscheidung des Entwurfs: Das Einrichten des
   Journals bleibt beim Teaching-Agenten; der Schreibbereich des Development-Agenten wächst nur um den Brief.)*
2. **Development-Agent – Anliegen klären:** neu oder anpassen? Bei „anpassen“: Ist es ein fremdes Template
   aus dem Katalog (wird geforkt und verändert) oder ein eigenes, das schon auf GitHub liegt (wird geklont)?
   Was soll es können, für wen, ein Beispiel?
3. **Brief schreiben** in `## Templates` (`### {id} (in development)`). Im Template-Strang schreibt der
   Development-Agent den Brief selbst (im vollen Weg weiterhin der Teaching-Agent über
   `:suggest-templates`).
4. **Bauen und testen:** `:develop-template {id}` wie heute (Skill `liascript-templates` Pflicht,
   Modelltests, Ausprobieren in der Vorschau).
5. **Abnahme:** statt `:manage-templates` des Teaching-Agenten (es gibt keinen Kurs, in den übernommen wird)
   probiert die Lehrkraft die Template-README in der Vorschau aus und gibt frei.
6. **Veröffentlichen:** `:publish-template {id}` – eigenes Repository, Topic `liascript-template`,
   Versions-Tag; bei einem Fork optional ein Pull Request ans Original. Der Schritt „Kurs-Imports umstellen“
   entfällt im Template-Strang. Git und Veröffentlichen werden wie heute im Terminal bestätigt.

**Prozessschritte in der Übersicht:** Anliegen & Brief → Bauen & testen → Ausprobieren & freigeben → Veröffentlichen.

**Anpassungen an bestehenden Aufgaben:** `develop-template.md` (Brief-Ursprung, Abnahme ohne
`:manage-templates` im Template-Strang), `publish-template.md` (ohne Import-Umstellung, Fork/Klon eines
vorhandenen Repos), `development-agent.yaml` (neuer Einstieg, z. B. `:start-template`, Name Sache des
Bauenden). Für Fork/Klon eines fremden Template-Repos muss die Liste erlaubter Befehle erweitert werden
(heute ist `gh repo fork` nur für den Katalog-PR erlaubt); alternativ das MCP-Werkzeug `git_clone`.

## 8. Betroffene Dateien (Orientierung, nicht abschließend)

- `CLAUDE.md` (Befehlstabelle, On Activation, erlaubte Befehle)
- `specs/agents/teaching-agent.yaml`, `development-agent.yaml` (Befehle, Startreihenfolge, Lesebereich)
- `specs/tasks/init-course.md` (Strangfrage, `later`-Vermerke), neue Aufgaben für Mini-Kurs, Umwandeln,
  Aktivieren, Template-Einstieg; Anpassungen in `develop-template.md`, `publish-template.md`, `start.md`,
  `open-chat.md`, `update-dashboard.md`, `validate-course.md`
- `specs/templates/journal.md`, `course-context.yaml`, `project-dashboard.yaml`
- `specs/data/agent-links.md` (Chat-Gedächtnis), `file-structure-modes.md`
- `specs/dashboard/journal-model.mjs`, `derive-dashboard.mjs`, `validate-journal.mjs`, `actions.mjs`,
  `dashboard.js`, `dashboard.css`, Sprachpakete, `check.mjs` (Modelltests) und `fixtures/`
- `specs/check-specs.mjs` (Spec-Wächter, falls neue Regeln geprüft werden sollen)

## 9. Prüfen

- Modelltests in `specs/dashboard/check.mjs` je Strang: Journal mit `later`-Abschnitten → abgeleitete
  Übersicht (Schritte, Zählung, `next`), `validate-journal.mjs` ohne Fehlmeldungen; Aktivieren eines
  Abschnitts; alte Journale ohne Strang-Feld verhalten sich wie heute.
- `node specs/check-specs.mjs` im Repo-Root grün.
- Danach ein Tandem-Test in einem neuen Testordner (Aufbau wie test4): je eine Runde Mini-Kurs, Umwandeln
  (mit einem PDF und einer `.pptx`), Template, dazu ein Neustart mitten in einer Runde für das
  Chat-Gedächtnis.

## 10. Was dem Bauenden überlassen ist

- Genaue Syntax des `later`-Vermerks und des Strang-Felds (Anforderungen in Abschnitt 4 und 5).
- Namen neuer Befehle und Aufgabendateien.
- Ob Mini-Kurs und Umwandeln eigene Aufgabendateien bekommen oder Varianten bestehender Aufgaben sind –
  Hauptsache, jede Aufgabe bleibt allein lesbar und der Agent liest pro Befehl nur, was er braucht.
- Weg zum Auslesen von `.pptx`-Dateien.
- Darstellung der Zeile „Bei Bedarf“ in der Übersicht.

## 11. Entscheidungen dieses Entwurfs (bitte prüfen)

1. Die Strangfrage steht in `:init-course`, nicht in der ersten Begrüßung von `start`.
2. Template anpassen = beides: fremdes Katalog-Template forken oder eigenes GitHub-Template klonen.
3. Im Template-Strang schreibt der Development-Agent den Brief selbst, und die Abnahme läuft ohne
   `:manage-templates`.
4. Chat-Gedächtnis: höchstens die letzten 50 Einträge, ab der letzten bestätigten Speicherung; Älteres gilt
   nur, wenn es im Journal steht.
5. Mini-Kurs: 1–3 Lernziele sind Pflicht; ab etwa sechs Folien oder einem zweiten Thema bietet der Agent
   den vollen Weg an.
6. Umwandeln fragt nach den Rechten an der Quelle und schlägt bei fremdem Material „neu aufbauen“ vor.
7. Welche Abschnitte je Strang `later` sind: Tabelle in Abschnitt 7.
8. Die eine `README.md` von Mini-Kurs und Umwandeln ist intern Einheit 1 in `## Sessions`.
9. Im Template-Strang richtet der Teaching-Agent das Journal verkürzt ein (eine Bestätigung), dann
   übernimmt der Development-Agent.
10. Speicherbestätigungen im Chat tragen eine unsichtbare Marke für das Chat-Gedächtnis.
11. `:scaffold` bleibt beim vollen Weg; alte `single-lesson`-Journale bleiben gültig.

**Von der Lehrkraft entschieden:** Mini-Kurs ersetzt „einzelne Stunde“; Umwandeln läuft am Stück mit
einer Bestätigung zu Beginn.
