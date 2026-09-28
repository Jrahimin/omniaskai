from pathlib import Path
import secrets

app = Path('/opt/omniaskai')
storage = app / 'storage'
data = storage / 'media'
db = storage / 'db'
db.mkdir(mode=0o700, parents=True, exist_ok=True)
data.mkdir(parents=True, exist_ok=True)

db_env = db / '.env'
if not db_env.exists():
    db_env.write_text(f'POSTGRES_PASSWORD={secrets.token_hex(32)}\n')
    db_env.chmod(0o600)

password_line = next(
    line for line in db_env.read_text().splitlines()
    if line.startswith('POSTGRES_PASSWORD=')
)
password = password_line.split('=', 1)[1]

app_env = app / '.env.local'
if app_env.stat().st_size:
    raise SystemExit('Existing application environment is nonempty; refusing to replace it.')

app_env.write_text('\n'.join([
    'APE_BASE_URL=https://api.omniaskai.com',
    'APE_ORG_KEY=',
    f'APE_CONVERSATION_TOKEN_KEY={secrets.token_hex(32)}',
    f'DATABASE_URL=postgres://omniaskai:{password}@127.0.0.1:5434/omniaskai',
    'APP_ORIGIN=https://omniaskai.com',
    f'BETTER_AUTH_SECRET={secrets.token_hex(32)}',
    f'MEDIA_STORAGE_DIR={data}',
    '',
]))
app_env.chmod(0o600)
print('Created restricted database and app environments. APE_ORG_KEY remains empty.')
