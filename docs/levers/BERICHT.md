# Hebel und Fixes – Task-Dateien gegen Skills

Stand: 2026-11-24 · Branches `experiment/levers-tasks` und `experiment/levers-skills` (beide ab `main` @ 6608166)

## Was verglichen wird

Beide Branches enthalten **dieselben Regeln, Wort für Wort**:

- **P1 – Cheat-Sheet nach Themen geteilt.** `data/liascript-cheat-sheet.md` ist jetzt ein Index, die Teile liegen in `data/cheat-sheet/`. Eine Prüfung des ganzen Dokuments liest alle Teile, ein gezielter Fix (quick-fix, kurze Nachprüfung) liest `00-checks.md` plus die Teile der betroffenen Konstrukte. Alle Verweise „→ Abschnittsname“ bleiben gültig, `check-specs.mjs` prüft Index und Teile zusammen.
- **P2 – build-session mit Subagenten.** Material, Fotosuche, Prüfung, Bericht und Persona-Review laufen als Subagenten mit Auftrag und vereinbarter Rückgabe. Der Hauptlauf behält seine Schleife, quick-fix, die Übersicht und die Rückgaben. Ohne Subagent-Werkzeug läuft alles wie bisher inline.
- **Sechs Spec-Fixes** aus der Blindbewertung des Pilots:
  1. quick-fix schreibt die Journal-Zeilen erst nach der Mini-Prüfung.
  2. Auf dem leichten Strang schreibt jede Änderung des Berichts die Kurszusammenfassung mit.
  3. Eine offene kurze Nachprüfung ergibt „PASS with concerns“ und **sperrt die Veröffentlichung**.
  4. Das Angebot `:try-as-learner` ist ein eigener Schritt und hält die Gate-Regel ein.
  5. Eine Einheit ohne Typ auf dem leichten Strang gilt als `n/a`.
  6. Die Zusammenfassung einer Einheit nennt keine Änderungsliste.

Der einzige Unterschied: In `levers-skills` sind `:quick-fix`, `:update-dashboard` und `:build-session` Skills mit bedingt geladenen Referenzen. Sie werden mit `docs/levers/assemble_skills.py` aus den Task-Dateien geschnitten, die Task-Dateien bleiben die einzige Quelle. `node docs/skills-pilot/coverage.mjs` meldet: 96 geschützte Sätze, keiner fehlt.

In beiden Branches laufen alle 120 Tests von `check-specs.mjs` und die 264 von `dashboard/check.mjs` grün.

## 1 · Lesemenge laut Regeln (berechnet)

`python3 docs/levers/measure.py` · Wörter · Mini-Kurs wie in den Läufen · Grundlast (≈ 10.600) nicht enthalten

| Szenario | main | Tasks + Hebel | Skills + Hebel |
|---|---|---|---|
| A quick-fix: Quiz verrät die Lösung, nach Prüfung, Freigabe | 17.205 | 15.910 (−8 %) | 14.290 (−17 %) |
| B quick-fix: Tippfehler, nach Prüfung, freigegeben | 17.205 | 15.001 (−13 %) | 13.163 (−23 %) |
| C build-session: Hauptkontext | 36.408 | 16.172 (−56 %) | 15.001 (−59 %) |
| C build-session: Subagenten zusammen | – | 40.527 | 40.527 |

- P2 verlagert die Last, es spart sie nicht. Die Gesamtmenge steigt, weil Material- und Prüf-Subagent jeweils das ganze Cheat-Sheet lesen. Der Hauptkontext, in dem laut euren Tandem-Tests die Regeln verwittern, sinkt dagegen um mehr als die Hälfte.
- Skills sparen zusätzlich 8–10 Prozentpunkte, vor allem durch bedingte Regelblätter und Abschnitte statt ganzer Dateien.

## 2 · Simulierte Läufe

