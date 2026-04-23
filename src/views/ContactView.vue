<template>
  <div class="contact-page">
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="container">
        <span class="overline">Nous contacter</span>
        <h1>CONTACT</h1>
        <p>Une question, envie de nous rejoindre ?</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="contact-layout">
          <!-- FORM -->
          <div class="contact-form-wrap">
            <h2>Envoyez-nous un message</h2>
            <div v-if="sent" class="success-msg">
              <span>✅</span>
              <div>
                <strong>Message envoyé !</strong>
                <p>Nous vous répondrons.</p>
              </div>
            </div>
            <form v-else @submit.prevent="handleSubmit" class="form">
              <div class="form-row">
                <div class="field">
                  <label>Prénom *</label>
                  <input v-model="form.prenom" type="text" placeholder="Jean" required />
                </div>
                <div class="field">
                  <label>Nom *</label>
                  <input v-model="form.nom" type="text" placeholder="Dupont" required />
                </div>
              </div>
              <div class="field">
                <label>Email *</label>
                <input v-model="form.email" type="email" placeholder="jean.dupont@mail.fr" required />
              </div>
              <div class="field">
                <label>Objet</label>
                <select v-model="form.objet">
                  <option value="">Sélectionner...</option>
                  <option value="adhesion">Demande d'adhésion</option>
                  <option value="info">Informations générales</option>
                  <option value="evenement">Événement / Partenariat</option>
                  <option value="presse">Presse / Média</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div class="field">
                <label>Votre moto (optionnel)</label>
                <input v-model="form.moto" type="text" placeholder="Ex : Honda CB 750, Harley Sportster..." />
              </div>
              <div class="field">
                <label>Message *</label>
                <textarea v-model="form.message" rows="5" placeholder="Votre message..." required></textarea>
              </div>
              <button type="submit" class="btn btn-primary submit-btn">
                Envoyer le message →
              </button>
            </form>
          </div>

          <!-- INFOS -->
          <div class="contact-info">
            <div class="info-card">
              <h3>Coordonnées</h3>
              <div v-for="info in infos" :key="info.label" class="info-row">
                <span class="info-icon">{{ info.icon }}</span>
                <div>
                  <span class="info-label">{{ info.label }}</span>
                  <strong>{{ info.value }}</strong>
                </div>
              </div>
            </div>

<!--            <div class="info-card">-->
<!--              <h3>Réunions mensuelles</h3>-->
<!--              <p>Tous les premiers samedis du mois à 10h au garage du club.</p>-->
<!--              <p style="margin-top:0.5rem;color:var(&#45;&#45;grey);">Ouvertes aux sympathisants sur invitation.</p>-->
<!--            </div>-->

            <div class="info-card social-card">
              <h3>Suivez-nous</h3>
              <div class="social-row">
                <a href="https://www.facebook.com/profile.php?id=61573516003975" target="_blank" class="social-btn">Facebook</a>
                <a href="https://www.instagram.com/ride4change_ludo_et_paule/" target="_blank" class="social-btn">Instagram</a>
                <a href="https://www.tiktok.com/@ride4change" target="_blank" class="social-btn">Tiktok</a>
              </div>
            </div>

<!--            <div class="adhesion-cta">-->
<!--              <span class="overline-label">Prêt à nous rejoindre ?</span>-->
<!--              <h3>Cotisation annuelle</h3>-->
<!--              <div class="price">80 <span>€ / an</span></div>-->
<!--              <ul>-->
<!--                <li>✅ Accès à toutes les sorties</li>-->
<!--                <li>✅ Assurance groupe</li>-->
<!--                <li>✅ Gilet officiel</li>-->
<!--                <li>✅ Newsletter & agenda prioritaire</li>-->
<!--              </ul>-->
<!--            </div>-->
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup  lang="ts">
import { ref, reactive } from 'vue'

const sent = ref(false)
const form = reactive({ prenom:'', nom:'', email:'', objet:'', moto:'', message:'' })

