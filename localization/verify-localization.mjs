import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {execFileSync} from 'node:child_process';

const report=JSON.parse(fs.readFileSync('localization/translation-report.json','utf8'));
const logicChanges=new Set(['emain/emain-menu.ts','emain/emain-platform.ts','emain/updater.ts','emain/zh-profile.ts']);
const files=[...new Set(report.changes.map(x=>x.file))].filter(x=>!logicChanges.has(x));
function fingerprint(file,text) {
    const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
    assert.equal(ast.parseDiagnostics.length,0,`Syntax diagnostics in ${file}`);
    const identifiers=[],numbers=[],technical=[];
    function visit(node) {
        if (ts.isIdentifier(node)) identifiers.push(node.text);
        if (ts.isNumericLiteral(node)) numbers.push(node.text);
        if (ts.isStringLiteral(node)) {
            const p=node.parent;
            if (ts.isImportDeclaration(p)||ts.isExportDeclaration(p)||ts.isLiteralTypeNode(p)||ts.isElementAccessExpression(p)||(ts.isPropertyAssignment(p)&&p.name===node)||(ts.isPropertyAssignment(p)&&/^(role|type|id|key|icon|className|class|command|method|event|view|controller|language|path|accelerator)$/.test(p.name?.text??''))||(ts.isJsxAttribute(p)&&/^(className|id|key|type|role|href|src|value|defaultValue|language|data-testid)$/.test(p.name?.text??''))) technical.push(node.text);
        }
        ts.forEachChild(node,visit);
    }
    visit(ast);
    return {identifiers,numbers,technical};
}
for (const file of files) {
    const original=execFileSync('git',['show',`HEAD:${file}`],{encoding:'utf8',maxBuffer:8*1024*1024});
    const current=fs.readFileSync(file,'utf8');
    assert.deepEqual(fingerprint(file,current),fingerprint(file,original),`Code contracts changed in ${file}`);
}
for (const {en,zh} of report.changes) {
    assert(zh.trim());
    const expected=[...en.matchAll(/\{\d+\}/g)].map(x=>x[0]).sort();
    const actual=[...zh.matchAll(/\{\d+\}/g)].map(x=>x[0]).sort();
    assert.deepEqual(actual,expected,`Placeholder contract changed: ${en}`);
}
const summary={syntaxAndContractFiles:files.length,translatedOccurrences:report.occurrences,dictionaryEntries:report.dictionaryEntries,placeholderChecks:'passed',identifiersAndTechnicalValues:'preserved'};
fs.writeFileSync('localization/static-verification.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary));
