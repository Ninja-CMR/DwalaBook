<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useRouter, useRoute } from 'vue-router';
import api from '../api';
import { Check, X, Loader2, AlertCircle, Globe, CreditCard, Smartphone } from 'lucide-vue-next';
import ManualPaymentModal from '../components/ManualPaymentModal.vue';

const route = useRoute();
const authStore = useAuthStore();
const router = useRouter();
const isProcessing = ref<string | null>(null);
const error = ref<string | null>(null);

onMounted(() => {
  if (route.query.selected) {
    const planId = route.query.selected as string;
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      showPaymentOptions(planId as any, plan.rawPrice || 0);
    }
  }
});

const manualPaymentData = ref({
  isOpen: false,
  planId: 'starter' as 'starter' | 'pro',
  amount: 0
});

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
    action: (id: string, amount: number) => showPaymentOptions(id as any, amount),
    highlight: true,
    id: 'starter',
    rawPrice: 5000
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
    action: (id: string, amount: number) => showPaymentOptions(id as any, amount),
    highlight: false,
    id: 'pro',
    rawPrice: 10000
  }
];

const selectedPlan = ref<any>(null);

const showPaymentOptions = (id: 'starter' | 'pro', amount: number) => {
  if (!authStore.isAuthenticated) {
    router.push({ path: '/register', query: { plan: id } });
    return;
  }
  selectedPlan.value = { id, amount };
};

const handleStripeUpgrade = async () => {
  if (!selectedPlan.value) return;

  try {
    isProcessing.value = 'stripe';
    isProcessing.value = 'stripe';
    error.value = null;
    
    const response = await api.post('/payments/stripe/create-session', { plan: selectedPlan.value.id });
    const { checkout_url } = response.data;

    // Redirect to Stripe Checkout
    window.location.href = checkout_url;
  } catch (err: any) {
    console.error('Stripe initiation failed', err);
    error.value = err.response?.data?.message || err.message || "Impossible d'initier le paiement Stripe.";
  } finally {
    isProcessing.value = null;
  }
};

const handleManualUpgrade = () => {
  if (!selectedPlan.value) return;
  manualPaymentData.value = {
    isOpen: true,
    planId: selectedPlan.value.id,
    amount: selectedPlan.value.amount
  };
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
          Paiement par <strong>OM/MOMO</strong> ou <strong>Carte Bancaire</strong>.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <!-- Error Alert -->
        <div v-if="error" class="md:col-span-3 p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] text-red-600 font-extrabold flex items-center justify-center gap-4 animate-bounce mb-4">
            <AlertCircle class="w-8 h-8" />
            <div class="text-center">
                <p class="text-lg">{{ error }}</p>
                <p class="text-xs opacity-70 font-bold uppercase tracking-widest mt-1">Veuillez vérifier votre connexion ou réessayez.</p>
            </div>
        </div>

        <div 
          v-for="plan in plans" 
          :key="plan.name"
          class="relative bg-white rounded-[2.5rem] shadow-xl transition-all duration-300 hover:scale-[1.02]"
          :class="[
            plan.highlight ? 'border-2 border-[#8b5e3c] ring-8 ring-[#8b5e3c]/5 scale-100 z-10' : 'border border-gray-100'
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
              <span class="ml-2 text-xl font-medium text-gray-500">FCFA / mois</span>
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

            <!-- Plan Action Button -->
            <button
              v-if="!selectedPlan || selectedPlan.id !== plan.id"
              @click="plan.action(plan.id, plan.rawPrice || 0)"
              :disabled="authStore.user?.plan === plan.id || isProcessing === plan.id"
              class="mt-10 w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-black rounded-xl text-white shadow-xl transition-all duration-200 transform active:scale-95"
              :class="[
                authStore.user?.plan === plan.id 
                  ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-[#8b5e3c] hover:bg-[#4a3728] hover:-translate-y-1'
              ]"
            >
              {{ authStore.user?.plan === plan.id ? 'VOTRE PLAN ACTUEL' : plan.buttonText }}
            </button>

            <!-- Payment Method Selection (Appears after selecting plan) -->
            <div v-else class="mt-8 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <p class="text-[10px] font-black text-[#8b5e3c] uppercase tracking-[0.2em] text-center mb-4">Mode de paiement</p>
              
              <!-- Stripe Button -->
              <div class="relative group">
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-400 text-black text-[8px] font-black uppercase rounded-full z-20 group-hover:scale-110 transition-transform">
                  Bientôt disponible
                </div>
                <button 
                  disabled
                  class="w-full flex items-center gap-3 px-4 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold text-sm shadow-sm cursor-not-allowed grayscale"
                >
                  <div class="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Globe class="w-5 h-5 text-gray-300" />
                  </div>
                  <div class="flex-1 text-left">
                    <span>Carte Bancaire</span>
                    <p class="text-[10px] opacity-70 font-medium">Stripe (International)</p>
                  </div>
                  <CreditCard class="w-4 h-4 opacity-50" />
                </button>
              </div>

              <!-- Local Payment Button -->
              <button 
                @click="handleManualUpgrade"
                class="w-full flex items-center gap-3 px-4 py-4 bg-white border-2 border-gray-100 text-[#4a3728] rounded-2xl font-bold text-sm shadow-sm hover:border-[#8b5e3c] hover:bg-[#8b5e3c]/5 transition-all group active:scale-95"
              >
                <div class="w-8 h-8 rounded-lg bg-[#8b5e3c]/10 flex items-center justify-center">
                  <Smartphone class="w-5 h-5 text-[#8b5e3c]" />
                </div>
                <div class="flex-1 text-left">
                  <span>Mobile Money</span>
                  <p class="text-[10px] text-gray-400 font-medium">OM, MTN (Cameroun)</p>
                </div>
                <Smartphone class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#8b5e3c]" />
              </button>

              <button 
                @click="selectedPlan = null"
                class="w-full text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-red-500 transition-colors py-2"
              >
                Annuler selection
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Manual Payment Modal -->
      <ManualPaymentModal 
        :isOpen="manualPaymentData.isOpen"
        :planId="manualPaymentData.planId"
        :amount="manualPaymentData.amount"
        @close="manualPaymentData.isOpen = false"
      />

      <!-- FAQ simplistic -->
      <div class="mt-20 text-center">
         <!-- ... existing FAQ ... -->
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
