<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';
import api from '../api';
import { Check, X, ArrowRight, Loader2, AlertCircle } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const isProcessing = ref<string | null>(null);
const error = ref<string | null>(null);

const plans = [
  {
    name: 'FREEMIUM',
    price: '0',
    description: 'Pour débuter votre activité',
    features: [
      { text: '5 rendez-vous / mois', included: true },
      { text: '1 seul utilisateur', included: true },
      { text: 'Statut de base (en attente, confirmé)', included: true },
      { text: 'Statistiques avancées', included: false },
      { text: 'Rappels SMS / WhatsApp', included: false },
      { text: 'Gestion avancée des clients', included: false },
    ],
    buttonText: 'Plan Actuel',
    action: () => {},
    highlight: false,
    id: 'free'
  },
  {
    name: 'STARTER',
    price: '5 000',
    description: 'Idéal pour les salons et cliniques',
    features: [
      { text: 'Rendez-vous illimités', included: true },
      { text: 'Gestion complète clients', included: true },
      { text: 'Statistiques basiques', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Rappels SMS / WhatsApp', included: false },
      { text: 'Multi-employés', included: false },
    ],
    buttonText: 'Choisir Starter',
    action: (id: string) => handleUpgrade(id),
    highlight: true,
    id: 'starter'
  },
  {
    name: 'PRO',
    price: '10 000',
    description: 'Le pack complet pour dominer',
    features: [
      { text: 'Tout du plan Starter', included: true },
      { text: 'Rappels SMS / WhatsApp', included: true },
      { text: 'Statistiques avancées', included: true },
      { text: 'Multi-employés', included: true },
      { text: 'Gestion du stock', included: true },
      { text: 'Logo personnalisé', included: true },
    ],
    buttonText: 'Choisir PRO',
    action: (id: string) => handleUpgrade(id),
    highlight: false,
    id: 'pro'
  }
];

const handleUpgrade = async (planId: any) => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  if (planId === 'free') return;

  try {
    isProcessing.value = planId;
    error.value = null;
    
    // Initiate Monetbil payment
    const response = await api.post('/payments/initiate', { plan: planId });
    const { payment_url } = response.data;

    // Redirect to Monetbil
    window.location.href = payment_url;
  } catch (err: any) {
    console.error('Payment initiation failed', err);
    error.value = "Impossible d'initier le paiement. Réessayez plus tard.";
  } finally {
    isProcessing.value = null;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#fcf9f4] py-16 px-6 sm:px-12 lg:px-20">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-base font-semibold text-[#8b5e3c] tracking-wide uppercase">Tarification simple</h2>
        <p class="mt-1 text-4xl font-extrabold text-[#4a3728] sm:text-5xl sm:tracking-tight lg:text-6xl">
          Développez votre business à Douala
        </p>
        <p class="max-w-xl mt-5 mx-auto text-xl text-gray-500">
          Choisissez le plan qui correspond à la taille de votre entreprise. 
          Paiement sécurisé par <strong>MTN MoMo</strong> ou <strong>Orange Money</strong>.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div 
          v-for="plan in plans" 
          :key="plan.name"
          class="relative bg-white rounded-2xl shadow-xl transition-all duration-300 hover:scale-105"
          :class="[
            plan.highlight ? 'border-2 border-[#8b5e3c] ring-4 ring-[#8b5e3c]/10 scale-105 z-10' : 'border border-gray-100'
          ]"
        >
          <div v-if="plan.highlight" class="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#8b5e3c] text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
            Plus Populaire
          </div>

          <div class="p-8">
            <h3 class="text-2xl font-bold text-[#4a3728]">{{ plan.name }}</h3>
            <p class="mt-4 text-gray-500 text-sm h-10">{{ plan.description }}</p>
            <div class="mt-6 flex items-baseline">
              <span class="text-4xl font-extrabold text-[#4a3728]">{{ plan.price }}</span>
              <span class="ml-1 text-xl font-medium text-gray-500">FCFA/mois</span>
            </div>

            <ul class="mt-8 space-y-4">
              <li v-for="feature in plan.features" :key="feature.text" class="flex items-start">
                <div class="flex-shrink-0">
                  <Check v-if="feature.included" class="h-5 w-5 text-[#8b5e3c]" />
                  <X v-else class="h-5 w-5 text-gray-300" />
                </div>
                <p class="ml-3 text-sm text-gray-600" :class="{ 'text-gray-400 line-through' : !feature.included }">
                  {{ feature.text }}
                </p>
              </li>
            </ul>

            <button
              @click="handleUpgrade(plan.id)"
              :disabled="authStore.user?.plan === plan.id || isProcessing === plan.id"
              class="mt-10 w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-black rounded-xl text-white shadow-xl transition-all duration-200 transform active:scale-95"
              :class="[
                authStore.user?.plan === plan.id 
                  ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-[#8b5e3c] hover:bg-[#4a3728] hover:-translate-y-1'
              ]"
            >
              <Loader2 v-if="isProcessing === plan.id" class="w-6 h-6 animate-spin" />
              <template v-else>
                {{ authStore.user?.plan === plan.id ? 'VOTRE PLAN ACTUEL' : plan.buttonText }}
              </template>
            </button>
          </div>
        </div>
      </div>

      <!-- FAQ simplistic -->
      <div class="mt-20 text-center">
        <h3 class="text-2xl font-bold text-[#4a3728]">Questions fréquentes</h3>
        <div class="mt-10 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-2 text-left max-w-4xl mx-auto">
          <div>
            <h4 class="text-lg font-semibold text-[#4a3728]">Puis-je changer de plan n'importe quand ?</h4>
            <p class="mt-2 text-gray-600 text-sm">Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. La différence sera calculée automatiquement.</p>
          </div>
          <div>
            <h4 class="text-lg font-semibold text-[#4a3728]">Quels sont les modes de paiement ?</h4>
            <p class="mt-2 text-gray-600 text-sm italic">Nous acceptons MTN MoMo et Orange Money. Le plan est activé instantanément après votre confirmation sur votre téléphone.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom local colors */
.bg-earth {
  background-color: #fcf9f4;
}
</style>
