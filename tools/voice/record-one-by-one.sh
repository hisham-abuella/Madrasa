#!/bin/zsh
# Record narration clips ONE AT A TIME in Hisham's cloned voice (local Fish S2-Pro + Whisper QA),
# checking memory and the GPU before every clip. This is the only way local voice runs in this repo.
#
# Usage:  tools/voice/record-one-by-one.sh <transcript.json> [--lang ar] [--min-free 30]
#   transcript.json: {"slides":[{"id":..., "transcript":...}, ...]}  (see audio/transcripts/)
# Output: ~/Work/Whisper-audio/site-audio/slides/<transcript-name>/<id>.mp3 (+ qa.json);
#         copy the passed clips into the repo afterwards (e.g. audio/words/<id>.mp3).
# Safe to stop and re-run: clips already recorded are skipped.
set -u
T=${1:?usage: record-one-by-one.sh <transcript.json> [--lang ar] [--min-free 30]}
T=${T:A}; shift
LANG_QA=ar; MIN_FREE=30
while (( $# )); do case $1 in --lang) LANG_QA=$2; shift 2;; --min-free) MIN_FREE=$2; shift 2;; *) echo "unknown: $1"; exit 1;; esac; done
NARRATE=~/Work/Whisper-audio/bakeoff
OUT=~/Work/Whisper-audio/site-audio/slides/${${T:t:r}%-en}
free_pct() { memory_pressure | awk -F': ' '/free percentage/{print $2+0}'; }

cd $NARRATE || exit 1
ids=($(python3 -c "import json,sys;print(' '.join(s['id'] for s in json.load(open(sys.argv[1]))['slides']))" $T))
n=0
for id in $ids; do
  n=$((n+1))
  [[ -f $OUT/$id.mp3 ]] && { echo "[$n/${#ids}] $id: already done"; continue; }
  # never two local model jobs at once (Draw Things, another narrate/mlx run, Voicebox)
  while pgrep -f "draw-things-cli|narrate.py|voicebox" >/dev/null; do echo "  waiting: another local model job is running"; sleep 60; done
  free=$(free_pct)
  while (( free < MIN_FREE )); do echo "  waiting: memory free ${free}% < ${MIN_FREE}%"; sleep 60; free=$(free_pct); done
  echo "[$n/${#ids}] $id (memory free ${free}%)"
  uv run narrate.py deck $T --lang $LANG_QA --tries 4 --only $id 2>&1 | grep -E "^  $id:|Error|error" | tail -2
  sleep 5   # let memory settle before the next clip
done
echo "ALL DONE: $OUT"
