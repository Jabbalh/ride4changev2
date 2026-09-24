<template>
  <div class="boutique-page">
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="container">
        <span class="overline">Soutenez l'association</span>
        <h1>BOUTIQUE</h1>
        <p>Portez les couleurs de Ride 4 Change. Chaque achat soutient nos actions.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="products-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <div class="product-visual">
              <span class="product-emoji">{{ product.emoji }}</span>
              <span v-if="!product.available" class="product-badge">Bientôt</span>
            </div>
            <div class="product-body">
              <span class="product-type">{{ product.type }}</span>
              <h3>{{ product.name }}</h3>
              <p>{{ product.desc }}</p>
              <div class="product-footer">
                <strong class="product-price">{{ product.price }}</strong>
                <router-link
                    v-if="product.available"
                    :to="{ path: '/contact', query: { objet: 'boutique' } }"
                    class="btn btn-primary product-btn"
                >Commander</router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="boutique-info">
          <h3>Comment commander ?</h3>
          <p>
            Envoyez-nous votre demande via le formulaire de contact en précisant l'article, la taille et la quantité.
            Retrait lors de nos événements ou envoi postal.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Articles de la boutique : modifier cette liste pour ajouter / mettre à jour les produits.
const products = [
  { id: 1, emoji: '👕', type: 'Textile', name: 'T-shirt Ride 4 Change', desc: 'T-shirt coton, logo de l\'association.', price: 'Prix à venir', available: false },
  { id: 2, emoji: '🧥', type: 'Textile', name: 'Sweat à capuche', desc: 'Sweat chaud pour les sorties fraîches.', price: 'Prix à venir', available: false },
  { id: 3, emoji: '🧢', type: 'Accessoire', name: 'Casquette', desc: 'Casquette brodée Ride 4 Change.', price: 'Prix à venir', available: false },
  { id: 4, emoji: '🏷️', type: 'Accessoire', name: 'Stickers', desc: 'Lot de stickers pour casque et moto.', price: 'Prix à venir', available: false },
]
</script>

<style scoped>
.page-header {
  position: relative; padding: 10rem 0 5rem;
  background: var(--dark); overflow: hidden;
}
.header-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 70% 50%, rgba(230,57,70,0.1) 0%, transparent 60%);
}
.page-header .container { position: relative; z-index: 1; }
.page-header .overline { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--red); display:block; margin-bottom:0.75rem; }
.page-header h1 {
  font-family: 'Bebas Neue',sans-serif; font-size: clamp(1.5rem, 5vw, 5rem);
  line-height: 0.95;
}
.page-header p { color:var(--grey-light); font-size:1.1rem; margin-top:1rem; max-width:500px; }

.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
.product-card {
  background: var(--dark); border-top: 3px solid var(--red);
  display: flex; flex-direction: column;
  transition: transform 0.3s;
}
.product-card:hover { transform: translateY(-4px); }
.product-visual {
  position: relative; aspect-ratio: 4 / 3;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle, var(--dark2) 0%, var(--dark) 70%);
}
.product-emoji { font-size: 4rem; }
.product-badge {
  position: absolute; top: 0.75rem; right: 0.75rem;
  font-family:'Barlow Condensed',sans-serif; font-size:0.7rem; letter-spacing:0.15em; text-transform:uppercase;
  background: rgba(230,57,70,0.2); color: var(--red); padding: 0.2rem 0.6rem;
}
.product-body { padding: 1.25rem 1.5rem 1.5rem; display: flex; flex-direction: column; flex: 1; }
.product-type { font-family:'Barlow Condensed',sans-serif; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--red); }
.product-body h3 { font-family:'Barlow Condensed',sans-serif; font-size:1.2rem; font-weight:700; margin: 0.25rem 0 0.4rem; }
.product-body p { font-size:0.88rem; color:var(--grey); line-height:1.5; flex: 1; }
.product-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1.25rem; }
.product-price { font-family:'Bebas Neue',sans-serif; font-size:1.4rem; color: var(--white); }
.product-btn { padding: 0.5rem 1rem; font-size: 0.8rem; }

.boutique-info {
  margin-top: 3rem; background: var(--dark); padding: 1.75rem;
  border-left: 3px solid var(--red);
}
.boutique-info h3 { font-family:'Barlow Condensed',sans-serif; font-size:0.85rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--red); margin-bottom:0.75rem; }
.boutique-info p { font-size:0.95rem; color:var(--grey-light); line-height:1.6; max-width: 700px; }
</style>
