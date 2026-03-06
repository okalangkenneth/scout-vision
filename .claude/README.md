# Claude Code Template with Hybrid Memory

**v4.0** — Combines native auto-memory + claude-mem for complete context persistence.

## 🧠 Memory Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    THREE-LAYER MEMORY STACK                     │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: CLAUDE.md (You Write)                                 │
│  └─► Rules, workflow, conventions                               │
│  └─► Always loaded into context                                 │
│                                                                 │
│  Layer 2: Native Auto-Memory (Claude Writes)                    │
│  └─► MEMORY.md + topic files                                    │
│  └─► Patterns, decisions, bug fixes                             │
│  └─► First 200 lines auto-loaded                                │
│                                                                 │
│  Layer 3: claude-mem Plugin (Deep History)                      │
│  └─► AI-compressed observations                                 │
│  └─► Searchable across all sessions                             │
│  └─► Progressive disclosure via MCP                             │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Step 1: Install claude-mem (One-Time)

```bash
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
# Restart Claude Code
```

### Step 2: Create New Project

```bash
# Windows
cd E:\Projects
mkdir my-app && cd my-app
copy ..\CLAUDE-v4.md CLAUDE.md
xcopy /E ..\.claude-template .claude\
git init

# Mac/Linux
cd ~/Projects
mkdir my-app && cd my-app
cp ../CLAUDE-v4.md CLAUDE.md
cp -r ../.claude-template/. .claude/
git init
```

### Step 3: Start Claude Code

```bash
claude
# Watch for: "Recalled X memories" — that's auto-memory working!
```

## 📁 What Goes Where

| Type | Location | Who Manages |
|------|----------|-------------|
| Project rules | `CLAUDE.md` (project root) | You |
| Private notes | `CLAUDE.local.md` (auto-gitignored) | You |
| Session learnings | `~/.claude/projects/<project>/memory/MEMORY.md` | Claude |
| Topic deep-dives | `~/.claude/projects/<project>/memory/*.md` | Claude |
| Compressed history | `~/.claude-mem/claude-mem.db` | claude-mem plugin |

## ⌨️ Commands

| Command | Purpose |
|---------|---------|
| `/memory` | View/edit memory files, toggle auto-memory |
| `/remember` | Suggest patterns for permanent storage |
| `/compact` | Instant compaction (Session Memory) |
| `/verify` | Run typecheck, tests, format |
| `/commit-push-pr` | Git workflow |
| `Ctrl+O` | Expand memory details |
