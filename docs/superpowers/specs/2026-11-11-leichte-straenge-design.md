# Leichte Stränge: Mini-Kurs, Umwandeln, Template – und der Chat als Gedächtnis

Stand: 2026-11-12 · Status: Etappe 1 umgesetzt (in `main`); Überarbeitung für Etappe 2 und 3 freigegeben

> **Überarbeitung 2026-11-12:** neuer Strang **Gestaltung** (7.4), gemeinsame Bausteine für Umwandeln und
> Gestaltung (7.5), geschärfte Abläufe für Umwandeln (7.2) und Template (7.3), neue Etappenfolge (12).
> Die Abschnitte 4–6 sind mit Etappe 1 umgesetzt; wo die Umsetzung vom Entwurf abweicht, gilt der Code.

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
- Vier leichte Stränge: **Mini-Kurs**, **Umwandeln**, **Template**, **Gestaltung** (Aussehen und Bilder
  eines vorhandenen Kurses, ohne den Lehrtext zu ändern).
- Ein neuer Abschnittszustand **`later`** („bei Bedarf“) für Journal-Abschnitte, die der Strang nicht braucht.
- Der Agent knüpft nach einem Neustart am Chat an.

**Nicht-Ziele (jetzt)**
- Keine zweite Journal-Vorlage, keine eigene „leichte“ Journal-Datei.
- Kein neuer Agent. Die vier Agenten (Teaching, Artist, Learner, Development) bleiben.
- Der volle Kursweg ändert sich nur an zwei Stellen: die Strangfrage am Anfang und das Chat-Gedächtnis.
- Diese Ideen kommen später, nicht in diesem Vorhaben: Kurs übersetzen, nur veröffentlichen/exportieren
  (Development allein), fremden Kurs prüfen (Bericht statt Journal). *(„Nur Design ändern“ ist seit der
  Überarbeitung als Strang Gestaltung Teil des Vorhabens.)*
- Der Gestaltungs-Strang ändert kein Folien-Layout (Spalten, Kästen, Folien teilen) – siehe 7.4.
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
- Der Gestaltungs-Strang ändert Lehrtext, Quizze oder die Folienfolge.
- Ein Bild mit unklarer Lizenz bleibt still im Kurs – es wird gemeldet und die Lehrkraft entscheidet.
- Ein langer Durchgang (Umwandeln) bricht nach einem Neustart ab und beginnt von vorn, obwohl Teile schon
  gespeichert sind.

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
5. Einen vorhandenen LiaScript-Kurs verbessern → **Folgefrage** „Was soll besser werden?“
   *(Überarbeitung, Entscheidung des Entwurfs: so bleibt die erste Frage bei fünf Optionen)*:
   1. Inhalt und Aufbau → wie heute `improve-existing` / `:analyze-existing` (voller Weg)
   2. Nur das Aussehen (Farben, Schriften, Logo) → **Gestaltung**, Umfang `look`
   3. Nur die Bilder (prüfen, ersetzen, neue dazu) → **Gestaltung**, Umfang `images`
   4. Aussehen und Bilder → **Gestaltung**, Umfang `both`

**Abgrenzung Umwandeln / Verbessern:** Ist die Quelle schon LiaScript (`.md` mit LiaScript-Kopf), ist es
Option 5; PDF, PowerPoint und Webseiten sind Option 3. Der Agent schlägt die passende Option vor, wenn die
Lehrkraft die Datei schon genannt hat.

**Kurs mit Journal:** Hat das Projekt schon einen gefüllten `## Course Context` (z. B. ein voller Kurs),
gibt es keine Strangfrage. Aussehen und Bilder ändert dann der Artist-Agent direkt mit den Bausteinen aus
7.5 (`:apply-theme`, `:review-images`) – das ist kein Strangwechsel.

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

