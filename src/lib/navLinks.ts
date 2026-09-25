// Pages publiques affichées dans le menu (NavBar) et le pied de page (FooterBar) : une seule liste pour les deux.
// Ajouter une page ici impose de revérifier la largeur du menu (passage en burger sous 1150 px),
// et de l'ajouter à STATIC_PAGES dans worker/sitemap.ts.
// La galerie n'y figure pas tant qu'elle contient du contenu d'exemple.
export const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/association', label: "L'Association" },
  { to: '/competition', label: 'Compétition' },
  { to: '/evenements', label: 'Événements' },
  { to: '/initiation-roulage', label: 'Initiation & Roulage' },
  { to: '/boutique', label: 'Boutique' },
  { to: '/contact', label: 'Contact' },
] as const
