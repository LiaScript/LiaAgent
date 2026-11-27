# Optimierung – Auswertung

Lauf: `/home/claude/runs/g1` · Basis: `base`

| Variante | Status | Datei (Wörter / ~Tokens) | gelesene Instruktionen (Wörter) | fehlende Anforderungen | Erfolg Training | krit. Verstöße | Tokens (Median) | Tokens je Erfolg | Kosten | Dauer s | Rückfragen | Erfolg Holdout |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | dominated | 1.084 / 1.730 | 14.278 | – | 70 % (10) | 4 | 138.321 | 193.742 | – | 212 | 3 | – |
| c1 | excluded | 1.350 / 2.193 | 12.920 | – | 60 % (10) | 6 | 130.559 | 218.442 | – | 202 | 5 | – |
| c3 | pareto | 1.269 / 2.031 | 12.839 | – | 80 % (10) | 3 | 130.005 | 162.636 | – | 207 | 5 | – |

Pareto-Front (Training): `c3`

Kosten und Cache-Treffer nur bei Läufen über einen Adapter mit Trace (Claude Code: `--output-format stream-json`); Läufe über Subagenten melden nur die Gesamt-Tokens.
