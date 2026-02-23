<script setup lang="ts">
import { ref } from 'vue';
import api from '../api';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-vue-next';

const email = ref('');
const isLoading = ref(false);
const isSent = ref(false);
const error = ref('');

const handleSubmit = async () => {
  if (!email.value) return;
  
  isLoading.value = true;
  error.value = '';
  try {
    const response = await api.post('/auth/forgot-password', { email: email.value });
    isSent.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Une erreur est survenue.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#fcf9f4] flex flex-col justify-center py-12 px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <h1 class="text-4xl font-black text-[#8b5e3c] italic tracking-tighter">DwalaBook</h1>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-[#4a3728]">
        Réinitialisation du mot de passe
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        {{ isSent ? 'Vérifiez votre boîte mail' : 'Saisissez votre email pour recevoir un lien' }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-6 shadow-xl rounded-[2.5rem] border border-gray-100">
        <div v-if="!isSent">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700">Email Professionnel</label>
              <div class="mt-1 relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail class="w-5 h-5" />
                </div>
                <input 
                  v-model="email"
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]/20 focus:border-[#8b5e3c]"
                  placeholder="nom@entreprise.cm"
                />
              </div>
            </div>

            <div v-if="error" class="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">
              {{ error }}
            </div>

            <button 
              type="submit" 
              :disabled="isLoading"
              class="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#8b5e3c] hover:bg-[#4a3728] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5e3c] transition-all active:scale-95 disabled:opacity-70"
            >
              <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin mr-2" />
              Envoyer le lien
            </button>
          </form>
        </div>

        <div v-else class="text-center py-4 space-y-4">
          <div class="flex justify-center">
            <CheckCircle2 class="w-16 h-16 text-green-500" />
          </div>
          <p class="text-gray-600 font-medium">
            Si un compte existe pour <strong>{{ email }}</strong>, vous recevrez un lien de réinitialisation d'ici quelques minutes.
          </p>
        </div>

        <div class="mt-6">
          <router-link to="/login" class="flex items-center justify-center gap-2 text-sm font-bold text-[#8b5e3c] hover:underline">
            <ArrowLeft class="w-4 h-4" /> Retour à la connexion
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
