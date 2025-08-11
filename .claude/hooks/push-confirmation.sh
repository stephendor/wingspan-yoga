#!/bin/bash

# Interactive script to push commits with user confirmation
# Called after successful task completion commits

set -e

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
if [ -z "$PROJECT_DIR" ]; then
    PROJECT_DIR="$(pwd)"
fi

cd "$PROJECT_DIR"

TASK_ID="$1"

echo ""
echo "════════════════════════════════════════════"
echo "🎉 Task $TASK_ID completed and committed!"
echo "════════════════════════════════════════════"
echo ""
echo "📝 Summary:"
echo "   • Task/subtask marked as done"
echo "   • Changes committed locally"
echo "   • Ready to push to remote repository"
echo ""

# Show the latest commit
echo "📋 Latest commit:"
git log -1 --oneline
echo ""

# Check if we have unpushed commits
UNPUSHED=$(git log @{u}.. --oneline 2>/dev/null | wc -l || echo "0")
if [ "$UNPUSHED" -gt 0 ]; then
    echo "🔄 You have $UNPUSHED unpushed commit(s)"
    echo ""
    
    read -p "🚀 Push to remote repository? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📤 Pushing to remote..."
        git push
        echo "✅ Successfully pushed to remote!"
    else
        echo "ℹ️  Changes committed locally only"
        echo "   Run 'git push' manually when ready"
    fi
else
    echo "ℹ️  No unpushed commits found"
fi

echo ""
echo "════════════════════════════════════════════"