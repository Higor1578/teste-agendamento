const categoryToNiche: Record<string, string> = {
  barbearia: "barbearia",
  lava_jato: "lava-jato",
  manicure: "manicure",
  salao_beleza: "salao-de-beleza",
};

const nicheToCategory = Object.fromEntries(
  Object.entries(categoryToNiche).map(([category, niche]) => [niche, category]),
);

export function getBusinessNiche(category: string) {
  return categoryToNiche[category] ?? category;
}

export function getCategoryFromNiche(niche: string) {
  return nicheToCategory[niche] ?? null;
}

export function getBusinessPublicPath(category: string, slug: string) {
  return `/${getBusinessNiche(category)}/${slug}`;
}
