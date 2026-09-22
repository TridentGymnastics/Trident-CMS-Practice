# Staff guide: the simple website editor

This guide covers the separate **Trident-CMS-Practice** website. The live Netlify website is unchanged. Use the practice repository in Pages CMS; the old JSON file open in the IDE is not the staff editor.

## Everyday workflow

1. Open Pages CMS and select **Trident-CMS-Practice / main**.
2. Open the relevant section below. Change the information and press **Save** before moving to another page.
3. Wait for the practice Vercel deployment to succeed, then refresh the practice website and check your change on a phone as well as a computer.
4. To undo a wording mistake, restore the wording in that editor and save again. For a larger mistake, ask the nominated technical contact to revert the specific Git commit.

Each Save currently makes a Git commit and can trigger a deployment. There is no draft branch or separate Publish website button yet. A news item's Publish switch controls visibility; it does not batch deployments. Plan related edits before saving each section.

## Where to change things

| Section | Editor | What you can change |
| --- | --- | --- |
| Notices and holidays | Site-wide notice | On/off, colour, heading, message and optional link |
| Notices and holidays | School holidays | Open/coming soon/closed, dates, notice, booking link, program switches, descriptions, prices and session information |
| Notices and holidays | News updates | Add/hide updates; headline, date, paragraphs and photos |
| Program information | PlayGym | Name, ages, supervision, description, regular drop-in times, prices and photos |
| Program information | Little Gymnasts, EduGym, UrbanGym, AGC | Names, descriptions, level information, photos and a preset header colour |
| Program information | Birthday parties | Introduction, booking link, package prices/guest numbers, times and practical details |
| Club information | Term dates | Heading, short note and replacement calendar image |
| Club information | About and policies | About text, people, portraits, policy PDFs and parent guides |
| Club information | Phone, email and opening hours | Shared contact details and opening-hours text |

Editor labels stay familiar even if a program is renamed. Page addresses stay the same, preserving existing links. Names update navigation, program cards, page headings and galleries; separately written paragraphs, news and PDF contents still need a wording review.

## School holidays: one place to update

1. Before the next program is ready, select **Coming soon**. This hides old dates, program details and the dated homepage promotion.
2. Enter the next dates, any closure notice, the correct holiday booking link and the program details. Switch each program on or off as needed. The two booked-program slots can be renamed; keep their existing references. PlayGym has its own on/off switch and holiday-times field.
3. When bookings are ready, select **Open** and save. Check the homepage promotion and /school-holidays. When finished, select **Closed** and save.

The page uses a fixed design. There is no seasonal artwork, separate daily calendar or coded schedule to maintain. The booking portal supplies actual booked-session availability. Keep the written session information consistent with it. All existing holiday subpage addresses still work and respect the same switches.

PlayGym's name, age range, supervision and casual price are shared with its main editor. Keep the casual single-visit price **first** in PlayGym's prices list. Its regular timetable and holiday times are deliberately separate.

## Class bookings

**View Classes** opens iClassPro directly. Manage actual class times, availability and enrolments there. The website no longer has a separate class-finder timetable to keep in sync. Website program descriptions and age/level text still need updating if those facts change.

## Photos, news and documents

- Choose an existing photo or upload one, describe the activity, and select a crop position if necessary. A program may have no photos. Gallery size and layout are fixed.
- Only UrbanGym has an **existing video** on/off switch. Replacing videos is outside the staff editor.
- Use the news date format YYYY-MM-DD. The website formats that date and sorts updates; no second date or technical ID needs entering.
- Upload the new calendar image in Term dates. Creating the calendar artwork happens outside the website editor.
- Select/upload a replacement policy PDF in About and policies. The editor changes the file link, not the words inside the PDF.
- Use images the club has permission to publish. Do not delete or rename existing library files as an exercise; other pages may still link to them.

For an internal link use /playgym, /school-holidays, /contact or **/** for the homepage. The practice notice currently has a TEST link to /homepage; change that to / when finishing the test.

## What stays fixed

Branding, layout, navigation structure, street address/maps, homepage hero artwork and general promotional copy stay fixed. Ordinary staff do not need to manage search metadata, CSS, gallery dimensions, booking identifiers or video processing. Adding a new type of page, moving the club or changing enrolment integrations still needs technical help. Holiday programs, notices and news can be hidden; there is no general hide-any-page switch.

For a free-trial policy change, review the fixed trial buttons and copy with that helper. Existing trial/booking destinations for regular program pages are retained.

## Short handover exercise

Ask a staff member to do this in practice without coaching:

1. Change a notice and turn it off again.
2. Change a program description and replace one photo.
3. Change a party price and check the result.
4. Switch holidays to Closed, check the homepage and an old holiday subpage, then restore Open.
5. Replace the term-calendar image and update the opening-hours text.

Restore test content when finished. Confirm club-controlled accounts, a second authorised person who can recover access, and a named helper for a failed build. A genuine upload/save/reopen check and staff account permissions still require this hands-on exercise.

The permanent target remains Pages CMS -> original GitHub repository -> existing Netlify website. That migration has not happened. Follow README.md for a selective migration, preserving the real site's forms, domain and indexing.