const handleSubmit = () => {
  // Simulation d'envoi
  sent.value = true
}

const infos = [
  { icon:'📍', label:'Adresse', value:'24 rue Maurice, 35290 Saint Meen le Grand' },
  { icon:'📧', label:'Email', value:'1ride4change@gmail.com' },
  { icon:'📞', label:'Téléphone', value:'+33 00 00 00 00 00' }
]
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
.page-header h1 { font-family:'Bebas Neue',sans-serif; font-size:clamp(4rem,10vw,8rem); line-height:0.95; }
.page-header p { color:var(--grey-light); font-size:1.1rem; margin-top:1rem; max-width:500px; }

.contact-layout { display: grid; grid-template-columns: 1.3fr 1fr; gap: 4rem; align-items: start; }
.contact-form-wrap h2 { font-family:'Bebas Neue',sans-serif; font-size:2rem; margin-bottom:2rem; }

.success-msg {
  display: flex; align-items: center; gap: 1rem;
  background: rgba(0,180,80,0.1); border: 1px solid rgba(0,180,80,0.3);
  padding: 2rem;
}
.success-msg span { font-size: 2rem; }
.success-msg strong { display: block; margin-bottom: 0.25rem; }
.success-msg p { font-size: 0.9rem; color: var(--grey-light); }

.form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field label { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey); }
.field input, .field select, .field textarea {
  background: var(--dark2); border: 1px solid rgba(255,255,255,0.1);
  color: var(--white); padding: 0.85rem 1rem;
  font-family: 'Barlow',sans-serif; font-size: 0.95rem;
  transition: border-color 0.3s; outline: none;
}
.field input:focus, .field select:focus, .field textarea:focus {
  border-color: var(--red);
}
.field textarea { resize: vertical; min-height: 120px; }
.field select option { background: var(--dark2); }
.submit-btn { align-self: flex-start; }

/* INFO CARDS */
.info-card {
  background: var(--dark); padding: 1.75rem;
  margin-bottom: 1rem; border-left: 3px solid var(--red);
}
.info-card h3 { font-family:'Barlow Condensed',sans-serif; font-size:0.85rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--red); margin-bottom:1rem; }
.info-card p { font-size:0.9rem; color:var(--grey-light); line-height:1.6; }
.info-row { display:flex; align-items:center; gap:1rem; padding:0.6rem 0; border-bottom:1px solid rgba(255,255,255,0.07); }
.info-row:last-child { border-bottom: none; }
.info-icon { font-size:1.25rem; }
.info-row > div { display:flex; flex-direction:column; }
.info-label { font-size:0.75rem; color:var(--grey); font-family:'Barlow Condensed',sans-serif; letter-spacing:0.1em; text-transform:uppercase; }
.info-row strong { font-size:0.9rem; }
.social-row { display:flex; gap:0.75rem; }
.social-btn {
  flex: 1; padding:0.6rem; text-align:center;
  font-family:'Barlow Condensed',sans-serif; font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase;
  border:1px solid rgba(255,255,255,0.15); color:var(--grey);
  transition:all 0.3s;
}
.social-btn:hover { border-color:var(--red); color:var(--red); }
.adhesion-cta {
  background: var(--dark); padding: 1.75rem;
  border-top: 4px solid var(--red);
}
.overline-label { font-family:'Barlow Condensed',sans-serif; font-size:0.75rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--red); display:block; margin-bottom:0.5rem; }
.adhesion-cta h3 { font-family:'Bebas Neue',sans-serif; font-size:1.5rem; }
.price { font-family:'Bebas Neue',sans-serif; font-size:3rem; color:var(--red); line-height:1.1; margin:0.5rem 0 1rem; }
.price span { font-size:1.2rem; color:var(--grey); }
.adhesion-cta ul { list-style:none; }
.adhesion-cta li { padding:0.4rem 0; font-size:0.88rem; border-bottom:1px solid rgba(255,255,255,0.07); }

@media (max-width: 900px) {
  .contact-layout { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
