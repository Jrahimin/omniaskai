from getpass import getpass
from pathlib import Path

env_path = Path('/opt/omniaskai/.env.local')
key = getpass('RAG Builder organization API key: ').strip()
if not key or '\n' in key or '\r' in key:
    raise SystemExit('A nonempty single-line key is required.')

lines = env_path.read_text().splitlines()
matches = [i for i, line in enumerate(lines) if line.startswith('APE_ORG_KEY=')]
if len(matches) != 1:
    raise SystemExit('Expected exactly one APE_ORG_KEY setting.')
lines[matches[0]] = 'APE_ORG_KEY=' + key
env_path.write_text('\n'.join(lines) + '\n')
env_path.chmod(0o600)
print('RAG Builder key saved. Its value was not displayed.')