| Abschnitt | voll | Mini-Kurs | Umwandeln: übertragen | Umwandeln: neu aufbauen | Template | Gestaltung |
|---|---|---|---|---|---|---|
| Course Context | ✓ | ✓ (kurz) | ✓ + Quelle | ✓ + Quelle | ✓ (kurz) | ✓ (kurz) + Kursdateien |
| Outline | ✓ | ✓ (kurz: 1–3 Lernziele + Folienliste) | later | ✓ | later | later |
| Didactics | ✓ | later | later | later | later | later |
| Visual Identity | ✓ | later | ✓ | ✓ | later | ✓ (bei `images`: nur Bildstil) |
| Templates | ✓ | ✓ (nie later) | ✓ (nie later) | ✓ (nie later) | ✓ (Brief) | ✓ (nie later) |
| Agenda | ✓ | later | later | later | later | later |
| Sessions | ✓ | ✓ (genau Einheit 1) | ✓ (genau Einheit 1) | ✓ (genau Einheit 1) | later | ✓ (eine Einheit je Kursdatei; nur Bilder + Prüfbericht) |
| Agents → Learner Personas | ✓ | later | later | later | later | later |
| Validation | ✓ | ✓ | ✓ | ✓ | later | ✓ |
| Publishing | optional | optional | optional | optional | ✓ | optional |
| Analysis Status | nur improve-existing | later | later | later | later | later |
| Notes Backup | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

*(Entscheidung des Entwurfs, im Einzelfall vom Bauenden anpassbar, solange die Anti-Ziele gelten.
`## Templates` ist seit Etappe 1 nie `later`, weil dort der Import der Übersicht dokumentiert ist.)*

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

**Für:** eine Quelle – PDF, PowerPoint (`.pptx`) oder Webseite (URL) – wird zu einem interaktiven
LiaScript-Kurs. Ist die Quelle schon LiaScript, ist es „Verbessern“ (Abschnitt 4, Option 5).

**Ablauf:**
1. **Teaching-Agent – Quelle sichten.** Die Lehrkraft gibt die Quelle (Datei im Projekt oder URL). Der Agent
   liest sie mit dem Baustein „Quelle auslesen“ (7.5) und sagt in zwei, drei Sätzen, was drinsteckt:
   Umfang, Gliederung, Bilder, vorhandene Aufgaben, Sprechernotizen. Danach liest er die Quelle nicht noch
   einmal, sondern nur ihren **Auszug** (7.5) – auch nach einem Neustart.
2. **Rechte klären.** Eine Frage mit drei Antworten: eigenes Material · freie Lizenz (welche?) · fremdes
   Material. Gespeichert als Feld im Strang-Block (`Source rights`). Folgen:
   - *eigenes:* alles darf übernommen werden.
   - *freie Lizenz:* Übernahme mit Nennung im Nachweis-Kapitel (Quelle, Urheber, Lizenz).
   - *fremd:* der Agent schlägt „neu aufbauen“ mit eigenen Formulierungen vor; Bilder der Quelle werden
     nicht übernommen, sondern im Bildschritt ersetzt; die Quelle steht als Literaturangabe im Kurs.
3. **Weg und Umfang wählen** (ein Formular):
   - **Übertragen:** Inhalt und Reihenfolge bleiben; passende Stellen werden interaktiv (Quiz aus
     vorhandenen Fragen, Aufklappen statt Lösungsfolie, Animation statt Folienaufbau).
   - **Neu aufbauen:** Die Quelle ist Grundlage. Der Agent schlägt Lernziele und eine neue Gliederung vor,
     kürzt und ordnet um.
   - **Sprechernotizen als Vorlesetext?** (ja/nein; nur wenn die Quelle welche hat).
   - **Größe:** Hat die Quelle mehr als etwa 15 Folien/Seiten bzw. mehr als ein Thema, bietet der Agent
     **jetzt**, vor dem Schreiben, den vollen Weg mit mehreren Dateien an – nicht erst am Ende.
     *(Überarbeitung: vorher stand das erst in Schritt 6.)* Nimmt die Lehrkraft den vollen Weg, endet
     das Umwandeln hier: Der Auszug der Quelle (7.5) wird Eingabe für `:create-outline` und später für
     `:coauthor-materials`; es gibt **keinen** Umwandel-Durchgang je Einheit. *(Entscheidung des Entwurfs.)*
4. Speichern (eine Bestätigung): Kurskontext mit Strang-Block (Quelle, Weg, Rechte); beim Neu-Aufbauen
   die Gliederung; `later`-Vermerke. Das ist zugleich die **Startbestätigung des Durchgangs** (Schritte
   5–8), die alle Schreibvorgänge des Durchgangs abdeckt. Das Formular fragt dafür auch, was
   `:build-session` vorab fragt: Bildquelle (freie Fotos · erzeugen · eigene · ohne Bilder) und wer freie
   Fotos auswählt (Lehrkraft am Ende · Agent mit Begründung).
