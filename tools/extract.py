import re, json, sys
from bs4 import BeautifulSoup, NavigableString

s = open('source/book_clean.html', encoding='utf8').read()
soup = BeautifulSoup(s, 'lxml')

def md(el):
    """inline markup -> mini markdown"""
    out = []
    for c in el.children:
        if isinstance(c, NavigableString):
            out.append(str(c))
        else:
            n = c.name
            inner = md(c)
            if n in ('strong', 'b'): out.append('**' + inner.strip() + '**' + (' ' if inner.endswith(' ') else ''))
            elif n in ('em', 'i'): out.append('_' + inner.strip() + '_' + (' ' if inner.endswith(' ') else ''))
            elif n == 'code': out.append('`' + c.get_text() + '`')
            elif n == 'br': out.append('\n')
            else: out.append(inner)
    return re.sub(r'[ \t]+', ' ', ''.join(out)).strip()

def txt(el): return re.sub(r'\s+', ' ', el.get_text(' ', strip=True)).strip()

def table(fig):
    cap = fig.select_one('figcaption')
    t = fig.select_one('table')
    head = [txt(th) for th in t.select('thead th')]
    rows = [[md(td) for td in tr.select('td')] for tr in t.select('tbody tr')]
    return {'type': 'table', 'caption': txt(cap) if cap else '', 'head': head, 'rows': rows}

def parse_steps(cont):
    steps = []
    for ch in cont.children:
        if getattr(ch, 'name', None) is None: continue
        if ch.name == 'p':
            steps.append({'type': 'p', 'text': md(ch)})
        elif ch.name == 'figure':
            steps.append(table(ch))
        elif ch.name == 'pre':
            steps.append({'type': 'code', 'text': ch.get_text()})
        elif ch.name == 'ul':
            steps.append({'type': 'ul', 'items': [md(li) for li in ch.select('li')]})
    return steps

def parse_project(pb):
    d = {}
    d['badge'] = txt(pb.select_one('.project-badge'))
    d['title'] = txt(pb.select_one('.project-title'))
    d['desc'] = txt(pb.select_one('.project-desc'))
    d['meta'] = [txt(x) for x in pb.select('.project-meta span')]
    ms = []
    for m in pb.select('.milestone-card'):
        spec = [md(p) for p in m.select('.spec-content p')]
        deliv = ''
        for dv in m.find_all('div', recursive=False):
            if 'Παραδοτέο' in dv.get_text(): deliv = txt(dv)
        ms.append({'num': txt(m.select_one('.milestone-num')), 'title': txt(m.select_one('.milestone-title')),
                   'desc': txt(m.select_one('.milestone-desc')), 'spec': spec, 'deliv': deliv})
    d['milestones'] = ms
    db = pb.select_one('.deliverables-box')
    d['deliverables'] = [md(li) for li in db.select('li')] if db else []
    lo = pb.select_one('.lab-objectives')
    d['env'] = [md(li) for li in lo.select('li')] if lo else []
    return d

