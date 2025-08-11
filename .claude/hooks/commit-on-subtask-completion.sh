#!/bin/bash

# Hook script to commit changes when Task Master subtasks are completed
# This script is triggered after mcp__task-master-ai__set_task_status tool usage

set -e

# Get project directory
PROJECT_DIR="$CLAUDE_PROJECT_DIR"
if [ -z "$PROJECT_DIR" ]; then
    PROJECT_DIR="$(pwd)"
fi

cd "$PROJECT_DIR"

# Parse the tool input to check if this was a completion
TOOL_INPUT="$1"
if echo "$TOOL_INPUT" | grep -q '"status": *"done"'; then
    # Extract task ID from the input
    TASK_ID=$(echo "$TOOL_INPUT" | grep -o '"id": *"[^"]*"' | head -1 | sed 's/"id": *"\([^"]*\)"/\1/')
    
    if [ -n "$TASK_ID" ]; then
        echo "Task/Subtask $TASK_ID marked as done, creating git commit..."
        
        # Check if there are changes to commit
        if ! git diff --quiet || ! git diff --cached --quiet; then
            # Stage all changes
            git add .
            
            # Create commit message
            COMMIT_MSG="feat: complete task $TASK_ID

🤖 Auto-commit via Claude Code hook
- Task/subtask $TASK_ID marked as done
- Generated on $(date -u +"%Y-%m-%d %H:%M:%S UTC")
"
            
            # Create the commit
            git commit -m "$COMMIT_MSG"
            
            echo "✅ Committed changes for task $TASK_ID"
            
            # Call the push confirmation script
            "$PROJECT_DIR/.claude/hooks/push-confirmation.sh" "$TASK_ID"
            
        else
            echo "ℹ️  No changes to commit for task $TASK_ID"
        fi
    fi
fi