5. **Artist-Agent – Aussehen.** Visual Identity „aus der Quelle“ (7.5): Farben, Schriften, Logo aus der
   Quelle übernehmen (`liascript-theming`, wenn installiert). Ist das Aussehen unklar (z. B. PDF ohne
   erkennbare Farben), fragt er einmal kurz nach – die einzige Rückfrage unterwegs.
6. **Teaching-Agent – Material.** `README.md` schreiben; das Theme steht gleich im Kopf. Braucht eine
   Interaktion etwas, das LiaScript nicht selbst kann: `:suggest-templates` wird **nach** dem Durchgang
   angeboten, nicht mittendrin. Bildstellen der Quelle werden zu `#### Images`-Einträgen (7.5, Bildbestand).
7. **Artist-Agent – Bilder.** Bildschritt über die Einträge aus Schritt 6 (7.5, Bildbestand; danach das
   heutige `create-image`).
8. **Prüfen:** `check-material.mjs` + Syntaxprüfung, dann ein kurzer Durchgang aus Sicht der Lernenden:
   Learner-Agent `review-as-persona` mit einer **Gelegenheits-Persona**, die aus der Zielgruppe im
   Kurskontext gebildet und nicht gespeichert wird.

**Am Stück, mit Haltepunkten.** *(Lehrkraft: am Stück mit einer Startbestätigung. Überarbeitung:
Haltepunkte.)* Den Durchgang führt der Teaching-Agent mit `:convert-course`; er bekommt dieselbe Ausnahme wie
`:build-session` in `CLAUDE.md` → Agent Coordination (Artist- und Learner-Abläufe als Unterschritte).
Die Schritte 5–8 laufen als Unterschritte eines Durchgangs; jeder
Unterschritt liest nur den eigenen Teil des Journals. **Jeder Unterschritt speichert sein Ergebnis sofort**
und meldet es im Chat mit der Speichermarke (`<!-- saved: … -->`). Nach einem Neustart erkennt der Agent
über das Chat-Gedächtnis den letzten fertigen Unterschritt und bietet an, **dort weiterzumachen** – er
beginnt nicht von vorn. Schleifen-Obergrenze 3 (Iteration Pattern aus `CLAUDE.md`): bleibt die Prüfung rot,
berichtet der Agent die offenen Punkte. Am Ende sieht die Lehrkraft Ergebnis und Prüfbericht und kann
korrigieren (`:quick-fix 1 …`). Git, Veröffentlichen und externe Browser-Sitzungen bleiben im Terminal zu
bestätigen und sind nicht Teil des Durchgangs.

**Prozessschritte in der Übersicht:** Quelle & Weg → (Gliederung, nur neu aufbauen) → Aussehen → Material → Prüfen & Ausprobieren → (Veröffentlichen, optional).
*(Der Bildschritt gehört zu „Material“, wie im vollen Weg.)*

**Grenzen, offen gesagt:**
- **PDF:** Text und Seitenbilder liest das Lese-Werkzeug des Agenten (in Abschnitten von höchstens 20
  Seiten). Bilder löst `pdfimages` (poppler) heraus *(Lehrkraft, 2026-11-12)*: zuerst `pdfimages -list`
  (welches Bild auf welcher Seite), dann `pdfimages -png -p <pdf> .cache/source/{slug}/img`; sehr kleine
  Bilder (Logos, Zierlinien) werden aussortiert. Beide Befehle kommen in die Liste erlaubter Befehle.
  Fehlt poppler, wird jede Bildstelle ein `wanted`-Eintrag mit Beschreibung (eigenes Bild, freies Foto
  oder erzeugt), und der Agent sagt in einer Zeile, dass mit poppler die Originale erhalten blieben.
  Bei fremden Quellen werden auch herausgelöste Bilder ersetzt (Rechte, Schritt 2).
- **Webseite:** Das Web-Werkzeug des Agenten liefert eine Zusammenfassung, nicht den Originaltext. Deshalb
  holt `read-source.mjs` die Seite selbst und zieht Überschriften, Absätze, Listen und Bilder mit Ziel heraus
  (7.5). Bilder fremder Seiten gelten als fremd (Ersetzen). *(Entscheidung des Entwurfs.)*
