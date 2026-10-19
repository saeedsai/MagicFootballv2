"""Source-backed original $D993 weather OAM browser smoke.
Owner ROM loaded only in browser memory; not distributed or committed.
Not an NES emulator frame-parity test.
"""
from pathlib import Path
from urllib.parse import urlparse
from zipfile import ZipFile
import os
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
rom_path=os.environ.get('KUNIO_ORIGINAL_ZIP')
assert rom_path, 'KUNIO_ORIGINAL_ZIP must point to the user-supplied original ROM archive'
with ZipFile(rom_path) as archive:
    names=[x for x in archive.namelist() if x.lower().endswith('.nes')]
    assert len(names)==1
    rom=archive.read(names[0])

def run(browser,mode):
    mobile=mode=='mobile'
    page=browser.new_page(viewport={'width':844,'height':390} if mobile else {'width':1280,'height':960},is_mobile=mobile,has_touch=mobile)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def route(q):
        path=urlparse(q.request.url).path.lstrip('/') or 'index.html'
        target=(root/'dist'/path).resolve()
        if root/'dist' not in target.parents or not target.is_file():
            q.fulfill(status=404,body='not found')
        else:
            q.fulfill(status=200,body=target.read_bytes(),content_type={'.html':'text/html','.js':'text/javascript','.css':'text/css'}.get(target.suffix,'application/octet-stream'))
    page.route('**/*',route)
    if mode=='standalone' or mode=='mobile':
        page.set_content((root/'dist/standalone.html').read_text(),wait_until='load')
    else:
        html=(root/'dist/index.html').read_text().replace('<head>','<head><base href="https://kunio.local/">')
        page.set_content(html,wait_until='load')
    page.locator('#classicGraphicsLabBtn').click()
    page.locator('#graphicsFile').set_input_files({'name':'Kunio-original.nes','mimeType':'application/octet-stream','buffer':rom})
    page.locator('#weatherStatus').get_by_text('Original PRG verified',exact=False).wait_for(timeout=10000)
    page.locator('#weatherInitBtn').click()
    status=page.locator('#weatherStatus').inner_text()
    trace=page.locator('#weatherTrace').inner_text()
    assert 'initialize' in status and 'AUTHENTIC PRG TABLES, SYNTHETIC RAM' in status,(mode,status)
    assert '#00  Y=$00  tile=$e0  attributes=$01  X=$28' in trace,(mode,trace)
    page.locator('#weatherStepBtn').click()
    status=page.locator('#weatherStatus').inner_text()
    trace=page.locator('#weatherTrace').inner_text()
    assert 'update' in status and 'phase $03AE=$01' in status,(mode,status)
    assert '#00  Y=$40  tile=$e0  attributes=$00  X=$29' in trace,(mode,trace)
    if mode=='standalone':
        page.locator('#originalWeatherSpriteLab').screenshot(path=str(root/'reports/screenshots/original-weather-sprite-lab.png'))
    # Reject a modified PRG even when its CHR bytes are unchanged.
    corrupted=bytearray(rom)
    corrupted[0x100]^=0x01
    page.locator('#graphicsFile').set_input_files({'name':'corrupted-original.nes','mimeType':'application/octet-stream','buffer':bytes(corrupted)})
    page.locator('#graphicsStatus').get_by_text('Original PRG verification failed',exact=False).wait_for(timeout=10000)
    page.locator('#weatherInitBtn').click()
    assert 'Select the verified original .nes' in page.locator('#weatherStatus').inner_text()
    assert not errors,errors
    print('WEATHER SPRITE',mode,'PASS: authenticated PRG, $D993 init/update, OAM+DMA, JS errors 0')
    page.close()

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for mode in ('standalone','modular','mobile'):run(browser,mode)
    browser.close()
