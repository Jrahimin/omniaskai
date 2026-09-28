#!/bin/sh
set -eu

app_dir=/opt/omniaskai
if ! test -f "$app_dir/.next/BUILD_ID"; then
    echo 'Production build is missing.' >&2
    exit 1
fi
install -m 0644 "$app_dir/deploy/omniaskai.nginx.conf" /etc/nginx/sites-available/omniaskai.conf
ln -sfn /etc/nginx/sites-available/omniaskai.conf /etc/nginx/sites-enabled/omniaskai.conf

# This shared snippet is used by the other Next.js virtual hosts as well.
sed -i 's/^proxy_read_timeout 60s;$/proxy_read_timeout 120s;/; s/^proxy_send_timeout 60s;$/proxy_send_timeout 120s;/' /etc/nginx/snippets/proxy-common.conf

install -m 0644 "$app_dir/deploy/omniaskai.service" /etc/systemd/system/omniaskai.service
nginx -t
systemctl daemon-reload
systemctl enable --now omniaskai.service
systemctl reload nginx

attempt=0
until curl --fail --silent --max-time 3 http://127.0.0.1:3011/ >/dev/null; do
    attempt=$((attempt + 1))
    if test "$attempt" -ge 30; then
        echo 'OmniAskAI did not become healthy within 30 seconds.' >&2
        exit 1
    fi
    sleep 1
done
