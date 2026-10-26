import {_electron} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=process.cwd();
const qa=path.join(root,'localization');
const run=process.env.WAVE_QA_RUN || 'qa2';
const app=await _electron.launch({
    executablePath:path.join(root,'make-zh/win-unpacked/Wave-ZH.exe'),
    env:{...process.env,WAVETERM_CONFIG_HOME:path.join(qa,run,'config'),WAVETERM_DATA_HOME:path.join(qa,run,'data'),WAVETERM_ZH_USER_DATA:path.join(qa,run,'userdata'),WAVETERM_NOCONFIRMQUIT:'1'},
    timeout:60000,
});
try {
    const page=await app.firstWindow({timeout:60000});
    await page.waitForFunction(()=>document.body.innerText.length>30,undefined,{timeout:60000});
    const pages=app.windows();
    const encrypted=fs.readFileSync(path.join(qa,run,'config/secrets.enc'),'utf8');
    const nativeCheck=await app.evaluate(({safeStorage},encrypted)=>{
        const data=JSON.parse(safeStorage.decryptString(Buffer.from(encrypted,'base64')));
        return {encryptionAvailable:safeStorage.isEncryptionAvailable(),names:Object.keys(data).filter(k=>k!=='wave:writets').sort()};
    },encrypted);
    assert(nativeCheck.encryptionAvailable);
    assert(nativeCheck.names.length>0);
    await page.screenshot({path:path.join(qa,'qa-startup.png')});
    if(await page.getByRole('button',{name:'继续',exact:true}).isVisible())await page.getByRole('button',{name:'继续',exact:true}).click();
    if(await page.getByRole('button',{name:'稍后再说',exact:true}).isVisible())await page.getByRole('button',{name:'稍后再说',exact:true}).click();
    const skip=page.getByRole('button',{name:/跳过功能介绍/});
    await skip.waitFor({state:'visible',timeout:15000});
    await skip.click();
    await page.locator('div:text-is("设置"):visible').first().click();
    await page.getByText('凭据',{exact:true}).click();
    for(const name of nativeCheck.names)await page.getByText(name,{exact:true}).waitFor({state:'visible',timeout:15000});
    const applicationSecretCount=nativeCheck.names.length;
    await page.screenshot({path:path.join(qa,'qa-secrets.png')});
    const connectionButton=page.locator('[title^="已连接到本机"]:visible').first();
    await connectionButton.click();
    const connectionMenuItemCount=await page.getByRole('menuitem').count();
    assert(connectionMenuItemCount>0,'No connection entries were shown in the menu');
    await page.screenshot({path:path.join(qa,'qa-connections.png')});
    await page.keyboard.press('Escape');
    const result={encryptionAvailable:nativeCheck.encryptionAvailable,applicationSecretCount,connectionMenuItemCount,locale:await page.locator('html').getAttribute('lang'),title:await page.title(),windowCount:pages.length};
    fs.writeFileSync(path.join(qa,'smoke-result.json'),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
} finally {
    await app.close();
}
