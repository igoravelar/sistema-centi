"""Decodifica um arquivo .fig do Figma (zstd + Kiwi) para canvas.json.

    python3 kiwi.py "../Protocolo Digital.fig"   # gera canvas.json ao lado do script
    python3 tree.py                              # lista os frames
    python3 tree.py "PO011 - Drawer Dados"       # despeja o layout de um frame

Requer o binário `zstd` no PATH (brew install zstd).
"""

import struct, zlib, json, sys, subprocess, os, zipfile

BASE = os.path.dirname(os.path.abspath(__file__))

class BB:
    def __init__(self, data):
        self.d = data; self.i = 0
    def byte(self):
        v = self.d[self.i]; self.i += 1; return v
    def varuint(self):
        v = 0; s = 0
        while True:
            b = self.byte()
            v |= (b & 0x7f) << s
            s += 7
            if not (b & 0x80): break
        return v & 0xffffffff
    def varint(self):
        v = self.varuint()
        return (v >> 1) ^ -(v & 1)
    def varuint64(self):
        v = 0; s = 0
        while True:
            b = self.byte()
            v |= (b & 0x7f) << s
            s += 7
            if not (b & 0x80) or s >= 63: break
        return v
    def varint64(self):
        v = self.varuint64()
        return (v >> 1) ^ -(v & 1)
    def varfloat(self):
        first = self.byte()
        if first == 0: return 0.0
        bits = first | (self.byte() << 8) | (self.byte() << 16) | (self.byte() << 24)
        bits = ((bits << 23) | (bits >> 9)) & 0xffffffff
        return struct.unpack('<f', struct.pack('<I', bits))[0]
    def string(self):
        start = self.i
        while self.d[self.i] != 0: self.i += 1
        s = self.d[start:self.i].decode('utf-8', 'replace')
        self.i += 1
        return s
    def bytes_(self):
        n = self.varuint()
        v = self.d[self.i:self.i+n]; self.i += n
        return v

BUILTIN = ['bool', 'byte', 'int', 'uint', 'float', 'string', 'int64', 'uint64']

def parse_schema(buf):
    bb = BB(buf)
    n = bb.varuint()
    defs = []
    for _ in range(n):
        name = bb.string()
        kind = bb.byte()
        fc = bb.varuint()
        fields = []
        for _ in range(fc):
            fname = bb.string()
            ftype = bb.varint()
            isarr = bool(bb.byte() & 1)
            val = bb.varuint()
            fields.append(dict(name=fname, type=ftype, isArray=isarr, value=val))
        defs.append(dict(name=name, kind=['ENUM', 'STRUCT', 'MESSAGE'][kind], fields=fields))
    return defs

class Decoder:
    def __init__(self, defs):
        self.defs = defs
        self.byname = {d['name']: i for i, d in enumerate(defs)}

    def read(self, bb, t):
        if t < 0:
            b = BUILTIN[~t]
            if b == 'bool': return bb.byte() != 0
            if b == 'byte': return bb.byte()
            if b == 'int': return bb.varint()
            if b == 'uint': return bb.varuint()
            if b == 'float': return bb.varfloat()
            if b == 'string': return bb.string()
            if b == 'int64': return bb.varint64()
            if b == 'uint64': return bb.varuint64()
        return self.read_def(bb, t)

    def read_field(self, bb, f):
        if f['isArray']:
            n = bb.varuint()
            return [self.read(bb, f['type']) for _ in range(n)]
        return self.read(bb, f['type'])

    def read_def(self, bb, idx):
        d = self.defs[idx]
        if d['kind'] == 'ENUM':
            v = bb.varuint()
            for f in d['fields']:
                if f['value'] == v: return f['name']
            return v
        if d['kind'] == 'STRUCT':
            return {f['name']: self.read_field(bb, f) for f in d['fields']}
        out = {}
        while True:
            fid = bb.varuint()
            if fid == 0: return out
            f = next((x for x in d['fields'] if x['value'] == fid), None)
            if f is None: raise ValueError(f"unknown field {fid} in {d['name']}")
            out[f['name']] = self.read_field(bb, f)


def main():
    # aceita o .fig do Figma (zip) ou o canvas.fig já extraído
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, 'canvas.fig')
    if zipfile.is_zipfile(src):
        with zipfile.ZipFile(src) as z:
            fig = z.read('canvas.fig')
    else:
        fig = open(src, 'rb').read()
    off = 12
    n = struct.unpack('<I', fig[off:off+4])[0]; off += 4
    schema_raw = fig[off:off+n]; off += n
    n2 = struct.unpack('<I', fig[off:off+4])[0]; off += 4
    data_raw = fig[off:off+n2]

    schema = zlib.decompressobj(-15).decompress(schema_raw)
    defs = parse_schema(schema)
    print("definitions:", len(defs), file=sys.stderr)
    json.dump([d['name'] for d in defs], open(os.path.join(BASE, 'schema_names.json'), 'w'), indent=0)

    data = subprocess.run(['zstd', '-d', '-c'], input=data_raw, capture_output=True).stdout
    dec = Decoder(defs)
    bb = BB(data)
    root = dec.read_def(bb, dec.byname['Message'])
    json.dump(root, open(os.path.join(BASE, 'canvas.json'), 'w'), ensure_ascii=False)
    print("decoded ok, keys:", list(root.keys()), file=sys.stderr)
    print("consumed", bb.i, "of", len(data), file=sys.stderr)

main()
