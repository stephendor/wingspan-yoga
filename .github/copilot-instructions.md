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

## Improving Prompt Phrasing for Code Reviews
When requesting code reviews, use prompts that:
- Provide clear structure and priorities
- Specify the desired output format
- Set concrete expectations for level of detail
- Guide focus toward the most valuable insights
- Request practical, actionable recommendations
- Include criteria for prioritization

Example of an improved code review prompt:
> "Please conduct a comprehensive code review of my repository, using the Taskmaster task list to structure your analysis. Focus on the following priority areas:
> 
> 1. Security vulnerabilities: Identify critical issues in authentication, payment processing, and API endpoints
> 2. Code quality: Highlight patterns of repetition, unnecessary complexity, and opportunities for refactoring
> 3. Performance optimization: Suggest specific improvements for frontend loading times and backend efficiency
> 4. UI/UX enhancements: Recommend concrete improvements for user flows, particularly in booking and authentication
> 5. Architecture recommendations: Propose any structural changes that would improve maintainability
> 
> For each issue identified, please include:
> - Severity rating (Critical, High, Medium, Low)
> - Specific file locations affected
> - Concrete code examples showing the improvement
> - Brief explanation of why the change is beneficial
> 
> Please prioritize tasks that are marked as 'done' since these represent the most mature code. For pending tasks, focus on architectural recommendations rather than implementation details."

Example of an improved document creation prompt:
> "Please consolidate your analysis into a single markdown document named 'CodeReview.md' with the following structure:
> 
> 1. Executive Summary (3-5 bullet points of critical findings)
> 2. Security Analysis (organized by severity)
> 3. Code Quality Assessment (organized by component)
> 4. Performance Recommendations
> 5. UI/UX Improvement Opportunities
> 6. Architectural Considerations
> 7. Implementation Roadmap (suggestions for which improvements to tackle first)
> 
> Format code snippets with proper syntax highlighting, and include section headings for easy navigation."

## Task Execution and Taskmaster Integration

- When a user asks to "implement the remaining subtasks" after a progress report, ensure the context from the progress report is maintained and that the next actions align with the "next steps" outlined in the report. Specifically, if the progress report indicates that subtask 10.2 should be set to "in-progress" and a subtask should be added for implementing real Mux signed playback (JWT), these actions must be prioritized.