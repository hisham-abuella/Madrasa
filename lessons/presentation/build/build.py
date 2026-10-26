import re, subprocess
S="/Users/hishamabuella/Work/Presentation_Claude_SKILL/keynote_html_claude_skill/plugins/present-in-html/skills/present-in-html"
A="/Users/hishamabuella/Work/Arabic-school/assets/kids.css"
OUT="/Users/hishamabuella/Work/Arabic-school/lessons/presentation.html"
kc=open(A,encoding='utf8').read().split('\n')
def rng(a,b): return '\n'.join(kc[a-1:b])
copied = '\n'.join([rng(556,589), rng(593,594), rng(711,740), rng(752,752), rng(757,765), rng(799,824), rng(659,664)])
copied += '\n' + rng(471,486) + '\n' + rng(490,493)

def ta(w):
    m=re.match(r'^(.*[^\s])(ة[ً-ٰٟ]*)$',w)
    return m.group(1)+'&zwj;<span class="ta">&zwj;'+m.group(2)+'</span>'
DM=lambda t='هَذَا':f'<span class="dm">{t}</span>'
DF=lambda t='هَذِهِ':f'<span class="df">{t}</span>'
def pic(n,cls=''): return f'<div data-pic="{n}" class="pic-box {cls}"></div>'
def gull(m,cls='gull-box'): return f'<div data-gull="{m}" class="{cls}" aria-hidden="true"></div>'
SPK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
def listen(n,label):
    return f'<div class="bx-ui listen-wrap"><button type="button" class="listen" aria-label="{label}">{SPK}<span>{label}</span></button><audio preload="none" src="../audio/samples/ar/{n}.mp3"></audio></div>'
def notes(ar,en=None):
    h=''.join(f'<p>{x}</p>' for x in ar)
    if en: h+=''.join(f'<p dir="ltr" lang="en">{x}</p>' for x in en)
    return f'<aside class="notes">{h}</aside>'
AG=lambda cur=None: '<ol>'+''.join(
  f'<li{" aria-current=\"step\"" if cur==i else ""}><span>{t}</span></li>' for i,t in enumerate([
  'هَذَا لِلْمُذَكَّرِ','هَذِهِ لِلْمُؤَنَّثِ','سِرُّ الصَّدَفَةِ الصَّغِيرَةِ: <span class="ta">ة</span>','نَلْعَبُ وَنَكْتُبُ'],1))+'</ol>'
PROM='الْيَوْمَ سَنَتَعَلَّمُ: مَتَى نَقُولُ هَذَا، وَمَتَى نَقُولُ هَذِهِ!'
BOOKP='صَفَحَاتُ ١٨–٢٨'
BOOKT='نُورِي وَالصَّدَفَةُ الصَّغِيرَةُ'

sl=[]
def S_(id,layout,body,nt,attrs=''):
    sl.append(f'<section class="slide" data-id="{id}" data-layout="{layout}"{attrs}>\n{body}\n{nt}\n</section>')

# 1
S_('start','title',f'''<p class="label">مَدْرَسَةُ نَوْرَس لِلْفُصْحَى · الصَّفُّ الْأَوَّلُ وَالثَّانِي</p>
<h1>هَذَا وَهَذِهِ</h1>
<p class="sub">مَعَ نُورِي النَّوْرَسِ الصَّغِيرِ</p>
{listen('s1','اسْتَمِعْ إِلَى نُورِي')}
{gull('wave','gull-box hero-gull')}''',
notes(['«السَّلَامُ عَلَيْكُمْ يَا أَصْدِقَائِي!» انْتَظِرْ: «وَعَلَيْكُمُ السَّلَامُ».','أَشِرْ إِلَى نُورِي: «هَذَا نُورِي، النَّوْرَسُ الصَّغِيرُ.»','اضْغَطْ زِرَّ السَّمَّاعَةِ لِيُحَيِّيَ نُورِي الصَّفَّ.'],
['Tap the speaker button to let Noori greet the class (Fusha clip, about 7 seconds; it never plays by itself). If your class opens with بِسْمِ اللهِ, say it here.']))
# 2
S_('promise','agenda',f'''<h2>{PROM}</h2>
{AG()}
{gull('think','gull-box deco-gull')}''',
notes([f'اقْرَأِ الْعُنْوَانَ ببُطْءٍ والصَّفُّ يُرَدِّدُ: «{PROM}»'.replace('ببُطْءٍ','بِبُطْءٍ'),'أَشِرْ إِلَى الْخُطُوَاتِ الْأَرْبَعِ.'],
['By the end they will use هَذَا and هَذِهِ like a grown-up, and they will write them.']))
# 3
def card(n,cls,dem,word,i,w=None):
    return f'<div class="col card {cls}" data-build="rise" data-order="{i}">{pic(n)}<p class="word">{dem} {word}</p></div>'