chapters = []
for art in soup.select('article.chapter-article'):
    c = {}
    hdr = art.select_one('header.chapter-header')
    c['part'] = txt(art.select_one('.part-badge'))
    c['time'] = txt(art.select_one('.time-badge'))
    c['title'] = txt(art.select_one('.chapter-title'))
    c['subtitle'] = txt(art.select_one('.chapter-subtitle'))
    c['outcomes'] = [md(li.select_one('span')) for li in art.select('.outcomes-list li')]
    c['intro'] = [md(p) for p in art.select('.chapter-intro p')]
    secs = []
    for sec in art.select('section.chapter-section'):
        st = sec.select_one('h3.section-title')
        sid = txt(st.select_one('.sec-id'))
        spans = st.find_all('span')
        title = txt(spans[-1])
        blocks = []
        for ch in sec.children:
            if getattr(ch, 'name', None) is None or ch is st: continue
            if ch.name == 'p': blocks.append({'type': 'p', 'text': md(ch)})
            elif ch.name == 'figure': blocks.append(table(ch))
            elif ch.name == 'aside':
                kind = [k for k in ch.get('class', []) if k.startswith('callout-')]
                blocks.append({'type': 'callout', 'kind': kind[0][8:] if kind else 'note',
                               'title': txt(ch.select_one('.callout-title')), 'text': md(ch.select_one('.callout-body'))})
            elif ch.name in ('pre',): blocks.append({'type': 'code', 'text': ch.get_text()})
            elif ch.name == 'ul': blocks.append({'type': 'ul', 'items': [md(li) for li in ch.select('li')]})
        secs.append({'id': sid, 'title': title, 'blocks': blocks})
    c['sections'] = secs
    c['terms'] = [{'name': txt(t.select_one('.term-name')), 'def': md(t.select_one('.term-def'))} for t in art.select('.term-box')]
    c['summary'] = [md(li) for li in art.select('.summary-list li')]
    c['review'] = [md(q.select_one('.review-q-text')) for q in art.select('.review-q-item')]
    # CLI lab
    cli = art.select_one('section.cli-lab-block')
    tasks = []
    for t in cli.select('.task-card'):
        hint = ''
        for dv in t.find_all('div', recursive=False):
            if 'Hint' in dv.get_text() and 'command-box' not in ' '.join(dv.get('class', [])): hint = txt(dv).replace('💡 Hint:', '').strip()
        tasks.append({'pill': txt(t.select_one('.task-pill')), 'name': txt(t.select_one('.task-name')),
                      'instr': md(t.select_one('.task-instruction')), 'hint': hint,
                      'cmd': t.select_one('.terminal-pre').get_text().strip(),
                      'ok': txt(t.select_one('.task-validation span'))})
    c['cli'] = {'title': txt(cli.select_one('.lab-title')), 'desc': txt(cli.select_one('.lab-desc')),
                'meta': [txt(x) for x in cli.select('.lab-meta span')], 'tasks': tasks}
    lab = art.select_one('section.hands-on-lab-block')
    phases = []
    for p in lab.select('.phase-card'):
        objs = [md(li) for li in p.select('div > ul li')][:6]
        steps = parse_steps(p.select_one('.steps-container'))
        phases.append({'badge': txt(p.select_one('.phase-badge')), 'name': txt(p.select_one('.phase-name')),
                       'dur': txt(p.select_one('.phase-duration')), 'objs': objs, 'steps': steps})
    lo = lab.select_one('.lab-objectives')
    cl = lab.select_one('.checklist-card')
    c['lab'] = {'title': txt(lab.select_one('.lab-title')), 'desc': txt(lab.select_one('.lab-desc')),
                'meta': [txt(x) for x in lab.select('.lab-meta span')],
                'env': [md(li) for li in lo.select('li')] if lo else [],
                'phases': phases,
                'checklist': [re.sub(r'^☑\s*', '', txt(x)) for x in cl.select('.checklist-item')] if cl else []}
    pbs = art.select('section.project-block')
    c['projects'] = [parse_project(p) for p in pbs]
    quiz = []
    for q in art.select('.quiz-item-card'):
        opts = [{'k': txt(o.select_one('.option-key')), 'v': md(o.select_one('.option-val'))} for o in q.select('.option-row')]
        sc = q.select_one('.solution-content')
        ans = txt(sc.select_one('.key-letter'))
        exp = md(sc.select_one('.explanation-box p'))
        quiz.append({'q': md(q.select_one('.q-text')), 'opts': opts, 'ans': ans, 'exp': exp})
    qb = art.select_one('.quiz-block')
    c['quizTitle'] = txt(qb.select_one('.quiz-title')) if qb else ''
    c['quiz'] = quiz
    chapters.append(c)

# front matter
front = {}
json.dump(chapters, open('tools/chapters.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
for i, c in enumerate(chapters, 1):
    print(i, c['part'], '|', c['time'], '|', c['title'])
    print('   secs', [(x['id'], len(x['blocks'])) for x in c['sections']])
    print('   terms', len(c['terms']), 'sum', len(c['summary']), 'rev', len(c['review']), 'tasks', len(c['cli']['tasks']), 'phases', len(c['lab']['phases']), 'chk', len(c['lab']['checklist']), 'proj', [len(p['milestones']) for p in c['projects']], 'quiz', len(c['quiz']))