- **PowerPoint:** über das Projektskript aus 7.5 – Text, Sprechernotizen, Bilder und Theme-Farben.

### 7.3 Template

**Für:** ein neues LiaScript-Template bauen oder ein bestehendes anpassen und auf GitHub veröffentlichen.

**Journal:** *(Überarbeitung, von der Lehrkraft bestätigt.)* **oberflächliches
Journal**, nicht gar keins. Grund aus der Messung (test4): ruhende Abschnitte kosten nur etwa 1–2 %; dafür
bleiben Übersicht, nächster Schritt, Chat-Gedächtnis und Speichermarke ohne Sonderweg erhalten. Brief und
Status stehen wie heute in `## Templates`.

**Ablauf:**
1. **Teaching-Agent** stellt die Strangfrage und speichert in **einer** Bestätigung einen verkürzten
   `:init-course`-Stand: Sprache, `language:`-Kopf, Strang-Block, kurzer Kurskontext (Zweck des
   Templates), `later`-Vermerke. Dann übergibt er an den Development-Agenten (`agent:development/switch`),
   der **komplett übernimmt**.
2. **Development-Agent – Anliegen klären:** neu oder anpassen? Bei „anpassen“ drei Herkünfte:
   - ein Template **aus dem Katalog** von jemand anderem → Fork, dann Klon;
   - ein **eigenes**, das schon auf GitHub liegt → Klon;
   - eines, das **schon im Projekt** unter `lia-templates/{id}` liegt → kein Git-Schritt.
   Klonen bevorzugt über das MCP-Werkzeug `git_clone` (keine neue Shell-Freigabe nötig); nur der Fork
   braucht `gh repo fork … --clone=false` in der Liste erlaubter Befehle. Was soll es können, für wen, ein
   Beispiel?
3. **Brief schreiben** in `## Templates` (`### {id} (in development)`). Im Template-Strang schreibt der
   Development-Agent den Brief selbst (im vollen Weg weiterhin der Teaching-Agent über `:suggest-templates`).
4. **Bauen und testen:** `:develop-template {id}` wie heute (Skill `liascript-templates` Pflicht,
   Modelltests, Ausprobieren in der Vorschau).
5. **Abnahme:** statt `:manage-templates` probiert die Lehrkraft die Template-README in der Vorschau aus und
   gibt frei.
6. **Veröffentlichen:** `:publish-template {id}` – eigenes Repository, Topic `liascript-template`,
   Versions-Tag; bei einem Fork optional ein Pull Request ans Original. „Kurs-Imports umstellen“ entfällt.
   Git und Veröffentlichen werden wie heute im Terminal bestätigt.
7. **Danach** *(Überarbeitung)*: ein Link „Template in einem Mini-Kurs verwenden“ – ein Strangwechsel zu
   `mini` über `:activate-section` (Track switch), der das neue Template gleich in `## Templates` übernimmt.

**Prozessschritte in der Übersicht:** Anliegen & Brief → Bauen & testen → Ausprobieren & freigeben → Veröffentlichen.

**Anpassungen an bestehenden Aufgaben:** `develop-template.md` (Brief-Ursprung, Abnahme ohne
`:manage-templates`), `publish-template.md` (ohne Import-Umstellung, Fork/Klon), `development-agent.yaml`
(Einstieg `:start-template`), `activate-section.md` (Wechsel template → mini).

### 7.4 Gestaltung *(neu)*

**Für:** ein vorhandener LiaScript-Kurs soll anders aussehen und/oder bessere Bilder bekommen. Der Lehrtext
bleibt, wie er ist.

**Umfang** (Folgefrage aus Abschnitt 4, Option 5): `look` (Farben, Schriften, Logo) · `images` (Bilder
prüfen, ersetzen, neue dazu) · `both`. Gespeichert als Modus im Strang-Block.