S_('masc','two-column',f'''<h2>نَقُولُ هَذَا لِلْمُذَكَّرِ</h2>
{card('boy','m',DM(),'وَلَدٌ',1)}
{card('cat','m',DM(),'قِطٌّ',2)}
{card('book','m',DM(),'كِتَابٌ',3)}''',
notes(['اضْغَطْ: تَظْهَرُ الصُّورَةُ. قُلْ «هَذَا وَلَدٌ» وَالصَّفُّ يُكَرِّرُ. وَكَذَلِكَ: قِطٌّ، كِتَابٌ.','ثُمَّ: «نَقُولُ هَذَا لِلْمُذَكَّرِ.»'],
['Masculine = "boy words". Keep it simple; one click, one word, class repeats.']),' data-cols="3"')
# 4
S_('fem','two-column',f'''<h2>نَقُولُ هَذِهِ لِلْمُؤَنَّثِ</h2>
{card('cat-f','f',DF(),ta('قِطَّةٌ'),1)}
{card('fish','f',DF(),ta('سَمَكَةٌ'),2)}
{card('star','f',DF(),ta('نَجْمَةٌ'),3)}''',
notes(['الْإِيقَاعُ نَفْسُهُ: «هَذِهِ قِطَّةٌ… هَذِهِ سَمَكَةٌ… هَذِهِ نَجْمَةٌ.»','«نَقُولُ هَذِهِ لِلْمُؤَنَّثِ.»'],
['Do not explain the ة yet. Just let them notice the red letter at the end of each word.']),' data-cols="3"')
# 5
S_('pair','statement',f'''<p class="label">مُذَكَّرٌ وَمُؤَنَّثٌ</p>
<h2>{DM()} قِطٌّ… <span data-build="fade" data-order="1">{DF('وَهَذِهِ')} {ta('قِطَّةٌ')}!</span></h2>
<div class="pair">{pic('cat')}<div data-build="fade" data-order="1">{pic('cat-f')}</div></div>
{listen('s2','اسْتَمِعْ')}''',
notes(['«هَذَا قِطٌّ…» (اضْغَطْ) «وَهَذِهِ قِطَّةٌ!» الصَّفُّ يَقُولُ الْجُمْلَتَيْنِ مَعًا.'],
['This is the whole lesson in one pair. Optional: tap the listen button (the clip also says هَذِهِ بِنْتٌ; that is fine, we come back to بِنْتٌ later). Clip s2 is the recorded Fusha voice (Sarah).']))
# quiz helper
def quiz(id,h2,label,opts,pic_name,nt,extra_pic=True):
    lis=''.join(f'<li{" data-correct" if ok else ""}>{t}</li>' for t,ok in opts)
    p=f'<div class="q-pic">{pic(pic_name)}</div>' if pic_name else ''
    S_(id,'quiz',f'<p class="label">{label}</p>\n<h2>{h2}</h2>\n{p}\n<ol class="opts" data-build="reveal">{lis}</ol>',nt)
quiz('q-moon','ـــــ قَمَرٌ','هَذَا أَمْ هَذِهِ؟',[('هَذِهِ',0),('هَذَا',1)],'moon',
 notes(['«هَذَا أَمْ هَذِهِ؟» دَعِ الصَّفَّ يَهْتِفُ، ثُمَّ اضْغَطْ. «أَحْسَنْتُمْ! هَذَا قَمَرٌ.»']))
