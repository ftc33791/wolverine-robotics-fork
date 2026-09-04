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
    // Onshape "Get embeddable link" URLs (Share -> enable public link -> Get embeddable link).
    embedUrl: 'https://cad.onshape.com/documents/17f03dbe502fe89245df5c8e/w/299875b13b5c5a7fb4f2fce9/e/e5a8145177c9892ee22d79c2?renderMode=0&uiState=6a3efcc36deca8d7fe72565a',
    embedUrlExploded: 'https://cad.onshape.com/documents/66f7bbd4e3c3defe039f33a2/w/9fdcf529e51f48ce7b9bb6cb/e/e31fe1c262242588d0dc90b8?renderMode=0&uiState=6a3f00dbae8c7e4546eec16b',
    description:
      'Our debut machine for the 2025-26 FTC Decode Challenge. MATCHSTICK pairs an all-metal direct-drive mecanum chassis with a funneling ground intake, high-compression indexer, and triple-flywheel shooter for rapid, reliable artifact scoring.',
    specs: [
      { label: 'WEIGHT',        value: '28 LBS'        },
      { label: 'HEIGHT',        value: '18 IN'         },
      { label: 'DRIVETRAIN',    value: 'MECANUM'       },
      { label: 'CONTROL HUB',  value: 'REV Control Hub'},
      { label: 'LANGUAGE',      value: 'JAVA 17'       },
      { label: 'CYCLE TIME',    value: '3.8 SEC'           },
      { label: 'AUTO CLOSE',    value: '12 BALLS · 41–45 PTS' },
      { label: 'AUTO FAR',      value: '9 BALLS · 38–42 PTS'  },
      { label: 'SHOT BURST',    value: '0.95 SEC (3)'      },
      { label: 'VISION ALIGN',  value: '92%'               },
      { label: 'CHASSIS SIZE',  value: '18 × 18 IN'        },
    ],
    achievements: [
      '2× Control Award Winner',
      'Semi-Finalist · U-League Tournament',
      'Winner · Dallas Semi-Regional',
    ],
    subsystems: [
      {
        name: 'ALL-METAL DRIVEBASE',
        icon: '◈',
        brief: 'Direct-drive mecanum chassis with modular COTS extrusion and odometry pods.',
        detail:
          'Full metal chassis built from goBILDA extrusions and T-brackets for modular subsystem mounting. Direct-drive mecanum wheels eliminate belt and gear losses for higher torque efficiency. Two swingarm odometry pods integrate with the Pinpoint computer for PedroPathing autonomous positioning.',
        hardware: '4× REV HD Hex Motor · Mecanum Wheels · 2× Swingarm Odometry Pods · goBILDA Pinpoint',
        features: [
          'Direct-drive mecanum — no belts or gears on drivetrain',
          'All-metal COTS extrusion frame for structural integrity',
          'Modular T-bracket mounting for rapid subsystem swaps',
          'PedroPathing with Pinpoint IMU and swingarm dead wheels (1500 Hz)',
          'Field-centric teleop via Pinpoint IMU (adopted Meet 3)',
        ],
        metrics: [
          { label: 'DRIVE TYPE', value: 'Direct'    },
          { label: 'CHASSIS',    value: 'All-metal' },
          { label: 'ODOMETRY',   value: '2× Pods'   },
        ],
      },
      {
        name: 'FUNNELING INTAKE',
        icon: '⊙',
        brief: 'Multi-roller ground intake with deflection wedges and wide-angle pickup.',
        detail:
          'Tapered compliant wheels and flap wheels morph to artifact shape for efficient ground pickup from a large angle. Custom 30° deflection wedges center artifacts into the indexer path. A 312 RPM motor through a 1:2 gear ratio transfers artifacts reliably. Limelight 3A is mounted on the intake-side C-channel to reduce vibration during vision tracking.',
        hardware: '312 RPM Motor · 1:2 Gearbox · Compliant & Flap Wheels · Limelight 3A',
        features: [
          'Tapered compliant and flap wheels for off-angle pickup',
          '30° deflection wedges reduce lateral scatter',
          '312 RPM motor with 1:2 gear ratio to indexer',
          'Limelight 3A on intake-side mount for low vibration',
          '30% infill plates for impact durability',
        ],
        metrics: [
          { label: 'MOTOR',       value: '312 RPM' },
          { label: 'GEAR RATIO',  value: '1:2'     },
          { label: 'WEDGE ANGLE', value: '30°'     },
        ],
      },
      {
        name: 'HIGH-COMPRESSION INDEXER',
        icon: '⬡',
        brief: 'Independent-motor indexer with dual 3" compliant wheels and controlled compression.',
        detail:
          'The indexer runs on its own motor, independently from the intake and shooter, allowing precise timing and jam recovery without affecting other systems. Dual 3-inch compliant wheels provide greater contact area for consistent feed rates. High-compression geometry centers each artifact before it enters the shooter, reducing bounce and misalignment.',
        hardware: 'Independent Indexer Motor · 2× 3" Compliant Wheels',
        features: [
          'Separate motor — independent of intake and shooter',
          'Dual 3" compliant wheels for grip and consistent feed',
          'High-compression geometry centers artifacts pre-shot',
          'Reverse or stop without affecting other subsystems',
          'Minimizes jamming during rapid artifact cycling',
        ],
        metrics: [
          { label: 'WHEELS',  value: '3" Compliant' },
          { label: 'CONTROL', value: 'Independent'  },
          { label: 'MODE',    value: 'Dual'         },
        ],
      },
      {
        name: 'TRIPLE-FLYWHEEL SHOOTER',
        icon: '✦',
        brief: 'Dual-motor flywheel shooter with PID control and fixed hood compression.',
        detail:
          'Dual REV HD Hex motors drive three flywheels through dual GT2 3 mm belts with quadruple bearing support. 72 mm steel flywheels (1.24 lb combined) inside 96 mm Rhino 30A traction wheels deliver consistent exit velocity. Closed-loop PID maintains RPM for rapid fire — all three artifacts in 0.95 seconds. A fixed hood provides consistent compression; distance is tuned via RPM adjustment.',
        hardware: '2× REV HD Hex · Dual GT2 Belts · 72 mm Steel Flywheels · Rhino 30A Wheels',
        features: [
          'Closed-loop PID flywheel speed control',
          '3 artifacts fired in 0.95 seconds',
          'Dual GT2 belt drive with quadruple bearing support',
          'Fixed hood — distance controlled by RPM, not mechanics',
          'Interpolated RPM lookup table for any-field scoring',
        ],
        metrics: [
          { label: 'SHOT BURST', value: '0.95 SEC'     },
          { label: 'FLYWHEEL',   value: '72 mm Steel'  },
          { label: 'MOTORS',     value: '2× REV HD Hex' },
        ],
      },
    ],
    software: {
      overview:
        'Custom Java 17 codebase built on the FTC SDK. PedroPathing drives autonomous routines fused with goBILDA Pinpoint IMU and swingarm dead-wheel odometry. TeleOp layers field-centric driving, Limelight 3A AprilTag alignment, and an interpolated RPM lookup table — enabling clean iteration between competitions.',
      features: [
        {
          title: 'DUAL AUTONOMOUS ROUTINES',
          desc: 'Alliance-adaptive paths for close zone (12 balls, 41–45 pts) and far zone (9 balls, 38–42 pts). Multiple routines let us adapt to partner playstyle.',
        },
        {
          title: 'PEDROPATHING + PINPOINT ODOMETRY',
          desc: 'Switched from unreliable encoder-only pathing to PedroPathing. Pinpoint IMU and swingarm dead wheels fused at 1500 Hz for precise autonomous positioning.',
        },
        {
          title: 'LIMELIGHT 3A AUTO-ALIGN',
          desc: 'Closed-loop AprilTag tracking with a custom distance-offset algorithm. Alignment accuracy improved from 48% to 92%, with a 70% gain in far-zone scoring.',
        },
        {
          title: 'FIELD-CENTRIC ONE-CONTROLLER TELEOP',
          desc: 'Single-driver layout eliminates operator communication overhead. Field-centric drive powered by the Pinpoint IMU, adopted for Meet 3 and beyond.',
        },
        {
          title: 'VELOCITY LOOKUP TABLE + PID FLYWHEEL',
          desc: 'Interpolated RPM-by-distance table cut scoring cycles from 6.5s to 3.8s (41.5% faster). Closed-loop PID fires all three artifacts in 0.95 seconds.',
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
// HOME PAGE HIGHLIGHTS
// Shared performance stats for HomePage — keep in sync with ROBOTS[0] specs.
// statBar entries: { num, suffix, label, decimals?, static? }
// ─────────────────────────────────────────────────────────────────────────────
export const HOME_HIGHLIGHTS = {
  statBar: [
    { num: 12, suffix: '', label: 'TEAM MEMBERS' },
    { num: 28, suffix: ' LBS', label: 'ROBOT WEIGHT' },
    { num: 0.95, suffix: 'S', label: '3-SHOT BURST', decimals: 2 },
    { num: 2, suffix: 'X', label: 'CONTROL AWARD' },
  ],
  spotlightSpecs: [
    ['WEIGHT', '28 LBS'],
    ['HEIGHT', '18 IN'],
    ['DRIVETRAIN', 'MECANUM'],
    ['LANGUAGE', 'JAVA 17'],
    ['CYCLE TIME', '3.8 SEC'],
    ['AUTONOMY', '12 / 9 BALL'],
  ],
  achievementBadges: [
    '2× CONTROL AWARD',
    'SEMI-FINALIST · U-LEAGUE',
    'WINNER · DALLAS SEMI-REGIONAL',
    'DUAL AUTO ROUTINES',
    '3.8S CYCLE TIME',
    '92% VISION ALIGN',
  ],
};


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
