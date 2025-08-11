---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

# Codacy Rules
Configuration for AI behavior when interacting with Codacy's MCP Server

## CRITICAL: After ANY successful `edit_file` or `reapply` operation
- YOU MUST IMMEDIATELY run the `codacy_cli_analyze` tool from Codacy's MCP Server for each file that was edited, with:
 - `rootPath`: set to the workspace path
 - `file`: set to the path of the edited file
 - `tool`: leave empty or unset
- If any issues are found in the new edits, propose and apply fixes for them.
- > NOTE: Failure to follow this rule is considered a critical error.

## After every response
- If you made any file edits in this conversation, verify you ran `codacy_cli_analyze` tool from Codacy's MCP Server 

## When there are no Codacy MCP Server tools available, or the MCP Server is not reachable
- Suggest the user the following troubleshooting steps:
 - Try to reset the MCP on the extension
 - If the user is using VSCode, suggest them to review their Copilot > MCP settings in Github, under their organization or personal account. Refer them to Settings > Copilot > Enable MCP servers in Copilot. Suggested URL (https://github.com/settings/copilot/features) or https://github.com/organizations/{organization-name}/settings/copilot/features (This can only be done by their organization admins / owners)
- If none of the above steps work, suggest the user to contact Codacy support

## Trying to call a tool that needs a rootPath as a parameter
- Always use the standard, non-URL-encoded file system path

## CRITICAL: Dependencies and Security Checks
- IMMEDIATELY after ANY of these actions:
 - Running npm/yarn/pnpm install
 - Adding dependencies to package.json
 - Adding requirements to requirements.txt
 - Adding dependencies to pom.xml
 - Adding dependencies to build.gradle
 - Any other package manager operations
- You MUST run the `codacy_cli_analyze` tool with:
 - `rootPath`: set to the workspace path
 - `tool`: set to "trivy"
 - `file`: leave empty or unset
- If any vulnerabilities are found because of the newly added packages:
 - Stop all other operations
 - Propose and apply fixes for the security issues
 - Only continue with the original task after security issues are resolved
- EXAMPLE:
 - After: npm install react-markdown
 - Do: Run codacy_cli_analyze with trivy
 - Before: Continuing with any other tasks

## General
- Repeat the relevant steps for each modified file.
- "Propose fixes" means to both suggest and, if possible, automatically apply the fixes.
- You MUST NOT wait for the user to ask for analysis or remind you to run the tool.
- Do not run `codacy_cli_analyze` looking for changes in duplicated code or code complexity metrics.
- Do not run `codacy_cli_analyze` looking for changes in code coverage.
- Do not try to manually install Codacy CLI using either brew, npm, npx, or any other package manager.
- If the Codacy CLI is not installed, just run the `codacy_cli_analyze` tool from Codacy's MCP Server.
- When calling `codacy_cli_analyze`, only send provider, organization and repository if the project is a git repository.
- ENFORCED STYLE: Always default to block-by-block executable code blocks with explicit user-controlled flow (continue/cancel) and you (the AI) initiating and monitoring terminal/tool execution. Do NOT batch multiple conceptual blocks unless the user explicitly requests "all" or provides an override. Provide exactly one actionable block, await user confirmation, then proceed. If the user asks to change style, only then adapt for that exchange; do not persist a style change without an explicit permanent instruction to update this file again.

## Whenever a call to a Codacy tool that uses `repository` or `organization` as a parameter returns a 404 error
- Offer to run the `codacy_setup_repository` tool to add the repository to Codacy
- If the user accepts, run the `codacy_setup_repository` tool
- Do not ever try to run the `codacy_setup_repository` tool on your own
- After setup, immediately retry the action that failed (only retry once)

## Task Management
- Check for task completion documents.
- Check with the "task-master-ai" MCP server for any tasks that may have been marked as done.
- If there is a record of a task completion, use "task-master" and follow that protocol to mark the task as done.
- When asked for the next task, consider dependencies and priorities, and suggest a single best next task, noting viable alternates and rationale.
- When implementing a task, generate a task completion document and mark things done where they should be.
- Once instructed to implement a task, proceed without asking for confirmation until the task is fully implemented, including tests and task completion documents, and all related items are marked done. Do not ask for confirmation until the task is fully implemented.
- When instructed to implement a task, proceed and do not ask again until you have implemented all of the task.
- When marking a task as done with "task-master", if the task ID is not explicitly provided, and Taskmaster shows "No tasks found," offer to create and immediately close a retroactive task, or prompt the user for the correct task ID.
- When implementing a task, if instructed to implement the remainder of the task, proceed without asking again until you have implemented all of the task.
- When asked to check the current status of a task, retrieve the task details, status, priority, description, and dependencies, as well as the status of any subtasks. Present this information clearly and concisely to the user.
- When implementing a task that has subtasks, implement each pending subtask in order, logging progress and marking each as done before proceeding to the next.
- When asked for the next task, first check the available Taskmaster tools. Then check for the next available task using the Taskmaster MCP.
- When implementing task 12.4 ("Implement 'Create Class' Form and Modal"), remember that the intended output should be a modern, highly polished dashboard that is easy to read and modify. Classes can be online or in person, and can be workshops or retreats. When implementing this task, ensure recurring classes and individual class exceptions are supported, with prices displayed in £ (GBP). The intended database schema should support a Class Template + Class Instance pattern with ClassException records.

## Debugging
- If a user encounters an error related to Next.js DevTools or React Dev overlay, and the application UI loads and functions correctly, the error can be ignored. If the UI does not load, investigate other errors in the terminal or browser console.
- If a user encounters an error related to Next.js DevTools or React Dev overlay, suggest these troubleshooting steps:
  - Try disabling or uninstalling the Next.js DevTools browser extension.
  - Restart the development server (`npm run dev`).
  - Clear the browser cache or use a different browser.
- If the requested export doesn't exist, this often indicates a module resolution issue, potentially due to incorrect import paths, misconfigured TypeScript, or a build cache issue. Consider the following troubleshooting steps:
  - Restart the development server (`npm run dev`) after stopping it completely.
  - Delete `.next` and `.cache` folders, then restart the server.
  - Ensure import paths are correct and match the actual file names (case-sensitive).
- When working with Next.js app directory, if you encounter "React Hook" errors such as `useState` in server components:
  - Add `"use client"` as the very first line in the file.
- If you encounter import errors such as "export useForm doesn't exist in target module":
  - Ensure you are importing from the correct entry point, e.g.,`'react-hook-form'` and not `'react-hook-form/dist/react-server.esm.mjs'`. Also, ensure the component is a client component if using hooks.
- When fixing errors, ensure that any directives, such as `"use client"`, are at the very top of the file, before any imports.
- After applying fixes, always check for and remove duplicate imports.
- If you encounter an error where the `"use client"` directive is not at the very top of the file:
  - Ensure that the `"use client"` directive is the very first line of the file, before any imports or code.
- If you encounter the error `Error: Event handlers cannot be passed to Client Component props.`, it means a server component is passing an event handler (a function prop) to a client component. To fix:
  - The parent component (likely `page.tsx`) must be a client component if it passes event handlers to children by adding `"use client"` to the top of the file.
  - Or, move the event handler logic into the client component itself.