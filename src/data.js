/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  WOLVERINE ROBOTICS — SITE DATA
 *  Single source of truth. Edit this file to update the website content.
 *
 *  ADDING A NEW ROBOT:   append to ROBOTS array
 *  ADDING A TEAM MEMBER: append to TEAM.students / coaches / mentors
 *  GRADUATING A MEMBER:  move to PAST_MEMBERS array
 *  ADDING A SPONSOR:     append to SPONSORS array (set tier field)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// Reorder or add pages here. The 'scouting' page has special internal routing.
// ─────────────────────────────────────────────────────────────────────────────
export const NAVIGATION = [
  { name: 'HOME',     id: 'home'     },
  { name: 'ABOUT',   id: 'about'    },
  { name: 'TEAM',    id: 'team'     },
  { name: 'ROBOTS',  id: 'robots'   },
  { name: 'SPONSORS',id: 'sponsors' },
  { name: 'CONTACT', id: 'contact'  },
  { name: 'SCOUTING',id: 'scouting' },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MEMBERS
// Each member object:
//   name      string   Full name
//   role      string   Comma-separated roles (first role shown in previews)
//   image     string   Path from /public (e.g. /data/team/Dev.png)
//   initials  string   2-char fallback when image missing
//   rookie    boolean  Show "ROOKIE" badge in team page
//   season    string   e.g. "2025–26 Decode"
//   bio       string   (optional) Short paragraph shown in modal
// ─────────────────────────────────────────────────────────────────────────────
export const TEAM = {
  students: [
    {
      name: 'Dev Gavande',
      role: 'Team Captain, Founder, Driver, CAD Lead, Hardware Lead',
      image: '/data/team/Dev.png',
      initials: 'DG',
      rookie: false,
      season: '2025–26 Decode',
      bio: 'Founding member and team captain leading Wolverine Robotics through its inaugural season.',
    },
    {
      name: 'Sahejdeep Singh',
      role: 'Software Lead, Hardware, Drive Coach',
      image: '/data/team/sahejdeep.jpg',
      initials: 'SS',
      rookie: true,
      season: '2025–26 Decode',
    },
    {
      name: 'Sripaadh J Kuppusamy',
      role: 'Hardware, Human Player',
      image: '/data/team/sripadh.jpg',
      initials: 'SK',
      rookie: true,
      season: '2025–26 Decode',
    },
    {
      name: 'Manveer Singh Tib',
      role: 'Hardware, Human Player',
      image: '/data/team/manveer.jpg',
      initials: 'MT',
      rookie: true,
      season: '2025–26 Decode',
    },
    {
      name: 'Jivansh Pandya',
      role: 'Hardware',
      image: '/data/team/Jivansh.jpg',
      initials: 'JP',
      rookie: true,
      season: '2025–26 Decode',
    },
    {
      name: 'Jacob Esparza',
      role: 'Hardware',
      image: '/data/team/Jacob.jpeg',
      initials: 'JE',
      rookie: true,
      season: '2025–26 Decode',
    },
    {
      name: 'Kaiden Lee',
      role: 'Hardware',
      image: '/data/team/kaiden.jpg',
      initials: 'KL',
      rookie: true,
      season: '2025–26 Decode',
    },
    {
      name: 'Kalvik Das',
      role: 'Hardware',
      image: '/data/team/Kalvik.jpg',
      initials: 'KD',
      rookie: true,
      season: '2025–26 Decode',
    },
    {
      name: 'Alexander Fiderfish',
      role: 'Hardware',
      image: '/data/team/member9.jpg',
      initials: 'AF',
      rookie: true,
      season: '2025–26 Decode',
    },
    {
      name: 'Piousvir Singh',
      role: 'Outreach',
      image: '/data/team/pious.jpg',
      initials: 'PS',
      rookie: true,
      season: '2025–26 Decode',
    },
    {
      name: 'Pratham Erramilli',
      role: 'Outreach',
      image: '/data/team/pratham.jpg',
      initials: 'PE',
      rookie: true,
      season: '2025–26 Decode',
    },
    {
      name: 'Kavin Murugan',
      role: 'Outreach',
      image: '/data/team/kavin.jpg',
      initials: 'KM',
      rookie: true,
      season: '2025–26 Decode',
    },
  ],
  coaches: [
    {
      name: 'Mr. Ellis',
      role: 'Coach',
      image: '/data/team/ellis.jpg',
      initials: 'E',
      rookie: false,
      season: '2025–26 Decode',
    },
  ],
  mentors: [
    {
      name: 'Abdullah Khaled',
      role: 'Youth Software Mentor',
      image: '/data/team/abdullah.jpg',
      initials: 'AK',
      rookie: false,
      season: '2025–26 Decode',
      bio: 'Wolverine Robotics Youth Software Mentor guiding the team on software architecture and Java best practices.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PAST MEMBERS  (alumni — move entries here when they leave the team)
// Same shape as TEAM members. Season field = their final season.
// ─────────────────────────────────────────────────────────────────────────────
export const PAST_MEMBERS = [];
// Example:
// export const PAST_MEMBERS = [
//   {
//     name: 'Jane Doe',
//     role: 'Mechanical Lead',
//     image: '/data/team/jane.jpg',
//     initials: 'JD',
//     rookie: false,
//     season: '2025–26 Decode',
//     bio: 'Led mechanical design in the inaugural season.',
//   },
// ];


// ─────────────────────────────────────────────────────────────────────────────
// ROBOTS
// Each robot object:
//   id           string  Unique slug (used as React key)
//   name         string  Robot name
//   season       string  e.g. "2025-26"
//   challenge    string  FTC challenge name
//   description  string  One or two sentence overview
//   specs        Array   { label, value } pairs for the spec table
//   achievements Array   String list of competition achievements
//   subsystems   Array   See subsystem shape below
//   software     Object  { overview: string, features: [{ title, desc }] }
//
// SUBSYSTEM shape:
//   name     string  Display name
//   icon     string  Emoji or short symbol
//   brief    string  One-line card description
//   detail   string  Full paragraph for the detail panel
//   hardware string  (optional) Hardware callout (e.g. "2× REV HD Hex Motor")
//   features Array   (optional) Bullet points
//   metrics  Array   (optional) { label, value } shown as stat pills
// ─────────────────────────────────────────────────────────────────────────────
export const ROBOTS = [
  {
    id: 'matchstick-2025',
    name: 'MATCHSTICK',
    season: '2025-26',
    challenge: 'Decode Challenge',
    description:
      'Our debut machine. Built from the ground up for the 2025-26 FTC Decode Challenge, MATCHSTICK combines a mecanum drivetrain, precision linear lift, active roller intake, and servo-actuated claw into a cohesive, high-cycle competitive robot.',
    specs: [
      { label: 'WEIGHT',        value: '28 LBS'        },
      { label: 'HEIGHT',        value: '18 IN'         },
      { label: 'DRIVETRAIN',    value: 'MECANUM'       },
      { label: 'CONTROL HUB',  value: 'REV Control Hub'},
      { label: 'LANGUAGE',      value: 'JAVA 17'       },
      { label: 'CYCLE TIME',    value: '~3 SEC'        },
      { label: 'AUTO BALLS',    value: '12 (MAX)'      },
      { label: 'CHASSIS SIZE',  value: '18 × 18 IN'   },
    ],
    achievements: [
      '2× Control Award Winner',
      'Semi-Finalist · U-League Tournament',
      'Winner · Dallas Semi-Regional',
    ],
    subsystems: [
      {
        name: 'MECANUM DRIVETRAIN',
        icon: '◈',
        brief: 'Omnidirectional holonomic drive with full field strafing.',
        detail:
          'Four-wheel mecanum drivetrain powered by REV HD Hex motors and controlled through a REV Control Hub. Independent encoder feedback on each wheel enables accurate dead-reckoning odometry during autonomous. The holonomic configuration allows the robot to strafe, rotate, and translate simultaneously — critical for fast, precise field positioning.',
        hardware: '4× REV HD Hex Motor · REV Control Hub · Mecanum Wheel Set',
        features: [
          'Full omnidirectional movement at competition speed',
          'Dead-reckoning odometry via wheel encoders',
          'IMU-corrected heading hold during teleop',
          'Max speed ~1.4 m/s at full throttle',
        ],
        metrics: [
          { label: 'MAX SPEED',  value: '1.4 m/s' },
          { label: 'ACCURACY',   value: '±1 cm'   },
          { label: 'RESPONSE',   value: '<50ms'   },
        ],
      },
      {
        name: 'LINEAR LIFT',
        icon: '⬆',
        brief: 'Dual-rail linear slide reaching full extension in ~1.2s.',
        detail:
          'Dual-rail linear slide assembly driven by a high-torque motor with a string-and-spool take-up mechanism. Encoder position feedback enables automated pre-set heights for consistent scoring. Full extension achieves the maximum scoring height for the Decode Challenge game elements while remaining within the legal 18-inch starting configuration.',
        hardware: '1× REV Core Hex Motor · Linear Slide Rails · Encoder Spool',
        features: [
          'Four automated height presets (home, low, mid, high)',
          'Encoder-based position hold under load',
          'Gravity-compensated descent profile',
          'Full extension in under 1.2 seconds',
        ],
        metrics: [
          { label: 'MAX HEIGHT',  value: '28 IN'   },
          { label: 'EXT. TIME',   value: '1.2 SEC' },
          { label: 'PRESETS',     value: '4'       },
        ],
      },
      {
        name: 'INTAKE SYSTEM',
        icon: '⊙',
        brief: 'Active roller intake capturing elements from the floor.',
        detail:
          'Active roller intake using compliant rubber rollers driven by a servo motor. The intake width is calibrated to the game element geometry, enabling consistent floor-level pickup without requiring precise driver aim. An intake detection sensor triggers automatic element acquisition sequences.',
        hardware: 'Servo Motor · Compliant Rollers · REV Color Sensor',
        features: [
          'Compliant roller compliance for off-angle pickup',
          'Automatic element detection via color sensor',
          'Intake-to-lift transfer in a single button press',
          'Floor pickup from full robot width',
        ],
        metrics: [
          { label: 'PICKUP TIME', value: '0.4 SEC' },
          { label: 'WIDTH',       value: '14 IN'   },
          { label: 'SENSOR',      value: 'COLOR'   },
        ],
      },
      {
        name: 'CLAW ASSEMBLY',
        icon: '✦',
        brief: 'Servo-driven dual-finger gripper with tactile compliance.',
        detail:
          'Dual-finger claw actuated by two independent servo motors, allowing variable grip width for different game element orientations. Integrated into the automated scoring macro: driver triggers the sequence, robot extends lift to preset height, opens claw, advances, closes, and retracts — targeting a 3-second end-to-end cycle.',
        hardware: '2× Servo Motors · Claw Finger Assembly',
        features: [
          'Variable grip width for different element sizes',
          'Automated scoring macro (single button)',
          'Servo torque hold prevents dropping under load',
          'Consistent placement within ±5mm',
        ],
        metrics: [
          { label: 'CYCLE TIME', value: '~3 SEC'  },
          { label: 'ACCURACY',   value: '±5 MM'   },
          { label: 'GRIP FORCE', value: '8 N·m'   },
        ],
      },
    ],
    software: {
      overview:
        'Custom Java 17 codebase built on the FTC SDK. Modular architecture separates hardware abstraction, autonomous path planning, and driver-control logic — enabling clean iteration and confident code merges between competitions.',
      features: [
        {
          title: 'MODULAR HARDWARE ABSTRACTION',
          desc: 'Each subsystem (drivetrain, lift, intake, claw) is its own class. Swapping hardware means changing one file, not the whole codebase.',
        },
        {
          title: '12-BALL AUTONOMOUS PATH',
          desc: 'Pre-programmed path using encoder dead-reckoning and IMU heading correction. Scores up to 12 game elements without driver input.',
        },
        {
          title: 'AUTOMATED CYCLE MACROS',
          desc: 'Driver presses one button; software handles lift extension, claw positioning, scoring, and retraction in under 3 seconds.',
        },
        {
          title: 'TUNABLE CONSTANTS FILE',
          desc: 'All PID gains, heights, speeds, and autonomous path coordinates live in a single constants file — easy to tune at competition.',
        },
      ],
    },
  },

  // ── Add future robots below ─────────────────────────────────────
  // {
  //   id: 'new-robot-2026',
  //   name: 'IRONCLAD',
  //   season: '2026-27',
  //   challenge: 'Next Challenge Name',
  //   description: '...',
  //   specs: [...],
  //   achievements: [],
  //   subsystems: [...],
  //   software: { ... },
  // },
];


// ─────────────────────────────────────────────────────────────────────────────
// SPONSORS
// Each sponsor object:
//   id          string  Unique slug
//   name        string  Display name
//   image       string  Path from /public (e.g. /data/sponsors/whs.png)
//   tier        string  'platinum' | 'gold' | 'silver' | 'default'
//   description string  (optional) One-line tagline shown under name
//   url         string  (optional) Link to sponsor website
// ─────────────────────────────────────────────────────────────────────────────
export const SPONSORS = [
  {
    id: 'wakeland-hs',
    name: 'Wakeland High School',
    image: '/data/sponsors/whs.png',
    tier: 'platinum',
    description: 'Home school & primary program supporter',
    url: 'https://www.friscoisd.org/schools/high/wakeland',
  },
  {
    id: 'wakeland-nhs',
    name: 'Wakeland High School NHS',
    image: '/data/sponsors/nhs.png',
    tier: 'gold',
    description: 'National Honor Society chapter sponsor',
  },

  // ── Add sponsors below ──────────────────────────────────────────
  // {
  //   id: 'company-slug',
  //   name: 'Company Name',
  //   image: '/data/sponsors/company.png',
  //   tier: 'gold',
  //   description: 'Short description',
  //   url: 'https://company.com',
  // },
];
