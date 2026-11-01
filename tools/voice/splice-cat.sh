#!/bin/zsh
# Rebuild the narration clips whose «قِطٌّ / قِطَّةٌ» the local voice model cannot say
# inside a longer line (Whisper heard كط / كتا in every variant, 2026-11-01).
# Each clip = recorded parts (audio/transcripts/splice-ar.json, recorded with
# record-one-by-one.sh) + the word clips approved by ear (audio/words/cat, cat-f,
# this-cat, this-cat-f) + short silences, then loudness-normalised. No model runs here.
#
#   zsh tools/voice/splice-cat.sh
set -eu
REPO=${0:A:h:h:h}; cd $REPO
P=~/Work/Whisper-audio/site-audio/slides/splice-ar
W=audio/words
TMP=$(mktemp -d)
sil() { ffmpeg -hide_banner -loglevel error -y -f lavfi -i anullsrc=r=44100:cl=mono -t $1 $TMP/s$1.wav; echo $TMP/s$1.wav; }
wav() { ffmpeg -hide_banner -loglevel error -y -i $1 -ar 44100 -ac 1 $TMP/${1:t:r}.wav; echo $TMP/${1:t:r}.wav; }
join() {   # join <out.mp3> <file|silence-seconds>...
  local out=$1; shift; local list=$TMP/list.txt; : > $list
  for x in "$@"; do
    if [[ $x == <->.<-> ]]; then print "file '$(sil $x)'" >> $list; else print "file '$(wav $x)'" >> $list; fi
  done
  ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i $list \
    -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 44100 -ac 1 -b:a 96k $out
  echo "built $out"
}
join book/audio/ar/recap.mp3  $P/recap-a.wav 0.25 $W/this-cat.mp3 0.25 $P/recap-b.wav
join book/audio/ar/qitt.mp3   $W/cat.mp3 0.35 $W/cat-f.mp3 0.5 $W/this-cat.mp3 0.25 $W/this-cat-f.mp3 0.4 $P/qitt-c.wav
join audio/story/eg/p04.mp3   $P/p04-a.wav 0.5 $W/this-cat.mp3 0.3 $W/this-cat-f.mp3
join audio/samples/eg/s2.mp3  $P/p04-a.wav 0.5 $W/this-cat.mp3 0.3 $W/this-cat-f.mp3
rm -rf $TMP
