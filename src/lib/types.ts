export type EvidenceKind = "verified" | "inferred" | "guessed";

export type Tag = {
  label: string;
  kind: EvidenceKind;
  note?: string;
};

export type HistoryLine = {
  date: string;
  text: string;
  tag?: string;
  source?: string;
};

export type ToolImage = {
  url: string;
  source: string;
  caption: string;
  credit: string;
  license: string;
  status: string;
  kind: string;
  checked: string;
  artistSlug: string;
};

export type ToolProject = {
  slug: string;
  name: string;
  artist: string;
  artistSlug: string;
  date: string;
  mints: number;
  evidence: EvidenceKind;
  tier: string;
  library: string;
};

export type ToolLink = { label: string; url: string };

export type Tool = {
  id: string;
  name: string;
  plain: string;
  what: string;
  maturityRow: string;
  match: string;
  firstProject: string;
  intro: string;
  history: HistoryLine[];
  steps: string[];
  starterCost: string;
  humanity: string[];
  care: string;
  links: ToolLink[];
  physical: boolean;
  sketch: string | null;
  gotcha: string;
  image: ToolImage;
  projects: ToolProject[];
  projectCount: number;
  evidenceCounts: { verified: number; inferred: number; guessed: number };
  relatedIds: string[];
  category: string;
  categoryIds: string[];
};

export type Artist = {
  slug: string;
  name: string;
  aliases: string;
  wallets: string[];
  count: number;
  first: string;
  latest: string;
  tiers: string[];
  chains: string[];
  libraries: string[];
  verifiedTags: string[];
  scriptSignals: string[];
  guessed: string[];
  mints: number;
  projectSlugs: string[];
  claimIds: number[];
  collabSlugs: string[];
  relatedIds: string[];
  websites: string[];
};

export type Project = {
  slug: string;
  key: string;
  name: string;
  artist: string;
  artistSlug: string;
  apiName: string;
  wallet: string;
  tier: string;
  chain: string;
  contractLayer: string;
  contractName: string;
  tokenStandard: string;
  minter: string;
  scriptType: string;
  library: string;
  libraries: string[];
  invocations: number;
  maxInvocations: number | null;
  license: string;
  website: string;
  artblocks: string;
  date: string;
  activated: string;
  mintStart: string;
  firstMint: string;
  completed: string;
  legacyActivation: boolean;
  externalAssets: string[];
  notes: string;
  tags: Tag[];
  verifiedCount: number;
};

export type Claim = {
  id: number;
  artist: string;
  artistSlug: string;
  project: string;
  projectSlug: string;
  category: string;
  tool: string;
  tags: string[];
  url: string;
  date: string;
  confidence: string;
  practice: boolean;
};

export type Recipe = {
  slug: string;
  title: string;
  plain: string;
  toolIds: string[];
  how: string;
  publish: string;
  status: string;
};

export type MakePath = {
  slug: string;
  plain: string;
  line: string;
  blurb: string;
  toolIds: string[];
  recipeSlugs: string[];
};

export type MaturityRow = {
  name: string;
  category: string;
  tier: string;
  tierSrb: string;
  disagree: string;
  call: string;
  abProjects: string;
  abTrend: string;
  inAb: string;
  earliest: string;
  example1: string;
  example1Url: string;
  example2: string;
  example2Url: string;
  barrier: string;
  source: string;
  exploration: string;
  momentum: string;
  learnMore: string;
  toolId: string;
};

export type WhitespaceRow = {
  rank: string;
  pick: string;
  srbRank: string;
  confidence: string;
  why: string;
  test: string;
  data: string;
};

export type UsageRow = {
  category: string;
  tag: string;
  projects: string;
  artists: string;
  verified: string;
  inferred: string;
  guessedOnly: string;
  trend: string;
  first: string;
  firstProject: string;
  latest: string;
  mostlyGuessed: string;
  notes: string;
};

export type RelatedClaim = {
  tool: string;
  claim: string;
  url: string;
  source: string;
  confidence: string;
  sourceType: string;
  date: string;
};

export type RelatedWork = {
  id: string;
  name: string;
  maker: string;
  makerSlug: string;
  cross: { name: string; slug: string }[];
  makerNote: string;
  kind: string;
  description: string;
  date: string;
  status: string;
  category: string;
  sources: string[];
  onArtBlocks: string;
  claims: RelatedClaim[];
};

export type AbxTableRow = { job: string; artblocks: string; abx: string };
export type AbxSource = { id: string; url: string };
export type AbxPlugin = { title: string; body: string };

export type Meta = {
  pulledAt: string;
  pulledLabel: string;
  api: string;
  counts: {
    artists: number;
    projects: number;
    claims: number;
    tools: number;
    p5: number;
    verifiedArtists: number;
    recipes: number;
  };
  recipes: Recipe[];
  paths: MakePath[];
  maturity: MaturityRow[];
  whitespace: WhitespaceRow[];
  usage: UsageRow[];
  related: RelatedWork[];
  abx: {
    intro: string[];
    table: AbxTableRow[];
    sources: AbxSource[];
    pluginLead: string;
    plugins: AbxPlugin[];
    uncertainties: string[];
  };
  categories: string[];
};
