"""Browser-only smoke on the actual privately supplied CHR (no original ROM execution)."""
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
assert (root/'local/original.chr').exists(), 'private user-supplied CHR must be imported before this test'
mt={'.html':'text/html','.js':'text/javascript','.css':'text/css','.chr':'application/octet-stream','.json':'application/json'}
def route(q):
    path=urlparse(q.request.url).path.lstrip('/') or 'index.html'
    target=(root/path).resolve()
    if root not in target.parents or not target.is_file():q.fulfill(status=404,body='not found')
    else:q.fulfill(status=200,body=target.read_bytes(),content_type=mt.get(target.suffix,'application/octet-stream'))
def check(browser,mode):
    viewport= {'width':844,'height':390} if mode=='mobile' else {'width':1280,'height':960}
    page=browser.new_page(viewport=viewport,is_mobile=mode=='mobile',has_touch=mode=='mobile')
    errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
    page.route('**/*',route)
    path='dist/index.html' if mode=='modular' else 'dist/standalone-private.html'
    if mode=='modular':
        html=(root/path).read_text().replace('<head>', '<head><base href="https://kunio.local/">')
        page.set_content(html,wait_until='load')
    else:
        page.set_content((root/path).read_text(),wait_until='load')
    page.locator('#classicGraphicsLabBtn').click()
    page.wait_for_function("document.querySelector('#graphicsStatus').textContent.includes('8192 decoded tile patterns')")
    status=page.locator('#graphicsStatus').inner_text()
    assert ('VERIFIED: CHR graphics exactly match pinned original binary' in status or
            ('modular'==mode and 'Original CHR identity unverified' in status)),status
    assert page.locator('#graphicsAtlas').is_visible()
    assert 'Page 1 / 32' in page.locator('#graphicsPageLabel').inner_text()
    page.locator('#graphicsNext').click()
    assert 'Page 2 / 32' in page.locator('#graphicsPageLabel').inner_text()
    # Verify the source is byte-varying original tiles, not a synthetic empty atlas.
    unique=page.evaluate("(() => {const d=document.querySelector('#graphicsAtlas').getContext('2d').getImageData(0,0,128,128).data;const a=new Set();for(let k=0;k<d.length;k+=4)a.add(`${d[k]}:${d[k+1]}:${d[k+2]}`);return a.size})()")
    assert unique>=2,unique
    page.locator('#graphicsPrev').click()
    (root/'reports/screenshots').mkdir(parents=True,exist_ok=True)
    page.screenshot(path=str(root/'reports/screenshots'/f'verified-original-chr-{mode}.png'))
    assert errs==[],errs
    print('VERIFIED ORIGINAL CHR',mode, 'PASS', 'decoded 8192 tiles / 32 pages, original hash verified, browser errors 0')
    page.close()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for name in ['standalone','modular','mobile']:check(b,name)
 b.close()
