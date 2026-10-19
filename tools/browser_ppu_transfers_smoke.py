"""Browser checks for source-derived $F05F palette queue and $EE5A OAM DMA.
Uses synthetic RAM fixtures; does not claim original NES frame parity.
"""
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent

def route(q):
    path=urlparse(q.request.url).path.lstrip('/') or 'index.html'
    target=(root/path).resolve()
    if root not in target.parents or not target.is_file():q.fulfill(status=404,body='not found')
    else:q.fulfill(status=200,body=target.read_bytes(),content_type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.chr':'application/octet-stream'}.get(target.suffix,'application/octet-stream'))

def run(browser,mode):
    mobile=mode=='mobile'
    page=browser.new_page(viewport={'width':844,'height':390} if mobile else {'width':1280,'height':960},is_mobile=mobile,has_touch=mobile)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.route('**/*',route)
    if mode=='modular':
        html=(root/'dist/index.html').read_text().replace('<head>','<head><base href="https://kunio.local/">')
        page.set_content(html,wait_until='load')
    else:page.set_content((root/'dist/standalone.html').read_text(),wait_until='load')
    page.locator('#classicGraphicsLabBtn').click()
    page.locator('#ppuPaletteCount').fill('4')
    page.locator('#ppuPaletteLow').fill('16')
    page.locator('#ppuPaletteApply').click()
    status=page.locator('#ppuPaletteStatus').inner_text()
    trace=page.locator('#ppuPaletteTrace').inner_text()
    assert '4 PPU writes' in status and 'SYNTHETIC RAM' in status,(mode,status)
    assert '$3f10=00' in trace and '$3f13=03' in trace,(mode,trace)
    page.locator('#ppuPaletteCount').fill('33')
    page.locator('#ppuPaletteApply').click()
    assert 'rejected' in page.locator('#ppuPaletteStatus').inner_text()
    page.locator('#ppuOamApply').click()
    status=page.locator('#ppuPaletteStatus').inner_text()
    trace=page.locator('#ppuPaletteTrace').inner_text()
    assert '256 OAM bytes' in status and 'NOT original character metasprites' in status,status
    assert '$2003=$00, $4014=$02' in trace and '00 01 02 03' in trace,trace
    assert not errors,errors
    print('PPU TRANSFER',mode,'PASS: $F05F palette queue, $EE5A OAM DMA, invalid input and browser JS errors 0')
    page.close()

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for mode in ('standalone','modular','mobile'):run(browser,mode)
    browser.close()
