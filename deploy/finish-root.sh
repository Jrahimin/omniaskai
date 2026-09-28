#!/bin/sh
set -eu

app=/opt/omniaskai
storage="$app/storage"
if ! test -d "$storage"; then
    for path in /opt/omniaskai-data/media /opt/omniaskai-db /opt/omniaskai-backups; do
        if ! test -d "$path"; then
            echo "$path is missing." >&2
            exit 1
        fi
    done
    mkdir "$storage"
    mv /opt/omniaskai-data/media "$storage/media"
    rmdir /opt/omniaskai-data
    mv /opt/omniaskai-db "$storage/db"
    mv /opt/omniaskai-backups "$storage/backups"
    chown -R junayed:junayed "$storage"
fi

sed -i 's|^MEDIA_STORAGE_DIR=/opt/omniaskai-data/media$|MEDIA_STORAGE_DIR=/opt/omniaskai/storage/media|' "$app/.env.local"
chown junayed:junayed "$app/.env.local"
chmod 600 "$app/.env.local"

sh "$app/deploy/install-root.sh"
