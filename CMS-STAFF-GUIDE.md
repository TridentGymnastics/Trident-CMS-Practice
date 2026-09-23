# Staff guide: the simple website editor

This guide applies to both the live and practice websites. Use **Trident-Gymnastics** for real updates after migration is approved, or **Trident-CMS-Practice** for training. Practice changes never update the real website. The practice site shows a yellow badge and cannot send applications.

## Everyday workflow

1. Open Pages CMS and check the repository: **Trident-Gymnastics / main** is live; **Trident-CMS-Practice / main** is training. During migration testing, use the migration branch only.
2. Open the relevant section below. Change the information and press **Save** before moving to another page.
3. Wait for the connected deployment to succeed (Netlify for live, Vercel for practice), then refresh that website and check your change on a phone as well as a computer.
4. To undo a wording mistake, restore the wording in that editor and save again. For a larger mistake, ask the nominated technical contact to revert the specific Git commit.

Each Save makes a Git commit and can trigger a deployment. On the live repository, assume it publishes automatically unless the team has explicitly configured and verified manual publishing. There is no draft branch or separate Publish website button yet. Plan related edits before saving each section.

## Where to change things

| Section | Editor | What you can change |
| --- | --- | --- |
| Essential | Site-wide Notices | On/off, colour, heading, message and optional link |
| Essential | Holiday Program | Season, open/coming soon/closed, dates, notice, booking link and collapsed program sections with Week 1 / Week 2 session lists |
| Club information | iClassPro App Guides | App guide PDF titles, descriptions and files |
| Program information | PlayGym | Name, ages, supervision, description, regular drop-in times, prices and photos |
| Program information | Little Gymnasts, EduGym, UrbanGym, AGC | Names, descriptions, level information, photos and a preset header colour |
| Program information | Birthday parties | Introduction, booking link, package prices/guest numbers, times and practical details |
| Club information | Term dates | Heading, short note and replacement calendar image |
| Essential | Policies | Current policy PDFs and older policies |
| Club information | About | About text, people and portraits |
| Club information | Phone, email and opening hours | Shared contact details and opening-hours text |

Editor labels stay familiar even if a program is renamed. Page addresses stay the same, preserving existing links. Names update navigation, program cards, page headings and galleries; separately written paragraphs and PDF contents still need a wording review.

## Holiday Program: separate dates for every program

Open **Essential > Holiday Program**. You can edit all holiday programs here before pressing Save once.

1. Select **Coming soon** while preparing the next holiday period. Choose **Season**, then enter the overall holiday dates, closure notice and booking link at the top.
2. Expand **PlayGym**, **OpenGym** or **Skill Workshops**. All three sections start collapsed and have their own **Week 1** and **Week 2** lists.
3. Expand a session row or click **Add an item**. Choose **Date**, **Start time** and **Finish time**. Times are dropdown choices every 15 minutes from 6:00am to 9:00pm; no time range needs typing. Workshop rows also require a **Name** first, such as Handstands & Cartwheels.
4. Remove dates that no longer run. A completely empty week displays **No sessions scheduled this week**. If both weeks are empty, that program has no booking button or drop-in invitation until dates are added. Switch the whole program off to hide its card entirely. Keep the three program sections; only add/remove session rows.
5. Finish all program changes, select **Open** when ready, then **Save once**. Wait for the build and check /school-holidays and the program's direct page. Select **Closed** when the holiday period finishes.

For example, the stored OpenGym schedule has Week 1 on 21, 22, 23 and 24 September, 2:30pm - 4:00pm, and Week 2 on 29 September and 2 October, 1:00pm - 2:30pm. These dates came from the existing practice timetable; confirm them against current bookings before using them publicly.

Dates display in chronological order with their weekday added automatically. Week 2 dates must follow Week 1. Invalid dates, backwards times and identical duplicate sessions fail the build. Staff do not need to maintain calendar code. Workshop names are required.

**Website edits do not change bookings in iClassPro.** If a session is moved or cancelled, update it in iClassPro as well. Also update the overall date range and closure notice at the top; those are separate from the session lists. The main holiday page and all existing holiday subpages share the same schedules and status.

**Season themes:** Winter = slow snow; Autumn = leaves; Spring = flowers; Summer = gentle sunshine. One selection changes the holiday heading colours/effects on all four holiday pages, the homepage hero decoration, holiday promotion and holiday feature card. Closed/Coming soon hides the effects and schedules. Reduced-motion preferences hide the decorative effects. Selecting a season does not change dates, booking information, or uploaded PDF/poster artwork.

PlayGym's name, age range, supervision and casual price come from its main editor. Keep the casual single-visit price first in that prices list. The regular PlayGym timetable is separate from these holiday dates.

## Policies: one editor for shared documents

Open **Essential > Policies** to replace a current policy PDF, update its title/description, or manage older policies. Current policies are shared by the Policies page and the PlayGym page; update them once here. About now contains only the club story and people.

Upload a new PDF filename and select it, then save and check both pages. The editor changes the PDF link, not the text inside the document. Keep older files until existing links have been checked.

App guides have their own page under **More > iClassPro App Guides**. Edit their PDFs in **Club information > iClassPro App Guides**. The retired news page no longer needs maintaining.

## Class bookings

**View Classes** opens iClassPro directly. Manage actual class times, availability and enrolments there. The website no longer has a separate class-finder timetable to keep in sync. Website program descriptions and age/level text still need updating if those facts change.

## Photos and documents

- Choose an existing photo or upload one, describe the activity, and select a crop position if necessary. A program may have no photos. Gallery size and layout are fixed.
- Only UrbanGym has an **existing video** on/off switch. Replacing videos is outside the staff editor.
- Upload the new calendar image in Term dates. Creating the calendar artwork happens outside the website editor.
- Select/upload a replacement policy PDF in Essential > Policies. The editor changes the file link, not the words inside the PDF.
- Use images the club has permission to publish. Do not delete or rename existing library files as an exercise; other pages may still link to them.

For an internal link use /playgym, /school-holidays, /contact or **/** for the homepage. The homepage address is /, not /homepage.

## What stays fixed

Branding, layout, navigation structure, street address/maps, homepage hero artwork and general promotional copy stay fixed. Ordinary staff do not need to manage search metadata, CSS, gallery dimensions, booking identifiers or video processing. Adding a new type of page, moving the club or changing enrolment integrations still needs technical help. Holiday programs and notices can be hidden; there is no general hide-any-page switch.

For a free-trial policy change, review the fixed trial buttons and copy with that helper. Existing trial/booking destinations for regular program pages are retained.

## Short handover exercise

Ask a staff member to do this in practice without coaching:

1. Change a notice and turn it off again.
2. Change a program description and replace one photo.
3. Change a party price and check the result.
4. Change one OpenGym date in Week 1 and one in Week 2; check the main holiday page and its OpenGym subpage. Change a workshop name and its start/finish times. Try another season and check the homepage too. Empty one week, then restore it. Test Closed and restore Open.
5. Replace the term-calendar image and update the opening-hours text.

Restore test content when finished. Confirm club-controlled accounts, a second authorised person who can recover access, and a named helper for a failed build. A genuine upload/save/reopen check and staff account permissions still require this hands-on exercise.

The permanent flow is Pages CMS -> existing Trident-Gymnastics GitHub repository -> existing Netlify website. See CMS-MIGRATION.md for launch status and the practice refresh procedure.
