import json
with open('.graphify/graph.json', 'r', encoding='utf-8') as f:
    g = json.load(f)
print(f"Top-level keys: {list(g.keys())}")
print(f"Nodes: {len(g.get('nodes', []))}")
for key in ['edges', 'links', 'relations']:
    if key in g:
        print(f"Edges ({key}): {len(g[key])}")
print()
print("=== Community Labels ===")
for c in g.get('communities', []):
    cid = c.get('id', '')
    label = c.get('label', '(no label)')
    print(f"  {cid}: {label}")
print()
print("=== Node Samples (first 10) ===")
for node in g['nodes'][:10]:
    nid = node.get('id', '')
    comm = node.get('community', '')
    desc = str(node.get('description', ''))[:80]
    label = str(node.get('label', ''))[:40]
    print(f"  {nid} | comm={comm} | label={label} | desc={desc}")
if g.get('nodes'):
    print(f"\nFirst node keys: {list(g['nodes'][0].keys())}")

# Description coverage
descs = [n for n in g['nodes'] if n.get('description')]
empty = [n for n in g['nodes'] if not n.get('description')]
print(f"\nDescription coverage: {len(descs)}/{len(g['nodes'])} nodes described")
print(f"Empty descriptions: {len(empty)} nodes")
for n in empty:
    print(f"  - {n['id']}")

# Unique community names
comms = {}
for n in g['nodes']:
    cid = n.get('community', '')
    cname = n.get('community_name', '')
    if cid not in comms:
        comms[cid] = set()
    comms[cid].add(cname)
print(f"\nCommunities: {len(comms)}")
for cid in sorted(comms.keys()):
    print(f"  {cid}: {comms[cid]}")
