import urllib.request
import json

urls = [
    'http://127.0.0.1:8000/',
    'http://127.0.0.1:8000/data/characters.json',
    'http://127.0.0.1:8000/data/news.json',
    'http://127.0.0.1:8000/css/variables.css',
    'http://127.0.0.1:8000/css/base.css',
    'http://127.0.0.1:8000/css/navbar.css',
    'http://127.0.0.1:8000/css/hero.css',
    'http://127.0.0.1:8000/css/roster.css',
    'http://127.0.0.1:8000/css/modal.css',
    'http://127.0.0.1:8000/css/news.css',
    'http://127.0.0.1:8000/js/viewer3d.js',
    'http://127.0.0.1:8000/js/roster.js',
    'http://127.0.0.1:8000/js/modal.js',
    'http://127.0.0.1:8000/js/news.js',
    'http://127.0.0.1:8000/js/app.js'
]

all_ok = True
for u in urls:
    req = urllib.request.Request(u)
    with urllib.request.urlopen(req) as resp:
        code = resp.getcode()
        body = resp.read()
        print(f'{u} => Status: {code}, Bytes: {len(body)}')
        if code != 200 or len(body) == 0:
            all_ok = False

# Verify JSON schema parsing
with urllib.request.urlopen('http://127.0.0.1:8000/data/characters.json') as r:
    chars = json.loads(r.read().decode('utf-8'))
    char_list = chars.get('characters', [])
    print(f'Characters loaded: {len(char_list)}')
    for c in char_list:
        print(f" - [{c['id']}] {c['alias']} ({c['name']}) | Debut: {c['comicDebut']['comicTitle']} {c['comicDebut']['issue']} | Powers: {len(c['powers'])}")
        assert 'powerGrid' in c, 'Missing powerGrid'
        assert 'keyStorylines' in c, 'Missing keyStorylines'

with urllib.request.urlopen('http://127.0.0.1:8000/data/news.json') as r:
    news = json.loads(r.read().decode('utf-8'))
    news_list = news.get('news', [])
    print(f'News items loaded: {len(news_list)}')
    for n in news_list:
        print(f" - [{n['category']}] {n['title']} ({n['date']})")

if all_ok and len(char_list) == 6 and len(news_list) == 6:
    print('\n>>> ALL SYSTEM CHECKS PASSED SUCCESSFULLY! <<<')
else:
    print('\n>>> SOME CHECKS FAILED <<<')
