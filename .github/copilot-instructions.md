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

## Debugging Authentication and Redirects

- **When debugging authentication issues, always verify the `NEXTAUTH_URL` environment variable matches the actual port the development server is running on.** A mismatch will cause session and cookie issues.
- **When debugging authentication issues, always validate the `authorize` function is validating user credentials correctly and not bypassing authentication.**
- When encountering redirect loops after sign-in (returning to the sign-in page repeatedly):
    - Check browser cookies for `next-auth.session-token` to ensure the session is being established.
    - Verify the `NEXTAUTH_SECRET` in your `.env` file matches the configuration.
    - Use `secure: false` for cookies in development and `sameSite: 'lax'`, `path: '/'`.

## OAuth Provider Setup

When integrating social OAuth providers (Google, Facebook, Twitter/X, and Instagram), the following steps are crucial:

1.  **Set up OAuth Applications** in each provider's developer console:
    *   **Google Cloud Console**: Create OAuth 2.0 client credentials
    *   **Facebook Developers**: Create a Facebook app with sign-in
    *   **Twitter Developer Portal**: Create Twitter app with OAuth 2.0
    *   **Instagram Basic Display**: Set up Instagram app for Basic Display API
2.  **Configure Redirect URIs** in each OAuth app:
    *   Development: `http://localhost:3001/api/auth/callback/[provider]`
    *   Production: `https://yourdomain.com/api/auth/callback/[provider]`
3.  **Update Environment Variables** with real credentials:
    ```bash
    # Replace placeholder values with actual OAuth credentials
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    # ... etc for other providers
    ```

### Detailed OAuth Setup Guides:

#### Google OAuth Setup

1.  **Go to Google Cloud Console**: <https://console.cloud.google.com/>
2.  **Create or select a project**:
    *   Click "Select a project" → "New Project"
    *   Name it something like "Wingspan Yoga"
3.  **Enable Google+ API**:
    *   Go to "APIs & Services" → "Library"
    *   Search for "Google+ API" and enable it
4.  **Create OAuth credentials**:
    *   Go to "APIs & Services" → "Credentials"
    *   Click "Create Credentials" → "OAuth 2.0 Client IDs"
    *   Application type: "Web application"
    *   Name: "Wingspan Yoga Web App"
    *   Authorized redirect URIs:
        ```
        http://localhost:3001/api/auth/callback/google
        https://yourdomain.com/api/auth/callback/google
        ```
5.  **Copy the credentials** and add to your `.env`:
    ```bash
    GOOGLE_CLIENT_ID=your_google_client_id_here
    GOOGLE_CLIENT_SECRET=your_google_client_secret_here
    ```

#### Facebook OAuth Setup

1.  **Go to Facebook Developers**: <https://developers.facebook.com/>
2.  **Create an App**:
    *   Click "Create App"
    *   Choose "Consumer" (for login)
    *   App name: "Wingspan Yoga"
3.  **Add Facebook Login**:
    *   In your app dashboard, click "Add Product"
    *   Find "Facebook Login" and click "Set Up"
4.  **Configure OAuth settings**:
    *   Go to Facebook Login → Settings
    *   Valid OAuth Redirect URIs:
        ```
        http://localhost:3001/api/auth/callback/facebook
        https://yourdomain.com/api/auth/callback/facebook
        ```
5.  **Get your credentials**:
    *   Go to Settings → Basic
    *   Copy App ID and App Secret to your `.env`:
        ```bash
        FACEBOOK_CLIENT_ID=your_facebook_app_id_here
        FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
        ```

#### Twitter/X OAuth Setup

1.  **Go to Twitter Developer Portal**: <https://developer.twitter.com/>
2.  **Apply for developer access** (if you don't have it):
    *   Fill out the application form
    *   Explain you're building a yoga studio website with social login
3.  **Create a new App**:
    *   Go to your developer dashboard
    *   Click "Create App"
    *   Name: "Wingspan Yoga"
4.  **Configure OAuth settings**:
    *   Go to your app → Settings → Authentication settings
    *   Enable "3-legged OAuth"
    *   Callback URLs:
        ```
        http://localhost:3001/api/auth/callback/twitter
        https://yourdomain.com/api/auth/callback/twitter
        ```
5.  **Get your credentials**:
    *   Go to Keys and Tokens tab
    *   Copy API Key and API Secret Key:
        ```bash
        TWITTER_CLIENT_ID=your_twitter_api_key_here
        TWITTER_CLIENT_SECRET=your_twitter_api_secret_here
        ```

#### Instagram OAuth Setup

1.  **Go to Facebook Developers** (Instagram uses Facebook's system): <https://developers.facebook.com/>
2.  **Use the same app** you created for Facebook, or create a new one
3.  **Add Instagram Basic Display**:
    *   In your app dashboard, click "Add Product"
    *   Find "Instagram Basic Display" and click "Set Up"
4.  **Create an Instagram App**:
    *   Go to Instagram Basic Display → Basic Display
    *   Click "Create New App"
    *   Display Name: "Wingspan Yoga"
5.  **Configure OAuth settings**:
    *   Valid OAuth Redirect URIs:
        ```
        http://localhost:3001/api/auth/callback/instagram
        https://yourdomain.com/api/auth/callback/instagram
        ```
6.  **Get your credentials**:
    *   Copy Instagram App ID and Instagram App Secret:
        ```bash
        INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
        INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret_here
        ```