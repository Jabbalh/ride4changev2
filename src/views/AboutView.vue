<template>
  <div class="about">
    <SocialFloat />
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="container">
        <span class="overline">Notre histoire</span>
        <h1>L'ASSOCIATION</h1>
        <p>Découvrez qui nous sommes, nos valeurs et notre engagement depuis 2025.</p>
      </div>
    </section>

    <!-- HISTOIRE -->
    <section class="section histoire">
      <div class="container">
        <div class="section-heading">
          <span class="overline">Notre histoire</span>
          <h2>Née de la passion, unis par la route</h2>
        </div>
        <div class="histoire-grid">
          <div class="histoire-text">

            <p>Née de la passion de la moto sur route et unie par le défi de la compétition sur circuit, Ride 4 Change voit le jour en 2025.</p>
            <p class="margin-top-p">À l’origine, un défi personnel : prouver que la pratique de la vitesse moto reste possible malgré le handicap. Très vite, ce projet dépasse le cadre individuel pour devenir un véritable engagement.</p>
            <p class="margin-top-p">Aujourd’hui, Ride 4 Change œuvre pour promouvoir la moto de vitesse accessible à tous, personnes en situation de handicap comme valides. L’association défend des valeurs fortes : dépassement de soi, inclusion, solidarité et passion.</p>
            <p class="margin-top-p">Sur les plus beaux circuits d’Europe, notre équipe repousse ses limites avec une seule ambition : montrer que la passion n’a pas de barrières.</p>
            <p class="margin-top-p">Plus qu’un projet sportif, Ride 4 Change est une aventure humaine. Une équipe de plus de 10 membres actifs partage aujourd’hui cette vision, animée par l’amour de la moto, dans le respect essentiel de la sécurité et de l’exigence de la discipline.</p>
            <div class="milestones">
              <div v-for="m in milestones" :key="m.year" class="milestone">
                <span class="m-year">{{ m.year }}</span>
                <span class="m-text">{{ m.text }}</span>
              </div>
            </div>
          </div>
          <div class="histoire-visual">
            <div class="visual-card big">
              <span><img :src="baseUrl + 'Bassin.jpg'" ></span>
            </div>
            <div class="visual-row">
              <div class="visual-card small"><span><img :src="baseUrl + 'LeMans99.jpg'" ></span></div>
              <div class="visual-card small"><span><img :src="baseUrl + 'LeMans99-2.jpg'" ></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BUREAU -->
    <section class="section bureau" style="background: var(--dark);">
      <div class="container">
        <div class="section-heading">
          <span class="overline">Le bureau</span>
          <h2>Ceux qui font<br>tourner la machine</h2>
        </div>
        <div class="bureau-grid">
          <div v-for="member in bureau" :key="member.name" class="member-card">
            <div class="member-avatar">{{ member.initials }}</div>
            <div class="member-info">
              <h3>{{ member.name }}</h3>
              <span class="member-role">{{ member.role }}</span>
              <p>{{ member.bio }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STATUTS / REGLEMENT -->
    <section class="section docs">
      <div class="container">
        <div class="docs-grid">
<!--          <div class="docs-text">-->
<!--            <div class="section-heading">-->
<!--              <span class="overline">Organisation</span>-->
<!--              <h2>Transparence et<br>gouvernance</h2>-->
<!--            </div>-->
<!--            <p>Iron Brotherhood MC est une association loi 1901. Nos statuts garantissent la démocratie interne et la transparence financière. L'assemblée générale se réunit chaque année en janvier.</p>-->
<!--            <ul class="docs-list">-->
<!--              <li v-for="doc in docs" :key="doc">-->
<!--                <span class="doc-icon">📄</span> {{ doc }}-->
<!--              </li>-->
<!--            </ul>-->
<!--          </div>-->
          <div class="adhesion-box">
            <h3>Rejoindre l'association</h3>
            <p>Vous partagez nos valeurs ? Venez rouler avec nous !</p>
            <router-link to="/contact" class="btn btn-primary" style="margin-top:1.5rem;">Faire une demande</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import SocialFloat from "@/components/SocialFloat.vue";

const baseUrl = import.meta.env.BASE_URL;

const milestones = [
  { year: '2025', text: 'Création de l’association par 4 membres fondateurs' },
  { year: '2025', text: 'Engagement sportif à la Bridgestone PMR Cup avec une quatrième place au championnat en catégorie 1000 cm3' },
  { year: '2026', text: "L'équipe devient une famille avec plus de 10 membres actifs" },
  { year: '2026', text: "Engager à la Bridgestone PMR Cup" },
  { year: '2026', text: "Debut des initiations pistes sur le mythique circuit Bugatti au Mans" },
]
const bureau = [
  { name: 'Ludovic Rouvrais', role: 'Président', initials: 'LR', bio: 'Motard depuis plus de 30 ans, Ludovic pilote l\'association avec passion et rigueur.' },
  { name: 'Anthony Martin', role: 'Bricoleur', initials: 'AM', bio: 'Bricoleur passionné.' },
]

</script>

<style scoped>
.page-header {
  position: relative; padding: 10rem 0 5rem;
  background: var(--dark); overflow: hidden;
}
.header-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 80% 50%, rgba(230,57,70,0.1) 0%, transparent 60%);
}
.page-header .container { position: relative; z-index: 1; }
.page-header .overline {
  font-family: 'Barlow Condensed',sans-serif; font-size: 0.8rem;
  letter-spacing: 0.3em; text-transform: uppercase; color: var(--red);
  display: block; margin-bottom: 0.75rem;
}
.page-header h1 {
  font-family: 'Bebas Neue',sans-serif; font-size: clamp(1.5rem, 5vw, 5rem);
  line-height: 0.95;
}
.page-header p { color: var(--grey-light); font-size: 1.1rem; margin-top: 1rem; max-width: 500px; }

