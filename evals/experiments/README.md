# Experimente

Jede Idee: ein Branch `experiment/e{n}-{slug}` ab `develop`, eine `HYPOTHESIS.md` hier (Vorlage `TEMPLATE.md`),
ein Lauf der Prüfstrecke mit `base=main` und der Variante. Kennzahlen und Ziel stehen **vor** dem Lauf fest.

| # | Idee | Hauptkennzahl | Stand |
|---|---|---|---|
| E1 | `record-change.mjs` schreibt den Änderungsweg nach einer Prüfung (Done, Ergebnis, Nutzbar, empfohlener Schritt, Zusammenfassung) | alle Code-Prüfungen bestanden | gelaufen: Kandidat – gleich richtig, −6–7 % Tokens, −12–16 % Zeit, viel weniger Streuung |
| E2 | `load_command`: ein Werkzeug legt fest, was gelesen wird | Spanne der Lesemenge | geplant |
| E3 | Cheat-Sheet nach Konstrukt geteilt (aus `experiment/levers-tasks`, jetzt mit Abschnittsregel) | gelesene Spec-Wörter | gelaufen: verworfen – liest mehr statt weniger (Abschnittsregel wirkt schon) |
| E4 | Regeln als OKF-Bundle mit Status, Herkunft und Prüfstand | unbelegte Regeln, Prüfungen | geplant |
| E5 | Kritische Regeln an den Anfang jeder Datei (IFScale: frühe Anweisungen werden besser befolgt) | Richter-Fragen | geplant |
| E6 | build-session mit Subagenten | Hauptkontext, Ergebnis | braucht Umgebung mit Subagenten |
| E7 | Automatisch vorgeschlagene, einzelne Textänderungen an quick-fix (GEPA/ACE) | Prüfungen + Richter | nach E1 |
| E8 | Caveman: Grundlast (`CLAUDE.md`, Agent-YAML) komprimiert, Regelblätter mit Wortlauten unverändert | Tokens gesamt | gelaufen: verworfen – keine Token-Ersparnis, knapperer Lerntext im Quiz |
| E9 | Caveman intern: Subagenten und Terminal knapp, Chat mit der Lehrkraft normal | Tokens, Dauer | braucht Umgebung mit Subagenten |
