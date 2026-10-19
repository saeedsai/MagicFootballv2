#!/usr/bin/env python3
"""Export 32 pages/8192 exact original 8x8 CHR pixels in neutral index colors.

Input is a user-imported local/original.chr; grayscale tones are not authentic NES
palette selections and tile sheets are NOT composed in-game player sprites.
Requires Pillow: python -m pip install Pillow
"""
from pathlib import Path
from PIL import Image, ImageDraw
import sys

root=Path(__file__).resolve().parent.parent
source=Path(sys.argv[1]) if len(sys.argv)>1 else root/'local'/'original.chr'
dest=Path(sys.argv[2]) if len(sys.argv)>2 else root/'local'/'original-chr-atlas.png'
data=source.read_bytes()
if len(data)!=131072:raise ValueError('Expected 131072 bytes of pinned CHR data; run private importer first')
palette=[(25,36,51),(91,107,119),(174,191,199),(245,244,232)]
result=Image.new('RGB',(8*256,4*(256+26)),(14,22,30));draw=ImageDraw.Draw(result)
for page in range(32):
    img=Image.new('RGB',(128,128));pixels=img.load()
    for local in range(256):
        base=(page*256+local)*16
        for y in range(8):
            lo=data[base+y];hi=data[base+8+y]
            for x in range(8):
                bit=7-x;v=((lo>>bit)&1)|(((hi>>bit)&1)<<1)
                pixels[(local%16)*8+x,(local//16)*8+y]=palette[v]
    ox=(page%8)*256;oy=(page//8)*(256+26)
    draw.text((ox+8,oy+5),f'CHR page {page:02d} | tiles {page*256:04d}-{page*256+255:04d}',fill=(216,228,235))
    result.paste(img.resize((256,256),Image.Resampling.NEAREST),(ox,oy+26))
dest.parent.mkdir(parents=True,exist_ok=True)
result.save(dest,optimize=True)
print(f'Wrote {dest}: {result.width}x{result.height}, all 8192 original CHR patterns')
