<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { X, CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Crown, Calendar, Sparkles } from 'lucide-vue-next';

const emit = defineEmits(['close', 'success']);
const authStore = useAuthStore();
const step = ref<'select' | 'processing' | 'success'>('select');

const handlePayment = async () => {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!stripeKey || stripeKey.includes('your_actual')) {
    alert("Configuration Stripe manquante. Veuillez ajouter votre clé dans le fichier .env");
    return;
  }

  // Simulation step to show securing state
  step.value = 'processing';
  
  // Simulated success for demo purposes
  // In real production, this would trigger loadStripe and redirectToCheckout
  setTimeout(async () => {
    await authStore.upgradePlan('starter');
    step.value = 'success';
  }, 2000);
};

const finish = () => {
  emit('success');
};
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" v-motion-fade>
    <!-- Overlay -->
    <div class="absolute inset-0 bg-[#0A2540]/95 backdrop-blur-2xl" @click="step === 'select' ? $emit('close') : null"></div>
    
    <!-- Modal Container -->
    <div class="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25)] overflow-hidden border border-white/20" v-motion-pop>
      
      <!-- Stripe-Style Premium Header -->
      <div class="bg-[#635BFF] p-12 text-white relative overflow-hidden">
        <div class="relative z-10 flex items-center justify-between">
          <div class="flex items-center gap-6">
             <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6">
                <Sparkles class="w-10 h-10 text-[#635BFF]" />
             </div>
             <div>
               <h2 class="text-4xl font-extrabold tracking-tight">Dwala <span class="opacity-70 italic font-black">PRO</span></h2>
               <p class="text-xs font-bold uppercase tracking-widest text-indigo-100 mt-1">Édition Internationale</p>
             </div>
          </div>
          <button v-if="step !== 'processing' && step !== 'success'" @click="$emit('close')" class="p-3 hover:bg-white/10 rounded-full transition-all group">
            <X class="w-7 h-7 text-white/50 group-hover:text-white transition-all" />
          </button>
        </div>
        <!-- Stripe Decorative Waves -->
        <div class="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <!-- Content -->
      <div class="p-10 sm:p-14">
        
        <!-- Step 1: Selection -->
        <div v-if="step === 'select'" class="space-y-10">
          <div class="text-center space-y-4">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-[#635BFF]/10 text-[#635BFF] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#635BFF]/20">
               <Crown class="w-3 h-3" /> Accès Illimité
            </div>
            <h3 class="text-3xl font-black text-[#0A2540] tracking-tight">Libérez tout votre potentiel.</h3>
            <p class="text-slate-500 font-medium text-lg">
               Tarif unique : <span class="text-4xl font-black text-[#635BFF]">3€</span> / mois
            </p>
          </div>

          <!-- Feature list -->
          <div class="space-y-4">
             <div class="flex items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#635BFF]/30 transition-all">
                <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                   <CheckCircle2 class="text-green-500 w-5 h-5" />
                </div>
                <div>
                   <p class="text-sm font-black text-[#0A2540] uppercase tracking-wide">Rendez-vous Illimités</p>
                   <p class="text-xs text-slate-500 font-bold">Aucune limite sur la croissance de votre salon</p>
                </div>
             </div>
             <div class="flex items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#635BFF]/30 transition-all">
                <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                   <Calendar class="text-indigo-500 w-5 h-5" />
                </div>
                <div>
                   <p class="text-sm font-black text-[#0A2540] uppercase tracking-wide">Vue Agenda Pro</p>
                   <p class="text-xs text-slate-500 font-bold">Planification visuelle haute performance</p>
                </div>
             </div>
          </div>

          <div class="space-y-6">
             <button 
              @click="handlePayment"
              class="w-full py-6 bg-[#0A2540] text-white rounded-2xl font-black shadow-2xl hover:bg-black hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 text-xl relative group overflow-hidden"
             >
                <CreditCard class="w-6 h-6 text-[#635BFF]" />
                Payer par Carte / Apple / Google
                <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
             
             <div class="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                <ShieldCheck class="w-4 h-4 text-[#635BFF]" /> Sécurisé par Stripe 🌍
             </div>
          </div>
        </div>

        <!-- Step 1.5: Processing -->
        <div v-if="step === 'processing'" class="py-20 text-center space-y-8" v-motion-fade>
           <div class="w-20 h-20 border-4 border-[#635BFF]/20 border-t-[#635BFF] rounded-full animate-spin mx-auto"></div>
           <div class="space-y-2">
             <h3 class="text-2xl font-black text-[#0A2540]">Sécurisation de la transaction...</h3>
             <p class="text-slate-500 font-medium">Connexion au réseau bancaire international.</p>
           </div>
        </div>

        <!-- Step 2: Success -->
        <div v-if="step === 'success'" class="py-10 text-center space-y-12" v-motion-pop>
           <div class="relative w-32 h-32 mx-auto">
              <div class="absolute inset-0 bg-green-100 rounded-3xl animate-ping opacity-20"></div>
              <div class="relative z-10 w-full h-full bg-white text-green-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-green-50 scale-110">
                 <CheckCircle2 class="w-20 h-20" />
              </div>
           </div>
           
           <div class="space-y-3">
             <h3 class="text-4xl font-black text-[#0A2540] tracking-tighter uppercase italic">Bravo !</h3>
             <p class="text-lg text-slate-500 font-black uppercase tracking-widest">Abonnement PRO activé</p>
           </div>

           <button 
              @click="finish"
              class="w-full py-6 bg-green-500 text-white rounded-2xl font-black shadow-xl hover:bg-green-600 hover:-translate-y-1 transition-all text-xl uppercase tracking-widest"
           >
              Accéder aux Outils Pro
           </button>
        </div>

      </div>
    </div>
  </div>
</template>
