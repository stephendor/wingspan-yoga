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
- Whenever we make a webpage, always check visually and provide feedback to each other. When one is ready to be shown we should start a dev server and take a look
- Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
- When using custom colors with Tailwind gradients, you sometimes need to explicitly define the gradient combinations in CSS to ensure they're not purged or missed during compilation.
- Whenever the AI is tasked to perform a web design task, it MUST refer to the Website Design Brief and Figma Mockup for guidance.
- Always update taskmaster whenever you in progress or complete a subtask
- When tasked with implementing website changes, the primary focus should be on Task 24 as outlined in the Website Design Brief, irrespective of other system suggestions.
- Whenever the AI is tasked to locate a "next task", it MUST look to the Website Design Brief and Figma Mockup for guidance and continue with the highest priority task there, regardless of other system suggestions.

## Whenever a call to a Codacy tool that uses `repository` or `organization` as a parameter returns a 404 error
- Offer to run the `codacy_setup_repository` tool to add the repository to Codacy
- If the user accepts, run the `codacy_setup_repository` tool
- Do not ever try to run the `codacy_setup_repository` tool on your own
- After setup, immediately retry the action that failed (only retry once)

## Website Design and Development
- When performing website design tasks, prioritize the Website Design Brief and Figma Mockup.
- Use `add_subtask` to add detailed subtasks under existing tasks rather than creating separate top-level tasks.
- Whenever implementing web design changes, remember to check visually and provide feedback to each other. Start a dev server and take a look.
- When using custom colors with Tailwind gradients, you sometimes need to explicitly define the gradient combinations in CSS to ensure they're not purged or missed during compilation.
- Use nature, sky, open and spacious images whenever appropriate and indicated in the design brief

## Tailwind CSS
- When encountering issues with custom Tailwind colors not working, try the following:
    - Restart the development server to ensure the new Tailwind config is loaded.
    - Clear the Next.js build cache.
    - Ensure custom colors are properly defined in `tailwind.config.ts`.
    - Explicitly define gradient combinations in CSS (e.g., `bg-gradient-to-b from-softyellow-300 to-softblue-300`).
    - If using Turbopack, custom colors might need to be explicitly whitelisted.
- Custom border radius utilities should be defined in the `borderRadius` section of `tailwind.config.ts`.

## Next.js
- When encountering hydration errors, check for server/client rendering differences. Common causes include:
    - Using `Date.now()` or `Math.random()`.
    - Date formatting inconsistencies.
    - Incorrect HTML tag nesting.
    - Browser extensions interfering with HTML.
- Use a stable ID system for SSR compatibility when using `React.useId()`. A custom hook can be used to handle SSR/client differences.
- Configure `next.config.js` to allow external images from specified hostnames.

## Images