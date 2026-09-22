import { programNames as names, playgymSupervision, playgymSupervisionDetail } from './programContent';
/**
 * School Holiday Programs Content Manifest
 *
 * SOURCE OF TRUTH: All content must be verifiable against official program pages.
 * No invented details, ages, times, or prerequisites unless present on source page.
 *
 * Last manual verification: 2026-09-02
 */

import playgymData from '../content/playgym.json' with { type: 'json' };

/**
 * ── SEASON ON/OFF SWITCH ──────────────────────────────────────────────
 * Single source of truth for whether a holiday program is currently live.
 *
 * OFF-SEASON (live: false):
 *   • /school-holidays renders the friendly "coming soon" placeholder
 *   • Winter/season-specific FAQ, calendar, structured data are NOT emitted
 *   • Subpages (playgym/opengym/skill-workshops) hide their stale schedule
 *
 * TO TURN A SEASON ON OR OFF: see docs/HOLIDAY-PROGRAM-PLAYBOOK.md
 *   1. Set live and fill in season / termLabel / datesLabel / booking
 *   2. Update the schedule data in this file + the calendar in the page
 *   3. Toggle the promo + nav links (grep for TODO( in the .astro files)
 *
 * Spring 2026 program runs 21 September – 2 October 2026. Week 1 is Monday 21
 * to Thursday 24 September — Friday 25 September is a public holiday and the
 * gym is closed. Source: "2026 Spring Holiday Timetable" (Trident tab).
 */
export const holidayProgramStatus = {
  /** Master switch — false hides the whole program across the site. */
  live: true,
  /** Season currently running (or the next one up when live is false). */
  season: 'Spring',
  /** Human label for the break. */
  termLabel: 'Term 3 School Holidays',
  /** Confirmed dates once known, e.g. '21 September – 2 October 2026'. Empty = "dates coming soon". */
  datesLabel: '21 September – 2 October 2026',
  /** Whether iClassPro bookings are open yet for the season. */
  bookingsOpen: true,
  /** Generic Holiday Program listing in the booking portal. */
  bookingUrl: 'https://portal.iclasspro.com/trident/camps/9?sortBy=name'
};

export type ProgramBlock = {
  id: 'playgym' | 'opengym' | 'skill-workshops';
  sourceUrl: string;
  lastVerifiedISO: string;

  // Card summary (visible on main page)
  title: string;
  summary: string; // Max ~50 words, derived from source page

  // Quick meta (must be present on source or marked TODO)
  ages: string;
  sessionLength: string;
  bookingType: string;
  time?: string;
  timeNote?: string; // Additional time details (shown in full view only)

  // Card bullets (4-6 items, condensed from source)
  bullets: string[];

  // Full-screen view content (Complete Information only)
  fullView: {
    tagline: string;
    about: string[]; // Paragraphs from source
    features?: string[]; // Bullets/benefits from source
    requirements?: string[]; // Prerequisites from source
    schedule?: {
      weeks: Array<{
        weekNumber: number;
        weekLabel: string;
        sessions: Array<{
          day: string;
          date: string;
          title?: string;
          time?: string;
          description?: string;
        }>;
      }>;
    };
    pricing?: {
      intro?: string;
      items: Array<{ label: string; price: string }>;
      note?: string;
    };
    howToJoin?: {
      text: string;
      note?: string;
    };
  };

  // Booking CTA (null = use fallback "Contact to book")
  bookHref: string | null;
};

/**
 * PlayGym Program
 * Source: https://www.tridentgymnastics.com.au/playgym-1
 * Content derived from playgym.json (last updated from source: 2024-12-01)
 */
