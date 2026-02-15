<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { User, Mail, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);

const handleSubmit = async () => {
  if (!name.value || !email.value || !password.value) return;
  
  isLoading.value = true;
  error.value = '';
  try {
    await authStore.register({ name: name.value, email: email.value, password: password.value });
    isSuccess.value = true;
    
    // Snappy transition
    setTimeout(() => {
       router.replace('/dashboard');
    }, 800);
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    } else {
      error.value = 'Hélas ! Une erreur est survenue lors de l\'inscription.';
    }
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex bg-background font-sans">
    <!-- Left Side: Promo Content (Desktop) -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-12">
      <!-- Decor -->
      <div class="absolute inset-0 opacity-10">
        <div class="grid grid-cols-8 gap-4 w-full h-full rotate-12 scale-150">
          <div v-for="i in 64" :key="i" class="h-20 bg-white/20 rounded-lg"></div>
        </div>
      </div>

      <div class="relative z-10 max-w-lg text-white" v-motion-fade>
        <div class="bg-white/10 p-2 rounded-2xl w-fit mb-8 backdrop-blur-md border border-white/20">
          <Sparkles class="w-10 h-10 text-secondary" />
        </div>
        
        <h2 class="text-5xl font-extrabold leading-tight mb-6 tracking-tighter">
          Simplifiez votre succès à <span class="text-secondary-light">Douala</span>.
        </h2>
        
        <p class="text-xl text-primary-light mb-10 leading-relaxed font-medium">
          DwalaBook digitalise votre agenda professionnel en quelques minutes. Simple, rapide, camerounais.
        </p>

        <div class="grid grid-cols-2 gap-6">
          <div class="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
            <h5 class="text-2xl font-black text-secondary mb-1">99%</h5>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-300">Satisfaction</p>
          </div>
          <div class="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
            <h5 class="text-2xl font-black text-secondary mb-1">MoMo</h5>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-300">Payement Local</p>
          </div>
        </div>

        <div class="mt-12 flex items-center gap-3">
          <ShieldCheck class="w-5 h-5 text-accent" />
          <p class="text-sm font-bold text-gray-400">Plateforme certifiée et sécurisée.</p>
        </div>
      </div>
    </div>

    <!-- Right Side: Register Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-24 relative overflow-hidden bg-white">
      
      <div v-if="isSuccess" class="w-full max-w-md text-center space-y-8" v-motion-pop>
         <div class="w-24 h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 class="w-12 h-12" />
         </div>
         <div class="space-y-2">
            <h3 class="text-4xl font-black text-gray-900 tracking-tighter">Bienvenue ! ✨</h3>
            <p class="text-lg text-gray-500 font-medium">L'inscription a réussi. Nous vous redirigeons vers votre dashboard...</p>
         </div>
      </div>

      <div v-else class="w-full max-w-md" v-motion-fade>
         <!-- Logo Mobile -->
        <div class="lg:hidden text-center mb-10">
           <h1 class="text-4xl font-black text-primary tracking-tighter italic">DwalaBook</h1>
        </div>

        <div class="mb-10 text-left">
          <h3 class="text-4xl font-black text-gray-900 mb-2 tracking-tighter">Créer mon espace</h3>
          <p class="text-gray-500 font-medium">Rejoignez DwalaBook pour booster votre activité.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6" autocomplete="off">
          <div class="space-y-2">
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nom / Entreprise</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <User class="w-5 h-5" />
              </div>
              <input 
                v-model="name" 
                type="text" 
                required 
                autocomplete="off"
                placeholder="Ex: Salon de Coiffure Akwa"
                class="block w-full pl-12 pr-4 py-4 border-2 border-gray-50 rounded-2xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Professionnel</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Mail class="w-5 h-5" />
              </div>
              <input 
                v-model="email" 
                type="email" 
                required 
                autocomplete="off"
                placeholder="contact@entreprise.cm"
                class="block w-full pl-12 pr-4 py-4 border-2 border-gray-50 rounded-2xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Lock class="w-5 h-5" />
              </div>
              <input 
                v-model="password" 
                type="password" 
                required 
                autocomplete="new-password"
                placeholder="Minimum 8 caractères"
                class="block w-full pl-12 pr-4 py-4 border-2 border-gray-50 rounded-2xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold"
              />
            </div>
          </div>

          <div v-if="error" class="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-black flex items-center gap-3">
             <div class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
             {{ error }}
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full flex justify-center items-center gap-3 py-5 px-4 border border-transparent rounded-[2rem] shadow-xl text-sm font-black text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <span v-if="isLoading" class="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
            <template v-else>
              Créer mon espace <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </template>
          </button>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500 font-bold">
          Déjà partenaire ? 
          <router-link to="/login" class="text-primary hover:underline transition-colors uppercase tracking-[0.1em] text-xs">Se connecter</router-link>
        </p>
      </div>
      
      <!-- Abstract BG Decor -->
      <div class="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/[0.03] rounded-full"></div>
    </div>
  </div>
</template>