# 7
S_('part-ta','agenda',f'''<h2>{PROM}</h2>
{AG(3)}
{gull('fly','gull-box deco-gull')}''',
notes(['«وَالْآنَ… سِرٌّ صَغِيرٌ!» أَشِرْ إِلَى الْخُطْوَةِ ٣.'.replace('الْخُطْوَةِ','الْخُطْوَةِ')]))
# 8
S_('ta','image-left',f'''<figure><div class="shell-wrap">{pic('shell','shell')}<span class="bigta" aria-hidden="true">ة</span></div></figure>
<p class="label">ة مِثْلُ صَدَفَةٍ صَغِيرَةٍ!</p>
<h2>إِذَا رَأَيْتَ الصَّدَفَةَ <span class="ta">ة</span>، فَقُلْ: {DF()}!</h2>
<p>التَّاءُ الْمَرْبُوطَةُ تَأْتِي فِي آخِرِ الْكَلِمَةِ، وَتَجْعَلُهَا مُؤَنَّثَةً فِي الْغَالِبِ.</p>
<div class="chip-row">{''.join(f'<span class="chip" data-build="rise" data-order="{i}">{ta(w)}</span>' for i,w in enumerate(['قِطَّةٌ','سَمَكَةٌ','نَجْمَةٌ'],1))}</div>
{listen('s3','اسْتَمِعْ')}''',
notes(['اضْغَطْ «اسْتَمِعْ» (نُورِي يَسْأَلُ عَنِ الْحَرْفِ الصَّغِيرِ).','«هَلْ تَرَوْنَ الصَّدَفَةَ الصَّغِيرَةَ فِي آخِرِ الْكَلِمَةِ؟ إِنَّهَا التَّاءُ الْمَرْبُوطَةُ: ة.»','اضْغَطْ لِتَظْهَرَ الْكَلِمَاتُ الثَّلَاثُ، وَالْأَطْفَالُ يُشِيرُونَ إِلَى الـ ة فِي الْهَوَاءِ.','«إِذَا رَأَيْتَ الصَّدَفَةَ ة، فَقُلْ: هَذِهِ!»'],
['Say "usually": the exceptions come in two slides. Clip s3 is the recorded Fusha voice (Sarah).']))
# 9
S_('magic-a','image-right',f'''<figure>{pic('teacher-m','tall')}</figure>
<h2><span data-magic="dem" class="dm">هَذَا</span> <span data-magic="word">مُعَلِّمٌ</span></h2>
<div class="chiprow"><span class="ta-chip" data-magic="ta" data-build="scale">ة</span><span class="plus">+ ة</span></div>''',
notes(['«هَذَا مُعَلِّمٌ.» اضْغَطْ: تَأْتِي الصَّدَفَةُ.','«نَضَعُ الصَّدَفَةَ فِي آخِرِ الْكَلِمَةِ… مَاذَا يَحْدُثُ؟»'],
['The shell appears on the click. Next slide it flies into the word.']))
# 10
S_('magic-b','image-right',f'''<figure>{pic('teacher-f','tall')}</figure>
<h2><span data-magic="dem" class="df">هَذِهِ</span> <span data-magic="word">مُعَلِّمَ&zwj;</span><span data-magic="ta" class="ta">&zwj;ةٌ</span></h2>
<p class="eq">مُعَلِّمٌ + <span class="ta">ة</span> ← {ta('مُعَلِّمَةٌ')}</p>''',
notes(['(تَطِيرُ الـ ة إِلَى الْكَلِمَةِ) «هَذِهِ مُعَلِّمَةٌ!» الصَّفُّ يُكَرِّرُ.','أَشِرْ إِلَى نَفْسِكَ: «أَنَا مُعَلِّمٌ» أَوْ «أَنَا مُعَلِّمَةٌ».'],
['Point at your own title and say which one you are.']))
# 11
quiz('q-student','هَذِهِ ـــــ','أَضِفِ الصَّدَفَةَ!',[('طَالِبٌ',0),(ta('طَالِبَةٌ'),1)],'student-f',
 notes(['«هَذِهِ… طَالِبٌ أَمْ طَالِبَةٌ؟» اضْغَطْ. «هِيَ بِنْتٌ، فَنُضِيفُ ة: طَالِبَةٌ.»']))
# 12
def fcard(n,w,i):
    return f'<div class="col card f warn" data-build="rise" data-order="{i}">{pic(n)}<p class="word">{DF()} {w}</p><span class="chip hot nota">بِلَا ة</span></div>'
