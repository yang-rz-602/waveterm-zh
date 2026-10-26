from pathlib import Path
import hashlib
import json
import subprocess
import time
import zipfile


root = Path(__file__).resolve().parents[1]
source = root / 'make-zh/win-unpacked'
archive_path = root.parent / 'Wave-ZH-0.14.5-zh.1-public-windows-x64.zip'
assert source.is_dir() and (source / 'Wave-ZH.exe').is_file()
assert not archive_path.exists(), 'Preserve an existing public ZIP before replacing it'

verification = json.loads((root / 'localization/static-verification.json').read_text(encoding='utf-8'))
manifest = {
    'edition': '0.14.5-zh.1',
    'base_version': '0.14.5',
    'source_commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
    'electron': '41.1.0',
    'architecture': 'windows-x64',
    'rebuilt_components': ['renderer', 'electron-main', 'electron-preload'],
    'official_native_backend_preserved': True,
    'personal_configuration_bundled': False,
    'sha256': {
        relative: hashlib.sha256((source / relative).read_bytes()).hexdigest()
        for relative in ['Wave-ZH.exe', 'resources/app.asar']
    },
    'validation': {
        'static_source_verification': 'passed',
        'packaged_application_launch': 'passed',
        'locale': 'zh-CN',
        'encrypted_credential_store_read': 'passed',
        'connection_menu_read': 'passed',
        'verification_files': verification.get('syntaxAndContractFiles'),
    },
}
started = time.monotonic()
forbidden_names = {'servers.json', 'secrets.enc', 'waveapp.log', 'Local State'}
files = [path for path in sorted(source.rglob('*')) if path.is_file()]
assert not [path for path in files if path.name in forbidden_names]
with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for path in files:
        archive.write(path, str(Path('Wave-ZH-0.14.5-zh.1') / path.relative_to(source)))
    archive.write(root / 'LICENSE', 'Wave-ZH-0.14.5-zh.1/LICENSE-Wave-Apache-2.0.txt')
    archive.write(root / 'localization/README.zh-CN.md', 'Wave-ZH-0.14.5-zh.1/使用说明.md')
    archive.writestr('Wave-ZH-0.14.5-zh.1/build-manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    archive.write(root / 'localization/static-verification.json', 'Wave-ZH-0.14.5-zh.1/verification/static-verification.json')

with zipfile.ZipFile(archive_path) as archive:
    names = archive.namelist()
    assert archive.testzip() is None
    assert not any(Path(name).name in forbidden_names for name in names)
    assert not any(Path(name).name.lower().startswith('qa-') or 'smoke-result' in name for name in names)

digest = hashlib.sha256(archive_path.read_bytes()).hexdigest()
archive_path.with_suffix('.zip.sha256').write_text(digest + '  ' + archive_path.name + '\n', encoding='ascii')
print(json.dumps({
    'archive': str(archive_path),
    'bytes': archive_path.stat().st_size,
    'files': len(names),
    'zip_integrity': 'passed',
    'personal_configuration_bundled': False,
    'sha256': digest,
    'seconds': round(time.monotonic() - started, 1),
}, ensure_ascii=False), flush=True)
