# Outreach & Media Library Flow Analysis

## Current Flow

### Outreach Page Image Editor
1. Admin opens **Admin → Outreach Page**
2. Sees six image URL inputs: Hero, Community Outreach, Cal Trans, 12 Step, Bible Study, Community
3. Instructions: *"Use Media Library to upload images, then paste each URL here"*
4. User must: switch to **Media Library** tab → upload file → hover image → click **Copy URL** → switch back to **Outreach Page** tab → paste into the slot

### Home Page Content Editor
- Same pattern: single hero background image URL input with "Use Media Library to upload images, then paste URL here"

### Media Library
1. Admin opens **Admin → Media Library**
2. Clicks **Upload Media** → selects image file
3. With Supabase: uploads to `supabase.storage.from('media')` → inserts row into `media` table
4. Without Supabase: converts to data URL, stores in localStorage
5. Each item shows: Copy URL, Replace, Delete on hover

---

## Pain Points

| Issue | Impact |
|-------|--------|
| **Context switching** | User must switch tabs between Outreach and Media Library for each image |
| **Copy-paste friction** | Six slots × copy → switch → paste = 12 manual steps per full update |
| **No inline picker** | No "Choose from Media Library" or "Upload and use" per slot |
| **Error opacity** | Upload failures show generic "Failed to upload" – no actionable error (bucket missing, auth, project paused, etc.) |
| **Supabase dependency** | Storage bucket `media` must exist; setup is manual (no migration). If bucket missing or project paused, uploads fail silently. |

---

## Likely Causes of Upload Failure

1. **Storage bucket `media` not created** – Setup docs require manual creation in Dashboard. If never done, `supabase.storage.from('media').upload()` fails.
2. **Storage RLS policies** – `storage.objects` needs INSERT policy for authenticated users. Default may deny uploads.
3. **Project paused** – Supabase free-tier projects pause after inactivity. All API calls (including storage) fail.
4. **Not authenticated** – Media table RLS requires `auth.role() = 'authenticated'`. Storage may also require auth.
5. **CORS or network** – Less common but possible from some deploy origins.

---

## Is This the Best Workflow?

**Short answer: No.** The current flow is functional but not optimal.

### Better Approaches

| Option | Description | Effort |
|--------|-------------|--------|
| **A. Inline Media Picker modal** | Add "Choose from Media Library" button next to each Outreach slot; modal shows Media Library grid; selecting an image auto-fills the URL | Medium |
| **B. Direct upload per slot** | Each Outreach slot has its own "Upload" button; file picker → upload → auto-fill URL | Medium |
| **C. Unified picker** | Single modal: tabs "Media Library" and "Upload new"; select or upload, then apply to slot | Higher |
| **D. Keep current, improve UX** | Add "Copy URL" in a toast after upload; improve error messages; add link "Open Media Library" next to each input | Low |

**Recommendation:** Start with **D** (low effort) plus **storage migration + better error handling**. Then add **A** (inline picker) for better UX.

---

## Recommended Changes

### 1. Storage Bucket Migration
- Create migration to insert `media` bucket into `storage.buckets` and add `storage.objects` policies for authenticated upload/select.
- Ensures setup is automated; no manual bucket creation.

### 2. Better Error Handling in MediaLibrary
- Surface actual error: `uploadError?.message`, `dbError?.message`, "Project may be paused", "Storage bucket not found", "Not authenticated".
- Helps users debug upload failures.

### 3. Tests
- Playwright: Media Library load, upload (with mock or skip when no Supabase), copy URL flow.
- Playwright: Outreach editor load, paste URL, save, verify Outreach page shows image.
- Unit: MediaLibrary handleFileUpload error paths.

---

## Files Involved

| File | Role |
|------|------|
| `components/admin/OutreachContentEditor.tsx` | Outreach image URL inputs |
| `components/admin/MediaLibrary.tsx` | Upload, copy URL, replace |
| `components/admin/HomeContentEditor.tsx` | Hero image URL input |
| `lib/supabase.ts` | Supabase client |
| `supabase/migrations/*` | Storage bucket + policies |
