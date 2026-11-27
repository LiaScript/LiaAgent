# d3-both — c3-ail + d1 + d2 + agent names + new sentences

- Base: c3-ail; contains the d1 preview rule (field list, no "as above"/"unchanged", saved = shown word for word, §DIALOG parts rule excluded from the save preview) and the d2 level rule (one verb per objective and per basic/extension level, split or reduce, verb count in the self-check), worded identically.
- §DIALOG: `!` internal agent names ("Teaching-Agent", "Artist-Agent" …) in messages; "I" for itself, other assistants by role in the course language (e.g. "the design assistant") — targets the language failures.
- [5] content-question bullet: any new sentence in any field (target-group note, abstract sentence, session note, the "plus: …" of [8]) is a content question before the save confirmation, never first in the save preview — targets content_before_save.
- [6] (R17): "tell the instructor the design assistant creates it after the outline is saved" — says it (coverage fix shared with d1/d2) without the internal name.
- Several ideas at once by request: if d3 wins, d1/d2 attribute the preview and level parts; the agent-name and new-sentence parts are only attributable against d1+d2.
- Word count (wc -w): 1376 vs c3 1196 (+180) vs original 1053 (+323). Read set otherwise as c3.
