import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const dictionary = new Map();
for (const [index, line] of fs.readFileSync('localization/zh-CN.tsv', 'utf8').split(/\r?\n/).entries()) {
    if (!line.trim() || line.startsWith('#')) continue;
    const tab = line.indexOf('\t');
    if (tab < 1) throw new Error(`Invalid translation at line ${index + 1}`);
    const key = line.slice(0, tab), value = line.slice(tab + 1);
    if (dictionary.has(key) && dictionary.get(key) !== value) throw new Error(`Conflicting translation: ${key}`);
    if (!value.trim()) throw new Error(`Empty translation: ${key}`);
    dictionary.set(key, value);
}
const normalize = text => text.replace(/\s+/g, ' ').trim();
const changes = [];
const translated = new Set();
const protectedAttributes = new Set(['className','class','id','key','type','role','value','defaultValue','href','src','language','lang','icon','name','data-testid','hotkey']);
function isProtected(node) {
    const p = node.parent;
    if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || ts.isElementAccessExpression(p)) return true;
    if (ts.isPropertyAssignment(p) && p.name === node) return true;
    if (ts.isJsxAttribute(p) && protectedAttributes.has(p.name.text)) return true;
    if (ts.isImportTypeNode(p) || ts.isTypeAliasDeclaration(p)) return true;
    if (ts.isBinaryExpression(p) && p.operatorToken.kind !== ts.SyntaxKind.EqualsToken && p.operatorToken.kind !== ts.SyntaxKind.PlusToken && p.operatorToken.kind !== ts.SyntaxKind.PlusEqualsToken) return true;
    if (ts.isBinaryExpression(p) && ts.isPropertyAccessExpression(p.left) && p.left.name.text === 'displayName') return true;
    if (ts.isPropertyAssignment(p) && /^(role|type|id|key|value|icon|className|class|command|method|event|view|controller|language|path|accelerator|displayName)$/.test(p.name?.text ?? '')) return true;
    if (ts.isCaseClause(p)) return true;
    if (ts.isCallExpression(p) && ts.isPropertyAccessExpression(p.expression) && /^(join|resolve|dirname|basename|log|warn|error|debug|info|includes|startsWith|endsWith|indexOf|match|replace|replaceAll|querySelector|querySelectorAll|addEventListener|removeEventListener|send|on|once)$/.test(p.expression.name.text)) return true;
    return false;
}
function localize(file) {
    const text = fs.readFileSync(file, 'utf8');
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const edits = [];
    const record = (node, replacement, key) => {
        edits.push({start: node.getStart(source), end: node.end, replacement});
        translated.add(key);
        changes.push({file: file.replaceAll('\\','/'), line: source.getLineAndCharacterOfPosition(node.getStart(source)).line+1, en: key, zh: dictionary.get(key)});
    };
    function visit(node) {
        if (ts.isJsxText(node)) {
            const key = normalize(node.text), value = dictionary.get(key);
            if (value) {
                const raw = node.getText(source);
                const leading = raw.match(/^\s*/)[0], trailing = raw.match(/\s*$/)[0];
                record(node, leading + value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') + trailing, key);
            }
        } else if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !isProtected(node)) {
            const key = normalize(node.text), value = dictionary.get(key);
            if (value) {
                const leading = node.text.match(/^\s*/)[0], trailing = node.text.match(/\s*$/)[0];
                const quoted = JSON.stringify(leading + value + trailing);
                record(node, ts.isJsxAttribute(node.parent) ? `{${quoted}}` : quoted, key);
            }
        } else if (ts.isTemplateExpression(node) && !isProtected(node)) {
            const key = normalize(node.head.text + node.templateSpans.map((span,i) => `{${i}}` + span.literal.text).join(''));
            const value = dictionary.get(key);
            if (value) {
                const placeholders = [...value.matchAll(/\{(\d+)\}/g)].map(x=>Number(x[1]));
                if (placeholders.length !== node.templateSpans.length || new Set(placeholders).size !== node.templateSpans.length) throw new Error(`Template placeholder mismatch: ${key}`);
                const replacement = '`' + value.split(/(\{\d+\})/).map(part => {
                    const match = part.match(/^\{(\d+)\}$/);
                    return match ? '${' + node.templateSpans[Number(match[1])].expression.getText(source) + '}' : part.replaceAll('\\','\\\\').replaceAll('`','\\`').replaceAll('${','\\${');
                }).join('') + '`';
                record(node,replacement,key);
                return;
            }
        }
        ts.forEachChild(node,visit);
    }
    visit(source);
    if (!edits.length) return;
    let result = text;
    for (const edit of edits.sort((a,b)=>b.start-a.start)) result=result.slice(0,edit.start)+edit.replacement+result.slice(edit.end);
    const parsed = ts.createSourceFile(file,result,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
    if (parsed.parseDiagnostics.length) throw new Error(`Localized syntax error in ${file}: ${parsed.parseDiagnostics.map(d=>d.messageText).join('; ')}`);
    fs.writeFileSync(file,result);
}
function walk(dir) {
    for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
        const file=path.join(dir,entry.name);
        if (entry.isDirectory()) walk(file);
        else if (/\.(tsx?|jsx?)$/.test(file) && !file.endsWith('zh-profile.ts') && !/\.(test|preview|preview-util|d)\./.test(file)) localize(file);
    }
}
for (const dir of ['frontend/app','frontend/builder','frontend/layout','emain']) walk(dir);
localize('frontend/wave.ts');
const previous=fs.existsSync('localization/translation-report.json')?JSON.parse(fs.readFileSync('localization/translation-report.json','utf8')).changes:[];
const combined=[...previous,...changes];
const report={locale:'zh-CN',dictionaryEntries:dictionary.size,uniqueTranslated:new Set(combined.map(x=>x.en)).size,occurrences:combined.length,files:new Set(combined.map(x=>x.file)).size,changes:combined};
fs.writeFileSync('localization/translation-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,changes:undefined}));
