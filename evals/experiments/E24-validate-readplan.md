# E24 – Leseplan für validate-course (verworfen)

Branch: `experiment/e24-validate-readplan` · Basis: E23 · Stand: 28.11.2026 · Läufe: `/home/claude/runs/e24`

Design-Track, „bestanden mit Bedenken“ und „nur eigene Fotos“ nach `data/validate-course-cases.md`, Regelblätter by part,
quick-fix nur der Absatz „Findings outside the change“. `validate-course.md` 3.888 → 3.082 Wörter.

| Szenario (je 3 Läufe) | Tokens E23 → E24 | Dauer | Spec-Wörter | Code-Prüfungen |
|---|---|---|---|---|
| Kurze Nachprüfung | 111.158 → 121.623 (+9 %) | 102 → 147 s (+44 %) | 13.149 → 12.530 | alle / alle |
| Kursprüfung Mini-Kurs | 211.425 → 208.221 (−1,5 %) | 427 → 444 s | 28.389 → 26.917 | alle / alle |

Die Lesemenge sinkt nur wenig (die Läufe lasen Spickzettel-Teile und Prüfregeln trotzdem), die E24-Nachprüfungen
machten mehr Werkzeugaufrufe (34–39 statt 25–30) und fanden mehr Punkte außerhalb der Änderung. Kein Gewinn →
verworfen, kein Richter. Übernommen wird nur die Korrektur des Verweises auf `recheckExplain` (zwei Läufe fanden ihn
nicht im Template).

## Offene Spec-Fragen aus den Läufen (für André)

1. **Kursergebnis bei Done ❌:** Mit einer Einheit „bestanden mit Bedenken“ (Done ❌) schrieben 4 Läufe PASS with
   concerns, 2 FAIL – die Formel in `validate-course-full.md` Schritt 9 lässt beides zu.
2. **Veröffentlichen trotz offener Punkte:** nach geschlossener Nachprüfung nennt der Status „veröffentlichen“, obwohl
   ein `decide`-Punkt (z. B. fehlendes Vorlesen gegen die Kursregel) offen ist. Alle 6 Nachprüfungs-Läufe merkten es an.
3. **Freigabe nach Korrektur im Check:** Repariert die Kursprüfung das freigegebene Material (Schritt 4b), bleibt die
   alte Freigabe stehen.
