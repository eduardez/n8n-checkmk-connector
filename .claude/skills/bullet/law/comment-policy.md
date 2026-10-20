# Skill: comment-policy

The issue thread is the only channel to a human. Comment on issue **#{{ISSUE}}** at exactly four
moments, then continue. Short bodies only — what you did, the evidence, what is next. No logs, no
diffs — **except the Plan comment, which is the whole plan file** (that is the one long comment).

| Moment | When | Body |
|---|---|---|
| Claim | before first edit | `Claimed — branch \`{{BRANCH}}\`. Doing: <one line>.` |
| Plan | when plan file exists | the whole plan file, verbatim, via `--file` |
| Blocked | first red gate or dead end | exact command + first error line |
| Done | before finishing | `DONE\|PARTIAL\|BLOCKED` + commit hashes + one line per gate |

```bash
curl -s -X POST "$FJ_HOST/api/v1/repos/$FJ_REPO/issues/{{ISSUE}}/comments" \
  -H "Authorization: token $BULLET_TOKEN" -H "Content-type: application/json" \
  -d "$(jq -nc --arg b "BODY" '{body:$b}')"
```