export const playgymProgram: ProgramBlock = {
  id: 'playgym',
  sourceUrl: 'https://www.tridentgymnastics.com.au/playgym-1',
  lastVerifiedISO: '2026-09-02T00:00:00.000Z',

  title: names.playgym,
  summary: playgymData.tagline,

  ages: playgymData.age_range,
  sessionLength: playgymData.session_length,
  bookingType: 'No booking required',
  time: '11:00 am - 12:30 pm',
  timeNote: 'Stay for part or the whole session!',

  bullets: [
    playgymSupervisionDetail,
    'Use gymnastics equipment at your own pace',
    'Develops fine and gross motor skills through active play',
    `Pay at door: ${playgymData.prices.items[0].price} or multi-visit passes available`
  ],

  fullView: {
    tagline: playgymData.tagline,
    about: playgymData.about,
    features: [
      'Swing on bars, jump into foam pits, build cubby houses',
      playgymSupervision,
      'Vital for child development and school readiness',
      'Stay for as long or as little as you like'
    ],
    schedule: {
      weeks: [
        {
          weekNumber: 1,
          weekLabel: 'Week 1 - 21 to 24 September 2026',
          sessions: [
            { day: 'Monday', date: '21 September 2026', time: '11:00 am - 12:30 pm' },
            { day: 'Tuesday', date: '22 September 2026', time: '11:00 am - 12:30 pm' },
            { day: 'Wednesday', date: '23 September 2026', time: '11:00 am - 12:30 pm' },
            { day: 'Thursday', date: '24 September 2026', time: '11:00 am - 12:30 pm' }
          ]
        },
        {
          weekNumber: 2,
          weekLabel: 'Week 2 - 28 September to 2 October 2026',
          sessions: [
            { day: 'Monday', date: '28 September 2026', time: '11:00 am - 12:30 pm' },
            { day: 'Tuesday', date: '29 September 2026', time: '11:00 am - 12:30 pm' },
            { day: 'Wednesday', date: '30 September 2026', time: '11:00 am - 12:30 pm' },
            { day: 'Thursday', date: '1 October 2026', time: '11:00 am - 12:30 pm' },
            { day: 'Friday', date: '2 October 2026', time: '11:00 am - 12:30 pm' }
          ]
        }
      ]
    },
    pricing: {
      intro: playgymData.prices.intro,
      items: playgymData.prices.items,
      note: `${playgymData.prices.multi_visit_note} ${playgymData.prices.gift_blurb}`
    },
    howToJoin: {
      text: 'No booking required! Just drop in during our school holiday sessions.',
      note: 'For directions and more information, contact us.'
    }
  },

  bookHref: null
};

/**
 * OpenGym Program
 * Source: https://www.tridentgymnastics.com.au/school-holidays/opengym
 *
 * Last updated: 2026-09-02 (Spring Holiday schedule)
 */
export const opengymProgram: ProgramBlock = {
  id: 'opengym',
  sourceUrl: 'https://www.tridentgymnastics.com.au/school-holidays/opengym',
  lastVerifiedISO: '2026-09-02T00:00:00.000Z',

  title: 'OpenGym',
  summary: 'Supervised unstructured play and practice, open to all skill levels.',

  ages: '5–12 years',
  sessionLength: '1.5 hours',
  bookingType: 'Book ahead preferred',
  // Leads with the 2:30 pm start because that is all four week 1 sessions; the
  // two week 2 sessions run earlier, so they stay in the summary rather than
  // being rounded away.
  time: '2:30 pm - 4:00 pm (1:00 pm in week 2)',
  timeNote: 'Unstructured play on our full range of equipment with supervision.',

  bullets: [
    'Open to all skill levels',
    'Safety orientation must be completed first',
    'Supervised access to equipment',
    'Book ahead preferred; in-person booking available if spaces remain'
  ],

  fullView: {
    tagline: 'Supervised unstructured play and practice, open to all skill levels',
    about: [
      'OpenGym provides supervised access to our equipment for unstructured play and practice.',
      'Perfect for working on skills, staying active, or just having fun. All skill levels welcome.'
    ],
    requirements: [
      'Ages 5 to 12 years',
      'Safety orientation must be completed',
      'Parent/guardian waiver signed'
    ],
    features: [
      'Supervised access to all equipment',
      'Work on skills at your own pace',
      'Open to all skill levels',
      'Flexible scheduling'
    ],
    schedule: {
      weeks: [
        {
          weekNumber: 1,
          weekLabel: 'Week 1 - 21 to 24 September 2026',
          sessions: [
            { day: 'Monday', date: '21 September 2026', time: '2:30 pm - 4:00 pm' },
            { day: 'Tuesday', date: '22 September 2026', time: '2:30 pm - 4:00 pm' },
            { day: 'Wednesday', date: '23 September 2026', time: '2:30 pm - 4:00 pm' },
            { day: 'Thursday', date: '24 September 2026', time: '2:30 pm - 4:00 pm' }
          ]
        },
        {
          weekNumber: 2,
          weekLabel: 'Week 2 - 28 September to 2 October 2026',
          sessions: [
            { day: 'Tuesday', date: '29 September 2026', time: '1:00 pm - 2:30 pm' },
            { day: 'Friday', date: '2 October 2026', time: '1:00 pm - 2:30 pm' }
          ]
        }
      ]
    },
    pricing: {
      items: [
        { label: 'Per Session', price: '$20' }
      ]
    },
    howToJoin: {
      text: 'Booking ahead is preferred for OpenGym holiday sessions, but families can attend and book in person if spaces are available.',
      note: 'Contact us if you need help choosing a session.'
    }
  },

  bookHref: 'https://portal.iclasspro.com/trident/camps/9?typeId=9&next=camps&nextTitle=Holiday%20Program&pluralTitle=Holiday%20Programs&q=OpenGym&sortBy=name'
};

