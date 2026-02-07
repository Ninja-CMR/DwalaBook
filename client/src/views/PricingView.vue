<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';
import api from '../api';
import { Check, X, ArrowRight, Loader2, CreditCard, Banknote, Smartphone, ShieldCheck } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const isProcessing = ref<string | null>(null);
const error = ref<string | null>(null);

// Manual Payment Modal State
const showManualModal = ref(false);
const selectedPlanForManual = ref<'starter' | 'pro' | null>(null);
const manualForm = ref({
  phone: '',
  transaction_id: ''
});
const manualLoading = ref(false);

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
    action: (id: string) => openPaymentOptions(id),
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
    action: (id: string) => openPaymentOptions(id),
    highlight: false,
    id: 'pro'
  }
];

const openPaymentOptions = (planId: any) => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  if (planId === 'free') return;
  
  selectedPlanForManual.value = planId;
  showManualModal.value = true;
};

const handleStripePayment = async () => {
  if (!selectedPlanForManual.value) return;
  const planId = selectedPlanForManual.value;

  try {
    isProcessing.value = 'stripe';
    error.value = null;
    
    const response = await api.post('/payments/initiate', { plan: planId, method: 'stripe' });
    const { payment_url } = response.data;

    window.location.href = payment_url;
  } catch (err: any) {
    console.error('Stripe initiation failed', err);
    error.value = "Impossible d'initier le paiement Stripe. Réessayez plus tard.";
  } finally {
    isProcessing.value = null;
  }
};

const handleManualPayment = async () => {
  if (!selectedPlanForManual.value) return;
  if (!manualForm.value.phone || !manualForm.value.transaction_id) {
    error.value = "Veuillez remplir tous les champs.";
    return;
  }

  try {
    manualLoading.value = true;
    error.value = null;

    await api.post('/payments/initiate', { 
        plan: selectedPlanForManual.value, 
        method: 'manual',
        phone: manualForm.value.phone,
        transaction_id: manualForm.value.transaction_id
    });

    // Success - Redirect to pending/success page
    router.push('/payment-result?status=pending_review');
    showManualModal.value = false;
  } catch (err: any) {
    console.error('Manual payment failed', err);
    error.value = err.response?.data?.message || "Erreur lors de la déclaration du paiement.";
  } finally {
    manualLoading.value = false;
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
          Paiement par <strong>OM/MOMO</strong> ou <strong>Carte Bancaire</strong>.
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
              @click="plan.action(plan.id)"
              :disabled="authStore.user?.plan === plan.id"
              class="mt-10 w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-black rounded-xl text-white shadow-xl transition-all duration-200 transform active:scale-95"
              :class="[
                authStore.user?.plan === plan.id 
                  ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-[#8b5e3c] hover:bg-[#4a3728] hover:-translate-y-1'
              ]"
            >
              {{ authStore.user?.plan === plan.id ? 'VOTRE PLAN ACTUEL' : plan.buttonText }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- FAQ simplistic -->
      <div class="mt-20 text-center">
         <!-- ... existing FAQ ... -->
      </div>
    </div>

    <!-- Manual Payment / Selection Modal -->
    <div v-if="showManualModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showManualModal = false">
        <div class="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div class="bg-[#4a3728] p-6 text-white flex justify-between items-center">
                <h3 class="text-xl font-black">Paiement - Plan {{ selectedPlanForManual?.toUpperCase() }}</h3>
                <button @click="showManualModal = false" class="hover:bg-white/10 p-2 rounded-full"><X class="w-5 h-5" /></button>
            </div>
            
            <div class="p-8 space-y-8">
                <!-- Method Selection / Tabs could go here if we wanted to switch inside modal -->
                
                <!-- Option 1: Mobile Money (Highlighted) -->
                <div class="space-y-4">
                    <div class="flex items-center gap-3 text-[#8b5e3c] font-black uppercase text-sm tracking-widest">
                        <Smartphone class="w-5 h-5" /> Mobile Money (OM/MOMO)
                    </div>
                    <div class="bg-[#fcf9f4] p-5 rounded-xl border border-[#eaddcf] space-y-3">
                        <p class="text-sm text-gray-600">
                            Effectuez un dépôt de <strong class="text-[#4a3728]">{{ selectedPlanForManual === 'starter' ? '5 000' : '10 000' }} FCFA</strong> au numéro :
                        </p>
                        <p class="text-2xl font-black text-[#4a3728] tracking-widest text-center py-2 bg-white rounded-lg border border-dashed border-gray-300 select-all">
                            06 55 44 33 22
                        </p>
                        <p class="text-xs text-center text-gray-400 italic">Nom: Dwalabook Inc.</p>
                    </div>

                    <div class="space-y-3">
                        <label class="text-sm font-bold text-gray-700">Une fois payé, remplissez ceci :</label>
                        <input v-model="manualForm.phone" type="text" placeholder="Votre numéro de téléphone (celui qui a payé)" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#8b5e3c] focus:border-transparent outline-none" />
                        <input v-model="manualForm.transaction_id" type="text" placeholder="ID de Transaction (ex: PP2304...)" class="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#8b5e3c] focus:border-transparent outline-none" />
                    </div>

                    <button 
                        @click="handleManualPayment"
                        :disabled="manualLoading"
                        class="w-full py-4 bg-[#8b5e3c] text-white font-black rounded-xl hover:bg-[#6d4a2f] transition-all flex justify-center gap-2"
                    >
                        <Loader2 v-if="manualLoading" class="w-5 h-5 animate-spin" />
                        {{ manualLoading ? 'Vérification...' : "J'ai effectué le paiement" }}
                    </button>
                    <p v-if="error" class="text-red-500 text-sm font-bold text-center">{{ error }}</p>
                </div>

                <div class="relative flex items-center py-2">
                    <div class="flex-grow border-t border-gray-200"></div>
                    <span class="flex-shrink-0 mx-4 text-gray-300 text-xs font-bold uppercase">OU</span>
                    <div class="flex-grow border-t border-gray-200"></div>
                </div>

                <!-- Option 2: Stripe -->
                <button 
                    @click="handleStripePayment"
                    :disabled="isProcessing === 'stripe'"
                    class="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                >
                    <CreditCard class="w-5 h-5" /> 
                    <Loader2 v-if="isProcessing === 'stripe'" class="w-5 h-5 animate-spin" />
                    {{ isProcessing === 'stripe' ? 'Redirection...' : 'Payer par Carte (International)' }}
                </button>
                <div class="text-center">
                    <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex justify-center items-center gap-1">
                        <ShieldCheck class="w-3 h-3" /> Sécurisé par Stripe
                    </span>
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
