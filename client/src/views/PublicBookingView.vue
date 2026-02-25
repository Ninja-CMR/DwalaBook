<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-vue-next';

const route = useRoute();
const slug = route.params.slug as string;

const business = ref<any>(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const isSuccess = ref(false);
const error = ref('');

const form = ref({
  customer_name: '',
  email: '',
  phone: '',
  date: '',
  service: '',
  notes: ''
});

const loadBusiness = async () => {
  try {
    const res = await api.get(`/public/business/${slug}`);
    business.value = res.data;
  } catch (err: any) {
    error.value = "Entreprise introuvable ou lien invalide.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadBusiness);

const handleSubmit = async () => {
  isSubmitting.value = true;
  error.value = '';
  try {
    await api.post(`/public/booking/${slug}`, form.value);
    isSuccess.value = true;
  } catch (err: any) {
    error.value = "Une erreur est survenue lors de la réservation. Veuillez réessayer.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#fcf9f4] py-12 px-6">
    <div class="max-w-xl mx-auto">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 class="w-12 h-12 animate-spin text-[#8b5e3c]" />
        <p class="text-gray-500 font-bold">Chargement de la page de réservation...</p>
      </div>

      <div v-else-if="error && !isSuccess" class="bg-white p-12 rounded-[2.5rem] shadow-xl text-center border border-red-100">
        <AlertCircle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-2xl font-black text-[#4a3728] mb-2">Oups !</h2>
        <p class="text-gray-500">{{ error }}</p>
        <div class="mt-8">
            <a href="/" class="text-[#8b5e3c] font-black uppercase tracking-widest hover:underline">Retour à l'accueil</a>
        </div>
      </div>

      <div v-else-if="isSuccess" class="bg-white p-12 rounded-[2.5rem] shadow-xl text-center">
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle2 class="w-12 h-12" />
          </div>
        </div>
        <h2 class="text-3xl font-black text-[#4a3728] mb-4">C'est confirmé !</h2>
        <p class="text-gray-600 mb-8">
          Votre rendez-vous chez <strong>{{ business?.name }}</strong> a bien été enregistré. 
          Vous recevrez un rappel prochainement.
        </p>
        <button @click="isSuccess = false; form = { customer_name: '', email: '', phone: '', date: '', service: '', notes: '' }" class="w-full bg-[#8b5e3c] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-[#4a3728] transition-all">
          Prendre un autre rendez-vous
        </button>
      </div>

      <div v-else>
        <div class="text-center mb-10">
          <div class="w-20 h-20 bg-[#8b5e3c] rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
            <Calendar class="w-10 h-10" />
          </div>
          <h1 class="text-4xl font-black text-[#4a3728] mb-2">{{ business?.name }}</h1>
          <p class="text-[#8b5e3c] font-bold uppercase tracking-[0.2em] text-sm">Réserver un rendez-vous</p>
        </div>

        <form @submit.prevent="handleSubmit" class="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
          <div class="grid grid-cols-1 gap-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Votre Nom</label>
              <div class="relative">
                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input v-model="form.customer_name" type="text" required placeholder="Jean Dupont" class="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-[#8b5e3c]/10 focus:border-[#8b5e3c] transition-all" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Téléphone (WhatsApp)</label>
                <div class="relative">
                  <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input v-model="form.phone" type="tel" required placeholder="6XX XXX XXX" class="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-[#8b5e3c]/10 focus:border-[#8b5e3c] transition-all" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Email (Optionnel)</label>
                <div class="relative">
                  <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input v-model="form.email" type="email" placeholder="jean@mail.com" class="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-[#8b5e3c]/10 focus:border-[#8b5e3c] transition-all" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Date et Heure</label>
                <div class="relative">
                  <Clock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input v-model="form.date" type="datetime-local" required class="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-[#8b5e3c]/10 focus:border-[#8b5e3c] transition-all" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Service</label>
                <div class="relative">
                  <FileText class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input v-model="form.service" type="text" required placeholder="Coupe, Consultation, etc." class="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-[#8b5e3c]/10 focus:border-[#8b5e3c] transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Remarques particulières</label>
              <textarea v-model="form.notes" rows="3" placeholder="Avez-vous des précisions à nous donner ?" class="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-[#8b5e3c]/10 focus:border-[#8b5e3c] transition-all resize-none"></textarea>
            </div>
          </div>

          <div v-if="error" class="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
            <AlertCircle class="w-4 h-4" /> {{ error }}
          </div>

          <button :disabled="isSubmitting" type="submit" class="w-full bg-[#8b5e3c] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-[#4a3728] transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3">
            <Loader2 v-if="isSubmitting" class="w-6 h-6 animate-spin" />
            {{ isSubmitting ? 'Envoi en cours...' : 'Confirmer le rendez-vous' }}
          </button>
        </form>

        <p class="mt-8 text-center text-gray-400 text-xs">
          Propulsé par <router-link to="/" class="font-bold text-[#8b5e3c]">DwalaBook</router-link> - Gagnez du temps sur vos réservations.
        </p>
      </div>
    </div>
  </div>
</template>
