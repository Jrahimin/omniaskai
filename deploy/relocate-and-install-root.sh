#!/bin/sh
set -eu

for name in omniaskai omniaskai-data omniaskai-db omniaskai-backups; do
    if test -e "/opt/$name"; then
        echo "/opt/$name already exists; refusing to overwrite it." >&2
        exit 1
    fi
    if ! test -e "/home/junayed/$name"; then
        echo "/home/junayed/$name is missing." >&2
        exit 1
    fi
done

for name in omniaskai omniaskai-data omniaskai-db omniaskai-backups; do
    mv "/home/junayed/$name" "/opt/$name"
done

sed -i 's|^MEDIA_STORAGE_DIR=/home/junayed/omniaskai-data/media$|MEDIA_STORAGE_DIR=/opt/omniaskai-data/media|' /opt/omniaskai/.env.local
chown junayed:junayed /opt/omniaskai/.env.local
chmod 600 /opt/omniaskai/.env.local
runuser -u junayed -- sh -c 'cd /opt/omniaskai && npm run build'

old_cron=$(mktemp)
new_cron=$(mktemp)
trap 'rm -f "$old_cron" "$new_cron"' EXIT HUP INT TERM
crontab -u junayed -l > "$old_cron" 2>/dev/null || true
sed 's|/home/junayed/omniaskai/deploy/backup-user.sh|/opt/omniaskai/deploy/backup-user.sh|; s|/home/junayed/omniaskai-backups/backup.log|/opt/omniaskai-backups/backup.log|' "$old_cron" > "$new_cron"
crontab -u junayed "$new_cron"

sh /opt/omniaskai/deploy/install-root.sh