**Ablauf:**
1. **Teaching-Agent** stellt die Strangfrage mit Folgefrage, liest mit „Quelle auslesen“ (7.5) die
   Kursdateien und speichert in **einer** Bestätigung: kurzer Kurskontext (Zielgruppe, Sprache, Auslieferung),
   Strang-Block mit Umfang und Kursdateien, je Kursdatei eine Einheit in `## Sessions` (nur Titel, Datei,
   leerer Bildblock), `later`-Vermerke. Dann übergibt er an den Artist-Agenten (`agent:artist/switch`).

   **Kursdateien** *(Entscheidung des Entwurfs)*: nur Dateien **im Projekt**. Liegt der Kurs in einem
   Git-Repository, holt ihn der Agent mit dem MCP-Werkzeug `git_clone` ins Projekt (Bestätigung im
   Terminal); eine bloße Web-Adresse ohne Repository lädt die Lehrkraft selbst herunter. Jede `.md`-Datei mit
   LiaScript-Kopf ist eine Einheit – auch eine einzelne README mit vielen `##`-Kapiteln ist **eine** Einheit
   (die Bildliste nennt das Kapitel). Der Pfad steht im Einheitseintrag (`__File:__`); im Gestaltungs-Strang
   finden `create-image`, `validate-course` und `check-material.mjs` die Datei über diesen Eintrag statt
   über den File-Structure-Modus. Bildpfade bleiben, wie der Kurs sie hat; neue Bilder kommen in den
   Bildordner, den der Kurs schon nutzt, sonst neben die Datei.
2. **Artist-Agent – Aussehen** (bei `look`/`both`): Visual Identity „aus dem Kurs“ (7.5) – statt
   Didaktik-Angaben zwei bis drei Fragen (gewünschte Wirkung, Vorgaben wie Corporate Design, etwas, das
   bleiben soll) und das, was der Kurs schon mitbringt (vorhandener Kopf, Farben, Logo). Dann
   `:apply-theme` (7.5): Vorher-Nachher in der Vorschau, Bestätigung, Schreiben, Kontrastprüfung.
   Bei `images` entsteht nur der Bildstil in `## Visual Identity`, damit neue Bilder zusammenpassen.
3. **Artist-Agent – Bilder** (bei `images`/`both`): `:review-images {n}` je Einheit (7.5), danach der heutige
   Bildschritt (`create-image`) für alles, was ersetzt oder neu gemacht wird.
4. **Prüfen:** zurück zum Teaching-Agenten, `:validate-course {n}` je Einheit (Link mit dem Knopfwort der
   Übersicht) – im Gestaltungs-Strang aber **nur gestalterisch** *(Entscheidung des Entwurfs)*: Syntax,
   Kopf, Bilder (Pfad, Alt-Text, Nachweis, Lizenz), Kontrast. Inhaltliche Befunde (Lernziele, Didaktik,
   Fachliches) werden nicht bewertet und machen die Prüfung nicht rot; fallen sie auf, stehen sie als
   Hinweis in der Vorschlagsliste. Eine Lernenden-Prüfung entfällt – der Inhalt hat sich nicht geändert.
5. Optional Veröffentlichen, wenn die Auslieferung Link oder Plattform ist.

**Leitplanke:** Der Artist ändert in diesem Strang nur den Dateikopf, Bildzeilen, Alt-Texte und das
Nachweis-Kapitel. **Layout** – Spalten, Hinweiskästen, zu volle Folien teilen – gehört nicht dazu.
*(Entscheidung des Entwurfs; die Lehrkraft hat die Frage offen gelassen.)* Fällt dem Artist so etwas auf,
sammelt er es als **Vorschlagsliste** (Folie + ein Satz) und bietet am Ende den Teaching-Agenten mit
`:quick-fix {n} …` an. Grund: Layout ändert, wie Inhalt gelesen wird, und gehört damit zur Didaktik.

**Ausnahme beim Entfernen** *(Entscheidung des Entwurfs)*: Verweist ein Satz ausdrücklich auf ein Bild, das
entfernt wird („siehe Abbildung“), darf der Artist genau diesen Verweis anpassen; die Änderung steht in der
Bestätigung. Bilder, die Antwortoptionen eines Quiz sind, können nur ersetzt, nie entfernt werden.

**Prozessschritte in der Übersicht:** Rahmen → Aussehen → Bilder → Prüfen → (Veröffentlichen, optional);
bei `look` entfällt „Bilder“, bei `images` entfällt „Aussehen“.

