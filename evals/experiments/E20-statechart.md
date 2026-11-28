# E20 – Der Arbeitsablauf als Zustandsautomat (Statechart)

Branch: `experiment/e20-statechart` · Basis: `develop` @ b594ee1 · Stand: 27.11.2026

## Frage

Lässt sich der LiaAgent-Arbeitsablauf (welcher Schritt als Nächstes kommt, welcher Knopf im Dashboard steht) als
Zustandsautomat beschreiben – mit XState/Stately (https://stately.ai/docs) oder einem eigenen System? Und was
brächte das?

## Ausgangslage

Der Ablauf steckt heute verteilt in Code und Regeltext:

- `specs/dashboard/actions.mjs` → `unitAction` (Knopf einer Einheit), `courseNext` mit `lightNext`, `designNext`,
  `templateNext` (nächster Kursschritt je Track) – lange Wenn-dann-Ketten, deren Reihenfolge die Logik ist;
- `derive-dashboard.mjs` → `unitState` (Zustand in der Übersicht: planned/current/draft/review/revision/done);
- `tracks.mjs` (Schritte je Track); dazu Prosa in `update-dashboard.md`, `dashboard-cases.md`, Agent Coordination.

Wichtig: Das ist heute ein **Zustand aus Fakten**, kein ereignisgesteuerter Automat. Das Journal ist die Wahrheit;
jeder Befehl liest es neu und leitet daraus ab, wo der Kurs steht. Ein Automat muss deshalb aus dem Journal
„wiederhergestellt“ werden können (Rehydrierung), statt im Speicher weiterzulaufen.

## XState/Stately – Eignung

| | XState v5 | eigener Interpreter |
|---|---|---|
| Lizenz, Abhängigkeiten | MIT, ohne Laufzeit-Abhängigkeiten | – |
| Installation | npm-Paket; hier nicht installierbar (Netz aus), in jedem Kursordner nötig oder mitzuliefern | 145 Zeilen in `specs/statechart/` |
| Visuell bearbeiten | Stately Studio (importiert dieselbe JSON) | Mermaid-Bild aus derselben JSON |
| Pfad-/Modelltests | `@xstate/graph` | eigener Test (hier gebaut) |
| Laufzeit-Aktoren, Timer, Invoke | ja | nicht nötig – der Agent startet pro Befehl neu |

Der Prototyp nutzt deshalb **XState-v5-kompatible JSON** (`always`, `on`, benannte `guard`s und `actions`, `#id`-Ziele,
`meta`) mit einem kleinen eigenen Interpreter. Dieselbe Datei läuft später unverändert in XState
(`createMachine(config).provide({ guards, actions })`) und lässt sich in Stately Studio öffnen.

## Prototyp

- `specs/statechart/unit.machine.json` – Lebenslauf einer Einheit: `planned → sketched → building → written`
  (`unchecked`, `stale`, `changed`, `failed`, `concerns`, `passed` mit Unterzuständen). Jeder Endzustand trägt
  `meta.action` (Knopf) und `meta.display` (Übersichtszustand). Ereignisse = Schreibvorgänge der Tasks:
  `SKETCH_SAVED`, `MATERIAL_WRITTEN`, `CHECK_PASSED`, `CHANGED`, `RECHECK_PASSED`, `APPROVED`, `PHOTO_ASKED` … (17).
- `specs/statechart/course.machine.json` – der Kursablauf je Track (full, light = mini/convert, design, template).
  Zustände mit `meta.unit` übergeben an den Automaten der jeweiligen Einheit (Akteur-Prinzip: ein Einheiten-Automat je `### n`).
- `unit.impl.mjs`, `course.impl.mjs` – die Wächter (Fakten aus dem Journal) und die Wirkungen der Ereignisse.
- `interpreter.mjs` – `resolve(facts)` (Rehydrierung), `transition(state, event, facts)`, `toMermaid(config)`.
- `check.mjs` – drei Tests, Laufzeit ~2 s: `node --test specs/statechart/check.mjs`.

Bilder: `e20/unit.png`, `e20/course.png` (aus der JSON erzeugt).

## Ergebnis

| Test | Umfang | Abweichungen |
|---|---|---|
| Einheit: Knopf + Übersichtszustand gegen `unitAction`/`unitState` | alle 10.560 Faktenkombinationen | **0** |
| Einheit, modellbasiert: jedes Ereignis landet dort, wohin die geänderten Fakten führen | 557 Faktenzustände, 17/17 Zustände, 17/17 Ereignisse | **0** |
| Kurs: nächste Aktion gegen `courseNext` | 200.000 Zufallsjournale, alle Tracks, 38/38 Zustände erreicht | **0** |
| Echte Journale (`specs/dashboard/fixtures`) | 5 | **0** |

Gegenprobe: Vertauscht man zwei Zeilen in `passed`, meldet der Test sofort 3 von 8 Fällen falsch – der Vergleich
ist scharf.

**Der Ablauf lässt sich also vollständig und exakt als Statechart ausdrücken.**

## Beobachtungen

1. **Nicht kürzer.** JSON + Wächter ≈ 430 Zeilen gegenüber ≈ 170 Zeilen Ablauflogik in `actions.mjs`. Der Gewinn liegt
   nicht in weniger Code, sondern darin, dass Zustände, Knöpfe und erlaubte Übergänge an *einer* Stelle stehen,
   als Bild sichtbar und automatisch prüfbar sind.
2. **Zwei Achsen in einer Kette.** „Material ohne Planungsskizze“ (übernommener Kurs) braucht im Zustand `planned`
   eine 8-stufige Anzeigeregel. Fachlich sind Skizze und Materialstand zwei unabhängige Achsen – im Statechart wären
   das **parallele Regionen**. Das ist heute in der Reihenfolge der `if`s versteckt.
3. **Empfehlungen sind keine Sperren.** Der Automat erlaubt `CHECK_PASSED`, obwohl noch Bilder offen sind – der Code
   empfiehlt „erst Bilder“, verbietet die Prüfung aber nicht. Mit einem Automaten müsste man entscheiden: Wächter
   (verboten) oder nur Empfehlung. Das wird erst durch die Modellierung sichtbar.
4. **Laufzeit-Engine bringt wenig.** Weil der Agent pro Befehl neu startet und das Journal liest, ist ein dauerhaft
   laufender XState-Akteur überflüssig. Nützlich ist der Automat als **ausführbare Spezifikation**.

## Plan (wenn André weitermachen will)

1. **E20 (erledigt):** Automat als Schatten neben dem Code, Gleichheit per Test.
2. **E21 – Code liest den Automaten:** `unitAction`/`courseNext` holen Zustand und Knopf aus der JSON; die
   Wenn-dann-Ketten entfallen. Die bestehenden 274 Dashboard-Tests und `check.mjs` sichern ab.
3. **E22 – Skript statt Regeln:** `node specs/statechart/next.mjs [unit]` gibt Zustand, Knopf und *erlaubte* Ereignisse
   (= welche Tasks jetzt Sinn ergeben) aus. Ziel: Agent Coordination und Teile von `update-dashboard.md` /
   `dashboard-cases.md` ersetzen – gleiches Muster wie E14/E19 („Skript statt Regeln“). Messen mit dem Eval-Harness.
4. **Optional:** JSON in Stately Studio öffnen, Ablauf dort visuell bearbeiten; Mermaid-Bild in die Doku.
5. **Bewusst nicht:** XState als npm-Abhängigkeit in jedem Kurs, Laufzeit-Akteure, Timer.

## Empfehlung

Eigener kleiner Interpreter mit **XState-kompatibler JSON**: keine Abhängigkeit in den Kursen, aber Stately Studio
und XState bleiben jederzeit nutzbar. Der lohnende nächste Schritt ist E22 (Skript statt Regeln), weil dort die
Token-Ersparnis liegt; E21 ist die Voraussetzung dafür.
