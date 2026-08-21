import re, json
from pathlib import Path
root=Path('.').resolve()

# Exclusions
exclude_names = set([
    'google37defe6419d8ecc5.html',
    '404.html',
    'careers-admin.html'
])
# load existing audit to get redirect-only pages
redirects=set()
fa=root.joinpath('final_audit_results.json')
if fa.exists():
    try:
        final=json.loads(fa.read_text(encoding='utf-8'))
        redirects=set(final.get('redirect_pages',[]))
    except Exception:
        redirects=set()

# gather html pages to evaluate
pages=[]
for p in sorted(root.rglob('*.html')):
    if not p.is_file():
        continue
    sp=str(p)
    if 'node_modules' in sp.replace('\\','/'):
        continue
    name=p.name
    if name in exclude_names:
        continue
    if name in redirects:
        continue
    pages.append(p.relative_to(root).as_posix())

# helper to read
def read(p):
    return root.joinpath(p).read_text(encoding='utf-8',errors='ignore')

issues={}
for p in pages:
    txt=read(p)
    page_issues=[]
    # title
    if not re.search(r'<title[^>]*>\s*[^<\s].*?</title>',txt,flags=re.I|re.S):
        page_issues.append('Missing or empty <title>')
    # meta description
    if not re.search(r"<meta\s+name=['\"]description['\"]\s+content=['\"]([^'\"]+)['\"]",txt,flags=re.I):
        page_issues.append('Missing meta description')
    # canonical
    if not re.search(r"<link\s+rel=['\"]canonical['\"]",txt,flags=re.I):
        page_issues.append('Missing canonical link')
    # og
    og_keys=['og:title','og:description','og:url']
    for k in og_keys:
        if not re.search(r"<meta\s+property=['\"]%s['\"]"%k,txt,flags=re.I):
            page_issues.append('Missing meta property %s'%k)
    # twitter
    tw_keys=['twitter:card','twitter:title','twitter:description']
    for k in tw_keys:
        if not re.search(r"<meta\s+name=['\"]%s['\"]"%k,txt,flags=re.I):
            page_issues.append('Missing meta name %s'%k)
    # JSON-LD validity
    jsonlds=re.findall(r"<script[^>]*type=['\"]application/ld\+json['\"][^>]*>(.*?)</script>",txt,flags=re.I|re.S)
    for j in jsonlds:
        s=j.strip()
        try:
            json.loads(s)
        except Exception as e:
            page_issues.append('Invalid JSON-LD: %s'%str(e))
    # headings
    h1s=len(re.findall(r'<h1\b[^>]*>',txt,flags=re.I))
    if h1s==0:
        page_issues.append('Missing H1')
    if h1s>1:
        page_issues.append('Multiple H1 tags (%d)'%h1s)
    # empty sections: inspect the full content between headings instead of
    # truncating to 300 characters (which caused false positives on nested cards).
    heading_matches=list(re.finditer(r'<h([2-4])[^>]*>\s*(.*?)\s*</h\1>',txt,flags=re.I|re.S))
    for i,m in enumerate(heading_matches):
        level=int(m.group(1))
        end=None
        for nxt in heading_matches[i+1:]:
            if int(nxt.group(1)) <= level:
                end=nxt.start()
                break
        if end is None:
            end=txt.lower().find('</main>')
        if end == -1:
            end=len(txt)
        block=txt[m.end():end]
        # Treat meaningful image alt text as content; screenshot cards may
        # intentionally contain an image directly below their heading.
        alt_text=' '.join(re.findall(r'\balt=["\']([^"\']+)["\']',block,flags=re.I))
        title_text=' '.join(re.findall(r'\btitle=["\']([^"\']+)["\']',block,flags=re.I))
        txt_after=re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>|<[^>]+>',' ',block,flags=re.I)
        txt_after += ' ' + alt_text + ' ' + title_text
        txt_after=re.sub(r'&(?:nbsp|amp|lt|gt|quot|#39);',' ',txt_after,flags=re.I)
        txt_after=re.sub(r'\s+',' ',txt_after).strip()
        if len(txt_after)==0:
            heading=re.sub(r'<[^>]+>','',m.group(2)).strip()
            page_issues.append('Empty section after heading: %s'%heading)
    # broken internal links
    hrefs=re.findall(r"<a\b[^>]*href=['\"]([^'\"]+)['\"]",txt,flags=re.I)
    for h in hrefs:
        if h.startswith('http') or h.startswith('mailto:') or h.startswith('tel:') or h.startswith('#') or h.startswith('javascript:'):
            continue
        href_clean=h.split('?',1)[0].split('#',1)[0]
        target=(root.joinpath(p).parent / href_clean).resolve()
        if target.is_dir():
            target=target.joinpath('index.html')
        if not target.exists():
            page_issues.append('Broken internal link: %s'%h)
    if page_issues:
        issues[p]=page_issues

