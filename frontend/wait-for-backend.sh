#!/bin/sh
set -e

host="$1"
port="$2"
shift 2

until nc -z "$host" "$port"; do
  >&2 echo "Backend is unavailable at $host:$port - sleeping"
  sleep 1
done

>&2 echo "Backend is up - starting frontend"
exec "$@"