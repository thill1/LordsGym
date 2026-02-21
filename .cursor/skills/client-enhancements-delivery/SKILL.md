---
name: client-enhancements-delivery
description: Create client delivery Markdown for significant enhancements. Use when wrapping up a feature release, shipping client-facing changes, or when the user asks for a client enhancements summary, delivery doc, or email draft.
---

# Client Enhancements Delivery

When shipping significant client-facing enhancements, create a delivery Markdown file that can be copied into an email. The flow: **Markdown → copy to email → send to you for review → you forward to client** (never auto-send to client).

## When to Apply

- You finish a feature release or batch of enhancements
- The user asks for a client summary, delivery doc, or email draft
- A deploy completes and the user wants a client-facing changelog

## Required: Create Delivery Markdown

Create `docs/CLIENT_<FEATURE>_DELIVERY.md` (e.g. `docs/CLIENT_CALENDAR_ENHANCEMENTS_DELIVERY.md`).

### Template (include all sections)

```markdown
# [Project/Feature] — Enhancements Summary

**Date:** [Month Year]  
**Status:** ✅ Completed & Tested

## Code Versions Tested & Deployed

| Role | GitHub Commit | Short SHA | Link |
|------|---------------|-----------|------|
| **Source** (before) | [full SHA] | [short SHA] | [View](https://github.com/OWNER/REPO/commit/SHORT_SHA) |
| **Target** (deployed) | [full SHA] | [short SHA] | [View](https://github.com/OWNER/REPO/commit/SHORT_SHA) |

Commits in range: [first] → [last]. [Compare source..target](https://github.com/OWNER/REPO/compare/SOURCE..TARGET)

---

## What Changed
[Feature/fix descriptions in client-friendly language]

## What Was Tested
- ✅ [Test 1]
- ✅ [Test 2]

## Planned Future Upgrades (optional)
[Items under consideration]

## Questions?
If you notice any issues or have feature requests, please reach out.
```

### Critical: Explicit GitHub Commits

Always include:
- **Source** = commit SHA *before* the enhancement (parent of first enhancement commit)
- **Target** = commit SHA that was deployed
- Full SHA and short SHA (7 chars)
- Direct links: `https://github.com/OWNER/REPO/commit/SHORT_SHA` and `.../compare/SOURCE..TARGET`

Get SHAs via: `git rev-parse HEAD` (target) and `git rev-parse FIRST_COMMIT^` (source).

## Email Workflow (manual today)

1. **Create** the Markdown file (this skill).
2. **Copy** contents into your email client.
3. **Send to yourself** (or save as draft) for review.
4. **Review**, edit if needed.
5. **Forward to client** when ready.

Client never receives the email before you review it.

## Future Automation Options

To automate "send to me for review" in the future:

| Option | Effort | Flow |
|--------|--------|------|
| **GitHub Issue** | Low | Action on deploy creates an Issue with the Markdown body → you get a GitHub notification email |
| **Webhook → Zapier/Make** | Medium | Action POSTs summary to webhook → automation sends you an email |
| **SendGrid/Mailgun** | Medium | Action uses API to send email to you (requires API key) |

See [template.md](template.md) for a GitHub Action example that creates an Issue on deploy.
