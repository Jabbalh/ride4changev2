<template>
  <div class="legal-page">
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="container">
        <span class="overline">Informations légales</span>
        <h1>MENTIONS LÉGALES</h1>
        <p>Éditeur du site, hébergement et protection de vos données personnelles.</p>
      </div>
    </section>

    <section class="section">
      <div class="container legal-content">
        <p class="updated">Dernière mise à jour : {{ UPDATED }}</p>

        <h2>Éditeur du site</h2>
        <p>
          Le site <strong>ride4change.fr</strong> est édité par l'association <strong>{{ EDITEUR.nom }}</strong>,
          association loi 1901 fondée en 2025.
        </p>
        <ul>
          <li>Siège social : {{ EDITEUR.adresse }}</li>
          <li>Numéro RNA : <Todo :value="EDITEUR.rna" /></li>
          <li>Email : {{ EDITEUR.email }}</li>
          <li>Directeur ou directrice de la publication : <Todo :value="EDITEUR.directeurPublication" /></li>
        </ul>

        <h2>Propriété intellectuelle</h2>
        <p>
          Les textes, photos, logos et éléments graphiques de ce site sont la propriété de l'association
          {{ EDITEUR.nom }} ou de leurs auteurs, qui ont autorisé leur utilisation. Toute reproduction sans
          autorisation préalable est interdite.
          <template v-if="CREDITS">Crédits photos : {{ CREDITS }}.</template>
        </p>

        <h2 id="donnees-personnelles">Données personnelles</h2>
        <p>
          L'association {{ EDITEUR.nom }} est responsable des traitements de données personnelles réalisés
          sur ce site. Elle ne collecte que les données nécessaires, et ne les vend ni ne les cède à des tiers.
        </p>

        <h3>Cookies et mesure d'audience</h3>
        <p>
          Ce site <strong>n'utilise aucun cookie publicitaire ni outil de mesure d'audience</strong>, et ne charge
          aucune ressource de sites tiers (polices hébergées sur le site, pas de réseaux sociaux intégrés).
          Aucun consentement n'est donc demandé. Seuls les membres de l'association qui se connectent à
          l'espace éditeur enregistrent leur session dans leur navigateur (stockage local), afin de rester connectés.
        </p>


      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'

// ============================================================================
// Informations à fournir par l'association : remplacer les chaînes vides.
// Tant qu'une valeur est vide, la page affiche « à compléter » à sa place.
// ============================================================================
const EDITEUR = {
  nom: 'Ride 4 Change',
  adresse: '24 rue Maurice, 35290 Saint-Méen-le-Grand',
  email: '1ride4change[at]gmail.com',
  rna: 'W353024797',                    // numéro RNA, ex : W351234567 (récépissé de déclaration en préfecture)
  directeurPublication: 'Ludovic Rouvrais',   // en général le ou la président·e de l'association
}
const HEBERGEMENT = {
  regionSupabase: '',         // dashboard Supabase > Project Settings > General > Region (ex : Europe - Paris)
}
const CREDITS = ''            // facultatif, ex : 'Pics by Jeffou, membres de l'association'
const CONSERVATION = '3 ans'  // durée recommandée par la CNIL pour des échanges sans suite
const UPDATED = '25 septembre 2026'

// Affiche la valeur, ou un repère visible « à compléter » si elle est vide
const Todo = defineComponent({
  props: { value: { type: String, default: '' } },
  setup: props => () => props.value
    ? props.value
    : h('span', { class: 'todo' }, 'à compléter'),
})
</script>

<style scoped>
.page-header {
  position: relative; padding: 10rem 0 5rem;
  background: var(--dark); overflow: hidden;
}
.header-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(230,57,70,0.1) 0%, transparent 60%);
}
.page-header .container { position: relative; z-index: 1; }
.page-header .overline { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--red); display:block; margin-bottom:0.75rem; }
.page-header h1 {
  font-family: 'Bebas Neue',sans-serif; font-size: clamp(1.5rem, 5vw, 5rem);
  line-height: 0.95;
}
.page-header p { color:var(--grey-light); font-size:1.1rem; margin-top:1rem; max-width:500px; }

.legal-content { max-width: 820px; }
.legal-content .updated { color: var(--grey-light); font-size: 0.85rem; margin-bottom: 2rem; }
.legal-content h2 {
  font-family: 'Bebas Neue', sans-serif; font-size: 2rem !important; line-height: 1.1;
  margin: 2.5rem 0 0.75rem; color: var(--white);
}
.legal-content h3 {
  font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--red); margin: 1.5rem 0 0.5rem;
}
.legal-content p, .legal-content li { color: var(--grey-light); line-height: 1.8; }
.legal-content ul { padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.35rem; }
.legal-content strong { color: var(--white); }
.legal-content a { color: var(--red); text-decoration: underline; text-underline-offset: 2px; }
.legal-content a:hover { color: var(--white); }
.todo { background: rgba(244,162,97,0.15); color: var(--orange); padding: 0 0.35rem; font-style: italic; }
</style>
