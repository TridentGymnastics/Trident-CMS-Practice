# Trident CMS practice guide

Use **Trident-CMS-Practice / main** in Pages CMS and the separate Vercel practice website. The permanent club website stays on Netlify. You do not need to open code or JSON to complete these exercises.

## What you can change

| Editor | Changes it controls |
| --- | --- |
| Site-wide notice | Turn a notice on/off across the website; edit its message, optional link and blue/yellow colour. |
| PlayGym | Shared program name, ages and adult-helper setting; description, paragraphs, duration, regular days/times, New badges, prices and pass wording, joining instructions, button wording, gallery and video. |
| Little Gymnasts, EduGym, UrbanGym, AGC | Shared program and level names, school-year labels, introductions, search text, level descriptions, header colour preset, gallery size/photos/crops and video. |
| Class finder timetable | Regular EduGym/UrbanGym sessions displayed in Find a Class, including their iClassPro age ranges. |
| News updates | Add, edit or hide an update on What's happening; change text, date and photos. |
| About and policies | About page text, people and portraits, affiliations, current/older policies and parent-guide PDF links. Current policies also appear on PlayGym. |

Program names update headings, navigation, program cards and applicable class-finder labels. Program introductions also feed the homepage and Classes page cards. Level descriptions feed the class finder. Existing page URLs and iClassPro booking IDs stay the same when names change. The news editor does not add a new homepage section. There is no page-hide switch or drag-and-drop page builder yet.

Written paragraphs, gallery headings, search titles/descriptions, historical news and PDFs are separate wording: review them after a rename or change to session operation. The CMS does not rewrite prose for you or change iClassPro.

## Testing the unlocked fields

1. In PlayGym, temporarily change **Program name**, save, and check the menu, homepage, PlayGym heading, holiday program label and Find a Class result. Restore the name afterwards.
2. In EduGym, rename the Foundation level and change its school-year label. Its new name/label should appear on both the EduGym and preschool pages, and in the class finder. Restore both fields. Enter level names without the program prefix: the website adds it where needed. The preschool editor separately controls the Adventurers name and its Foundation description.
3. Change PlayGym's **Age range** using a format such as `2–7 years`. The values are exact ages in years, with decimals allowed. If the finder's selected age group only partly fits, it asks the family to contact the team rather than promising a suitable session. Restore the range after testing. School-year labels are display text; real coached-class enrolment ages come from the timetable and must match iClassPro.
4. Toggle **Adult helper required** and check the supervision labels on PlayGym, the class finder and holiday information. Review the written paragraphs and policies as well. Restore the real setting afterwards.
5. Open AGC and save a text edit with no photos. Empty galleries are allowed and stay hidden. In another program, expand a photo and try the **Crop position** dropdown. **Gallery width** is now an editable size choice.
6. For videos, select an MP4 from **Program videos**, choose a poster image, add a description, then switch **Show video** on. Switch it off to hide the video while retaining its settings. Use a compressed MP4 under 25 MB; uploads are not automatically compressed.

## First exercise: turn a notice on and off

1. Open **PRACTICE - Site-wide notice**.
2. Set the heading to **Practice notice** and message to **Testing the staff editor**. Leave both link fields blank.
3. Switch **Show this notice** on, choose a colour, and click **Save**.
4. Wait for the practice Vercel deployment to finish successfully. Refresh the practice homepage and PlayGym page; the notice should appear on both.
5. Switch the notice off and save. After the next successful deployment, refresh and confirm it has disappeared.

Saving commits your edit to the practice GitHub repository. The website changes after its build and deployment complete. A Vercel deployment labelled Production is still this practice project; it is not the club's Netlify website.

## Then try these, one at a time

- **Price:** change a PlayGym price, save, check it on the practice page, then restore it. Keep the single-visit entry first because the holiday PlayGym page also uses its price. Savings and pass-summary text do not calculate themselves; keep them consistent.
- **Timetable:** change a PlayGym session using a time such as `11:00am - 12:30pm`. Check both PlayGym and Find a Class, then restore it. School holiday dates/times remain separate.
- **Program:** change one EduGym description and choose a header colour preset. Check its page at desktop and phone widths, then restore it.
- **Photo:** choose or upload a photo, add a useful description, save, and check the crop on desktop and phone. Restore the original selection afterwards. Program/news photos use the existing responsive image optimisation. Portraits and logos use a separate media library.
- **News:** add an update with a unique reference such as `practice-update`, a real sorting date such as `2026-09-22`, text and optionally photos. Switch Publish on, save and check What's happening. Switch Publish off and save to hide it. A future sorting date does not schedule publication.
- **PDF:** upload a PDF with a new filename and select it in a policy/guide entry, then save and open the link from the practice page. PDF uploads do not change wording inside the PDF. Keep old files until existing links have been checked.

Use iClassPro as the authority for real class times and enrolment limits. Updating the website's timetable never updates iClassPro. The age-range format is `5Y - 8Y` or `3Y, 6M - 5Y, 6M`; it affects which sessions the website recommends. Ask someone responsible for enrolments if unsure of the correct range. Removing sessions does not remove the program page or close bookings.

Only upload images the club has permission to publish. Avoid children's names in captions or filenames. Do not delete or rename existing media as an editing exercise: another page may still use it.

## If an edit does not appear

1. Confirm you saved and that Pages CMS still shows Trident-CMS-Practice / main.
2. Check the latest Vercel deployment status. A failed build has not published the new version.
3. Correct the field identified in the build message (for example a missing image or a finish time before the start), then save again.
4. Once deployment succeeds, reload the practice URL. If needed, use a private window and sign in when Vercel requests access.
5. If you cannot fix it, record which editor and field you changed and get help. A technical helper can revert that edit's GitHub commit, preserving later unrelated edits.

Have one staff member edit a given section at a time to avoid overwriting each other's work. Use Pages CMS for these exercises, not the older temporary JSON file open in the IDE.

## Before permanent handover

Have a nontechnical staff member complete the exercises without coaching. Confirm club-controlled access to GitHub, Pages CMS, Netlify and the domain, with a second authorised person able to recover access. Record who handles failed builds or changes beyond these forms.

Remaining work includes page visibility, holiday seasons/promotions, birthday-party content, homepage content outside the connected program cards and global contact details. These need their own content wiring and tests. Arbitrary new layouts will still need development unless a page-builder approach is adopted.

Migration to the original repository and existing Netlify site is a later, separate step described in README.md. Do not copy the practice hosting or noindex/form-disable safeguards into production.