**Wachsen:** Wünscht die Lehrkraft unterwegs inhaltliche Änderungen, ist das der Wechsel zu „Inhalt und
Aufbau“ (`improve-existing`, voller Weg) über `:activate-section` (Track switch); Bildblöcke und Visual
Identity bleiben erhalten.

### 7.5 Gemeinsame Bausteine *(neu)*

Umwandeln und Gestaltung brauchen dieselben Teile. Sie werden **einmal** gebaut und stehen auch im vollen
Weg zur Verfügung.

1. **Quelle auslesen** – Projektskript `node specs/dashboard/read-source.mjs <datei>` (neu, in die Liste
   erlaubter Befehle). Gibt einen kompakten Auszug aus:
   - `.pptx`: je Folie Titel, Text, Sprechernotizen, Bilder (werden nach `.cache/source/{slug}/` entpackt),
     Theme-Farben und -Schriften. Nur Node-Bordmittel (`zlib`), keine neue Abhängigkeit.
   - LiaScript-`.md`: Kopfzeilen (Theme, Imports), Folienliste, je Bild Folie, Alt-Text, Ziel, ob ein
     Nachweis vorhanden ist.
   - `.pdf`: nur Seitenzahl und Metadaten; den Inhalt liest das Lese-Werkzeug des Agenten.
   - URL: holt die Seite (Node `fetch`) und gibt Überschriften, Absätze, Listen und Bilder mit Ziel aus.
   Zweck: Der Agent liest Zahlen und Listen statt ganzer Dateien – das spart Tokens bei jedem Schritt.
2. **Auszug der Quelle** – nach dem Sichten schreibt der Agent einmal `.cache/source/notes.md` (Gliederung,
   Bildstellen, Aufgaben, Notizen; höchstens etwa eine Seite). Spätere Schritte und Neustarts lesen diesen
   Auszug statt der Quelle. *(Entscheidung des Entwurfs; Ort und Form Sache des Bauenden.)*
3. **Visual Identity aus Quelle oder Kurs** – Variante von `:create-visuals` ohne `## Outline` und
   `## Didactics`: Eingaben sind Auszug, vorhandene Farben/Schriften/Logo und zwei bis drei Fragen. Der
   volle Weg bleibt unverändert.
4. **`:apply-theme`** (Artist, neu) – schreibt das Theme aus `## Visual Identity` in den Kopf **aller**
   Kursdateien und ersetzt dabei ein älteres Theme. Vorher-Nachher in der Vorschau, eine Bestätigung im
   Chat, danach Kontrastprüfung (`check-material.mjs`). Schließt auch eine Lücke im vollen Weg: Heute kommt
   eine geänderte Visual Identity nie in schon angelegten Dateien an (das Theme wird nur beim Anlegen
   geschrieben, `data/file-structure-modes.md`). Wie der Theme-Teil im Kopf eindeutig abgegrenzt wird
   (z. B. Kommentar-Klammern), entscheidet der Bauende. **Vorhandenes Styling ohne diese Abgrenzung**
   (`@style`, `link:` auf CSS, Theme-Imports in einem fremden Kurs) listet `:apply-theme` vor dem Schreiben
   auf; die Lehrkraft entscheidet in derselben Bestätigung, ob es ersetzt oder behalten wird (Vorauswahl:
   ersetzen, weil zwei Themes sich überlagern). Imports von Makro-Templates bleiben immer.
   *(Entscheidung des Entwurfs.)*
5. **`:review-images {number?}`** (Artist, neu) – Bildbestand einer Einheit: jedes vorhandene Bild wird ein
   Eintrag in `#### Images` mit neuem Status `existing` (Folie, Alt-Text, Quelle, Lizenz bekannt/unklar).
   Je Bild wählt die Lehrkraft in einem Formular: behalten · im neuen Stil neu erzeugen · durch freies Foto
   ersetzen · entfernen. Bilder mit unklarer Lizenz sind vorausgewählt auf „ersetzen“, nie still
   „behalten“; stellt die Lehrkraft auf „behalten“, steht im Nachweis-Kapitel „Lizenz ungeklärt – von der
   Lehrkraft behalten“. Neue Bildstellen kommen dazu, indem die Lehrkraft in der Vorschau auf die Folie geht und
   „hier ein Bild“ schreibt (der Agent nimmt die Folie aus dem Ereignis-Kontext). Danach arbeitet das
   heutige `create-image` die offenen Einträge ab. Fehlende Alt-Texte werden ergänzt.

