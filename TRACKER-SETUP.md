# NonFandomDesigns order tracker

This adds a shared-code customer tracker and an approved-admin management screen to the existing GitHub Pages site. It reuses the Supabase project already referenced by custom.html. The custom form, its submit-request function, Stripe links, and other pages are unchanged. The only homepage edit is a TRACK YOUR RUG menu link.

## Files to upload to the existing repository

Upload tracker.html, tracker-admin.html, tracker/, supabase/migrations/20261014_order_tracker.sql, TRACKER-SETUP.md and the updated index.html. Do not upload the separate PRIVATE-initial-orders.json file. The migration contains no customer records or secret keys. Do not run the migration twice: it is a one-time additive migration.

## Activate Supabase first

1. Resume the existing project if paused. Confirm the project URL matches tracker/config.js and custom.html.
2. In Supabase SQL Editor, run supabase/migrations/20261014_order_tracker.sql. This creates isolated private tables and limited RPC functions; it does not modify existing request/payment tables.
3. In Authentication > Users, create an admin user with an email and a strong password. Existing users can also be used. Keep your password private. Public signup alone never grants tracker admin rights.
4. Copy that user's UUID from Authentication. In SQL Editor run this, replacing the placeholder with that UUID:

   ```sql
   insert into nfd_tracker_private.admins(user_id)
   values ('YOUR-ADMIN-USER-UUID');
   ```

5. After uploading the website files, open tracker-admin.html under the same GitHub Pages base URL as your current website. Sign in with the approved account. The admin password and access token remain in browser memory; they are not written into the website or browser storage. Reloading requires sign-in again. Sessions expire; sign out and in if a session expires.
6. Import the separately supplied PRIVATE-initial-orders.json file through the admin screen. The backend requires an empty tracker and imports the list atomically. It refuses a second import. Future orders are added individually using Create order.
7. Set your chosen shared access code in the admin screen (10–128 characters), or generate a long random code. Privately send it with your tracker.html link. Generated codes are shown once; if lost, generate a replacement. No customer code or admin password belongs in GitHub.

## Customer view

Everyone with the code can read the entire shared list: rug names/descriptions, last two phone digits, status, and counts ahead. This was the selected shared access model. The phone digits are display only. A customer can open a rug to see the five stages: Waiting, Up next, Being made, Wrapping up, Completed. Wrapping up shows exactly: “Please have final payment ready at completion.” Stage filters include Wrapping up and Completed even when empty. Before production, the detail shows the count of non-completed orders earlier in your admin-managed queue. The list treats each entry as one order; the four-rug bundle therefore counts as one. Stage changes do not automatically reorder other entries. Use Move up/down for priority, including paid expedited orders. The tracker does not collect or verify an expedite payment and does not change Stripe behavior.

The tracker has no public order number. Order UUIDs are returned only to approved admins. Descriptions and phone endings are never baked into public HTML/JS. The shared code is sent in an HTTPS POST body, not a URL, and compared server-side to a SHA256 hash. This is a bearer code: anyone it is shared with gets the shared customer view. The database allows at most 30 failed code checks in a five-minute window across the shared tracker. Further attempts temporarily block all customer reads until the window ends; a malicious visitor could temporarily interrupt access. This is a simple global limit for a low-volume shared tracker. The code must be kept private. Lock tracker clears the displayed records and code from page memory. Code rotation prevents further reads with the old code; already viewed information cannot be recalled.

## Character image

An optional character image is supported: add the chosen image file to your repository and set characterImage in tracker/config.js to its relative path (for example './lore-yomizakura.png'). It appears beside the heading and adapts to phone screens. No character was selected, so the default is null.

## Free-tier availability

Supabase may pause free projects after low activity over seven days. The page handles failed/timed-out reads with a temporary-unavailable message; it never falls back to exposing orders in public files. A paused project must be resumed in the Supabase dashboard. Static GitHub Pages cannot resume it automatically. This package does not change your plan or add artificial keep-alive traffic. See https://supabase.com/docs/guides/platform/free-project-pausing.

## Verify before sharing the code

- Test an incorrect code: no records should be shown. Try a correct code and lock the page.
- Try admin sign-in with an unapproved account: access must be refused.
- Change one test order to Wrapping up and check the payment reminder.
- Reorder a test entry and confirm waiting counts change. Mark it Completed and confirm it no longer counts ahead.
- Generate a replacement code and confirm the old one no longer works.
- Review the import names, especially the four-rug bundle, Luffy rift, and Mimikyu wig racer; they preserve your supplied descriptions.
- Test your custom request form and current payment links without submitting a real payment.

Local verification uses PostgreSQL-compatible PGlite with Supabase roles/auth mocked. It covers migration execution, anonymous/non-admin access rejection, atomic initial import, phone field validation, queue order/counts, completed exclusion, rotation, and customer field filtering. In-app browser checks use fabricated test rugs rather than customer records: expandable details, reminder, wrong-code response, lock, admin rendering, and no horizontal overflow at 390/768/1440 widths. Standalone Playwright launch was blocked by macOS sandbox permissions; in-app browser checks were used instead. Production Supabase and live payment checks still require setup and verification in your account.

Security design follows https://supabase.com/docs/guides/database/postgres/row-level-security and https://supabase.com/docs/guides/database/functions. No service-role key is needed in the browser. Never add one to config.js.
