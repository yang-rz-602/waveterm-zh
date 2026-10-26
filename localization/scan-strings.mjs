import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const records = new Map();
const attributes = new Set(['title', 'label', 'placeholder', 'aria-label', 'alt', 'tooltip', 'message', 'description', 'text', 'name', 'header', 'emptyMessage', 'loadingMessage', 'buttonLabel', 'content']);
function scan(file) {
    const text = fs.readFileSync(file, 'utf8');
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    function add(node, value, kind) {
        value = value.replace(/\s+/g, ' ').trim();
        if (!/[A-Za-z]/.test(value) || value.length > 1400) return;
        const record = records.get(value) ?? {text: value, kinds: [], locations: []};
        if (!record.kinds.includes(kind)) record.kinds.push(kind);
        if (record.locations.length < 4) record.locations.push(`${path.relative(root, file).replaceAll('\\', '/')}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`);
        records.set(value, record);
    }
    function visit(node) {
        if (ts.isJsxText(node)) add(node, node.text, 'jsx');
        else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
            const p = node.parent;
            const name = p?.name?.text;
            if (ts.isJsxAttribute(p) && attributes.has(name)) add(node, node.text, 'attribute');
            else if (ts.isPropertyAssignment(p) && attributes.has(name)) add(node, node.text, 'property');
            else if (/[A-Z][a-z]+\s+[A-Za-z]/.test(node.text) && !/^(https?:|[.\/])/.test(node.text) && !node.text.includes('fa-')) add(node, node.text, 'literal');
            else if (/^[A-Z][A-Za-z ]{2,50}[.!?]?$/.test(node.text)) add(node, node.text, 'word');
        } else if (ts.isTemplateExpression(node)) {
            const value = node.head.text + node.templateSpans.map((s, i) => `{${i}}` + s.literal.text).join('');
            if (/[A-Z][a-z]+/.test(value)) add(node, value, 'template');
        }
        ts.forEachChild(node, visit);
    }
    visit(source);
}
function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (/\.(tsx?|jsx?)$/.test(file) && !/\.(test|preview|preview-util|d)\./.test(file)) scan(file);
    }
}
for (const dir of ['frontend/app', 'frontend/builder', 'frontend/layout', 'emain']) walk(path.join(root, dir));
scan(path.join(root, 'frontend/wave.ts'));
const list = [...records.values()].sort((a,b) => a.text.localeCompare(b.text));
fs.writeFileSync('localization/strings-inventory.json', JSON.stringify(list, null, 2) + '\n');
console.log(JSON.stringify({uniqueCandidates: list.length, directUI: list.filter(x=>x.kinds.some(k=>['jsx','attribute','property'].includes(k))).length}));
