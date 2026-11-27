# E17 – Qualität: Gliederung und kurze Nachprüfung

Branch: `experiment/e17-quality` · Basis: `develop` @ 39b1ef7 · Stand: 27.11.2026

## Hypothese

Die wiederkehrenden Schwächen aus dem Gliederungs-Benchmark (Vorschau „wie oben“, zweite Bestätigung nach
„Speichern“, zwei Verben je Stufe, Frage nach einer zuschauenden Person trotz „allein“) lassen sich mit vier
knappen Regeln in normalem Markdown beheben; die kurze Nachprüfung übersieht die Vorlese-Lücke seltener, wenn sie
die Anforderungen des Kursrahmens an jede Seite ausdrücklich prüft.

## Änderung

- `create-outline.md`: ein Verb je Ziel **und je Stufe**; bei „allein“ im Kursrahmen keine Frage nach einer Person,
  sondern sofort Aufnahme, Selbstkontrolle oder gemeinsame Phase; Vorschau zeigt jedes Feld vollständig (nie „wie
  oben“, „unverändert“, „wie in Teil 1“); „Speichern“ ist die einzige Bestätigung – Formänderungen des Validators
  werden in der ✅-Meldung genannt, nie neu bestätigt, der Wortlaut ändert sich nach „Speichern“ nicht.
- `validate-course.md`, kurze Nachprüfung: auf jeder geänderten Seite die Anforderungen des Kursrahmens an jede
  Seite (z. B. Vorlesetext gegen sichtbaren Text, Zeile für Zeile).
- `teaching-agent.yaml`: die Recherche-Anfrage in der Kurssprache (nach dem Lauf ergänzt, nicht gemessen).

## Ergebnis

Läufe `/home/claude/runs/e17` (Gliederung, 3 Szenarien × 2) und `e17r` (Nachprüfung, 3 je Variante), blinder Richter.

| Richterfrage (Gliederung) | develop | E17 |
|---|---|---|
| `save_confirm` (kritisch) | 2/6 | **6/6** |
| `one_action` | 2/6 | **6/6** |
| `preview_complete` | 2/6 | 4/6 |
| `no_silent_drop` (kritisch) | 4/6 | 5/6 |
| `content_before_save` (kritisch) | 6/6 | 5/6 |
| `language` | 5/6 | 3/6 |
| ohne kritischen Verstoß | 2/6 | **4/6** |

Code-Prüfungen in allen Läufen bestanden; Tokens gleich (±5 %). Kurze Nachprüfung: beide Varianten fanden die
Vorlese-Lücke in 3/3 Läufen – hier zeigt sich kein Unterschied.

Die zwei verbleibenden `preview_complete`-Fehler (s5) haben eine Ursache im Skript: `write-dashboard.mjs` zählt die
alte Folienliste der Lernseite als eigene Einheit, der Agent baut die Gliederung danach um. Die Sprachfehler: zweimal
der englische Recherche-Block der Persona (jetzt übersetzt), einmal der interne Agentenname (kommt auch in develop vor).

## Bewertung

**Übernehmen.** Die gezielten Schwächen sind deutlich seltener (Bestätigung und Stufen 6/6, Läufe ohne kritischen
Verstoß doppelt so oft). Nächster Schritt: die Zählung der Folienliste in `write-dashboard.mjs` beheben.