S_('fence','two-column',f'''<p class="label">مُؤَنَّثٌ بِلَا ة</p>
<h2>انْتَبِهْ! بَعْضُ الْكَلِمَاتِ مُؤَنَّثَةٌ بِلَا <span class="ta">ة</span></h2>
{fcard('girl','بِنْتٌ',1)}{fcard('mother','أُمٌّ',2)}{fcard('sun','شَمْسٌ',3)}''',
notes(['«انْتَبِهُوا! بَعْضُ الْكَلِمَاتِ مُؤَنَّثَةٌ بِلَا ة.»','اضْغَطْ كُلَّ بِطَاقَةٍ: «هَذِهِ بِنْتٌ… هَذِهِ أُمٌّ… هَذِهِ شَمْسٌ.» «نَحْفَظُهَا حِفْظًا.»'],
['No shell, but still هَذِهِ. We learn these three by heart.']),' data-cols="3"')
quiz('q-sun','ـــــ شَمْسٌ','انْتَبِهْ!',[('هَذَا',0),('هَذِهِ',1)],'sun',
 notes(['«هَذَا أَمْ هَذِهِ؟… شَمْسٌ!» اضْغَطْ. «شَمْسٌ مُؤَنَّثَةٌ بِلَا ة، فَنَقُولُ: هَذِهِ شَمْسٌ.»']))
