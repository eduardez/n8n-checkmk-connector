#!/usr/bin/env bash
# config.sh — bullet.yaml loader. Two-level YAML, no dependencies.
# Exports: FORGE FORGE_URL BULLET_REPO TRUNK SHIP AGENTS SPLIT_* CODER_MODEL REVIEWER_MODEL FIXER_MODEL
#          GATES[] BUDGET_MIN STALL_MIN KILL_MIN MERGE_MODE RUN_ROOT OMP_BIN SETUP[] TARGET
# shellcheck shell=bash

BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

die() { echo "bullet: $*" >&2; exit 1; }

# cfg KEY [FILE] — flat key ("forge") or two-level ("branches.trunk")
cfg() {
  local key=$1 file=${2:-${BULLET_CFG_FILE:-}}
  [[ -n $file && -f $file ]] || die "no config file"
  local sec="" k
  if [[ $key == *.* ]]; then sec=${key%%.*}; k=${key#*.}; else k=$key; fi
  awk -v sec="$sec" -v k="$k" '
    /^[[:space:]]*#/ || /^[[:space:]]*$/ { next }
    sec == "" {
      line=$0; sub(/#.*/,"",line)
      if (line ~ "^"k"[[:space:]]*:") { sub("^"k"[[:space:]]*:[[:space:]]*","",line); gsub(/^["'\'' ]+|["'\'' ]+$/,"",line); print line; exit }
      next
    }
    {
      line=$0; sub(/#.*/,"",line)
      if (line ~ /^[^[:space:]#].*:/) { cur=line; sub(/:.*/,"",cur); gsub(/[[:space:]]/,"",cur) }
      if (cur == sec && line ~ "^[[:space:]]+"k"[[:space:]]*:") { sub("^[[:space:]]*"k"[[:space:]]*:[[:space:]]*","",line); gsub(/^["'\'' ]+|["'\'' ]+$/,"",line); print line; exit }
    }
  ' "$file"
}

# cfg_list KEY [FILE] — YAML list under KEY (lines "  - value")
cfg_list() {
  local key=$1 file=${2:-${BULLET_CFG_FILE:-}} on=0
  [[ -n $file && -f $file ]] || return 0
  while IFS= read -r line; do
    case $line in
      "#"*) continue ;;
      "$key:"*) on=1; continue ;;
      [a-zA-Z]*) on=0 ;;
    esac
    if [[ $on == 1 ]]; then
      v=${line#* - }; v=${v%%#*}
      [[ -n ${v// /} ]] && printf '%s\n' "$v"
    fi
  done < "$file"
}

bullet_load_config() { # $1 = target repo dir (contains .bullet/bullet.yaml)
  TARGET=$(cd "$1" && pwd)

  # config: <repo>/.bullet/bullet.yaml (canonical); legacy flat <repo>/bullet.yaml still read
  BULLET_CFG_FILE=$TARGET/.bullet/bullet.yaml
  [[ -f $BULLET_CFG_FILE ]] || BULLET_CFG_FILE=$TARGET/bullet.yaml
  [[ -f $BULLET_CFG_FILE ]] || die "no .bullet/bullet.yaml in $TARGET (run: bullet init $TARGET)"

  FORGE=$(cfg forge); [[ $FORGE =~ ^(forgejo|github)$ ]] || die "forge must be forgejo|github"
  FORGE_URL=$(cfg url); BULLET_REPO=$(cfg repo)
  [[ -n $FORGE_URL && -n $BULLET_REPO ]] || die "url and repo required in bullet.yaml"
  case $FORGE in
    forgejo) FORGE_API="${FORGE_URL%/}/api/v1" ;;
    github)  [[ $FORGE_URL == *api.github.com* ]] || die "github url must be https://api.github.com"
             FORGE_API="${FORGE_URL%/}" ;;
  esac

  TRUNK=$(cfg branches.trunk);   TRUNK=${TRUNK:-main}
  SHIP=$(cfg branches.ship);     SHIP=${SHIP:-main}

  AGENTS=$(cfg agents);          AGENTS=${AGENTS:-10}
  (( AGENTS >= 1 && AGENTS <= 10 )) || die "agents must be 1..10 (got $AGENTS)"
  local c r f
  c=$(cfg split.coder); r=$(cfg split.reviewer); f=$(cfg split.fixer)
  if [[ -z $c$r$f ]]; then
    c=$(( (AGENTS * 7 + 9) / 10 )); r=$(( (AGENTS * 2 + 9) / 10 )); f=$(( AGENTS - c - r ))
    (( f < 1 )) && { f=1; (( c > 1 )) && c=$(( c - 1 )); }
  fi
  CODER_SLOTS=${c:-1}; REVIEWER_SLOTS=${r:-0}; FIXER_SLOTS=${f:-0}

  CODER_MODEL=$(cfg models.coder);     CODER_MODEL=${CODER_MODEL:-default}
  REVIEWER_MODEL=$(cfg models.reviewer); REVIEWER_MODEL=${REVIEWER_MODEL:-default}
  FIXER_MODEL=$(cfg models.fixer);     FIXER_MODEL=${FIXER_MODEL:-$CODER_MODEL}

  GATES=(); mapfile -t GATES < <(cfg_list gates "$BULLET_CFG_FILE")
  SETUP=(); mapfile -t SETUP < <(cfg_list setup "$BULLET_CFG_FILE")

  BUDGET_MIN=$(cfg budget_minutes); BUDGET_MIN=${BUDGET_MIN:-45}
  STALL_MIN=$(cfg stall_minutes);   STALL_MIN=${STALL_MIN:-15}
  KILL_MIN=$(cfg kill_minutes);     KILL_MIN=${KILL_MIN:-60}
  MERGE_MODE=$(cfg merge);          MERGE_MODE=${MERGE_MODE:-operator}

  # runtime tree: <repo>/.bullet by default; run_root override relocates worktrees+state
  RUN_ROOT=$(cfg run_root)
  if [[ -n ${RUN_ROOT// /} ]]; then
    RUN_ROOT=${RUN_ROOT/#\~/$HOME}
    RUN_DIR=$RUN_ROOT/${BULLET_REPO//\//-}
  else
    RUN_DIR=$TARGET/.bullet
  fi
  OMP_BIN=$(cfg omp_path);          OMP_BIN=${OMP_BIN/#\~/$HOME}; OMP_BIN=${OMP_BIN:-$(command -v omp || true)}

  mkdir -p "$RUN_DIR/meta" "$RUN_DIR/state" "$RUN_DIR/worktrees" "$RUN_DIR/logs"
}

require_deps() {
  local d
  for d in git tmux curl jq python3; do command -v "$d" >/dev/null || die "missing dependency: $d"; done
}
