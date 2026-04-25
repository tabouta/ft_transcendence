#!/bin/bash

set -euo pipefail

bun db:push
bun db:setup

exec "$@"
