# Browser Configuration - Chrome Default

This project is configured to **always use Google Chrome** (system default browser) for all browser automation tasks.

## ✅ Configuration Complete

### 1. Cursor User Settings
**Location**: `C:\Users\troyh\AppData\Roaming\Cursor\User\settings.json`

Added settings:
```json
{
  "cursor.browser.useExternalBrowser": true,
  "cursor.browser.preferredBrowser": "chrome"
}
```

### 2. Project Rules
**Location**: `.cursorrules` (project root)

Created rules file that instructs the AI to:
- **ALWAYS use** `user-chrome-devtools` MCP server
- **NEVER use** `cursor-ide-browser` or `cursor-browser-extension`
- Use Chrome DevTools for all browser automation

### 3. Documentation
**Location**: `.cursor/BROWSER_PREFERENCE.md`

Documentation explaining the browser preference and why Chrome is used.

## How It Works

When browser automation is needed:

1. **AI reads `.cursorrules`** → Sees preference for Chrome
2. **Uses `user-chrome-devtools` MCP server** → Connects to your Chrome browser
3. **Opens URLs in Chrome** → Uses your authenticated sessions
4. **Performs automation** → Via Chrome DevTools Protocol

## Benefits

✅ **Authenticated Sessions**: Chrome has your Supabase login, etc.
✅ **System Default**: Uses your default browser
✅ **Reliable**: Chrome DevTools is stable and well-supported
✅ **No Auth Issues**: Avoids Cursor browser authentication problems

## Verification

To verify Chrome is being used:
- Browser automation will use `user-chrome-devtools` server
- URLs open in your Chrome browser (not Cursor's browser)
- Authenticated websites work correctly

## Future Browser Tasks

All browser automation will now:
- Open Chrome automatically
- Use your authenticated sessions
- Work with Supabase dashboard and other authenticated sites

---

**Note**: The Cursor settings (`cursor.browser.*`) are custom settings that may not be recognized by Cursor itself, but the `.cursorrules` file ensures the AI always uses Chrome DevTools for browser automation.