## 8. Betroffene Dateien (Orientierung, nicht abschließend)

Etappe 1 (umgesetzt): `tracks.mjs`, `journal-model.mjs`, `actions.mjs`, `derive-dashboard.mjs`,
`validate-journal.mjs`, `dashboard.js/.css`, Sprachpaket, `init-course.md`, `activate-section.md`,
`create-mini-course.md`, `chat-memory.md` u. a.

Etappe 2 und 3 (neu oder geändert):
- `specs/dashboard/tracks.mjs` – Strang `design` (Schritte `frame, look, images, check, publish`, je
  Umfang gekürzt), `laterOf("design")`; `journal-model.mjs` liest Umfang und Rechte aus dem Strang-Block.
- `specs/dashboard/read-source.mjs` (neu) mit Tests in `check.mjs`; `CLAUDE.md` → erlaubte Befehle.
- `specs/tasks/init-course.md` (Optionen 3–5 freischalten, Folgefrage), `activate-section.md`
  (Strangwechsel design → full, template → mini, convert → full), neue Aufgaben `convert-course.md`,
  `start-template.md`, `apply-theme.md`, `review-images.md`; Anpassungen in `create-visuals.md`
  (Variante ohne Didaktik), `create-image.md` (Status `existing`), `develop-template.md`,
  `publish-template.md`.
- `specs/templates/course-context.yaml` (Strang-Block: Umfang, Rechte), `session-skeleton.yaml`
  (Status `existing`, `__File:__` je Einheit im Gestaltungs-Strang), `visuals.yaml` (Abgrenzung des
  Theme-Teils); `validate-course.md` (gestalterischer Prüfmodus), `check-material.mjs` (Datei aus dem
  Einheitseintrag).
- `specs/agents/artist-agent.yaml` (`:apply-theme`, `:review-images`, Rolle im Gestaltungs-Strang),
  `development-agent.yaml` (`:start-template`), `teaching-agent.yaml`, `learner-agent.yaml`
  (Gelegenheits-Persona).
- `specs/check-specs.mjs` (Wächtersätze für die neuen Leitplanken).

## 9. Prüfen

- Modelltests in `specs/dashboard/check.mjs` je Strang (jetzt auch `design` mit allen drei Umfängen):
  abgeleitete Übersicht, `validate-journal.mjs` ohne Fehlmeldungen; alte Journale unverändert.
- Tests für `read-source.mjs` mit einer kleinen `.pptx`- und einer LiaScript-Fixture.
- `node specs/check-specs.mjs` im Repo-Root grün.
- **Vor Etappe 2:** der Tandem-Test von Etappe 1 (Mini-Kurs, voller Weg, Neustart) – seine Befunde fließen in
  den Plan ein.
- Nach jeder Etappe ein eigener Tandem-Test: Gestaltung an einem vorhandenen Kurs (test4) und an einem
  fremden LiaScript-Kurs; Umwandeln mit einem PDF und einer `.pptx`, mit Neustart mitten im Durchgang;
  Template neu und angepasst.

## 10. Was dem Bauenden überlassen ist

- Genaue Form der neuen Felder im Strang-Block (Umfang, Rechte). Der Block aus Etappe 1 heißt
  `Convert mode`; ob er zu einem allgemeinen `Mode` wird, entscheidet der Bauende – alte Journale müssen
  lesbar bleiben.
- Namen neuer Befehle und Aufgabendateien.
- Abgrenzung des Theme-Teils im Dateikopf.
- Ort und Form des Quellen-Auszugs.
- Darstellung von „Lizenz unklar“ in der Übersicht.

## 11. Entscheidungen dieses Entwurfs

*Alle Entscheidungen 7–27 am 2026-11-12 mit der Lehrkraft durchgegangen und bestätigt; Nr. 15 geändert.*

Aus der ersten Fassung (Etappe 1 umgesetzt):
1. Die Strangfrage steht in `:init-course`, nicht in der ersten Begrüßung von `start`.
2. Chat-Gedächtnis: höchstens die letzten 50 Einträge, ab der letzten bestätigten Speicherung.
3. Mini-Kurs: 1–3 Lernziele Pflicht; ab etwa sechs Folien oder einem zweiten Thema wird der volle Weg
   angeboten.
