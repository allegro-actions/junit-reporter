#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# uncomment to use charles proxy or other debugging proxy
# export NODE_TLS_REJECT_UNAUTHORIZED=0
# export https_proxy=http://127.0.0.1:8888

export INPUT_PATH='**/TEST-*.xml'
# export your PAT with repo scope before running
export INPUT_TOKEN=$GITHUB_TOKEN

node "$DIR/../dist/index.js"
