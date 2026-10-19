"""Original 2bpp binary tile decoding UI smoke; synthetic fixture (not original art)."""
from playwright.sync_api import sync_playwright
from pathlib import Path
from urllib.parse import urlparse
root=Path(__file__).resolve().parent.parent
mime={'.html':'text/html','.css':'text/css','.js':'text/javascript'}
def serve(route):
    path=urlparse(route.request.url).path.lstrip('/') or 'index.html'
    target=(root/path).resolve()
    if root not in target.parents or not target.is_file():
        route.fulfill(status=404,body='not found')
    else: route.fulfill(status=200,body=target.read_bytes(),content_type=mime.get(target.suffix,'text/plain'))

def smoke(browser,standalone):
    p=browser.new_page(viewport={'width':1200,'height':920})
    p.route('**/*',serve)
    errors=[];p.on('pageerror',lambda error:errors.append(str(error)))
    if standalone:
        p.set_content((root/'dist/standalone.html').read_text(),wait_until='load')
    else:
        html=(root/'dist'/'index.html').read_text().replace('<head>', '<head><base href="https://kunio.local/">')
        p.set_content(html,wait_until='load')
        p.wait_for_function('typeof window.__kunioDebug === "object"')
    p.locator('#classicGraphicsLabBtn').click()
    assert p.locator('#graphicsLab').is_visible()
    assert p.locator('#graphicsAtlas').is_visible()
    # 257 tiles tests multi-page navigation; 256 first-page tile data all index 0.
    # tile 0: upper left pixel uses index 3 from both CHR planes.
    raw=bytearray(257*16);raw[0]=0x80;raw[8]=0x80
    raw[256*16+0]=0xff # tile 256: first row 8 pixels index 1.
    p.locator('#graphicsFile').set_input_files({'name':'synthetic-test.chr','mimeType':'application/octet-stream','buffer':bytes(raw)})
    p.wait_for_function("document.querySelector('#graphicsStatus').textContent.includes('257 decoded tile patterns')")
    assert not p.locator('#graphicsNext').is_disabled()
    first=p.evaluate("Array.from(document.querySelector('#graphicsAtlas').getContext('2d').getImageData(0,0,1,1).data)")
    assert first==[245,244,232,255], first # neutral index 3, not a game palette.
    tilelabel=p.locator('#graphicsTileLabel').inner_text()
    assert 'Tile 0' in tilelabel
    p.locator('#graphicsNext').click()
    assert 'Page 2 / 2' in p.locator('#graphicsPageLabel').inner_text()
    assert p.locator('#graphicsNext').is_disabled()
    assert 'Tile 256' in p.locator('#graphicsTileLabel').inner_text()
    first=p.evaluate("Array.from(document.querySelector('#graphicsAtlas').getContext('2d').getImageData(0,0,1,1).data)")
    assert first==[91,107,119,255], first # neutral index 1
    p.locator('#graphicsPrev').click()
    assert p.locator('#graphicsPrev').is_disabled()
    assert 'Tile 0' in p.locator('#graphicsTileLabel').inner_text()
    p.screenshot(path=str(root/'reports'/'screenshots'/('binary-graphics-standalone-synthetic.png' if standalone else 'binary-graphics-modular-synthetic.png')))
    # Invalid binary must never be accepted as original CHR data.
    p.locator('#graphicsFile').set_input_files({'name':'broken.chr','mimeType':'application/octet-stream','buffer':b'not a tile binary'})
    assert 'rejected' in p.locator('#graphicsStatus').inner_text()
    assert p.locator('#graphicsNext').is_disabled()
    assert not errors,errors
    print('graphics browser:', 'standalone' if standalone else 'modular','PASS, zero JS errors')
    p.close()

(root/'reports'/'screenshots').mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    smoke(browser,True)
    smoke(browser,False)
    browser.close()
