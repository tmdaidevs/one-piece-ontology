export const CATEGORIES = [
  "Character",
  "Crew",
  "Island",
  "Organization",
  "Devil Fruit",
  "Event"
];

export const ontologyEntities = [
  {
    id: "char-monkey-d-luffy",
    category: "Character",
    name: "Monkey D. Luffy",
    summary: "Captain of the Straw Hat Pirates and the central figure chasing the One Piece.",
    attributes: {
      affiliation: "Straw Hat Pirates",
      role: "Captain",
      origin: "Dawn Island",
      bounty: "3,000,000,000"
    },
    tags: ["Worst Generation", "Emperor", "Nika"],
    relations: [
      { type: "captains", target: "crew-straw-hat-pirates" },
      { type: "ate", target: "fruit-hito-hito-model-nika" },
      { type: "ally-of", target: "char-roronoa-zoro" },
      { type: "ally-of", target: "char-nami" },
      { type: "ally-of", target: "char-nico-robin" },
      { type: "enemy-of", target: "org-world-government" },
      { type: "fought-in", target: "event-marineford-war" }
    ]
  },
  {
    id: "char-roronoa-zoro",
    category: "Character",
    name: "Roronoa Zoro",
    summary: "Master swordsman of the Straw Hat Pirates aiming to become the world's strongest swordsman.",
    attributes: {
      affiliation: "Straw Hat Pirates",
      role: "Combatant",
      origin: "East Blue",
      fightingStyle: "Three Sword Style"
    },
    tags: ["Swordsman", "Haki", "Worst Generation"],
    relations: [
      { type: "member-of", target: "crew-straw-hat-pirates" },
      { type: "loyal-to", target: "char-monkey-d-luffy" },
      { type: "present-at", target: "event-enies-lobby-incident" }
    ]
  },
  {
    id: "char-nami",
    category: "Character",
    name: "Nami",
    summary: "Navigator of the Straw Hat Pirates and cartographer of her dream world map.",
    attributes: {
      affiliation: "Straw Hat Pirates",
      role: "Navigator",
      origin: "Conomi Islands",
      specialty: "Meteorology"
    },
    tags: ["Navigator", "East Blue", "Cartography"],
    relations: [
      { type: "member-of", target: "crew-straw-hat-pirates" },
      { type: "ally-of", target: "char-monkey-d-luffy" },
      { type: "involved-in", target: "event-enies-lobby-incident" },
      { type: "visited", target: "island-alabasta" }
    ]
  },
  {
    id: "char-nico-robin",
    category: "Character",
    name: "Nico Robin",
    summary: "Archaeologist of the Straw Hat Pirates and one of the few who can read Poneglyphs.",
    attributes: {
      affiliation: "Straw Hat Pirates",
      role: "Archaeologist",
      origin: "Ohara",
      expertise: "Ancient History"
    },
    tags: ["Poneglyph", "Ohara", "Scholar"],
    relations: [
      { type: "member-of", target: "crew-straw-hat-pirates" },
      { type: "ate", target: "fruit-hana-hana-no-mi" },
      { type: "targeted-by", target: "org-world-government" },
      { type: "rescued-in", target: "event-enies-lobby-incident" }
    ]
  },
  {
    id: "char-marshall-d-teach",
    category: "Character",
    name: "Marshall D. Teach (Blackbeard)",
    summary: "Ambitious emperor who commands the Blackbeard Pirates and seeks ultimate power.",
    attributes: {
      affiliation: "Blackbeard Pirates",
      role: "Captain",
      title: "Emperor",
      bounty: "3,996,000,000"
    },
    tags: ["Emperor", "D.", "Rival"],
    relations: [
      { type: "captains", target: "crew-blackbeard-pirates" },
      { type: "ate", target: "fruit-yami-yami-no-mi" },
      { type: "enemy-of", target: "char-monkey-d-luffy" },
      { type: "triggered", target: "event-marineford-war" }
    ]
  },
  {
    id: "crew-straw-hat-pirates",
    category: "Crew",
    name: "Straw Hat Pirates",
    summary: "A pirate crew united by Luffy's dream, known for liberating nations and challenging oppression.",
    attributes: {
      captain: "Monkey D. Luffy",
      ship: "Thousand Sunny",
      status: "Emperor Crew",
      origin: "East Blue"
    },
    tags: ["Yonko Crew", "Adventure", "Freedom"],
    relations: [
      { type: "led-by", target: "char-monkey-d-luffy" },
      { type: "includes", target: "char-roronoa-zoro" },
      { type: "includes", target: "char-nami" },
      { type: "includes", target: "char-nico-robin" },
      { type: "opposes", target: "org-world-government" },
      { type: "fought-in", target: "event-enies-lobby-incident" },
      { type: "visited", target: "island-egghead" }
    ]
  },
  {
    id: "crew-blackbeard-pirates",
    category: "Crew",
    name: "Blackbeard Pirates",
    summary: "A ruthless crew that rapidly rose to emperor-level influence under Teach.",
    attributes: {
      captain: "Marshall D. Teach",
      ship: "Saber of Xebec",
      status: "Emperor Crew",
      notoriety: "Extreme"
    },
    tags: ["Yonko Crew", "Ruthless", "Power Seizing"],
    relations: [
      { type: "led-by", target: "char-marshall-d-teach" },
      { type: "rivals", target: "crew-straw-hat-pirates" },
      { type: "clashes-with", target: "org-marines" }
    ]
  },
  {
    id: "island-dawn-island",
    category: "Island",
    name: "Dawn Island",
    summary: "East Blue island where Luffy grew up in Foosha Village and Mount Colubo.",
    attributes: {
      sea: "East Blue",
      notablePlace: "Foosha Village",
      significance: "Luffy's upbringing"
    },
    tags: ["East Blue", "Origin", "Goa Kingdom"],
    relations: [
      { type: "birthplace-of", target: "char-monkey-d-luffy" },
      { type: "part-of", target: "org-world-government" }
    ]
  },
  {
    id: "island-alabasta",
    category: "Island",
    name: "Alabasta",
    summary: "Desert kingdom saved by the Straw Hats from a major conspiracy.",
    attributes: {
      region: "Paradise",
      ruler: "Nefertari Family",
      climate: "Desert"
    },
    tags: ["Kingdom", "Civil War", "Poneglyph"],
    relations: [
      { type: "allied-with", target: "crew-straw-hat-pirates" },
      { type: "recognized-by", target: "org-world-government" },
      { type: "visited-by", target: "char-nami" }
    ]
  },
  {
    id: "island-egghead",
    category: "Island",
    name: "Egghead",
    summary: "Future island hosting Dr. Vegapunk's laboratory and major world-shaking incidents.",
    attributes: {
      sea: "New World",
      specialty: "Advanced Science",
      label: "Island of the Future"
    },
    tags: ["Vegapunk", "Technology", "World Government Siege"],
    relations: [
      { type: "site-of", target: "event-egghead-incident" },
      { type: "visited-by", target: "crew-straw-hat-pirates" },
      { type: "contested-by", target: "org-marines" }
    ]
  },
  {
    id: "org-world-government",
    category: "Organization",
    name: "World Government",
    summary: "Global ruling authority exerting political and military control through multiple institutions.",
    attributes: {
      seat: "Mary Geoise",
      militaryArm: "Marines",
      intelligenceArm: "Cipher Pol"
    },
    tags: ["Authority", "Celestial Dragons", "Imu"],
    relations: [
      { type: "commands", target: "org-marines" },
      { type: "opposes", target: "crew-straw-hat-pirates" },
      { type: "opposes", target: "org-revolutionary-army" },
      { type: "targeted", target: "char-nico-robin" },
      { type: "engaged-in", target: "event-enies-lobby-incident" }
    ]
  },
  {
    id: "org-marines",
    category: "Organization",
    name: "Marines",
    summary: "Primary naval force enforcing World Government order across the seas.",
    attributes: {
      supremeCommander: "Fleet Admiral",
      parentOrg: "World Government",
      mission: "Law Enforcement"
    },
    tags: ["Navy", "Justice", "Admirals"],
    relations: [
      { type: "serves", target: "org-world-government" },
      { type: "fought-in", target: "event-marineford-war" },
      { type: "engaged-with", target: "crew-blackbeard-pirates" },
      { type: "deployed-to", target: "island-egghead" }
    ]
  },
  {
    id: "org-revolutionary-army",
    category: "Organization",
    name: "Revolutionary Army",
    summary: "Organization working to topple the World Government and free oppressed nations.",
    attributes: {
      leader: "Monkey D. Dragon",
      mission: "Overthrow Global Tyranny",
      operationalStyle: "Cells and Uprisings"
    },
    tags: ["Rebellion", "Dragon", "Liberation"],
    relations: [
      { type: "opposes", target: "org-world-government" },
      { type: "indirectly-allied-with", target: "char-monkey-d-luffy" }
    ]
  },
  {
    id: "fruit-hito-hito-model-nika",
    category: "Devil Fruit",
    name: "Hito Hito no Mi, Model: Nika",
    summary: "Mythical Zoan fruit whose awakened power grants Luffy freedom-themed abilities.",
    attributes: {
      type: "Mythical Zoan",
      user: "Monkey D. Luffy",
      formerName: "Gomu Gomu no Mi"
    },
    tags: ["Mythical Zoan", "Awakening", "Joy Boy"],
    relations: [
      { type: "consumed-by", target: "char-monkey-d-luffy" },
      { type: "sought-by", target: "org-world-government" }
    ]
  },
  {
    id: "fruit-yami-yami-no-mi",
    category: "Devil Fruit",
    name: "Yami Yami no Mi",
    summary: "Logia fruit that manipulates darkness and can nullify other devil fruit powers.",
    attributes: {
      type: "Logia",
      user: "Marshall D. Teach",
      trait: "Ability nullification"
    },
    tags: ["Darkness", "Logia", "Power Nullification"],
    relations: [
      { type: "consumed-by", target: "char-marshall-d-teach" },
      { type: "used-in", target: "event-marineford-war" }
    ]
  },
  {
    id: "fruit-hana-hana-no-mi",
    category: "Devil Fruit",
    name: "Hana Hana no Mi",
    summary: "Paramecia fruit allowing Robin to sprout body parts on surfaces, including giant forms.",
    attributes: {
      type: "Paramecia",
      user: "Nico Robin",
      trait: "Limb replication"
    },
    tags: ["Paramecia", "Assassination", "Support Combat"],
    relations: [
      { type: "consumed-by", target: "char-nico-robin" },
      { type: "used-in", target: "event-enies-lobby-incident" }
    ]
  },
  {
    id: "event-enies-lobby-incident",
    category: "Event",
    name: "Enies Lobby Incident",
    summary: "Major confrontation where the Straw Hats declared war on the World Government to rescue Robin.",
    attributes: {
      location: "Enies Lobby",
      outcome: "Robin rescued",
      impact: "Straw Hat global notoriety"
    },
    tags: ["Rescue", "CP9", "Declaration of War"],
    relations: [
      { type: "involved", target: "crew-straw-hat-pirates" },
      { type: "involved", target: "org-world-government" },
      { type: "featured", target: "char-nico-robin" },
      { type: "featured", target: "char-roronoa-zoro" }
    ]
  },
  {
    id: "event-marineford-war",
    category: "Event",
    name: "Marineford War",
    summary: "Historic war between Marine Headquarters and Whitebeard's forces that reshaped the era.",
    attributes: {
      location: "Marineford",
      outcome: "Whitebeard and Ace fell",
      impact: "Power balance shifted"
    },
    tags: ["Summit War", "Era Shift", "Global Broadcast"],
    relations: [
      { type: "involved", target: "org-marines" },
      { type: "involved", target: "char-monkey-d-luffy" },
      { type: "catalyzed-by", target: "char-marshall-d-teach" },
      { type: "featured", target: "fruit-yami-yami-no-mi" }
    ]
  },
  {
    id: "event-egghead-incident",
    category: "Event",
    name: "Egghead Incident",
    summary: "Escalating conflict on Egghead involving Vegapunk, the Straw Hats, and world powers.",
    attributes: {
      location: "Egghead",
      status: "Ongoing / unfolding",
      impact: "Potential world order disruption"
    },
    tags: ["Vegapunk", "Siege", "Geopolitical Shock"],
    relations: [
      { type: "occurs-on", target: "island-egghead" },
      { type: "involves", target: "crew-straw-hat-pirates" },
      { type: "involves", target: "org-marines" }
    ]
  }
];
