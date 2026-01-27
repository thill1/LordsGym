# Browser Preference Configuration

This project is configured to **always use Google Chrome** (system default browser) for browser automation tasks.

## Configuration

### Cursor Settings
Updated in: `%APPDATA%\Cursor\User\settings.json`

```json
{
  "cursor.browser.useExternalBrowser": true,
  "cursor.browser.preferredBrowser": "chrome"
}
```

### Project Rules
See `.cursorrules` file in project root for browser automation guidelines.

## Why Chrome?

- Chrome has the user's authenticated sessions (Supabase, etc.)
- Chrome DevTools provides reliable browser automation
- System default browser ensures consistency
- Avoids authentication issues with Cursor's built-in browser

## MCP Server Usage

**Always use**: `user-chrome-devtools` MCP server
**Never use**: `cursor-ide-browser` or `cursor-browser-extension`

## Verification

To verify Chrome is being used:
1. Check that browser automation uses `user-chrome-devtools` server
2. URLs should open in your default Chrome browser
3. Authenticated sessions should work correctly
