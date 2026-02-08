export type DomainId =
  | "space"
  | "nature"
  | "physics"
  | "chemistry"
  | "earth"
  | "ocean"
  | "mind"
  | "engineering"
  | "computing"
  | "math";

export type DomainDefinition = {
  id: DomainId;
  label: string;
  description: string;
  topics: string[];
};

export const DOMAIN_DEFINITIONS: DomainDefinition[] = [
  {
    id: "space",
    label: "Space Science",
    description: "Planets, stars, and the big cosmic story.",
    topics: [
      "Black holes (intro)",
      "Galaxies and scale",
      "Gravity and orbits",
      "Solar system tours",
      "Space travel (realistic)",
      "Stars and life cycles",
    ],
  },
  {
    id: "nature",
    label: "Biology & Nature",
    description: "Living systems from cells to ecosystems.",
    topics: [
      "Animals & behavior",
      "Cells & tiny machines",
      "DNA & inheritance",
      "Ecosystems & food webs",
      "Evolution (intro)",
      "Plants & photosynthesis",
    ],
  },
  {
    id: "physics",
    label: "Physics",
    description: "Forces, energy, motion, and the rules of matter.",
    topics: [
      "Electricity & magnetism",
      "Energy & work",
      "Forces & motion",
      "Light & optics",
      "Heat & thermodynamics",
      "Waves & sound",
    ],
  },
  {
    id: "chemistry",
    label: "Chemistry",
    description: "Atoms, reactions, and how materials change.",
    topics: [
      "Acids & bases",
      "Atoms & bonds",
      "Chemistry in nature",
      "Materials (polymers, metals)",
      "Mixtures & solutions",
      "Reactions",
    ],
  },
  {
    id: "earth",
    label: "Earth Science",
    description: "Weather, geology, and the planet’s systems.",
    topics: [
      "Natural hazards",
      "Plate tectonics",
      "Rocks & minerals",
      "Volcanoes & earthquakes",
      "Water cycle",
      "Weather & storms",
    ],
  },
  {
    id: "ocean",
    label: "Oceans",
    description: "Currents, waves, and life under water.",
    topics: [
      "Coral reefs (intro)",
      "Ocean currents",
      "Sea life systems",
      "Tides and gravity",
      "Water pressure",
      "Waves and energy",
    ],
  },
  {
    id: "mind",
    label: "Mind & Brain",
    description: "How thinking, learning, and memory work.",
    topics: [
      "Attention & focus",
      "Emotions (intro)",
      "Memory basics",
      "Neurons & signals",
      "Senses & perception",
      "Sleep & the brain",
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    description: "Designing structures and useful systems.",
    topics: [
      "Design & prototyping",
      "Energy systems",
      "Machines & simple tools",
      "Materials engineering",
      "Robotics (safe)",
      "Structures & bridges",
    ],
  },
  {
    id: "computing",
    label: "Computer Science",
    description: "Algorithms, data, and digital systems.",
    topics: [
      "AI & learning (conceptual)",
      "Algorithms (kid metaphors)",
      "Data & compression",
      "Databases as libraries",
      "Networks & internet",
      "Security (safe habits)",
    ],
  },
  {
    id: "math",
    label: "Math & Patterns",
    description: "Structures, patterns, and scientific thinking.",
    topics: [
      "Big numbers & scale",
      "Estimation",
      "Geometry in nature",
      "Graphs & functions",
      "Measurement & units",
      "Patterns",
      "Probability",
    ],
  },
];

const PHRASE_OVERRIDES: Array<{
  pattern: RegExp;
  domain: DomainId;
  boost?: number;
}> = [
  {
    pattern: /space[-\s]?time|spacetime|relativity/i,
    domain: "physics",
    boost: 6,
  },
  {
    pattern: /space travel|astronaut|rocket|orbit/i,
    domain: "space",
    boost: 6,
  },
  {
    pattern: /\bin space\b|outer space|space station/i,
    domain: "space",
    boost: 6,
  },
  {
    pattern: /space to grow|space needed|space do .* need/i,
    domain: "nature",
    boost: 6,
  },
  {
    pattern: /space between|how much space|area of|square|volume/i,
    domain: "math",
    boost: 4,
  },
  {
    pattern: /ocean|sea|tide|current|reef|underwater/i,
    domain: "ocean",
    boost: 5,
  },
];

const DOMAIN_KEYWORDS: Record<
  DomainId,
  Array<{ term: string; weight: number }>
> = {
  space: [
    { term: "space", weight: 1 },
    { term: "solar system", weight: 4 },
    { term: "planet", weight: 3 },
    { term: "star", weight: 3 },
    { term: "stars", weight: 3 },
    { term: "galaxy", weight: 4 },
    { term: "galaxies", weight: 4 },
    { term: "universe", weight: 3 },
    { term: "cosmic", weight: 4 },
    { term: "black hole", weight: 5 },
    { term: "black holes", weight: 5 },
    { term: "gravity", weight: 2 },
    { term: "telescope", weight: 3 },
  ],
  nature: [
    { term: "cell", weight: 2 },
    { term: "dna", weight: 4 },
    { term: "plant", weight: 3 },
    { term: "tree", weight: 3 },
    { term: "leaf", weight: 2 },
    { term: "animal", weight: 3 },
    { term: "ecosystem", weight: 4 },
    { term: "photosynthesis", weight: 5 },
    { term: "evolution", weight: 3 },
    { term: "biology", weight: 4 },
  ],
  physics: [
    { term: "force", weight: 3 },
    { term: "motion", weight: 3 },
    { term: "energy", weight: 3 },
    { term: "wave", weight: 3 },
    { term: "waves", weight: 3 },
    { term: "sound", weight: 2 },
    { term: "light", weight: 2 },
    { term: "electricity", weight: 4 },
    { term: "magnet", weight: 3 },
    { term: "magnetism", weight: 3 },
    { term: "heat", weight: 3 },
    { term: "thermo", weight: 3 },
    { term: "thermodynamics", weight: 5 },
  ],
  chemistry: [
    { term: "atom", weight: 4 },
    { term: "atoms", weight: 4 },
    { term: "molecule", weight: 4 },
    { term: "molecules", weight: 4 },
    { term: "bond", weight: 3 },
    { term: "reaction", weight: 4 },
    { term: "reactions", weight: 4 },
    { term: "acid", weight: 3 },
    { term: "base", weight: 3 },
    { term: "mixture", weight: 2 },
    { term: "solution", weight: 2 },
    { term: "solutions", weight: 2 },
    { term: "polymer", weight: 3 },
    { term: "polymers", weight: 3 },
    { term: "metal", weight: 3 },
    { term: "metals", weight: 3 },
    { term: "chemical", weight: 4 },
  ],
  earth: [
    { term: "weather", weight: 4 },
    { term: "storm", weight: 3 },
    { term: "storms", weight: 3 },
    { term: "climate", weight: 4 },
    { term: "rock", weight: 3 },
    { term: "rocks", weight: 3 },
    { term: "mineral", weight: 3 },
    { term: "minerals", weight: 3 },
    { term: "volcano", weight: 4 },
    { term: "volcanoes", weight: 4 },
    { term: "earthquake", weight: 4 },
    { term: "earthquakes", weight: 4 },
    { term: "tectonic", weight: 4 },
    { term: "plate", weight: 3 },
    { term: "plates", weight: 3 },
    { term: "water cycle", weight: 3 },
    { term: "soil", weight: 2 },
  ],
  ocean: [
    { term: "ocean", weight: 4 },
    { term: "sea", weight: 3 },
    { term: "tide", weight: 3 },
    { term: "tides", weight: 3 },
    { term: "current", weight: 3 },
    { term: "currents", weight: 3 },
    { term: "reef", weight: 4 },
    { term: "marine", weight: 3 },
    { term: "underwater", weight: 3 },
  ],
  mind: [
    { term: "brain", weight: 4 },
    { term: "mind", weight: 3 },
    { term: "memory", weight: 3 },
    { term: "neuron", weight: 4 },
    { term: "sleep", weight: 3 },
    { term: "emotion", weight: 2 },
    { term: "learning", weight: 2 },
    { term: "attention", weight: 2 },
  ],
  engineering: [
    { term: "machine", weight: 3 },
    { term: "machines", weight: 3 },
    { term: "bridge", weight: 3 },
    { term: "bridges", weight: 3 },
    { term: "structure", weight: 3 },
    { term: "structures", weight: 3 },
    { term: "design", weight: 2 },
    { term: "robot", weight: 3 },
    { term: "robotics", weight: 3 },
    { term: "system", weight: 2 },
    { term: "engineer", weight: 4 },
  ],
  computing: [
    { term: "algorithm", weight: 4 },
    { term: "algorithms", weight: 4 },
    { term: "data", weight: 3 },
    { term: "network", weight: 3 },
    { term: "networks", weight: 3 },
    { term: "internet", weight: 4 },
    { term: "security", weight: 3 },
    { term: "ai", weight: 3 },
    { term: "code", weight: 3 },
    { term: "computer", weight: 4 },
    { term: "database", weight: 3 },
    { term: "databases", weight: 3 },
  ],
  math: [
    { term: "math", weight: 3 },
    { term: "pattern", weight: 3 },
    { term: "patterns", weight: 3 },
    { term: "probability", weight: 4 },
    { term: "graph", weight: 3 },
    { term: "graphs", weight: 3 },
    { term: "function", weight: 3 },
    { term: "geometry", weight: 3 },
    { term: "measure", weight: 3 },
    { term: "estimate", weight: 2 },
  ],
};

function countTermMatches(query: string, term: string) {
  const normalized = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${normalized}\\b`, "gi");
  const matches = query.match(regex);
  return matches ? matches.length : 0;
}

export function classifyDomain(query: string): DomainId {
  const normalized = query.toLowerCase();
  const scores: Record<DomainId, number> = {
    space: 0,
    nature: 0,
    physics: 0,
    chemistry: 0,
    earth: 0,
    ocean: 0,
    mind: 0,
    engineering: 0,
    computing: 0,
    math: 0,
  };

  for (const override of PHRASE_OVERRIDES) {
    if (override.pattern.test(query)) {
      scores[override.domain] += override.boost ?? 5;
    }
  }

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const typedDomain = domain as DomainId;
    for (const { term, weight } of keywords) {
      const matches = countTermMatches(normalized, term);
      if (matches > 0) {
        scores[typedDomain] += matches * weight;
      }
    }
  }

  let bestDomain: DomainId = "space";
  let bestScore = scores.space;
  for (const domain of Object.keys(scores) as DomainId[]) {
    if (scores[domain] > bestScore) {
      bestScore = scores[domain];
      bestDomain = domain;
    }
  }

  return bestDomain;
}
