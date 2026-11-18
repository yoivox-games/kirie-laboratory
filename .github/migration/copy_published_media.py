import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import tempfile
from urllib.parse import quote


HOME = 'kirie-laboratory'
GAMES = {
    'pochi-touch-talk-yoivox',
    'luis-touch-game',
    'linglong-touch-game',
    'monitor-no-kare',
    'good-pet-conditions',
    'noah-remember',
}
MEDIA_SUFFIXES = {'.webp', '.jpg', '.png', '.ico', '.mp4', '.mp3', '.wav', '.part', '.pdf'}


def validate(entry):
    raw_path = entry['path']
    path = PurePosixPath(raw_path)
    if path.as_posix() != raw_path or path.is_absolute() or any(p.startswith('.') for p in path.parts):
        raise ValueError(f'Unexpected path: {raw_path}')
    if path.suffix not in MEDIA_SUFFIXES:
        raise ValueError(f'Unexpected asset format: {path}')
    if path.parts[0] == 'games':
        if len(path.parts) < 3 or path.parts[1] not in GAMES:
            raise ValueError(f'Unexpected game path: {path}')
        slug = path.parts[1]
        original_path = PurePosixPath(*path.parts[2:])
    else:
        slug = HOME
        original_path = path
    expected = f'https://{slug}.sonminn.chatgpt.site/{quote(original_path.as_posix(), safe="/")}'
    if entry['url'] != expected:
        raise ValueError(f'Unexpected source URL for {path}')
    if not 0 < entry['bytes'] < 100 * 1024 * 1024 or not re.fullmatch('[a-f0-9]{64}', entry['sha256']):
        raise ValueError(f'Invalid size or checksum for {path}')
    return path


def matches(file, entry):
    if file.is_symlink() or not file.is_file() or file.stat().st_size != entry['bytes']:
        return False
    with file.open('rb') as data:
        return hashlib.file_digest(data, 'sha256').hexdigest() == entry['sha256']


def download(root, entry, path):
    destination = root / path
    if destination.exists():
        if matches(destination, entry):
            return
        raise ValueError(f'File already exists with different contents: {path}')
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, prefix='.migration-', delete=False) as part:
        temporary = Path(part.name)
    try:
        completed = subprocess.run([
            'curl', '--fail', '--silent', '--show-error', '--proto', '=https',
            '--connect-timeout', '15', '--max-time', '90', '--retry', '2',
            '--max-filesize', str(entry['bytes']), '--output', str(temporary), entry['url'],
        ], capture_output=True, text=True)
        if completed.returncode:
            raise RuntimeError(f'{path}: {completed.stderr.strip()}')
        if not matches(temporary, entry):
            raise ValueError(f'Asset did not match the captured public release: {path}')
        temporary.replace(destination)
    finally:
        temporary.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('manifest', type=Path)
    parser.add_argument('--root', type=Path, default=Path.cwd())
    parser.add_argument('--pathspec', type=Path)
    parser.add_argument('--workers', type=int, default=8)
    args = parser.parse_args()
    root = args.root.resolve()
    entries = json.loads(args.manifest.read_text(encoding='utf-8'))
    paths = [validate(entry) for entry in entries]
    if len(paths) != len(set(paths)):
        raise ValueError('Duplicate asset paths')
    failures = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        pending = [pool.submit(download, root, entry, path) for entry, path in zip(entries, paths)]
        for index, future in enumerate(as_completed(pending), start=1):
            try:
                future.result()
            except (RuntimeError, ValueError, OSError) as error:
                failures.append(str(error))
            if index == len(paths) or index % 50 == 0:
                print(f'Checked {index}/{len(paths)} assets', flush=True)
    if failures:
        raise SystemExit('\n'.join(failures))
    if args.pathspec:
        args.pathspec.write_bytes(''.join(path.as_posix() + '\0' for path in paths).encode('utf-8'))
    print(f'Verified {len(paths)} assets, {sum(entry["bytes"] for entry in entries):,} bytes.')


if __name__ == '__main__':
    main()
