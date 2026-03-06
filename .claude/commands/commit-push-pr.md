# Git Workflow - Commit, Push, and Create PR

## Steps

1. Stage all changes: `git add -A`
2. Create descriptive commit message following conventional commits:
   - feat: new feature
   - fix: bug fix
   - refactor: code change that neither fixes nor adds
   - docs: documentation only
   - test: adding/updating tests
   - chore: maintenance
3. Push to current branch
4. If on feature branch, create PR with `gh pr create`

## Command
```bash
git add -A && git commit -m "[type]: [description]" && git push && gh pr create --fill || echo "PR already exists or on main"
```

## Example
```bash
git add -A && git commit -m "feat: add expense categorization" && git push && gh pr create --fill
```
