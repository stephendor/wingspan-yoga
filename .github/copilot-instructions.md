---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

# Codacy Rules
Configuration for AI behavior when interacting with Codacy's MCP Server

## using any tool that accepts the arguments: `provider`, `organization`, or `repository`
- ALWAYS use:
 - provider: gh
 - organization: stephendor
 - repository: wingspan-yoga
- Avoid calling `git remote -v` unless really necessary

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
 - Adding dependencies to any other package manager operations
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
- All prices should be in pounds sterling (£).

## Whenever a call to a Codacy tool that uses `repository` or `organization` as a parameter returns a 404 error
- Offer to run the `codacy_setup_repository` tool to add the repository to Codacy
- If the user accepts, run the `codacy_setup_repository` tool
- Do not ever try to run the `codacy_setup_repository` tool on your own
- After setup, immediately retry the action that failed (only retry once)

## Task Management
- When adding subtasks to a main task, always prefer using the `add_subtask` tool over `add_task` or `expand_task` to ensure maximum control and detail for each subtask. This helps minimize bugs.

## Workflow & Release Rules
- After making changes to a webpage, always visually inspect it by starting a development server and reviewing the changes. Get feedback from others on the team to ensure the implementation matches the design.

- **Visual Validation Checklist:** When reviewing webpage changes, check for the following:
  - Hero gradient displays correctly
  - Typography loads properly
  - Layout is responsive and displays correctly
  - Footer appears with all sections and styling
  - Navigation uses correct brand colors
  - Mobile responsiveness works at different breakpoints

- **Feedback Loop Process:** Establish a feedback loop similar to the following:
  1. AI: "Ready for visual review - dev server running at localhost:3000"
  2. Human: Provides visual feedback on what they see
  3. AI: Makes adjustments based on feedback
  4. Repeat: Until design matches specifications

- **Color Palette Troubleshooting:** If the color palette or brand colors are not displaying correctly:
  1. Check the Tailwind configuration file for correct definitions of the custom colors (softpink, softgreen, softblue, softorange, softyellow).
  2. Restart the development server to ensure the new Tailwind configuration is loaded and CSS is regenerated.
  3. Clear the Next.js build cache if necessary.
  4. Ensure custom colors are explicitly used in the components to avoid purging.
  5. Check the browser developer console (F12) for any errors, especially hydration errors or 404 errors for CSS or font files.
  6. If hydration errors occur, ensure that you're using proper UI components instead of raw HTML elements.
  7. Ensure custom border radius utilities are defined in the custom CSS file.
  8. Ensure that gradient classes are explicitly defined in the custom CSS file (e.g., `bg-gradient-to-b.from-softyellow-300.to-softblue-300`).

- **Custom Border Radius Troubleshooting:** If custom border radius utilities are not working correctly:
  1. Ensure custom border radius utilities are defined in the custom CSS file.

- **Gradients not appearing:** If gradients are not appearing on cards or other elements:
  1. Ensure that the gradient classes are explicitly defined in the custom CSS file (e.g., `bg-gradient-to-b.from-softpink-300.to-softblue-300`, `bg-gradient-to-b.from-softyellow-300.to-softblue-300`, `bg-gradient-to-br.from-softorange-300.to-softblue-300`).
  2. Check that the element to which the gradient is applied does not have a conflicting background color. If so, remove the conflicting background.
  3. Apply the gradient to a `div` wrapper around the content instead of the Card component itself.