4. Die eine `README.md` von Mini-Kurs und Umwandeln ist intern Einheit 1 in `## Sessions`.
5. Speicherbestätigungen im Chat tragen eine unsichtbare Marke.
6. `:scaffold` bleibt beim vollen Weg; alte `single-lesson`-Journale bleiben gültig.

Neu mit der Überarbeitung:
7. Gestaltung ist eine Folgefrage von „Vorhandenen Kurs verbessern“, keine sechste Option.
8. **Gestaltung ändert kein Layout**; Layout-Ideen werden als Vorschlagsliste an den Teaching-Agenten
   (`:quick-fix`) gegeben. *(Offen gebliebene Frage der Lehrkraft.)*
9. `:apply-theme` und `:review-images` sind Bausteine für alle Wege, auch den vollen.
10. Bilder mit unklarer Lizenz sind auf „ersetzen“ vorausgewählt.
11. Umwandeln: Rechte als Feld mit drei Werten (eigen, frei lizenziert, fremd) und ihren Folgen.
12. Umwandeln: Größenfrage vor dem Schreiben (ab etwa 15 Folien/Seiten), nicht am Ende.
13. Umwandeln: Haltepunkte – jeder Unterschritt speichert sofort, nach einem Neustart geht es dort weiter.
14. Umwandeln: Gelegenheits-Persona aus der Zielgruppe, nicht gespeichert.
15. PDF-Bilder löst `pdfimages` heraus; ohne poppler werden sie als Bildstellen beschrieben. *(Von der
    Lehrkraft geändert.)*
16. `.pptx` über ein eigenes Projektskript nur mit Node-Bordmitteln.
17. Quellen-Auszug: einmal schreiben, danach nur ihn lesen.
18. Template: oberflächliches Journal statt keinem.
19. Template anpassen kennt drei Herkünfte (Katalog/Fork, eigenes GitHub/Klon, schon im Projekt); Klonen
    über das MCP-Werkzeug `git_clone`.
20. Nach dem Veröffentlichen eines Templates: Angebot, es in einem Mini-Kurs zu verwenden.

Nach der Prüfung durch einen Bauenden (2026-11-12):
21. Gestaltung arbeitet nur mit Kursdateien im Projekt (Git-Repo per `git_clone`); jede LiaScript-Datei ist
    eine Einheit, ihr Pfad steht im Einheitseintrag und gilt statt des File-Structure-Modus.
22. Die Prüfung im Gestaltungs-Strang ist nur gestalterisch; Inhaltliches wird Hinweis, nicht Fehler.
23. `:apply-theme` listet fremdes Styling auf und fragt (Vorauswahl ersetzen); Makro-Imports bleiben.
24. Beim Entfernen eines Bildes darf der Artist den ausdrücklichen Verweis darauf anpassen; Quiz-Bilder nur
    ersetzen.
25. Großer Umwandel-Stoff im vollen Weg: kein Umwandel-Durchgang je Einheit; der Auszug ist Eingabe für
    Gliederung und Material.
26. Webseiten liest `read-source.mjs` selbst, nicht das zusammenfassende Web-Werkzeug.
27. `:convert-course` bekommt die Ausnahme von `:build-session`; sein Startformular fragt auch Bildquelle
    und Fotoauswahl.

**Von der Lehrkraft entschieden:** Mini-Kurs ersetzt „einzelne Stunde“; Umwandeln läuft am Stück mit
einer Bestätigung zu Beginn; Umsetzung in Etappen.

## 12. Etappen *(Überarbeitung)*

- **Etappe 1** – Grundlage + Mini-Kurs: umgesetzt, in `main`.
- **Etappe 2a** – Gemeinsame Bausteine (7.5) + Gestaltung (7.4). Zuerst, weil sie kleiner ist, an
  vorhandenen Kursen sofort getestet werden kann und Umwandeln dieselben Teile braucht. Schließt nebenbei
  die Theme-Lücke im vollen Weg.
- **Etappe 2b** – Umwandeln (7.2), auf den Bausteinen aus 2a.
- **Etappe 3** – Template (7.3).
- **Vor 2a:** Tandem-Test von Etappe 1; seine Befunde gehen in den Plan für 2a ein.
