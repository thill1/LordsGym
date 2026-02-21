# Delivery Markdown Template

Copy this when creating a new `docs/CLIENT_*_DELIVERY.md`:

```markdown
# [Project/Feature] — Enhancements Summary

**Date:** [Month Year]  
**Status:** ✅ Completed & Tested

## Code Versions Tested & Deployed

| Role | GitHub Commit | Short SHA | Link |
|------|---------------|-----------|------|
| **Source** (before) | [full SHA] | [short SHA] | [View](https://github.com/thill1/LordsGym/commit/SHORT_SHA) |
| **Target** (deployed) | [full SHA] | [short SHA] | [View](https://github.com/thill1/LordsGym/commit/SHORT_SHA) |

Commits in range: [first] → [last]. [Compare source..target](https://github.com/thill1/LordsGym/compare/SOURCE..TARGET)

---

## What Changed
[Feature/fix descriptions]

## What Was Tested
- ✅ [Test 1]
- ✅ [Test 2]

## Planned Future Upgrades (optional)
[Items under consideration]

## Questions?
If you notice any issues or have feature requests, please reach out.
```

---

## Optional: GitHub Action to Create Review Issue on Deploy

Add a job to your deploy workflow to create a "Review: Enhancements" issue when deploying to production. You get a notification; you review the Markdown, then forward to the client.

```yaml
# Add to .github/workflows/cloudflare-pages.yml (or similar)
create-review-issue:
  name: Create Enhancements Review Issue
  needs: [build, deploy]
  runs-on: ubuntu-latest
  if: github.event_name == 'push' && github.ref == 'refs/heads/main' && needs.deploy.result == 'success'
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - name: Create review issue
      uses: actions/github-script@v7
      with:
        script: |
          const { execSync } = require('child_process');
          const target = execSync('git rev-parse HEAD').toString().trim();
          const source = execSync('git rev-parse HEAD~10^').toString().trim();
          const shortTarget = target.slice(0, 7);
          const shortSource = source.slice(0, 7);
          const commits = execSync(`git log --oneline ${shortSource}..${shortTarget}`).toString().trim();
          
          const body = `## Enhancements ready for client review

          **Deployed:** ${shortTarget}
          **Compare:** https://github.com/${{ github.repository }}/compare/${shortSource}..${shortTarget}

          ### Commits
          \`\`\`
          ${commits}
          \`\`\`

          **Next step:** Create \`docs/CLIENT_*_DELIVERY.md\` with full details, copy to email, review, then forward to client.
          `;
          
          await github.rest.issues.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            title: `[Review] Enhancements deployed ${new Date().toISOString().slice(0, 10)}`,
            body
          });
```

Note: This creates a lightweight reminder issue. The full delivery Markdown is still created manually (or by the agent when you ask) so you control the client-facing wording.
