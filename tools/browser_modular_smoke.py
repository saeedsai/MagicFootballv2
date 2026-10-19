"""Smoke-test actual ESM output (not the standalone inline bundle)."""
from playwright.sync_api import sync_playwright
from pathlib import Path
from urllib.parse import urlparse
root=Path(__file__).resolve().parent.parent/'dist'
MIMES={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json'}
def serve(route):
    path=urlparse(route.request.url).path.lstrip('/') or 'index.html'
    file=(root/path).resolve()
    if root not in file.parents or not file.is_file():
        route.fulfill(status=404,body='missing')
    else:
        route.fulfill(status=200,body=file.read_bytes(),content_type=MIMES.get(file.suffix,'text/plain'))
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1280,'height':850})
    page.route('**/*',serve)
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    # Sandbox blocks top-level HTTP navigation. Base URL enables real ESM imports via intercepted requests.
    html=(root/'index.html').read_text().replace('<head>', '<head><base href="https://kunio.local/">')
    page.set_content(html,wait_until='load')
    page.wait_for_function('typeof window.__kunioDebug === "object"')
    page.locator('#classicInputLabBtn').click()
    page.locator('[data-channel="2"][data-nes-button="LEFT"]').click()
    page.locator('#labScanBtn').click()
    assert page.evaluate('window.__kunioDebug.getOriginalInputLab().pressed[2]')==2
    page.locator('[data-channel="0"][data-nes-button="START"]').click()
    page.locator('#labScanBtn').click()
    assert page.evaluate('window.__kunioDebug.getOriginalInputLab().field.gameScript')==0x80
    page.locator('#labGoalTraceBtn').click()
    assert page.evaluate('window.__kunioDebug.getOriginalInputLab().goalCutscene.cutsceneTimer')==32
    page.locator('#labActionTraceBtn').click()
    action=page.evaluate('window.__kunioDebug.getOriginalInputLab().playerActionTrace')
    assert action['gate']['dispatch'] and action['state']['action']==4,action
    page.locator('#labActionHeld').fill('192')
    page.locator('#labBufferStepBtn').click()
    assert page.evaluate('window.__kunioDebug.getOriginalInputLab().actionBuffers.buffer570')==224
    page.locator('#labPossTraceBtn').click()
    assert page.evaluate('window.__kunioDebug.getOriginalInputLab().possessionTrace.branch')=='$B87E-A-new-press'
    page.locator('#labAltTraceBtn').click()
    alt=page.evaluate('window.__kunioDebug.getOriginalInputLab().alternateTrace')
    assert alt['dispatch']=='$B4C9' and alt['playerAction']==0x35,alt
    page.locator('#labArbTraceBtn').click()
    arb=page.evaluate('window.__kunioDebug.getOriginalInputLab().arbitrationTrace')
    assert arb['reason']=='$AA94-accepted-action' and arb['movementAfter']==0x35,arb
    page.locator('#labBackBtn').click()
    page.locator('#playBtn').click()
    page.wait_for_timeout(750)
    assert page.evaluate('window.__kunioDebug.getSnapshot().tick')>20
    assert not errors,errors
    print('MODULAR ESM PASS: actual imported modules, source-derived controller, player-action, possession and four-slot-selector/action-arbitration labs, development match, 0 JS page errors')
    browser.close()