# 14
S_('part-play','agenda',f'''<h2>{PROM}</h2>
{AG(4)}
{gull('happy','gull-box deco-gull')}''',
notes(['«هَيَّا نَلْعَبُ!» أَشِرْ إِلَى الْخُطْوَةِ ٤.']))
# 15
items=[('door','بَابٌ'),('rose','وَرْدَةٌ'),('pen','قَلَمٌ'),('apple','تُفَّاحَةٌ'),('house','بَيْتٌ'),('palm','نَخْلَةٌ'),('mother','أُمٌّ')]
S_('play','two-column',f'''<h2>قُومُوا! هَذَا أَمْ هَذِهِ؟</h2>
<div class="col gest-col"><p class="gest gm">{DM()} ← أَشِرْ بِإِصْبَعٍ وَاحِدٍ</p><p class="gest gf">{DF()} ← اصْنَعْ صَدَفَةً بِيَدَيْكَ</p></div>
<div class="col"><ol class="picgrid" data-build="list">{''.join(f'<li>{pic(n)}</li>' for n,_ in items)}</ol></div>''',
notes(['«قُومُوا!» عَلِّمِ الْحَرَكَتَيْنِ: إِصْبَعٌ وَاحِدٌ لِـ هَذَا، وَيَدَانِ مَضْمُومَتَانِ كَصَدَفَةٍ لِـ هَذِهِ.','اضْغَطْ لِكُلِّ صُورَةٍ؛ الصَّفُّ يَفْعَلُ الْحَرَكَةَ وَيَقُولُ الْجُمْلَةَ: «هَذَا بَابٌ / هَذِهِ وَرْدَةٌ / هَذَا قَلَمٌ / هَذِهِ تُفَّاحَةٌ / هَذَا بَيْتٌ / هَذِهِ نَخْلَةٌ / هَذِهِ أُمٌّ».'],
['Children who cannot stand join seated. If time allows, point at real things in the room (الْبَابُ، الْكِتَابُ، الطَّاوِلَةُ). Variant: a sorting game with two baskets هَذَا / هَذِهِ and printed picture cards. Praise every try; nobody is "out". The last picture (أُمٌّ) is the fence again: no ة, still هَذِهِ.']))
# 16 write: steps 1-2 (trace ة, then هَذَا / هَذِهِ)
S_('write','two-column',f'''<div class="col bx-text"><p class="label">مَحَطَّةُ الْكِتَابَةِ · ١ وَ٢</p>
<h2 class="inh">هَيَّا نَكْتُبْ: <span class="ta">ة</span>، ثُمَّ {DM()} وَ{DF()}</h2>
<p>ابْدَأْ مِنَ النُّقْطَةِ الْخَضْرَاءِ، مِنَ الْيَمِينِ إِلَى الْيَسَارِ.</p>
<p>افْتَحُوا الْكِتَابَ: {BOOKP}</p></div>
<div class="col bx-stage bx-ui"><div class="padhost" data-pad data-model="ة|هَذَا|هَذِهِ" data-lines="3" data-lh="200"></div></div>''',
notes(['«هَيَّا نَكْتُبْ!» اُكْتُبِ الـ ة عَلَى اللَّوْحِ بِبُطْءٍ، مِنَ النُّقْطَةِ الْخَضْرَاءِ، مِنَ الْيَمِينِ إِلَى الْيَسَارِ؛ ثُمَّ هَذَا، ثُمَّ هَذِهِ.',f'«افْتَحُوا الْكِتَابَ: {BOOKP}.»'],
[f'Walk around; praise effort, never mark handwriting wrong. About 2 minutes; finish at home if needed. The book is «{BOOKT}»; exercises are on pages 18–28. The children write on paper, not on the screen: if the book is not printed yet, use the printable worksheet from article.html (exercise 1, trace and write). The pad works with a finger, Apple Pencil or mouse; tapping «انْتَهَيْتُ» gives a star, never a grade.']),' data-fit="off" data-demo')
# 16b write a sentence under a picture (step 3)
S_('write-sentence','two-column',f'''<div class="col bx-text"><p class="label">مَحَطَّةُ الْكِتَابَةِ · ٣</p>
<h2 class="inh">انْظُرْ وَاكْتُبْ: {DF()} …</h2>
<div class="ws-pic">{pic('fish')}</div></div>
<div class="col bx-stage bx-ui"><div class="padhost" data-pad data-model="" data-lines="1" data-lh="300"></div></div>''',
notes(['«انْظُرُوا إِلَى الصُّورَةِ. مَاذَا نَكْتُبُ؟» الصَّفُّ يَقُولُ: «هَذِهِ سَمَكَةٌ.»','اُكْتُبِ الْجُمْلَةَ عَلَى السَّطْرِ الْفَارِغِ، ثُمَّ يَكْتُبُهَا الْأَطْفَالُ فِي الْكِتَابِ تَحْتَ الصُّورَةِ.'],
['Step 3 of the writing station: a short sentence under a picture. The line is empty on purpose (no model): the class says the sentence first, then you write it. Answer: هَذِهِ سَمَكَةٌ. Praise every try.']),' data-fit="off" data-demo')
# 17
S_('remember','bullets',f'''<p class="label">تَذَكَّرْ · نُرَدِّدُ مَعًا</p>
<h2>{DM()} لِلْمُذَكَّرِ، وَ{DF('هَذِهِ')} لِلْمُؤَنَّثِ</h2>
<ul data-build="list"><li>{DM()} وَلَدٌ.</li><li>{DF()} بِنْتٌ.</li><li>مُعَلِّمٌ ← {ta('مُعَلِّمَةٌ')}</li><li>بِلَا <span class="ta">ة</span>: بِنْتٌ، أُمٌّ، شَمْسٌ</li></ul>
{gull('happy','gull-box deco-gull')}''',
notes(['«نُرَدِّدُ مَعًا:» اضْغَطْ كُلَّ سَطْرٍ وَالصَّفُّ يُكَرِّرُ: «هَذَا وَلَدٌ.» «هَذِهِ بِنْتٌ.» «مُعَلِّمٌ… مُعَلِّمَةٌ.» «بِلَا ة: بِنْتٌ، أُمٌّ، شَمْسٌ.»','ثُمَّ مَرَّةً أُخْرَى، بِسُرْعَةٍ وَصَوْتٍ عَالٍ!'],
['The class says the rule back to you, once slowly, once fast and loud.']))
# 18
S_('close','closing',f'''<h2>أَنْتُمُ الْآنَ تَقُولُونَ هَذَا وَهَذِهِ مِثْلَ الْكِبَارِ!</h2>
<p class="contact"><span>١ الْكِتَابُ: {BOOKP}</span><span>٢ ابْحَثْ عَنْ ة فِي الْبَيْتِ</span><span>٣ أَشِرْ وَقُلْ لِأَهْلِكَ: هَذَا… هَذِهِ…</span></p>
{gull('cheer','gull-box close-gull')}''',
notes(['«أَنْتُمُ الْآنَ تَقُولُونَ هَذَا وَهَذِهِ مِثْلَ الْكِبَارِ!» اقْرَأِ الْوَاجِبَاتِ الثَّلَاثَةَ.','خِتَامًا: «أَحْسَنْتُمْ يَا أَبْطَالُ! إِلَى اللِّقَاءِ فِي الدَّرْسِ الْقَادِمِ.»'],
[f'For parents at pickup: the exercise pages in «{BOOKT}» (page numbers to be added), a ة hunt on food labels at home, and the "This or this?" walk: point at things and say هَذَا or هَذِهِ. End with a salute to the class, not "thank you".']))
# backup
S_('backup','appendix','<h2>لِلْأَبْطَالِ</h2>',notes(['شَرَائِحُ احْتِيَاطِيَّةٌ: تُسْتَعْمَلُ إِذَا بَقِيَ وَقْتٌ. اضْغَطْ G وَاخْتَرِ الشَّرِيحَةَ.'],['Backup only. Press G (overview) and pick a slide if the class is quick.']))
S_('champions','two-column',f'''<h2>الصِّفَةُ تَتْبَعُ الِاسْمَ</h2>
<div class="col card m">{pic('boy')}<p class="word">{DM()} وَلَدٌ نَشِيطٌ</p></div>
<div class="col card f" data-build="rise">{pic('girl')}<p class="word">{DF()} بِنْتٌ {ta('نَشِيطَةٌ')}</p></div>''',
notes(['«بِنْتٌ بِلَا ة، وَلَكِنَّ صِفَتَهَا فِيهَا ة.»'],['Backup. The adjective follows the noun: a feminine noun takes a feminine adjective, even when the noun itself has no ة.']))
quiz('q-champ','هَذِهِ بِنْتٌ ـــــ','سُؤَالُ الْأَبْطَالِ',[('نَشِيطٌ',0),(ta('نَشِيطَةٌ'),1)],'girl',
 notes(['«هَذِهِ بِنْتٌ… نَشِيطٌ أَمْ نَشِيطَةٌ؟» اضْغَطْ. الصِّفَةُ تَتْبَعُ الِاسْمَ: نَشِيطَةٌ.'],['Backup. Explanation as in article.html knowledge check Q5.']))
