#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
W="$(pwd)"

LIFECYCLE_REMOVE="needs-grooming,needs-triage,needs-info,ready-for-agent,ready-for-human,wontfix,suite-gap"

set_labels() {
  local num="$1" add="$2" extra_remove="${3:-}"
  local remove="$LIFECYCLE_REMOVE"
  [[ -n "$extra_remove" ]] && remove="$remove,$extra_remove"
  gh issue edit "$num" --add-label "$add" --remove-label "$remove" || gh issue edit "$num" --add-label "$add"
}

echo "Triage: lord-of-the-rinse ($(date -u +%Y-%m-%dT%H:%M:%SZ))"

# TanStack Query — needs-info
for n in 28 29 30; do
  set_labels "$n" "needs-info,tech-debt,audit-suite"
  gh issue comment "$n" --body-file "$W/comment-needs-info-tanstack.md"
done

# Tabler
set_labels 32 "needs-triage,tech-debt,audit-suite,tracking"
gh issue edit 32 --body-file "$W/body-32.md"
gh issue comment 32 --body-file "$W/comment-triage-32.md"

set_labels 35 "ready-for-agent,tech-debt,audit-suite" "blocked"
gh issue edit 35 --body-file "$W/body-35.md"
gh issue comment 35 --body-file "$W/comment-brief-35.md"

# shadcn
set_labels 36 "needs-triage,tech-debt,audit-suite,tracking"
gh issue comment 36 --body-file "$W/comment-triage-36.md"

set_labels 39 "needs-triage,tech-debt,audit-suite,blocked"
gh issue edit 39 --body-file "$W/body-39.md"
gh issue comment 39 --body-file "$W/comment-triage-39.md"

# Shell
set_labels 40 "needs-triage,tech-debt,audit-suite,tracking"
gh issue comment 40 --body-file "$W/comment-triage-40.md"

set_labels 42 "ready-for-agent,tech-debt,audit-suite" "blocked"
gh issue edit 42 --body-file "$W/body-42.md"
gh issue comment 42 --body-file "$W/comment-brief-42.md"

set_labels 43 "needs-triage,tech-debt,audit-suite,blocked"
gh issue edit 43 --body-file "$W/body-43.md"
gh issue comment 43 --body-file "$W/comment-triage-43.md"

# cmdk paused
set_labels 44 "needs-grooming,hitl,tech-debt,audit-suite,tracking"
gh issue edit 44 --body-file "$W/body-44.md"
gh issue comment 44 --body-file "$W/comment-groom-44.md"
for n in 45 46 47; do
  set_labels "$n" "needs-grooming,hitl,tech-debt,audit-suite,blocked"
  gh issue edit "$n" --body-file "$W/body-cmdk-child.md"
  gh issue comment "$n" --body-file "$W/comment-groom-cmdk.md"
done

# Monorepo
set_labels 52 "needs-info,tech-debt,audit-suite,tracking"
gh issue comment 52 --body-file "$W/comment-needs-info-52.md"

set_labels 54 "needs-info,tech-debt,audit-suite"
gh issue edit 54 --body-file "$W/body-54.md"
gh issue comment 54 --body-file "$W/comment-needs-info-52.md"

# PRD
set_labels 56 "needs-triage,enhancement,tracking,blocked"
gh issue edit 56 --body-file "$W/body-56.md"
gh issue comment 56 --body-file "$W/comment-triage-56.md"

set_labels 59 "needs-grooming,hitl,enhancement,blocked"
gh issue edit 59 --body-file "$W/body-59.md"
gh issue comment 59 --body-file "$W/comment-triage-prd-child.md"

for n in 60 61 62 63 64 65 66 67 68 69 70 71 73; do
  set_labels "$n" "needs-triage,enhancement,blocked"
  gh issue edit "$n" --body-file "$W/body-$n.md"
  gh issue comment "$n" --body-file "$W/comment-triage-prd-child.md"
done

echo "Triage complete."