Gleiches Modell, Terminal-Modus, vorgegebene Antworten der Lehrkraft. quick-fix: 2 Szenarien × 2 Wiederholungen × 2 Varianten. build-session: je ein Lauf, die Lernseite 2 eines vollen Kurses wurde dafür mit den echten Befehlen vorbereitet. Bewertet wurde **blind**: 14 Punkte für quick-fix, 12 für build-session. Belege, Protokolle und Bewertungen liegen in `runs/`.

### quick-fix

| | Tasks A | Skills A | Tasks B | Skills B | Referenz main* A / B |
|---|---|---|---|---|---|
| Blindbewertung | 12,5 · 13,5 → **93 %** | 11,5 · 11,5 → 82 % | 12,5 · 12,5 → **96 %** | 11,5 · 12 → 90 % | 12/13 · 11,5/12 |
| gelesene Spec-Wörter (Protokoll) | 25.617 · 23.862 | 27.367 · 29.160 | 28.416 · 27.121 | 23.606 · 26.717 | 25.709 · 28.183 |
| Dauer | 289 · 311 s | 304 · 284 s | 222 · 220 s | 250 · 250 s | 361 · 222 s |
| Tokens (Harness) | 175 k · 182 k | 194 k · 175 k | 171 k · 172 k | 173 k · 175 k | 173 k · 163 k |

\* Läufe aus dem ersten Pilot, mit einer älteren Bewertungsliste; nur als Orientierung.

**Die Fixes wirken, in beiden Varianten:**
- Kurszusammenfassung und Sperre bei offener Nachprüfung: 8 von 8 Läufen schreiben die Zusammenfassung mit und setzen „PASS with concerns“ (2 davon mit unsauberem Wortlaut). Im Pilot war das 0 von 2.
- `:try-as-learner` nach „Freigeben“: in 4 von 4 A-Läufen angeboten, korrekt als nächster Schritt in der Vorschau. Im Pilot 0 von 2.
- Reihenfolge Mini-Prüfung → Journal: in allen Läufen eingehalten. Nur ein Skill-Lauf schrieb das Material schon vor „Speichern“.

**P1 wirkt:** Kein Lauf las mehr das ganze Cheat-Sheet. In jedem Lauf wurden genau die passenden Teile gelesen (00 + 06 + 03 beim Quiz, 00 + 02 + 06 beim Tippfehler).

**Skills luden ihre Referenzen in 4 von 4 Läufen genau nach Bedingung.** `approval` wurde nur in A geladen, nie in B.

**Warum die gemessene Lesemenge kaum sinkt:** Fix 2 verweist auf einen Abschnitt von `validate-course.md`. In der Task-Variante gilt aber „eine Task-Datei immer vollständig lesen“, also lasen die Agenten dort die ganzen ~5.000 Wörter, und die Einsparung von P1 war wieder weg. Die Skill-Varianten lasen nur den Abschnitt, dafür aber `data/agent-links.md` (4.100 Wörter), das in den Inputs von update-dashboard steht. Die Task-Läufe übersprangen diese Datei. **Solche Lese-Entscheidungen der Agenten bewegen ±4.000 Wörter, mehr als die Struktur spart.**

### build-session

| | Tasks + Hebel | Skills + Hebel |
|---|---|---|
| Blindbewertung | 10 / 11 (knapp besser) | 10 / 11 |
| gelesene Spec-Wörter | 40.614 | 38.346 |
| Dauer · Tokens · Werkzeugaufrufe | 536 s · 249 k · 77 | 478 s · 244 k · 89 |
| Ergebnis | Lernseite 2 geschrieben, Prüfung 1 von 5 Runden, PASS with concerns (3 Punkte) | identisch im Ergebnis; 7 statt etwa 4 Writes |

**Einschränkung:** In dieser Testumgebung hatten die Läufe selbst kein Subagent-Werkzeug. Beide liefen deshalb nach der Rückfallregel inline, und diese Regel hat funktioniert. **P2 ist damit nur berechnet, nicht im Lauf gemessen.** Das muss ein echter Tandem-Test mit Claude Code zeigen.

