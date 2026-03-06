# Memory Status Check

Check claude-mem worker status and memory statistics.

## Steps

1. Check if worker is running
2. Show memory statistics for current project
3. Display recent observations

## Commands

### Check Worker Status
```bash
curl -s http://localhost:37777/api/health | jq .
```

### Get Memory Stats
```bash
curl -s http://localhost:37777/api/stats | jq .
```

### View Recent Observations
Open in browser: http://localhost:37777

## Troubleshooting

If worker not running:
```bash
cd ~/.claude/plugins/marketplaces/thedotmack && bun run worker:start
```

If memory seems stale, restart worker:
```bash
cd ~/.claude/plugins/marketplaces/thedotmack && bun run worker:restart
```
