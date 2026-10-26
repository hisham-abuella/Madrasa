# Re-creates the WebP/PNG images in pitch/img from the project masters.
from PIL import Image
R='/Users/hishamabuella/Work/Arabic-school/'
def webp(src,dst,w=1200):
    im=Image.open(R+src).convert('RGBA' if src.endswith('.png') else 'RGB')
    if im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
    im.save(R+'pitch/img/'+dst,'WEBP',quality=82)
webp('assets/art/hi/noori/happy.png','noori-happy.webp')
webp('assets/art/hi/noori/cheer.png','noori-cheer.webp')
webp('book/art-hi/images-noori-shell/friends.png','friends.webp')   # 1536 master (the web copies are WebP now)
im=Image.open(R+'book/build/prev-int.png').convert('RGB'); im=im.resize((1600,round(im.height*1600/im.width)),Image.LANCZOS); im.save(R+'pitch/img/book-pages.png',optimize=True)

# QR svg lacks xmlns (needed when used as <img>)
s=open(R+'book/input/qr/qr-book.svg').read().replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ',1)
open(R+'pitch/img/qr-book.svg','w').write(s)

# Logo switcher (slide 4): round-2 generated emblems (logos/img/v2/hi), main + small mark for the 32 px preview
for k in ('c1','c2','c3','c4','c5','c6'):
    for v,suf,w in (('m','',640),('s','-s',128)):
        im=Image.open(R+f'logos/img/v2/hi/{k}-{v}.png').convert('RGBA').resize((w,w),Image.LANCZOS)
        im.save(R+f'pitch/img/logo-{k}{suf}-v2.webp','WEBP',quality=86)
