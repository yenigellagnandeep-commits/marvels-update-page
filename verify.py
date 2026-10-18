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

# Verify both the current catalog array and the curated dossier schema.
with urllib.request.urlopen('http://127.0.0.1:8000/data/characters.json') as r:
    character_data = json.loads(r.read().decode('utf-8'))
    if isinstance(character_data, list):
        char_list = character_data
        print(f'Catalog records loaded: {len(char_list)}')
        for character in char_list:
            assert isinstance(character, dict), 'Catalog entries must be objects'
            assert isinstance(character.get('name'), str) and character['name'].strip(), 'Catalog entry missing name'
            assert isinstance(character.get('powerstats'), dict), 'Catalog entry missing powerstats'
    elif isinstance(character_data, dict):
        char_list = character_data.get('characters', [])
        print(f'Dossier records loaded: {len(char_list)}')
        for character in char_list:
            assert character.get('id'), 'Dossier entry missing id'
            assert character.get('alias'), 'Dossier entry missing alias'
            assert 'powerGrid' in character, 'Missing powerGrid'
            assert 'keyStorylines' in character, 'Missing keyStorylines'
    else:
        raise AssertionError('Unsupported characters.json format')

    assert len(char_list) > 0, 'No character records loaded'

with urllib.request.urlopen('http://127.0.0.1:8000/data/news.json') as r:
    news = json.loads(r.read().decode('utf-8'))
    news_list = news.get('news', [])
    print(f'News items loaded: {len(news_list)}')
    for n in news_list:
        print(f" - [{n['category']}] {n['title']} ({n['date']})")

if all_ok and len(char_list) > 0 and len(news_list) == 6:
    print('\n>>> ALL SYSTEM CHECKS PASSED SUCCESSFULLY! <<<')
else:
    print('\n>>> SOME CHECKS FAILED <<<')
