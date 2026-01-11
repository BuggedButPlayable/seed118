#!/usr/bin/env bash
set -euo pipefail

npm install
npm run build

set -a
source .env
set +a

lftp -e "set sftp:auto-confirm yes; open -u $SFTP_USERNAME,$SFTP_PASSWORD sftp://$SFTP_HOST:$SFTP_PORT; mirror -R --delete dist /seed118/.; bye"