# sitemap
sitemap_set=set()
sm=root.joinpath('sitemap.xml')
if sm.exists():
    import xml.etree.ElementTree as ET
    try:
        tree=ET.fromstring(sm.read_text(encoding='utf-8',errors='ignore'))
        ns={'ns':'http://www.sitemaps.org/schemas/sitemap/0.9'}
        for url in tree.findall('ns:url',ns):
            loc=url.find('ns:loc',ns).text
            if loc.endswith('/'):
                p='index.html'
            else:
                p=loc.split('https://hisabdo.app/')[-1]
            sitemap_set.add(p)
    except Exception:
        pass

important=['index.html','about.html','app.html','contact.html','blog.html','leadership.html','media.html','careers.html','privacy-policy.html','terms.html','faq.html','mian-usman-khalid.html']
missing_in_sitemap=[p for p in important if p in pages and p not in sitemap_set]

# robots.txt
robots_txt=''
robots_ok=True
rt=root.joinpath('robots.txt')
if rt.exists():
    robots_txt=rt.read_text(encoding='utf-8',errors='ignore')
    if 'Sitemap' not in robots_txt:
        robots_ok=False
else:
    robots_ok=False

# eeat checks (simple) - use regex to detect JSON-LD types reliably
eeat_issues={}
for p in ['mian-usman-khalid.html','mian-ahsan-khalid.html','mian-khalid-aziz.html','mian-sharjeel-khalid.html','leadership.html']:
    if p in pages and root.joinpath(p).exists():
        txt=read(p)
        if p != 'leadership.html':
            if not re.search(r'"@type"\s*:\s*"Person"', txt):
                eeat_issues[p] = 'Missing Person JSON-LD'
        else:
            if not re.search(r'"@type"\s*:\s*"Organization"', txt):
                eeat_issues[p] = 'Missing Organization JSON-LD'

# ads violations: ensure non-content pages (we excluded those) but still report any page that contains ads but seems non-content-like (heuristic: very few words)
ads_violations=[]
for p in pages:
    txt=read(p)
    if 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' in txt:
        # heuristic: count words
        wordcount=len(re.findall(r'\w+',re.sub(r'<[^>]+>','',txt)))
        if wordcount<80:
            ads_violations.append(p)

# summary
evaluated=len(pages)
with_issues=len(issues)
pass_criteria = (len(missing_in_sitemap)==0 and with_issues==0 and len(ads_violations)==0 and robots_ok and len(eeat_issues)==0)
readiness = round(100.0 * (1 - (with_issues / evaluated)) if evaluated>0 else 0,1)
report={'evaluated_pages':evaluated,'evaluated_sample':pages[:12],'pages_with_issues':with_issues,'issues':issues,'missing_in_sitemap':missing_in_sitemap,'robots_ok':robots_ok,'eeat_issues':eeat_issues,'ads_violations':ads_violations,'pass':pass_criteria,'readiness_percent':readiness}
open('final_verification_report.json','w',encoding='utf-8').write(json.dumps(report,indent=2))
print('VERIFICATION_COMPLETE:', json.dumps({'evaluated':evaluated,'with_issues':with_issues,'readiness':readiness,'pass':pass_criteria}))
