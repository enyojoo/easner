# Website admin: design fidelity

Each admin screen against its card in the easnerbanking design system (`claude/blog-admin-designs`, group "Website admin"). Method: the card's `preview.html` and the admin screen rendered headless at 1440 wide and compared; the dev harnesses (`/dev/overview`, `/dev/analytics`, `?shell=1` for the real shell) give seeded data with no sign-in.

| Screen | Card | Status | Notes |
| --- | --- | --- | --- |
| Overview | OffBlogOverview | Matched | Rebuilt top to bottom: header and period pills, Needs you, 4 KPI tiles, Blog views chart, Top posts, Where readers come from, Google searches, Categories, Pipeline, Whole website. Deviations: Needs you has no SEO issue or "helpful fell" rows yet (the data is not collected); chart labels the 3 newest publish dates only; Writers get no Needs you card (see below). |
| Analytics, Website and Blog tabs | OffSiteAnalytics | Fixed in part | KPI tiles now use the overline label, 24 px padding and "+12%" change text (no arrows). Still deviating: the filter row (country, device, source, page, compare toggle, "on the site now"), the funnel and the location map are not built (they need PostHog queries Phase 4A does not have); tables sit inside the card padding instead of edge to edge. |
| Sign-in | OffBlogAuth | Fixed | Title "Sign in", subtitle "Easner website admin", helper line under the button, 24 px card inset. Code, authenticator and wrong-code steps were not compared (they need a live session). |
| Shell (sidebar, header) | OffBlogOverview shell | Matched, one deviation | Checked at 1280, 1440 and 1920: no horizontal overflow, no clipped shadows or focus rings. Deviation: the account button shows initials; the card draws a person icon with a chevron. |
| Posts, editor shell and settings panel, Authors, My profile, Media, Categories, Redirects, Settings (Team) | OffBlog, OffBlogEditor, OffBlogMedia, OffBlogTaxonomy | Not compared | These need signed-in data and have no harness yet. The Card audit below found no missing padding on them. Next step: one `/dev/*` harness per screen with seeded rows. |

## Needs you for Writers

Overview shows Needs you to Editors and Owners only (reviews waiting, second approvals, posts going live in 48 hours). Writers see their own posts sent back for changes under a "Needs you" tab on the Posts list (shown only while something waits) and in the amber count on the Posts nav item. Editors and Owners get the same tab for posts in review.

## The Card padding bug and how it is held

`Card` pads only top and bottom; text placed straight inside touches the edges. Audit of every `<Card` in `admin/`: only the Overview pipeline tiles and the new Overview blocks had it (the earlier "two dozen" were `padding="none"` cards that hold tables or an `EmptyState`, which pad themselves). Rule now: use `CardHeader` and `CardContent`, or `CardBody` (24 px sides), or `padding="none"` with your own padding. `lib/card-padding.test.ts` reads the source and fails a `<Card>` whose first child is a bare element without a `px-` class.

## Clipping

The "clipped" look was the missing card padding plus the cards' own tight layout; the shell itself does not clip. The sidebar is fixed, the header is outside the scroll area, and only `main` scrolls, so nothing hides under the header.
