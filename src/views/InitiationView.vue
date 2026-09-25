<template>
  <div class="initiation-page">
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="container">
        <span class="overline">Sur piste</span>
        <h1>INITIATION &amp; ROULAGE</h1>
        <p>Découvrir la piste en toute sécurité ou progresser à votre rythme, encadré par l'association.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="formules">
          <div v-for="formule in formules" :key="formule.id" class="formule-card">
            <span class="formule-icon">{{ formule.icon }}</span>
            <span class="formule-level">{{ formule.level }}</span>
            <h2>{{ formule.title }}</h2>
            <p>{{ formule.desc }}</p>
            <ul>
              <li v-for="point in formule.points" :key="point">{{ point }}</li>
            </ul>
            <router-link
                :to="{ path: '/contact', query: { objet: 'initiation' } }"
                class="btn btn-primary"
            >Je suis intéressé</router-link>
          </div>
        </div>

        <div class="infos-layout">
          <div class="info-card">
            <h3>Équipement obligatoire</h3>
            <ul class="check-list">
              <li v-for="item in equipement" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div class="info-card">
            <h3>Déroulement d'une journée</h3>
            <div v-for="step in deroulement" :key="step.time" class="step-row">
              <span class="step-time">{{ step.time }}</span>
              <span>{{ step.label }}</span>
            </div>
          </div>
        </div>

        <p class="dates-note">
          Les prochaines dates sont annoncées sur la page
          <router-link to="/evenements">Événements</router-link>
          et sur nos réseaux sociaux.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Contenu de la page : modifier ces listes pour mettre à jour les formules et infos pratiques.
const formules = [
  {
    id: 1, icon: '🎓', level: 'Débutant', title: 'Initiation',
    desc: 'Première expérience sur circuit, encadrée pas à pas.',
    points: ['Briefing sécurité et trajectoires', 'Sessions encadrées par des pilotes expérimentés', 'Petits groupes de niveau'],
  },
  {
    id: 2, icon: '🏁', level: 'Tous niveaux', title: 'Roulage',
    desc: 'Des sessions libres pour rouler et progresser à votre rythme.',
    points: ['Groupes par niveau', 'Sessions chronométrées', 'Conseils personnalisés sur demande'],
  },
]

const equipement = [
  'Casque homologué',
  'Combinaison cuir (une ou deux pièces zippées)',
  'Gants et bottes moto',
  'Dorsale',
  'Moto en bon état (pneus, freins, niveaux)',
]

const deroulement = [
  { time: 'Matin', label: 'Accueil, contrôle technique et briefing' },
  { time: 'Journée', label: 'Sessions sur piste par groupe de niveau' },
  { time: 'Midi', label: 'Pause déjeuner et échanges' },
  { time: 'Fin', label: 'Débriefing et verre de l\'amitié' },
]
</script>

<style scoped>
.page-header {
  position: relative; padding: 10rem 0 5rem;
  background: var(--dark); overflow: hidden;
}
.header-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 30% 0%, rgba(230,57,70,0.12) 0%, transparent 60%);
}
.page-header .container { position: relative; z-index: 1; }
.page-header .overline { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--red); display:block; margin-bottom:0.75rem; }
.page-header h1 {
  font-family: 'Bebas Neue',sans-serif; font-size: clamp(1.5rem, 5vw, 5rem);
  line-height: 0.95;
}
.page-header p { color:var(--grey-light); font-size:1.1rem; margin-top:1rem; max-width:560px; }

.formules { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.formule-card {
  background: var(--dark); padding: 2rem;
  border-top: 4px solid var(--red);
  display: flex; flex-direction: column; align-items: flex-start;
}
.formule-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.formule-level { font-family:'Barlow Condensed',sans-serif; font-size:0.75rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--red); }
.formule-card h2 { font-family:'Bebas Neue',sans-serif; font-size:2.2rem; line-height:1.1; margin: 0.25rem 0 0.5rem; }
.formule-card p { color: var(--grey-light); font-size: 0.95rem; margin-bottom: 1rem; }
.formule-card ul { list-style: none; width: 100%; margin-bottom: 1.5rem; flex: 1; }
.formule-card li { padding: 0.45rem 0; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
.formule-card li::before { content: '›'; color: var(--red); font-weight: 700; margin-right: 0.6rem; }

.infos-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 3rem; }
.info-card { background: var(--dark); padding: 1.75rem; border-left: 3px solid var(--red); }
.info-card h3 { font-family:'Barlow Condensed',sans-serif; font-size:0.85rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--red); margin-bottom:1rem; }
.check-list { list-style: none; }
.check-list li { padding: 0.45rem 0; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
.check-list li::before { content: '✅'; margin-right: 0.6rem; }
.step-row { display: flex; gap: 1rem; padding: 0.55rem 0; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
.step-row:last-child, .check-list li:last-child { border-bottom: none; }
.step-time { font-family:'Barlow Condensed',sans-serif; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--white); min-width: 70px; }

.dates-note { margin-top: 2.5rem; color: var(--grey-light); font-size: 0.95rem; }
.dates-note a { color: var(--red); border-bottom: 1px solid currentColor; }

@media (max-width: 900px) {
  .formules, .infos-layout { grid-template-columns: 1fr; }
}
</style>
