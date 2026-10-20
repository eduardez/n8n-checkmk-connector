#!/usr/bin/env bash
# labels.sh — create the five state labels on the target repo (idempotent, announced).
# Thin wrapper over BT-02 (bullet_ensure_labels): same notice-then-create path ticks use.
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "$BULLET_HOME/lib/config.sh"
. "$BULLET_HOME/lib/forge.sh"
. "$BULLET_HOME/lib/state.sh"

bullet_load_config "${1:?usage: labels.sh <target-repo-dir>}"
bullet_ensure_labels
echo "labels: all five state labels present on $BULLET_REPO"
