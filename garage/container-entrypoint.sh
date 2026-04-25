#!/bin/bash

set -m
set -euo pipefail

exec "$@" &

sleep 1

if [[ "$(garage layout show | tail -n 1 | awk '{printf $5}')" == "0" ]]; then
  NODE_ID=$(garage status | sed '3q;d' | awk '{printf $1}')
  garage layout assign -z dc1 -c 1G $NODE_ID
  garage layout apply --version 1
fi

if [[ $(garage bucket list | wc -l) -lt 2 ]]; then
  KEY_NAME=www-key
  garage key import $S3_ACCESS_KEY_ID $S3_SECRET_ACCESS_KEY -n $KEY_NAME --yes

  garage bucket create public
  garage bucket allow --read --write --owner public --key $KEY_NAME
  garage bucket website --allow public

  garage bucket create private
  garage bucket allow --read --write --owner private --key $KEY_NAME
  garage bucket website --allow private
fi

cleanup() {
  kill -SIGINT %1
}
trap cleanup SIGTERM SIGINT

wait -n
