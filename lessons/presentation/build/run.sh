S=/Users/hishamabuella/Work/Presentation_Claude_SKILL/keynote_html_claude_skill/plugins/present-in-html/skills/present-in-html
cd "$(dirname "$0")"
python3 build.py && node $S/scripts/add-look.mjs /Users/hishamabuella/Work/Arabic-school/lessons/presentation.html --theme schoolyard >/dev/null && node $S/scripts/check.mjs /Users/hishamabuella/Work/Arabic-school/lessons/presentation.html "$@"
