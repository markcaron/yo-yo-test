---
description: Git workflow rules for yo-yo-test — enforces worktrees and PRs for all changes.
globs: ["**/*"]
---

# Git Workflow — MANDATORY

## NEVER push directly to `main`

All changes MUST go through a pull request. No exceptions.

## Workflow for every change:

1. Create a worktree:
   ```bash
   git worktree add ../yo-yo-test-feat-<name> -b feat/<name> origin/main
   ```

2. Make changes in the worktree directory.

3. Commit and push the branch:
   ```bash
   git push -u origin HEAD
   ```

4. Create a PR:
   ```bash
   gh pr create --title "..." --body "..."
   ```

5. Return the PR URL to the user.

## NEVER run `git push` on `main`. NEVER commit to `main`. ALWAYS use a feature branch via worktree.