## 3 · Urteil

1. **Die Fixes und P1 lohnen sich in beiden Varianten.** Die Fixes beheben genau die Fehler, die vorher beide Varianten machten. P1 senkt die Lesemenge gezielter Fixes ohne Qualitätsverlust. Ich würde beides nach `main` übernehmen.
2. **Task-Dateien schnitten in allen vier quick-fix-Vergleichen etwas besser ab** (93 % gegen 82 %, 96 % gegen 90 %), bei build-session gleichauf. Die Unterschiede liegen in Einzelfehlern: falscher Text in der Übersicht, altes Datum, Schreiben vor der Bestätigung. Ob die Skill-Struktur sie verursacht, lässt sich bei n = 2 nicht sagen. Ein plausibler Mechanismus: In `SKILL.md` verweist Schritt 2b auf „One journal write per fix“ „above“, die Regel steht aber in einer Referenz. Der Schnitt macht Verweise ungenau.
3. **Skills lesen laut Regeln 8–10 Prozentpunkte weniger, in den Läufen aber nicht messbar weniger.** Den Unterschied gleicht aus, was die Agenten selbst zusätzlich lesen.
4. **Empfehlung:** In `main` bei Task-Dateien bleiben und P1 sowie die Fixes übernehmen. P2 nach einem echten Test mit Subagenten übernehmen. Skills erst einführen, wenn
   - (a) die Inputs eindeutig sagen, was zu lesen ist, damit Lese-Entscheidungen nicht mehr streuen,
   - (b) Verweise in Skills auf die Referenz zeigen statt auf „above“, und
   - (c) die Regel „Task-Datei vollständig lesen“ Abschnittsverweise erlaubt. Davon profitieren auch Task-Dateien.

## 4 · Neue Spec-Befunde aus diesen Läufen

- **„Task-Datei vollständig lesen“ ↔ Abschnittsverweise:** Ein Verweis wie `validate-course.md` → One unit, one run kostet die ganze Datei. Vorschlag: Regeln, die mehrere Tasks brauchen, in ein Regelblatt verschieben, zum Beispiel die Kurszusammenfassung des leichten Strangs.
- **`data/agent-links.md` in den Inputs von update-dashboard:** Im Terminal ist es unklar und wird mal gelesen, mal nicht. Vorschlag: „nur bei offenem Gate“.
- **Wortlaut der Kurszusammenfassung bei offener Nachprüfung** fehlt in `outcome_words`. Alle 8 Läufe erfanden eigene Wörter.
- **Freigabe vorhanden, aber nicht im Entscheidungsfeld:** Die Fixture hatte `approved: true` ohne Eintrag „Material freigegeben“. Alle A-Läufe zeigten daraufhin korrekt das Formular. Der Widerspruch selbst bleibt aber unbemerkt.
- **Befunde außerhalb der Änderung** (z. B. das falsche „jede Antwort hat ▶“ im alten Bericht): Alle 8 Läufe meldeten sie nur im Chat, weil der Bericht dafür keinen Weg hat.
- **Tonprüfung ohne Didaktik:** Auf dem Mini-Strang ruht die Didaktik, die Prüfung „Ton passt zur Didaktik“ hat dann keinen Maßstab. 4 von 8 Läufen ließen sie aus.
- **build-session:** ein unbedingtes „Super gemacht!“ trotz Regel für ehrliches Lob, und „gemessene Dauer“ ist nicht definiert, wenn die Skizze schon vor dem Lauf bestand. Beides trat in beiden Läufen auf.

## Nachvollziehen

```bash
git checkout experiment/levers-tasks     # oder experiment/levers-skills
node --test specs/check-specs.mjs        # 120/120
node specs/dashboard/check.mjs           # 264/264
python3 docs/levers/measure.py           # Lesemenge main / tasks / skills (liest aus den git-Refs)
# nur im Skills-Branch:
python3 docs/levers/assemble_skills.py && node docs/skills-pilot/coverage.mjs
```