.histoire-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: start; }
.histoire-text p { color: var(--grey-light); line-height: 1.8; }
.milestones { margin-top: 2rem; border-left: 2px solid var(--red); padding-left: 1.5rem; }
.milestone { display: flex; gap: 1rem; margin-bottom: 1rem; }
.m-year { font-family: 'Bebas Neue',sans-serif; font-size: 1.3rem; color: var(--red); flex-shrink: 0; }
.m-text { font-size: 0.9rem; color: var(--grey-light); padding-top: 0.2rem; }
.visual-card {
  background: var(--dark2); display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1rem;
  text-align: center;
}
.visual-card.big {  margin-bottom: 1rem; }
.visual-card.big span { font-size: 5rem; }
.visual-card.big p { font-size: 0.85rem; color: var(--grey); max-width: 200px; }
.visual-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
/*.visual-card.small { height: 140px; margin-top: 25px; }*/
.visual-card.small span { font-size: 3rem; }

.bureau-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
.member-card { background: var(--black); padding: 2rem; border-bottom: 3px solid var(--red); transition: transform 0.3s; }
.member-card:hover { transform: translateY(-4px); }
.member-avatar {
  width: 56px; height: 56px; background: var(--red);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Barlow Condensed',sans-serif; font-size: 1rem; font-weight: 700;
  margin-bottom: 1rem;
}
.member-info h3 { font-family: 'Barlow Condensed',sans-serif; font-size: 1.1rem; font-weight: 700; letter-spacing: 0.05em; }
.member-role { font-family: 'Barlow Condensed',sans-serif; font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--red); display: block; margin: 0.3rem 0 0.75rem; }
.member-info p { font-size: 0.88rem; color: var(--grey); line-height: 1.6; }

.docs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
.docs-text .section-heading { margin-bottom: 1.5rem; }
.docs-text p { color: var(--grey-light); line-height: 1.8; margin-bottom: 1.5rem; }
.docs-list { list-style: none; }
.docs-list li { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.07); font-size: 0.9rem; color: var(--grey-light); cursor: pointer; transition: color 0.3s; }
.docs-list li:hover { color: var(--white); }
.adhesion-box {
  background: var(--dark); padding: 2.5rem;
  border-top: 4px solid var(--red);
}
.adhesion-box h3 { font-family: 'Bebas Neue',sans-serif; font-size: 1.8rem; margin-bottom: 0.75rem; }
.adhesion-box > p { color: var(--grey-light); margin-bottom: 1.5rem; }
.adhesion-box ul { list-style: none; }
.adhesion-box li { padding: 0.5rem 0; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.07); }

@media (max-width: 900px) {
  .histoire-grid, .docs-grid { grid-template-columns: 1fr; gap: 0rem; }
}
</style>
