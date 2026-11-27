# Rückmeldung an den Optimierungsagenten

Nur Trainingsszenarien. Jede kritische Anforderung (K) muss erhalten bleiben; eine Variante, der eine fehlt, wird ausgeschlossen.

## base (dominated)

- Größe: 1084 Wörter, ~1730 Tokens
- fehlende Anforderungen laut Abdeckung: keine
- outline-s1-complete #1: erfolgreich · 128.123 Tokens
- outline-s1-complete #2: erfolgreich · 128.269 Tokens
- outline-s2-missing-goals #1: erfolgreich · 128.877 Tokens
- outline-s2-missing-goals #2: nicht erfolgreich – Code: ok; Richter: one_action, content_before_save, language · 124.275 Tokens
- outline-s3-vague-goals #1: nicht erfolgreich – Code: ok; Richter: observable, one_action, content_before_save, preview_complete, language · 139.135 Tokens
- outline-s3-vague-goals #2: erfolgreich · 137.507 Tokens
- outline-s4-unrealistic-time #1: erfolgreich · 143.658 Tokens
- outline-s4-unrealistic-time #2: erfolgreich · 139.438 Tokens
- outline-s5-revise #1: erfolgreich · 142.058 Tokens
- outline-s5-revise #2: nicht erfolgreich – Code: ok; Richter: save_confirm · 144.851 Tokens

## c1 (excluded)

- Größe: 1350 Wörter, ~2193 Tokens
- fehlende Anforderungen laut Abdeckung: keine
- outline-s1-complete #1: erfolgreich · 120.498 Tokens
- outline-s1-complete #2: erfolgreich · 129.039 Tokens
- outline-s2-missing-goals #1: erfolgreich · 121.744 Tokens
- outline-s2-missing-goals #2: erfolgreich · 123.241 Tokens
- outline-s3-vague-goals #1: nicht erfolgreich – Code: ok; Richter: observable, one_action, content_before_save, preview_complete · 134.698 Tokens
- outline-s3-vague-goals #2: nicht erfolgreich – Code: ok; Richter: content_before_save, preview_complete · 131.475 Tokens
- outline-s4-unrealistic-time #1: erfolgreich · 132.635 Tokens
- outline-s4-unrealistic-time #2: erfolgreich · 129.643 Tokens
- outline-s5-revise #1: nicht erfolgreich – Code: ok; Richter: time_check, save_confirm, preview_complete, no_harm · 140.361 Tokens
- outline-s5-revise #2: nicht erfolgreich – Code: ok; Richter: save_confirm, preview_complete, no_harm · 147.320 Tokens

## c3 (pareto)

- Größe: 1269 Wörter, ~2031 Tokens
- fehlende Anforderungen laut Abdeckung: keine
- outline-s1-complete #1: erfolgreich · 128.241 Tokens
- outline-s1-complete #2: erfolgreich · 119.461 Tokens
- outline-s2-missing-goals #1: erfolgreich · 116.980 Tokens
- outline-s2-missing-goals #2: erfolgreich · 117.755 Tokens
- outline-s3-vague-goals #1: nicht erfolgreich – Code: ok; Richter: observable, time_check, preview_complete, language · 132.534 Tokens
- outline-s3-vague-goals #2: erfolgreich · 131.769 Tokens
- outline-s4-unrealistic-time #1: erfolgreich · 135.579 Tokens
- outline-s4-unrealistic-time #2: erfolgreich · 127.901 Tokens
- outline-s5-revise #1: nicht erfolgreich – Code: ok; Richter: save_confirm, preview_complete, no_harm · 142.719 Tokens
- outline-s5-revise #2: erfolgreich · 148.149 Tokens

