<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-vue-next';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';

const authStore = useAuthStore();
const error = ref('');
const isLoading = ref(false);

const schema = yup.object({
  email: yup.string().required('L\'email est requis').email('Format d\'email invalide'),
  password: yup.string().required('Le mot de passe est requis').min(6, 'Minimum 6 caractères'),
});

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
});

const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  error.value = '';
  try {
    await authStore.login({ email: values.email, password: values.password });
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    } else {
      error.value = 'Hélas ! Erreur de connexion au serveur.';
    }
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen flex bg-background font-sans">
    <!-- Left: Illustration/Intro (Visible on Desktop) -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-dark items-center justify-center p-12">
      <!-- Decor -->
      <div class="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary blur-[100px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent blur-[100px]"></div>
      </div>

      <div class="relative z-10 max-w-lg text-white" v-motion-fade>
        <div class="mb-8">
           <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary-light mb-4">
            L'excellence à Douala
          </span>
          <h2 class="text-5xl font-extrabold leading-tight mb-6">
            Simplifiez vos <span class="text-secondary">Rendez-vous</span> professionnels.
          </h2>
          <p class="text-xl text-gray-300 mb-10 leading-relaxed">
            DwalaBook aide les salons, cliniques et garages de Douala à gérer leur planning avec élégance et efficacité.
          </p>
        </div>

        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="mt-1 p-2 bg-white/10 rounded-lg">
              <CheckCircle2 class="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h4 class="font-bold text-lg">Gain de temps</h4>
              <p class="text-gray-400">Automatisez vos prises de rendez-vous en quelques clics.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="mt-1 p-2 bg-white/10 rounded-lg">
              <CheckCircle2 class="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h4 class="font-bold text-lg">Suivi Client</h4>
              <p class="text-gray-400">Gardez un œil sur l'historique de vos clients fidèles.</p>
            </div>
          </div>
        </div>

        <div class="mt-16 flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div class="flex -space-x-3">
             <img src="https://i.pravatar.cc/100?u=1" class="w-10 h-10 rounded-full border-2 border-primary-dark" />
             <img src="https://i.pravatar.cc/100?u=2" class="w-10 h-10 rounded-full border-2 border-primary-dark" />
             <img src="https://i.pravatar.cc/100?u=3" class="w-10 h-10 rounded-full border-2 border-primary-dark" />
          </div>
          <p class="text-sm text-gray-400">Rejoignez +50 entreprises locales à Douala.</p>
        </div>
      </div>
    </div>

    <!-- Right: Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-20 relative">
      <div class="w-full max-w-md" v-motion-fade>
        <!-- Logo Mobile -->
        <div class="lg:hidden text-center mb-10">
           <h1 class="text-4xl font-black text-primary tracking-tighter italic">DwalaBook</h1>
        </div>

        <div class="mb-10 text-left">
          <h3 class="text-3xl font-bold text-gray-900 mb-2">Bon retour ! 👋</h3>
          <p class="text-gray-500">Heureux de vous revoir sur DwalaBook.</p>
        </div>

        <form @submit="onSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Email Professionnel</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Mail class="w-5 h-5" />
              </div>
              <input 
                v-model="email" 
                type="email" 
                placeholder="nom@entreprise.cm"
                :class="[
                  'block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all sm:text-sm',
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary'
                ]"
              />
            </div>
            <span v-if="errors.email" class="text-[10px] text-red-500 mt-1 block font-bold uppercase tracking-widest pl-2 italic">
               {{ errors.email }}
            </span>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-semibold text-gray-700">Mot de passe</label>
              <a href="/forgot-password" class="text-xs font-medium text-primary hover:underline">Oublié ?</a>
            </div>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Lock class="w-5 h-5" />
              </div>
              <input 
                v-model="password" 
                type="password" 
                placeholder="••••••••"
                :class="[
                  'block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all sm:text-sm',
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary'
                ]"
              />
            </div>
            <span v-if="errors.password" class="text-[10px] text-red-500 mt-1 block font-bold uppercase tracking-widest pl-2 italic">
               {{ errors.password }}
            </span>
          </div>

          <div v-if="error" class="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
             <div class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
             {{ error }}
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <span v-if="isLoading">Connexion en cours...</span>
            <template v-else>
              Accéder au Dashboard <ArrowRight class="w-4 h-4" />
            </template>
          </button>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500">
          Pas encore de compte ? 
          <router-link to="/register" class="font-bold text-primary hover:text-primary-dark transition-colors">Créer un profil gratuitement</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Focus colors matches our primary brown palette */
</style>