quiz('q-which','أَيُّ كَلِمَةٍ مُؤَنَّثَةٌ؟','',[('مُعَلِّمٌ',0),('قَلَمٌ',0),(ta('مُعَلِّمَةٌ'),1)],None,
 notes(['«أَيُّ كَلِمَةٍ مُؤَنَّثَةٌ؟» اضْغَطْ: مُعَلِّمَةٌ، فِيهَا الصَّدَفَةُ ة.'],['Backup. From the article.html knowledge check Q3.']))
slides='\n\n'.join(sl).replace('<p class="label"></p>\n','')

css=open('deck.css',encoding='utf8').read().replace('/*COPIED*/',copied)
js=open('deck.js',encoding='utf8').read()
t=open(S+'/assets/template.html',encoding='utf8').read()
t=t.replace('<html lang="en" data-theme="keynote-white" data-fonts="">','<html lang="ar" dir="rtl" data-theme="schoolyard" data-fonts="" data-theme-fixed data-no-picker>')
TITLE='هَذَا وَهَذِهِ · دَرْسٌ لِلصَّفِّ — Nawras'
t=t.replace('<title>present-in-html template</title>',f'<title>{TITLE}</title>\n<meta name="description" content="Nawras classroom slides (grade 1–2): هَذَا وَهَذِهِ, masculine and feminine, for the teacher to present, with a live writing pad.">\n<meta property="og:title" content="هَذَا وَهَذِهِ — Nawras classroom slides">\n<meta property="og:description" content="A classroom lesson for grade 1–2: هَذَا وَهَذِهِ, the little shell ة, a game and a writing station.">\n<meta property="og:type" content="website">\n<meta property="og:url" content="https://hisham-abuella.github.io/Madrasa/lessons/presentation.html">\n<meta property="og:image" content="https://hisham-abuella.github.io/Madrasa/assets/og-nawras.png">\n<meta name="twitter:card" content="summary_large_image">\n<link rel="icon" href="../assets/favicon-32.png" type="image/png" sizes="32x32">\n<link rel="apple-touch-icon" href="../assets/apple-touch-icon.png">\n<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">')
t=t.replace('<main class="deck" data-title="present-in-html template">',f'<main class="deck" data-title="{TITLE}" data-duration="20">')
a=t.index('<!-- SLIDES:START -->'); b=t.index('<!-- SLIDES:END -->')
t=t[:a]+'<!-- SLIDES:START -->\n'+slides+'\n'+t[b:]
i=t.index('</head>'); t=t[:i]+'<style id="deck-style">\n'+css+'\n</style>\n'+t[i:]
i=t.rindex('</body>'); t=t[:i]+'<script src="../assets/kids.js"></script>\n<script id="deck-js">\n'+js+'\n</script>\n'+t[i:]
open(OUT,'w',encoding='utf8').write(t)
print('ok',len(sl))
