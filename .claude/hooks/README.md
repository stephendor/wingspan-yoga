# Claude Code Hooks for Task Master Integration

This directory contains Claude Code hooks that provide automated git workflow integration when completing Task Master subtasks.

## Overview

The hook system automatically creates git commits when Task Master subtasks are marked as "done", providing a seamless development workflow with proper version control tracking.

## Hook Files

### `commit-on-subtask-completion.sh`
- **Trigger**: After `mcp__task-master-ai__set_task_status` tool usage
- **Purpose**: Automatically commits changes when a task/subtask is marked as done
- **Behavior**:
  - Detects when a task status is changed to "done"
  - Stages all current changes (`git add .`)
  - Creates a descriptive commit message with task ID
  - Calls the push confirmation script

### `push-confirmation.sh`
- **Purpose**: Provides user-friendly confirmation for pushing commits to remote
- **Behavior**:
  - Shows a summary of the completed task
  - Displays the latest commit information
  - Prompts user for confirmation before pushing to remote
  - Handles the actual `git push` operation if confirmed

## Configuration

The hooks are configured in `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "mcp__task-master-ai__set_task_status",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/commit-on-subtask-completion.sh \"$INPUT\""
          }
        ]
      }
    ]
  }
}
```

## Permissions

The following permissions are required in `settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "mcp__task-master-ai__set_task_status",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)"
    ]
  }
}
```

## Workflow Example

1. Work on a Task Master subtask (e.g., 9.4)
2. Complete the implementation
3. Mark the subtask as done: `mcp__task-master-ai__set_task_status`
4. **Hook automatically triggers:**
   - Commits all changes with descriptive message
   - Shows completion summary
   - Prompts for push confirmation
5. User can choose to push immediately or defer

## Commit Message Format

```
feat: complete task 9.4

🤖 Auto-commit via Claude Code hook
- Task/subtask 9.4 marked as done
- Generated on 2025-08-11 05:30:00 UTC
```

## Benefits

- **Automatic Versioning**: Every subtask completion creates a commit
- **Descriptive History**: Clear commit messages with task references
- **User Control**: Interactive push confirmation prevents unwanted pushes
- **Seamless Integration**: Works transparently with Task Master workflow

## Troubleshooting

If hooks don't trigger:
1. Check file permissions (`chmod +x` on shell scripts)
2. Verify Claude Code settings configuration
3. Ensure git repository is properly initialized
4. Check that Task Master MCP tools are permitted in settings

## Customization

You can modify the commit message format in `commit-on-subtask-completion.sh` or add additional automation steps as needed for your workflow.