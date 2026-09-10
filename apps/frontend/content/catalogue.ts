/** Every label of the partner catalogue, shared by the spaces that host it. */
export const CATALOGUE_CONTENT = {
  searchPlaceholder: 'Rechercher un commerce, une ville…',
  searchLabel: 'Rechercher un partenaire',
  categoriesLabel: 'Catégories',
  allCategories: 'Tous',
  empty: 'Aucun partenaire trouvé',
  loadMore: 'Charger plus',
  loading: 'Chargement…',
  loadError: 'Le chargement des partenaires a échoué. Réessayez.',
  results: (count: number) =>
    count === 1 ? '1 partenaire' : `${count} partenaires`,
} as const;
