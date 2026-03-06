# Fix GitHub Issue

Automatically fix a GitHub issue by reading it, implementing the fix, and creating a PR.

## Usage
```
/fix-issue 123
```

## Steps

1. Fetch issue details: `gh issue view $ISSUE_NUMBER --json title,body,labels`
2. Analyze the issue requirements
3. Create a feature branch: `git checkout -b fix/issue-$ISSUE_NUMBER`
4. Implement the fix
5. Run verification: `/verify`
6. Commit and push: `/commit-push-pr`
7. Link PR to issue

## Command Template
```bash
# Fetch issue
gh issue view $ISSUE_NUMBER --json title,body,labels,comments

# Create branch
git checkout -b fix/issue-$ISSUE_NUMBER

# After implementing fix
git add -A
git commit -m "fix: resolve issue #$ISSUE_NUMBER"
git push -u origin fix/issue-$ISSUE_NUMBER
gh pr create --title "Fix #$ISSUE_NUMBER" --body "Closes #$ISSUE_NUMBER"
```

## Important
- Always run `/verify` before creating PR
- Reference the issue number in commit message
- Add tests for the fix if applicable
