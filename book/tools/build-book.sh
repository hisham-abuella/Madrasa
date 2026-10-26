#!/bin/zsh
# Build the web book and its narration scripts from the spec.
# (bedtime-stories: tools/build-<slug>.sh -> build-book.py; here one script.)
#
#   zsh tools/build-book.sh [slug]      # default: book.config.json -> slug (noori-shell)
#
#   books/<slug>.html                   the web book (template: tools/story-template.html)
#   source/<slug>-{ar,eg}.json          narration scripts for generate.js
set -e
cd "$(dirname "$0")/.."
slug=${1:-$(node -e "console.log(require('./book.config.json').slug)")}
node tools/new-story.js "stories/$slug.json"
node tools/make-transcripts.js "stories/$slug.json"
