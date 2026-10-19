"""Source-derived MMC3 CHR mapping browser QA using privately imported original ROM CHR.
No original ROM/CHR bytes are written to public outputs or screenshots.
"""
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
chr_data=(root/'local/original.chr').read_bytes()
assert len(chr_data)==131072
palette=((25,36,51,255),(91,107,119,255),(174,191,199,255),(245,244,232,255))
def pixel_at_chr_tile(tile):
    start=tile*16
    color=((chr_data[start]>>7)&1)|(((chr_data[start+8]>>7)&1)<<1)
    return list(palette[color])
def route(q):
    path=urlparse(q.request.url).path.lstrip('/') or 'index.html'
    target=(root/path).resolve()
    if root not in target.parents or not target.is_file():q.fulfill(status=404,body='not found')
    else:q.fulfill(status=200,body=target.read_bytes(),content_type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.chr':'application/octet-stream'}.get(target.suffix,'application/octet-stream'))
def run(browser,mode):
    mobile=mode=='mobile'
    page=browser.new_page(viewport={'width':844,'height':390} if mobile else {'width':1280,'height':960},is_mobile=mobile,has_touch=mobile)
    errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
    page.route('**/*',route)
    if mode=='modular':
        html=(root/'dist/index.html').read_text().replace('<head>','<head><base href="https://kunio.local/">')
        page.set_content(html,wait_until='load')
    else:page.set_content((root/'dist/standalone-private.html').read_text(),wait_until='load')
    page.locator('#classicGraphicsLabBtn').click()
    page.wait_for_function("document.querySelector('#graphicsStatus').textContent.includes('8192 decoded tile patterns')")
    page.locator('#graphicsBg0').fill('33') # 2 KiB register aligns to 32
    page.locator('#graphicsSp0').fill('100')
    page.locator('#graphicsMapperApply').click()
    status=page.locator('#graphicsMapperStatus').inner_text()
    assert '32, 33, 2, 3, 100, 5, 6, 7' in status,status
    actual=page.evaluate("Array.from(document.querySelector('#graphicsMappedAtlas').getContext('2d').getImageData(0,0,1,1).data)")
    assert actual==pixel_at_chr_tile(32*64),(mode,actual,pixel_at_chr_tile(32*64))
    page.locator('#graphicsPpuTable').select_option('1')
    actual=page.evaluate("Array.from(document.querySelector('#graphicsMappedAtlas').getContext('2d').getImageData(0,0,1,1).data)")
    assert actual==pixel_at_chr_tile(100*64),(mode,actual,pixel_at_chr_tile(100*64))
    page.locator('#graphicsBg0').fill('999')
    page.locator('#graphicsMapperApply').click()
    assert 'rejected' in page.locator('#graphicsMapperStatus').inner_text()
    assert errs==[],errs
    print('CHR BANKING',mode,'PASS: original $EE7D/$EE9A register order, 2 KiB alignment, authentic CHR pixel and browser errors 0')
    page.close()
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for mode in ('standalone','modular','mobile'):run(browser,mode)
    browser.close()
