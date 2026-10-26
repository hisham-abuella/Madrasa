# Log directory

Every team member keeps its **own persistent log** here, `<agent-name>.log`. It saves all of the
agent's analysis so later runs pick up where earlier ones left off. Logs are **committed to git**.

## Rules
1. **Start of every task:** read your own log (at least every entry since your last `[DONE]`) and
   pick up open items, earlier findings and earlier rulings before starting fresh.
2. **End of every task:** **append** one entry. Never overwrite, never edit or delete old entries
   (correct an old entry by appending a new one that cites it).
3. Write with a quoted heredoc (`cat >> claudeteam/log_chat/<name>.log <<'EOF'` … `EOF`) and then
   check `grep -c $'\xEF\xBF\xBD' claudeteam/log_chat/<name>.log` → 0, so Arabic is not corrupted.
4. Evidence, not opinion: every finding has a file and a quote or a measured value.

## Entry format

```
=== 2026-10-25 · <agent-name> · <task in one line> ===
Lead / asked by: <lead agent or user>
Files reviewed: <paths, commit if known>
Findings:
  [BLOCKER|MAJOR|MINOR] [TAG] <file:line or page+slide> — <what is wrong> — evidence: <quote / number> — fix: <fix>
Decisions / judgement calls:
  - <decision> — why: <reason; which rule or criterion settled it>
Fixed this run:
  - <item> — verified by: <command + result>
Still open:
  - <item> — owner: <agent or owner decision>
Notes for next time:
  - <traps, baselines, what was not checked>
[DONE]
```

Severity is **blocker / major / minor** (the same as `claudeteam/reviews/`). Each charter lists its
own tags (e.g. `ceo`: `[VISION] [RULING] [PRIORITY] [SENT-BACK]`; `qa-lead`: `[RUN] [REGRESSION]
[COVERAGE-GAP] [GREEN]`). The `ceo` log also records every prioritisation decision behind
`claudeteam/suggestions.jsonl` (suggestion id, rank, accepted / deferred / rejected, and why).
