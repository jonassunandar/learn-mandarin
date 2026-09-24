"""Optional asset regeneration. Download the MOE ZIP linked in CREDITS.md,
then run: python3 scripts/import-bopomofo.py /path/to/bopomofo_materials_20170213.zip
The standard chart/audio order is Unicode U+3105 through U+3129.
No network access or extraction of untrusted paths is performed by this script.
"""
import json
import pathlib
import re
import sys
import zipfile

out = pathlib.Path(__file__).resolve().parent.parent / 'public' / 'bopomofo'
out.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(sys.argv[1]) as archive:
    for code in range(0x3105, 0x312A):
        stem = f'{code:04x}'
        audio_index = code - 0x3105 + 1
        (out / f'{stem}.wav').write_bytes(archive.read(f'audio/F{audio_index}.WAV'))
        source = next(n for n in archive.namelist() if n.endswith(f'/{stem}.json'))
        folder = source.rsplit('/', 1)[0]
        frames = sorted((n for n in archive.namelist() if n.startswith(folder + '/') and n.endswith('.svg')),
                        key=lambda n: int(n.rsplit('/', 1)[1][:-4]))
        strokes = [re.findall(r'<path[^>]+d="([^"]+)"', archive.read(n).decode())[-1] for n in frames]
        (out / f'{stem}.json').write_text(json.dumps({'strokes': strokes}, separators=(',', ':')))
print('Prepared 37 official recordings and stroke files. See public/bopomofo/CREDITS.md.')
