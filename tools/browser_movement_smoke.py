"""Standalone and modular Chromium smoke for source-local bank06 transitions.
The RAM inputs are synthetic; this is NOT original-game frame parity.
"""
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
mimes={'.html':'text/html','.css':'text/css','.js':'text/javascript'}
def serve(route):
    path=urlparse(route.request.url).path.lstrip('/') or 'index.html'
    target=(root/'dist'/path).resolve()
    if (root/'dist') not in target.parents or not target.is_file():
        route.fulfill(status=404,body='not found')
    else:
        route.fulfill(status=200,body=target.read_bytes(),content_type=mimes.get(target.suffix,'text/plain'))

def smoke(browser,standalone,mobile=False):
    viewport={'width':844,'height':390} if mobile else {'width':1200,'height':900}
    page=browser.new_page(viewport=viewport)
    page.route('**/*',serve)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    if standalone:
        page.set_content((root/'dist/standalone.html').read_text(),wait_until='load')
    else:
        html=(root/'dist/index.html').read_text().replace('<head>','<head><base href="https://kunio.local/">')
        page.set_content(html,wait_until='load')
        page.wait_for_function('typeof window.__kunioDebug === "object"')
    page.locator('#classicInputLabBtn').click()
    page.locator('#labMoveStateBtn').click()
    trace=page.evaluate('window.__kunioDebug.getOriginalInputLab().movementTrace')
    assert trace['source']=='bank06:$AAC3/$AAC8-$AB0A',trace
    assert trace['movement']==53,trace
    assert 'NO physics' in page.locator('#labMoveStatus').inner_text()
    page.locator('#labMoveShotBtn').click()
    trace=page.evaluate('window.__kunioDebug.getOriginalInputLab().movementTrace')
    assert trace['reason']=='$AB46-shot-movement-selected',trace
    assert trace['movementAfter']==5,trace
    page.locator('#labMoveShot').fill('24')
    page.locator('#labMoveShotBtn').click()
    assert 'outside audited' in page.locator('#labMoveStatus').inner_text()
    assert page.evaluate('window.__kunioDebug.getOriginalInputLab().movementTrace') is None
    assert not errors,errors
    page.screenshot(path=str(root/'reports/screenshots'/('movement-lab-mobile.png' if mobile else ('movement-lab-standalone.png' if standalone else 'movement-lab-modular.png'))))
    print('PASS:', 'standalone' if standalone else 'modular', 'mobile' if mobile else 'desktop', '0 page errors')
    page.close()

(root/'reports/screenshots').mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    smoke(browser,True)
    smoke(browser,False)
    smoke(browser,True,True)
    browser.close()
