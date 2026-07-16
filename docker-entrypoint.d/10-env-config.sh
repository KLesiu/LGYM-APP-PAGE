#!/bin/sh
set -eu

: "${VITE_API_BASE_URL:=https://localhost:7025}"
: "${VITE_GOOGLE_CLIENT_ID:=}"

if ! printf '%s' "${VITE_API_BASE_URL}" | grep -Eq '^https?://'; then
  echo 'VITE_API_BASE_URL must start with http:// or https://.' >&2
  exit 1
fi

if printf '%s' "${VITE_API_BASE_URL}" | grep -Eq '[[:space:]"\\<>]'; then
  echo 'VITE_API_BASE_URL contains characters that are unsafe for env-config.js.' >&2
  exit 1
fi

if printf '%s' "${VITE_GOOGLE_CLIENT_ID}" | grep -Eq '[^A-Za-z0-9._-]'; then
  echo 'VITE_GOOGLE_CLIENT_ID contains invalid characters.' >&2
  exit 1
fi

export VITE_API_BASE_URL VITE_GOOGLE_CLIENT_ID

envsubst '${VITE_API_BASE_URL} ${VITE_GOOGLE_CLIENT_ID}' \
  < /usr/share/nginx/html/env-config.js.template \
  > /usr/share/nginx/html/env-config.js