/**
 * Skill Workshops Program
 * Source: https://www.tridentgymnastics.com.au/skills-workshop
 *
 * Last updated: 2026-09-02 (Spring Holiday schedule)
 */
export const skillWorkshopsProgram: ProgramBlock = {
  id: 'skill-workshops',
  sourceUrl: 'https://www.tridentgymnastics.com.au/skills-workshop',
  lastVerifiedISO: '2026-09-02T00:00:00.000Z',

  title: 'Skill Workshops',
  summary: 'Focused skill-development sessions with coaching and safe progressions.',

  ages: '5–18 years',
  sessionLength: '1.5 hours',
  bookingType: 'Advance booking required',
  time: '1:00 pm - 2:30 pm',

  bullets: [
    'Coaching focused on specific skills',
    'Small groups for personalized attention',
    'Focus on technique refinement',
    'Great for accelerating progress'
  ],

  fullView: {
    tagline: 'Master specific gymnastics skills with coaching and safe progressions',
    about: [
      'Skill Workshops are intensive sessions designed to master specific techniques.',
      'Our coaches provide personalized feedback and progression drills.',
      'Small group sizes ensure every participant gets individual attention.'
    ],
    features: [
      'Coaching focused on specific skills',
      'Small group sizes',
      'Personalized attention and feedback',
      'Progressive skill development',
      'Common skills: handstands, cartwheels, back handsprings, aerials',
      `${names.urbangym} workshops add vaults, swings, and safe flipping and tricking`
    ],
    requirements: [
      'Ages 5 to 18 years',
      'Prerequisites vary by workshop',
      'Advance booking required',
      'Appropriate attire required'
    ],
    schedule: {
      weeks: [
        {
          weekNumber: 1,
          weekLabel: 'Week 1 - 21 to 24 September 2026',
          sessions: [
            { day: 'Monday', date: '21 September 2026', title: 'Handstands & Cartwheels', time: '1:00 pm - 2:30 pm', description: 'Master the fundamentals with drills and apparatus-based activities designed to perfect your handstands and cartwheels.' },
            { day: 'Wednesday', date: '23 September 2026', title: 'Flips & Tricks', time: '1:00 pm - 2:30 pm', description: 'Work toward advanced skills like walkovers, round-offs, aerials, and flips with coaching and safe progressions.' },
            { day: 'Thursday', date: '24 September 2026', title: 'Parkour', time: '1:00 pm - 2:30 pm', description: 'Inspired by parkour, ninja warrior, and trampoline skills, combining agility, coordination, and adrenaline for a high-energy experience.' }
          ]
        },
        {
          weekNumber: 2,
          weekLabel: 'Week 2 - 28 September to 2 October 2026',
          sessions: [
            { day: 'Monday', date: '28 September 2026', title: 'Handstands & Cartwheels', time: '1:00 pm - 2:30 pm', description: 'Master the fundamentals with drills and apparatus-based activities designed to perfect your handstands and cartwheels.' },
            { day: 'Wednesday', date: '30 September 2026', title: 'Flips & Tricks', time: '1:00 pm - 2:30 pm', description: 'Work toward advanced skills like walkovers, round-offs, aerials, and flips with coaching and safe progressions.' },
            { day: 'Thursday', date: '1 October 2026', title: names.urbangym, time: '1:00 pm - 2:30 pm', description: 'Urban-inspired movement training that builds gymnastics fundamentals, safe flipping and tricking, plus vaults, swings and creative movement in a coached environment.' }
          ]
        }
      ]
    },
    pricing: {
      items: [
        { label: 'Per Session', price: '$35' }
      ]
    },
    howToJoin: {
      text: 'Advance booking is required for Skill Workshops.',
      note: 'Workshops fill quickly - contact us if you need help choosing the right session.'
    }
  },

  bookHref: 'https://portal.iclasspro.com/trident/camps/9?typeId=9&next=camps&nextTitle=Holiday%20Program&pluralTitle=Holiday%20Programs&q=2026&sortBy=name'
};

// Export all programs
export const holidayPrograms: ProgramBlock[] = [
  playgymProgram,
  opengymProgram,
  skillWorkshopsProgram
];
