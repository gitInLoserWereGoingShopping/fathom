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
      "Solar system tours",
      "Stars and life cycles",
      "Gravity and orbits",
      "Galaxies and scale",
      "Black holes (intro)",
      "Space travel (realistic)",
    ],
  },
  {
    id: "nature",
    label: "Biology & Nature",
    description: "Living systems from cells to ecosystems.",
    topics: [
      "Cells & tiny machines",
      "DNA & inheritance",
      "Plants & photosynthesis",
      "Animals & behavior",
      "Ecosystems & food webs",
      "Evolution (intro)",
    ],
  },
  {
    id: "physics",
    label: "Physics",
    description: "Forces, energy, motion, and the rules of matter.",
    topics: [
      "Forces & motion",
      "Energy & work",
      "Waves & sound",
      "Light & optics",
      "Electricity & magnetism",
      "Heat & thermodynamics",
    ],
  },
  {
    id: "chemistry",
    label: "Chemistry",
    description: "Atoms, reactions, and how materials change.",
    topics: [
      "Atoms & bonds",
      "Reactions",
      "Acids & bases",
      "Mixtures & solutions",
      "Materials (polymers, metals)",
      "Chemistry in nature",
    ],
  },
  {
    id: "earth",
    label: "Earth Science",
    description: "Weather, geology, and the planet’s systems.",
    topics: [
      "Weather & storms",
      "Rocks & minerals",
      "Plate tectonics",
      "Volcanoes & earthquakes",
      "Water cycle",
      "Natural hazards",
    ],
  },
  {
    id: "ocean",
    label: "Oceans",
    description: "Currents, waves, and life under water.",
    topics: [
      "Ocean currents",
      "Tides and gravity",
      "Waves and energy",
      "Sea life systems",
      "Coral reefs (intro)",
      "Water pressure",
    ],
  },
  {
    id: "mind",
    label: "Mind & Brain",
    description: "How thinking, learning, and memory work.",
    topics: [
      "Neurons & signals",
      "Memory basics",
      "Sleep & the brain",
      "Attention & focus",
      "Senses & perception",
      "Emotions (intro)",
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    description: "Designing structures and useful systems.",
    topics: [
      "Machines & simple tools",
      "Structures & bridges",
      "Energy systems",
      "Materials engineering",
      "Robotics (safe)",
      "Design & prototyping",
    ],
  },
  {
    id: "computing",
    label: "Computer Science",
    description: "Algorithms, data, and digital systems.",
    topics: [
      "Algorithms (kid metaphors)",
      "Networks & internet",
      "Security (safe habits)",
      "AI & learning (conceptual)",
      "Data & compression",
      "Databases as libraries",
    ],
  },
  {
    id: "math",
    label: "Math & Patterns",
    description: "Structures, patterns, and scientific thinking.",
    topics: [
      "Patterns",
      "Measurement & units",
      "Probability",
      "Graphs & functions",
      "Geometry in nature",
      "Big numbers & scale",
    ],
  },
];

const PHRASE_OVERRIDES: Array<{
  pattern: RegExp;
  domain: DomainId;
  boost?: number;
}> = [
  { pattern: /space[-\s]?time|spacetime|relativity/i, domain: "physics", boost: 6 },
  { pattern: /space travel|astronaut|rocket|orbit/i, domain: "space", boost: 6 },
  { pattern: /\bin space\b|outer space|space station/i, domain: "space", boost: 6 },
  { pattern: /space to grow|space needed|space do .* need/i, domain: "nature", boost: 6 },
  { pattern: /space between|how much space|area of|square|volume/i, domain: "math", boost: 4 },
  { pattern: /ocean|sea|tide|current|reef|underwater/i, domain: "ocean", boost: 5 },
];

const DOMAIN_KEYWORDS: Record<DomainId, Array<{ term: string; weight: number }>> = {
  space: [
    { term: "space", weight: 1 },
    { term: "planet", weight: 3 },
    { term: "star", weight: 3 },
    { term: "galaxy", weight: 4 },
    { term: "universe", weight: 3 },
    { term: "cosmic", weight: 4 },
    { term: "black hole", weight: 5 },
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
    { term: "sound", weight: 2 },
    { term: "light", weight: 2 },
    { term: "electricity", weight: 4 },
    { term: "magnet", weight: 3 },
    { term: "thermodynamics", weight: 5 },
  ],
  chemistry: [
    { term: "atom", weight: 4 },
    { term: "molecule", weight: 4 },
    { term: "bond", weight: 3 },
    { term: "reaction", weight: 4 },
    { term: "acid", weight: 3 },
    { term: "base", weight: 3 },
    { term: "mixture", weight: 2 },
    { term: "solution", weight: 2 },
    { term: "chemical", weight: 4 },
  ],
  earth: [
    { term: "weather", weight: 4 },
    { term: "storm", weight: 3 },
    { term: "climate", weight: 4 },
    { term: "rock", weight: 3 },
    { term: "mineral", weight: 3 },
    { term: "volcano", weight: 4 },
    { term: "earthquake", weight: 4 },
    { term: "tectonic", weight: 4 },
    { term: "soil", weight: 2 },
  ],
  ocean: [
    { term: "ocean", weight: 4 },
    { term: "sea", weight: 3 },
    { term: "tide", weight: 3 },
    { term: "current", weight: 3 },
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
    { term: "bridge", weight: 3 },
    { term: "structure", weight: 3 },
    { term: "design", weight: 2 },
    { term: "robot", weight: 3 },
    { term: "system", weight: 2 },
    { term: "engineer", weight: 4 },
  ],
  computing: [
    { term: "algorithm", weight: 4 },
    { term: "data", weight: 3 },
    { term: "network", weight: 3 },
    { term: "internet", weight: 4 },
    { term: "security", weight: 3 },
    { term: "ai", weight: 3 },
    { term: "code", weight: 3 },
    { term: "computer", weight: 4 },
  ],
  math: [
    { term: "math", weight: 3 },
    { term: "pattern", weight: 3 },
    { term: "probability", weight: 4 },
    { term: "graph", weight: 3 },
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
