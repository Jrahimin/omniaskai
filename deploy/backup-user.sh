#!/bin/sh
set -eu

backup_dir=/opt/omniaskai/storage/backups
stamp=$(date -u +%Y%m%dT%H%M%SZ)
umask 077
mkdir -p "$backup_dir"
chmod 700 "$backup_dir"

db_file="$backup_dir/omniaskai-db-$stamp.dump"
media_file="$backup_dir/omniaskai-media-$stamp.tar.gz"
trap 'rm -f "$db_file" "$media_file"' HUP INT TERM

docker exec omniaskai-db-postgres-1 pg_dump -U omniaskai -Fc omniaskai > "$db_file"
tar -czf "$media_file" -C /opt/omniaskai/storage media

test -s "$db_file"
test -s "$media_file"
find "$backup_dir" -maxdepth 1 -type f \( -name 'omniaskai-db-*.dump' -o -name 'omniaskai-media-*.tar.gz' \) -mtime +14 -delete
trap - HUP INT TERM
