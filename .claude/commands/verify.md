# Verification Workflow

Run all quality checks before committing.

## Steps

1. TypeScript type checking
2. Run test suite
3. Format code
4. Report any failures

## Command
```bash
bun run typecheck && bun run test && bun run format
```

## On Failure
- Fix errors before proceeding
- Do NOT commit code that fails verification
- Ask for help if stuck

## Success Criteria
- All types pass
- All tests pass
- No formatting changes needed
