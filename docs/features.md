# Features

## Feature 1 — Multilingual report intake with structured extraction

*Table-stakes, but do it well.*

A volunteer or reporter speaks/types in any of the 10 languages. Claude extracts a structured case record:

- Name (if given)
- Apparent age
- Gender
- Clothing
- Distinguishing features
- Last seen location (cross-referenced against your zone/chokepoint list)
- Language spoken by the missing person
- Reporter contact

Crucially, Claude tags fields as **high confidence** vs **low confidence** vs **describes the reporter, not the missing person**. This last bit alone fixes 30% of the data quality problem in the synthetic set.

**Why this wins:** it's deployable on a basic Android tablet at every Kendra. It works in voice or text. It runs on Claude's native multilingual capability — no separate translation pipeline. And it directly addresses what the data showed us is broken.

## Feature 2 — Cross-center case fusion

*This is the real differentiator.*

Every new case (reported missing or found) gets compared against the open case pool by Claude reasoning over the full record — physical description, last-seen location, age, time window, reporter geography, language. Not vector similarity, not edit distance — Claude reasoning in natural language about whether:

> "Old woman in white saree found near Adgaon Parking at 14:32"

matches:

> "Mother lost near Adgaon, 70 years, white saree, speaks only Telugu, reported by son at 13:50."

**Output:** a ranked list of candidate matches with Claude's reasoning attached, sent to the operator's screen. Operator confirms with one tap. The 8% duplicate rate and the dozens of unresolved cases in the data go to near-zero.

This is the "Dimensional AI" Raskar talked about. It works in the physical world. It addresses population dynamics. No other team will build this.

## Feature 3 — Geo-aware response routing

When a case is logged, Claude reasons over: last-seen location → nearby chokepoints → CCTV camera zones → nearest police station → nearest Kho-Ya-Paya center, and pushes a dispatch instruction:

> "Probable drift direction: south toward Ramkund Ghat. Notify Z3-C12 through Z3-C18 camera operators. Closest police station: Panchavati. Closest Kendra for family to wait: Ramkund Kho-Ya-Paya."

You already have lat/long for all of this in the CSVs you were given.

This is what makes a government rep sit up: it uses infrastructure they already own and have already paid for (CCTV grid, police stations, Kendras). No new procurement.

## Feature 5 — Operator console / commander view

A dashboard for the Central Control Room:

- Live case count
- Breakdown by status
- Geographic heatmap of last-seen locations on the Nashik map
- SLA aging on Pending cases
- Language load by Kendra so they can route translators

Claude generates the narrative summary on demand:

> "In the last hour, 47 new cases reported, 38 reunited, 9 pending — 4 of the 9 are clustered around Sadhugram Gate 2 and may share a root cause."

This is your ITSM/ServiceOps muscle showing up — incident dashboards are literally what you do at work.

## Heatmap

Active missing-person case density by zone, time-windowed. This is the strongest because it uses the data you have, ties directly to the lost-persons problem statement, and drives action. An operator sees:

> "Sadhugram Gate 2 has 12 active cases in the last hour, vs. baseline of 2"

and dispatches translators and announcement crews there. The dataset I already analyzed shows real clustering — Madsangvi Transit, Sadhugram Gate 2, Ramkund Ghat are the top last-seen locations.

### Shift-commander briefing

The right way: the summary is a briefing for an incoming shift commander, generated on-demand or every 15 minutes. It does four things that an operator can't do quickly by looking at the dashboard alone:

1. **Diff against the previous window.** "In the last hour: case load up 40% vs the previous hour. Sadhugram Gate 2 jumped from 2 to 11 active cases." Not "there are 47 active cases" (that's a number, the dashboard already shows it).
2. **Surface anomalies the eye misses.** "Bengali-speaking cases at Adgaon Kendra are spiking — 8 in the last 90 minutes vs. baseline of 1. Possible group separation event. Consider routing a Bengali translator there." This is reasoning across multiple dimensions (language × center × time) that no map view shows.
3. **Flag at-risk open cases.** "3 unresolved cases over 6 hours old involve persons aged 71+ — escalation recommended. Case KMP-2027-0XXXX: 80+ woman, only speaks Maithili, last seen Trimbakeshwar Approach at 09:14." Names them. Makes them actionable.
4. **Suggest one concrete next action.** Not three, not five. One. "Recommended next action: dispatch second Bengali volunteer to Adgaon Kendra." If you can't pick one, the system isn't smart enough yet.
