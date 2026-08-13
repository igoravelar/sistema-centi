import json, os, sys
BASE = os.path.dirname(os.path.abspath(__file__))
doc = json.load(open(os.path.join(BASE, 'canvas.json')))
nodes = doc['nodeChanges']

def gid(g):
    return f"{g['sessionID']}:{g['localID']}" if g else None

by = {}
for n in nodes:
    by[gid(n.get('guid'))] = n

kids = {}
for n in nodes:
    p = n.get('parentIndex') or {}
    pg = gid(p.get('guid')) if p.get('guid') else None
    n['_p'] = pg
    n['_pos'] = p.get('position', '')
    kids.setdefault(pg, []).append(n)
for k in kids:
    kids[k].sort(key=lambda n: n['_pos'])

def xy(n):
    t = n.get('transform') or {}
    return t.get('m02', 0), t.get('m12', 0)

def sz(n):
    s = n.get('size') or {}
    return s.get('x', 0), s.get('y', 0)

def col(n):
    fs = n.get('fillPaints') or []
    for f in fs:
        if f.get('type') == 'SOLID' and f.get('visible', True):
            c = f.get('color', {})
            o = f.get('opacity', 1)
            r, g, b = [round(c.get(k, 0) * 255) for k in 'rgb']
            s = '#%02X%02X%02X' % (r, g, b)
            return s if o >= .99 else f"{s}@{round(o,2)}"
        if f.get('type', '').startswith('GRADIENT') and f.get('visible', True):
            return 'grad'
        if f.get('type') == 'IMAGE':
            return 'img'
    return None

def strokecol(n):
    for f in (n.get('strokePaints') or []):
        if f.get('type') == 'SOLID' and f.get('visible', True):
            c = f.get('color', {})
            return '#%02X%02X%02X' % tuple(round(c.get(k, 0) * 255) for k in 'rgb')
    return None

def desc(n):
    t = n.get('type', '?')
    w, h = sz(n)
    x, y = xy(n)
    parts = [f"{t} '{n.get('name','')}'", f"@{x:.0f},{y:.0f}", f"{w:.0f}x{h:.0f}"]
    c = col(n)
    if c: parts.append(f"fill={c}")
    sc = strokecol(n)
    if sc: parts.append(f"stroke={sc}:{n.get('strokeWeight',1):.0f}")
    r = n.get('cornerRadius')
    if r: parts.append(f"r={r:.0f}")
    if n.get('rectangleTopLeftCornerRadius') is not None and not r:
        rs = [n.get(f'rectangle{k}CornerRadius', 0) for k in ('TopLeft', 'TopRight', 'BottomRight', 'BottomLeft')]
        if any(rs): parts.append("r=" + '/'.join(f"{v:.0f}" for v in rs))
    if t == 'TEXT':
        ch = (n.get('textData') or {}).get('characters', '')
        fs = n.get('fontSize')
        fn = (n.get('fontName') or {})
        parts.append(f'text="{ch}"')
        if fs: parts.append(f"{fs:.0f}px")
        if fn: parts.append(f"{fn.get('family','')}/{fn.get('style','')}")
        ha = n.get('textAlignHorizontal')
        if ha and ha != 'LEFT': parts.append(ha)
    lm = n.get('stackMode')
    if lm and lm != 'NONE':
        parts.append(f"auto:{lm} gap={n.get('stackSpacing',0):.0f} pad={n.get('stackVerticalPadding',0):.0f}/{n.get('stackHorizontalPadding',0):.0f}")
    if n.get('opacity') is not None and n['opacity'] < 1: parts.append(f"op={n['opacity']:.2f}")
    if n.get('visible') is False: parts.append("HIDDEN")
    return ' '.join(parts)

def walk(g, depth=0, out=None, maxdepth=99):
    n = by.get(g)
    if n is None: return
    out.append('  ' * depth + desc(n))
    if depth >= maxdepth: return
    for c in kids.get(g, []):
        walk(gid(c['guid']), depth + 1, out, maxdepth)

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else None
    md = int(sys.argv[2]) if len(sys.argv) > 2 else 99
    if not target:
        for n in nodes:
            if n.get('type') in ('FRAME', 'CANVAS', 'DOCUMENT'):
                w, h = sz(n)
                x, y = xy(n)
                print(f"{gid(n['guid'])}\t{n.get('type')}\t{n.get('name')}\t{x:.0f},{y:.0f}\t{w:.0f}x{h:.0f}\tparent={n['_p']}")
    else:
        hit = [n for n in nodes if n.get('name') == target]
        for n in hit:
            out = []
            walk(gid(n['guid']), 0, out, md)
            print('\n'.join(out))
            print('---')
