<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowLeft, Shield, FileText, Gavel } from 'lucide-vue-next';

const router = useRouter();

const sections = [
  {
    id: 'legal',
    title: 'Mentions Légales',
    icon: Shield,
    content: `
      <h3>1. Éditeur du site</h3>
      <p>Le site DwalaBook est édité par l'entreprise DwalaBook Tech, immatriculée au registre du commerce de Douala, Cameroun.</p>
      <p>Siège social : Akwa, Douala, Cameroun.</p>
      <p>Directeur de la publication : M. Meva'a Olivier</p>
      
      <h3>2. Hébergement</h3>
      <p>Le site est hébergé par Neon.tech et Vercel/Netlify (ou votre hébergeur configuré).</p>
      
      <h3>3. Propriété intellectuelle</h3>
      <p>L'ensemble du contenu (textes, graphismes, logos) est la propriété exclusive de DwalaBook Tech, sauf mentions contraires.</p>
    `
  },
  {
    id: 'privacy',
    title: 'Politique de Confidentialité',
    icon: FileText,
    content: `
      <h3>1. Collecte des données</h3>
      <p>Nous collectons les informations nécessaires à la gestion de vos rendez-vous : nom, numéro de téléphone, et adresse email.</p>
      
      <h3>2. Utilisation des données</h3>
      <p>Vos données sont exclusivement utilisées pour le fonctionnement du service DwalaBook, notamment l'envoi de rappels par SMS, Email et WhatsApp.</p>
      
      <h3>3. Protection des données</h3>
      <p>Nous mettons en œuvre des mesures de sécurité pour protéger vos informations personnelles contre tout accès non autorisé.</p>
    `
  },
  {
    id: 'terms',
    title: 'Conditions Générales (CGV/CGU)',
    icon: Gavel,
    content: `
      <h3>1. Objet</h3>
      <p>Les présentes CGU régissent l'utilisation de la plateforme DwalaBook par les professionnels et leurs clients.</p>
      
      <h3>2. Abonnements</h3>
      <p>Les plans Starter et Pro sont facturés mensuellement. En cas de non-paiement, le compte est automatiquement basculé vers le plan gratuit (Freemium).</p>
      
      <h3>3. Responsabilité</h3>
      <p>DwalaBook agit en tant qu'intermédiaire technique. La responsabilité des prestations effectuées incombe au professionnel.</p>
    `
  }
];
</script>

<template>
  <div class="min-h-screen bg-earth font-sans text-slate-900 pb-20">
    <!-- Header -->
    <header class="bg-white border-b py-8 sticky top-0 z-30">
      <div class="max-w-4xl mx-auto px-6 flex items-center justify-between">
        <button @click="router.back()" class="flex items-center gap-2 text-primary font-bold hover:underline">
          <ArrowLeft class="w-5 h-5" /> Retour
        </button>
        <span class="text-xl font-black text-primary-dark">Centre Légal</span>
        <div class="w-20"></div> <!-- Spacer -->
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-6 mt-12 space-y-16">
      <section v-for="section in sections" :key="section.id" :id="section.id" class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 scroll-mt-28">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <component :is="section.icon" class="w-6 h-6" />
          </div>
          <h2 class="text-3xl font-black text-slate-900 tracking-tight">{{ section.title }}</h2>
        </div>
        
        <div class="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed" v-html="section.content">
        </div>
      </section>
    </main>

    <footer class="mt-20 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
      © 2026 DwalaBook • Tous droits réservés
    </footer>
  </div>
</template>

<style scoped>
.bg-earth {
  background-color: #fcf9f4;
}
</style>
