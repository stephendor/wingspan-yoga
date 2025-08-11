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

## Whenever a call to a Codacy tool that uses `repository` or `organization` as a parameter returns a 404 error
- Offer to run the `codacy_setup_repository` tool to add the repository to Codacy
- If the user accepts, run the `codacy_setup_repository` tool
- Do not ever try to run the `codacy_setup_repository` tool on your own
- After setup, immediately retry the action that failed (only retry once)

## Debugging NextAuth issues
- If you are having issues with NextAuth authentication flow, and the `authorize` function is not being called, it is likely due to cached NextAuth cookies pointing to an incorrect port.
- Always ensure that the `NEXTAUTH_URL` environment variable is correctly set to the port where the dev server is running.
- Clear the NextAuth cookies in the browser, or use an incognito/private window to avoid cached values. The cookies to clear include `next-auth.callback-url`, `next-auth.session-token`, and `next-auth.csrf-token`.

## Admin Authentication Troubleshooting
- If you encounter an `access_denied` error after successful sign-in, ensure the middleware is correctly configured to handle the `membershipType` from the JWT token. Check for case sensitivity issues (e.g., middleware expecting `'ADMIN'` while the token contains `'admin'`). The middleware MUST use a case-insensitive check, or the JWT token should be set to uppercase. The middleware MUST use a case-insensitive check.
- If the NextAuth `authorize` function is not being called, verify that the `NEXTAUTH_URL` environment variable is correctly set and matches the port where the development server is running. A mismatch between `NEXTAUTH_URL` and the actual server port can lead to silent authentication failures.
- After changing `NEXTAUTH_URL`, clear browser cookies related to NextAuth including `next-auth.callback-url`, `next-auth.session-token`, and `next-auth.csrf-token`. Use an incognito/private window to avoid cached values.
- If experiencing redirect loops or authentication failures, carefully review the NextAuth configuration, particularly the credentials provider setup, and ensure that all required environment variables are defined (e.g., `NEXTAUTH_SECRET`).
- If you are getting a 404 error after successful authentication, check the `SignInForm` component in the front-end to ensure that it is redirecting to the correct route after sign-in. This component MUST respect the `callbackUrl` parameter that NextAuth automatically includes.
- If the dev server is serving a primitive admin interface instead of the sophisticated TailwindCSS styled interface, ensure that your Next.js project is serving from the correct `app` directory and that the import paths are correct.
- **Middleware JWT Token Membership Type Check**: When implementing admin route protection, the middleware MUST use a case-insensitive check for `membershipType` from the JWT token. This avoids issues where the token contains `'admin'` while the middleware expects `'admin'`.

## Taskmaster Specifics
- When the user says "Get task", "taskmaster get task", or "taskmaster-ai get task", interpret this as a request to assist with their project.

## Future Enhancements

These are polish items to make the admin interface more user-friendly:

### 1. Authentication UX Improvements
- On sign-in page load, pull the cursor into the email field.
- Add a password visibility toggle (show/hide password).
- Replace GitHub OAuth with Facebook, Twitter, and Instagram OAuth options (keep Google).

### 2. Calendar Interaction Enhancements
- When clicking cancelled classes in the calendar view: Replace "Keep/Cancel" dialog with "Restore Class" and "Go Back" options.

### 3. Data Sorting
- Sort upcoming instances by date/time in chronological order in the upcoming instances view.

### 4. Multi-Day Event Support
- For Workshops and Retreats in the create recurring class dialog:
  - Allow adding multiple calendar dates.
  - Automatically set as non-recurring. Support multi-day events that don't repeat (common for workshops/retreats).