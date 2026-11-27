# E16 – was jede Sitzung liest: Skills per Skript, Persona nicht doppelt

Branch: `experiment/e16-session-reads` · Basis: `develop` @ fa4afd3 (mit E10b, E14, E15) · Stand: 27.11.2026

## Hypothese

Neben den Aufgaben liest jede Sitzung dieselben Dateien. Zwei davon tragen vermeidbare Last:
`teaching-agent.yaml` wiederholt Persona und Iterationsmuster, die schon in `CLAUDE.md` stehen, und führt die
Abhängigkeitsliste für den Build; die Skill-Erkennung liest Regeln und sucht bis zu neun Ordner von Hand ab.

## Änderung

- **E16a:** `specs/dashboard/detect-skills.mjs` gibt für jeden der sieben Skills den ersten Ordner mit `SKILL.md`
  aus oder „not found“; `data/skills.md` → Detection, Aktivierungsschritt 7 und die Liste erlaubter Skripte nutzen
  es. Test: Skill-Liste = `CLAUDE.md` → LiaScript Skills, Fund in Projekt- und Nutzerordner.
- **E16b:** Persona, Iterationsmuster und Abhängigkeitsliste wandern nach `teaching-agent.nav.yaml` (der Build
  liest beide Dateien zusammen, `CLAUDE.md` bleibt unverändert). `teaching-agent.yaml` 2.107 → 1.633 Wörter.
- **E16c (verworfen):** Die Teile von `CLAUDE.md` → Agent Links, die nur bei offenem Browser-Chat gelten, nach
  `data/agent-links.md` zu verlegen, spart nur im Terminal (~300 Wörter). Die Startreihenfolge muss in
  `CLAUDE.md` bleiben, sonst liest der Agent vor der ersten Chat-Antwort 4.100 Wörter. Ohne Testläufe mit
  offenem Chat nicht zu verantworten.

## Ergebnis

Lauf 27.11.2026, `/home/claude/runs/e16`, 2 Läufe je Variante und Szenario, blinder Richter.

| Szenario | Tokens develop | E16 | Dauer develop | E16 | Code-Prüfungen |
|---|---|---|---|---|---|
| outline-s2-missing-goals-cached | 125.028 | 120.354 (−3,7 %) | 208 s | 183 s | 2/2 · 2/2 |
| quickfix-typo | 119.226 | 115.183 (−3,4 %) | 131 s | 117 s | 2/2 · 2/2 |
| recheck-short | 126.980 | 119.297 (−6,0 %) | 137 s | 113 s | 2/2 · 2/2 |

Alle sechs E16-Läufe riefen `detect-skills.mjs` auf. Richterfragen erfüllt: develop 55, E16 57; jede Abweichung
ist ein Lauf, in beide Richtungen.

## Bewertung

**Übernehmen.** Rund 4–6 % weniger Tokens und gut 10 % kürzere Laufzeit in jeder Sitzung, ohne Qualitätsverlust;
die Ersparnis fällt bei jedem Befehl an, auch im Browser-Chat.
