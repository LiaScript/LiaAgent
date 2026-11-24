# update-dashboard — older journal layout (step 9)

   **Older journal layout:** if it names an older journal layout (`{{…}}`
   skeletons in unfilled sections, `#### Validation Report` headings of an older
   template), run `node specs/dashboard/migrate-journal.mjs --check` and show its
   list in plain words ("Your journal still uses an older layout. I would update
   it – only the presentation, none of your entries:" plus the list, translated),
   with "Update" / "Not now" (tier "confirm in chat"). "Update" → run
   `node specs/dashboard/migrate-journal.mjs`, then validate again; a line it
   lists under "Left for you" is a section filled by hand — name it and propose
   filling or removing that line in the same form. "Not now" → write no
   Dashboard and say that the overview stays at its last state until then.
