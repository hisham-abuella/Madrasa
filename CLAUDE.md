# Nawras (نَوْرَس) — rules for Claude in this repo

Read `BRIEF.md` first; it is the binding brief (later sections supersede earlier ones).

## Working style
- **One task at a time.** Start one job, say what it is, report the result, and ask before the next.
  No stacks of parallel background agents, no chaining new work automatically.

## Local models (voice and images) — one job at a time, memory checked
- Never run two local model jobs together (Draw Things, Fish S2-Pro / `narrate.py`, Whisper, Voicebox).
  Running them in parallel filled memory and restarted the machine.
- **Voice:** all site sounds (word clips, story, book, samples; Fusha and Egyptian) are recorded
  locally in Hisham's cloned voice, **one clip at a time**, with
  `tools/voice/record-one-by-one.sh <transcript.json> --lang ar`. Before each clip it waits until no
  other local model job runs and at least 30% of memory is free; Whisper QA retries bad takes.
  It is resumable (finished clips are skipped). Do not call `narrate.py` on a whole file directly.
- **Images:** Draw Things, one picture at a time, only after checking
  `pgrep -fl "draw-things|narrate|mlx|voicebox"` shows nothing running and memory is ≥ 30% free.
- Run long jobs in the background *alone*, and check memory (`memory_pressure`) while they run.

## Other rules
- Never commit or print API keys. The repo is public.
- Islamic content rules, Arabic typesetting and kid UX rules: see `BRIEF.md`.
