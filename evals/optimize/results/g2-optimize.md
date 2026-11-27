# Optimierung – Auswertung

Lauf: `/home/claude/runs/g12` · Basis: `base`

| Variante | Status | Datei (Wörter / ~Tokens) | gelesene Instruktionen (Wörter) | fehlende Anforderungen | Erfolg Training | krit. Verstöße | Tokens (Median) | Tokens je Erfolg | Kosten | Dauer s | Rückfragen | Erfolg Holdout |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | dominated | 1.084 / 1.730 | 14.278 | – | 70 % (10) | 4 | 138.321 | 193.742 | – | 212 | 0 | – |
| c3 | pareto | 1.269 / 2.031 | 12.839 | – | 80 % (10) | 3 | 130.005 | 162.636 | – | 207 | 0 | – |
| d1 | dominated | 1.365 / 2.173 | 12.935 | – | 70 % (10) | 3 | 129.393 | 187.160 | – | 209 | 0 | – |
| d2 | dominated | 1.316 / 2.100 | 12.886 | R13 | 70 % (10) | 3 | 125.795 | 183.862 | – | 202 | 0 | – |
| d3 | dominated | 1.450 / 2.304 | 13.082 | – | 70 % (10) | 4 | 132.944 | 189.135 | – | 221 | 0 | – |

Pareto-Front (Training): `c3`

Kosten und Cache-Treffer nur bei Läufen über einen Adapter mit Trace (Claude Code: `--output-format stream-json`); Läufe über Subagenten melden nur die Gesamt-Tokens.
