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

## d1 (dominated)

- Größe: 1365 Wörter, ~2173 Tokens
- fehlende Anforderungen laut Abdeckung: keine
- outline-s1-complete #1: nicht erfolgreich – Code: ok; Richter: save_confirm · 132.247 Tokens
- outline-s1-complete #2: erfolgreich · 127.715 Tokens
- outline-s2-missing-goals #1: erfolgreich · 126.380 Tokens
- outline-s2-missing-goals #2: erfolgreich · 126.316 Tokens
- outline-s3-vague-goals #1: erfolgreich · 126.061 Tokens
- outline-s3-vague-goals #2: nicht erfolgreich – Code: ok; Richter: content_before_save · 120.806 Tokens
- outline-s4-unrealistic-time #1: erfolgreich · 133.528 Tokens
- outline-s4-unrealistic-time #2: nicht erfolgreich – Code: ok; Richter: one_action, content_before_save · 131.071 Tokens
- outline-s5-revise #1: erfolgreich · 143.099 Tokens
- outline-s5-revise #2: erfolgreich · 142.899 Tokens

## d2 (dominated)

- Größe: 1316 Wörter, ~2100 Tokens
- fehlende Anforderungen laut Abdeckung: R13
- outline-s1-complete #1: erfolgreich · 121.676 Tokens
- outline-s1-complete #2: erfolgreich · 121.715 Tokens
- outline-s2-missing-goals #1: erfolgreich · 122.344 Tokens
- outline-s2-missing-goals #2: erfolgreich · 122.040 Tokens
- outline-s3-vague-goals #1: nicht erfolgreich – Code: ok; Richter: time_check, preview_complete · 125.012 Tokens
- outline-s3-vague-goals #2: nicht erfolgreich – Code: ok; Richter: observable, preview_complete · 127.634 Tokens
- outline-s4-unrealistic-time #1: erfolgreich · 126.578 Tokens
- outline-s4-unrealistic-time #2: erfolgreich · 127.189 Tokens
- outline-s5-revise #1: erfolgreich · 141.793 Tokens
- outline-s5-revise #2: nicht erfolgreich – Code: ok; Richter: save_confirm, preview_complete · 151.053 Tokens

## d3 (dominated)

- Größe: 1450 Wörter, ~2304 Tokens
- fehlende Anforderungen laut Abdeckung: keine
- outline-s1-complete #1: erfolgreich · 118.331 Tokens
- outline-s1-complete #2: erfolgreich · 118.278 Tokens
- outline-s2-missing-goals #1: erfolgreich · 124.495 Tokens
- outline-s2-missing-goals #2: erfolgreich · 129.334 Tokens
- outline-s3-vague-goals #1: nicht erfolgreich – Code: ok; Richter: time_check, save_confirm · 133.507 Tokens
- outline-s3-vague-goals #2: nicht erfolgreich – Code: ok; Richter: observable, preview_complete · 140.861 Tokens
- outline-s4-unrealistic-time #1: erfolgreich · 134.329 Tokens
- outline-s4-unrealistic-time #2: erfolgreich · 132.380 Tokens
- outline-s5-revise #1: erfolgreich · 146.077 Tokens
- outline-s5-revise #2: nicht erfolgreich – Code: ok; Richter: save_confirm, preview_complete · 146.351 Tokens

