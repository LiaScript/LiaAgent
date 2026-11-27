# E18 – die gewachsene Folienliste zählt ihre Einheiten

Branch: `experiment/e18-outline-units` · Basis: `develop` @ d4cae2c (mit E17) · Stand: 27.11.2026

## Befund

In E17 (Szenario `outline-s5-revise-cached`) bauten alle Läufe die Gliederung nach „Speichern“ um: Eine Mini-
Gliederung mit dem Label „Folien“ zählte in `journal-model.mjs` → `outlineUnits()` immer als eine Einheit, auch
nachdem eine zweite Lernseite mit eigener, eingerückter Folienliste dazukam. Die Übersicht verlangte weiter
„Gliederung ergänzen“, die Agenten benannten das Feld um („Lernseiten …“) – nach der Bestätigung.

## Änderung

`outlineUnits()`: Unter einem Folien-Label zählen Punkte der obersten Ebene mit eingerückten Folienlisten als
Einheiten; eine flache Folienliste bleibt eine Einheit. Test in `specs/dashboard/check.mjs`.

## Ergebnis

Lauf `/home/claude/runs/e18`, 2 Läufe je Variante.

| | develop | E18 |
|---|---|---|
| Label nach dem Speichern | „Lernseiten“ (2/2 umbenannt) | „Folien“ (2/2 behalten) |
| Umbau nach „Speichern“ erwähnt | 2/2 | 0/2 |
| Code-Prüfungen | 2/2 | 2/2 |
| Tokens | 137.541 | 136.811 |

**Übernehmen.** Der Umbau nach der Bestätigung entfällt; die Gliederung bleibt Wort für Wort, wie Schritt 7 es verlangt.
