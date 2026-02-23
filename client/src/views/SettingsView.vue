<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { Settings, Bell, Lock, Smartphone, MessageCircle, User, RefreshCw, LogOut, Link } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import api from '../api';

const authStore = useAuthStore();
const isLoading = ref(false);

const profileForm = reactive({
    name: authStore.user?.name || '',
    email: authStore.user?.email || '',
    business_slug: authStore.user?.business_slug || ''
});

const notifications = ref({
    email: true,
    sms: false,
    whatsapp: false
});

const isPro = authStore.user?.plan === 'pro';

const copyLink = () => {
  const link = `${window.location.origin}/b/${authStore.user?.business_slug}`;
  navigator.clipboard.writeText(link);
  alert('Lien copié dans le presse-papier !');
};

const updateProfile = async () => {
    isLoading.value = true;
    try {
        await api.put('/auth/me', profileForm);
        await authStore.fetchUser();
        alert('Profil mis à jour avec succès !');
    } catch (err) {
        console.error(err);
        alert('Erreur lors de la mise à jour.');
    } finally {
        isLoading.value = false;
    }
};

</script>

<template>
  <AppLayout>
    <div class="space-y-8 max-w-4xl mx-auto" v-motion-fade>
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-200 pb-8">
        <div>
          <h2 class="text-3xl font-black text-[#4a3728] tracking-tight flex items-center gap-3">
            <Settings class="w-8 h-8 text-primary" />
            Paramètres
          </h2>
          <p class="text-gray-500 font-medium mt-2">Gérez votre profil, vos préférences et votre abonnement.</p>
        </div>
      </div>

      <!-- Account Section -->
      <div class="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-stone-200/50 border border-white/50 space-y-8">
          <h3 class="text-xl font-bold text-[#4a3728] flex items-center gap-3">
              <User class="w-6 h-6 text-primary" /> Mon Compte
          </h3>

          <form @submit.prevent="updateProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                      <label class="text-xs font-black uppercase text-gray-400 tracking-wider">Nom complet</label>
                      <input 
                        v-model="profileForm.name"
                        type="text" 
                        class="w-full px-5 py-4 bg-surface rounded-2xl border border-gray-100 font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                  </div>
                  <div class="space-y-2">
                      <label class="text-xs font-black uppercase text-gray-400 tracking-wider">Email</label>
                      <input 
                        v-model="profileForm.email"
                        type="email" 
                        class="w-full px-5 py-4 bg-surface rounded-2xl border border-gray-100 font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                  </div>
              </div>

              <div v-if="isPro" class="space-y-4">
                  <div class="space-y-2">
                      <label class="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
                        Identifiant de réservation public (Slug)
                        <span class="px-2 py-0.5 bg-[#8b5e3c]/10 text-[#8b5e3c] text-[10px] rounded">PRO</span>
                      </label>
                      <div class="relative items-center flex">
                          <span class="absolute left-5 text-gray-400 font-bold border-r pr-3 border-gray-100">dwalabook.cm/b/</span>
                          <input 
                            v-model="profileForm.business_slug"
                            type="text" 
                            placeholder="mon-salon"
                            class="w-full pl-[135px] pr-5 py-4 bg-surface rounded-2xl border border-gray-100 font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                      </div>
                      <p class="text-[10px] text-gray-400 font-medium">C'est le lien que vous partagerez à vos clients pour qu'ils réservent en ligne.</p>
                  </div>
                  
                  <div v-if="authStore.user?.business_slug" class="p-4 bg-[#fcf9f4] rounded-2xl border border-[#8b5e3c]/10 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <Link class="w-5 h-5 text-[#8b5e3c]" />
                      <span class="text-sm font-bold text-[#4a3728]">Lien public : dwalabook.cm/b/{{ authStore.user.business_slug }}</span>
                    </div>
                    <button @click.prevent="copyLink" class="text-xs font-black text-[#8b5e3c] uppercase hover:underline">Copier</button>
                  </div>
              </div>
              
              <div class="flex justify-end">
                  <button 
                    type="submit" 
                    :disabled="isLoading"
                    class="px-8 py-4 bg-[#4a3728] text-white rounded-2xl font-black shadow-lg shadow-stone-900/10 hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                        <RefreshCw v-if="isLoading" class="w-5 h-5 animate-spin" />
                        {{ isLoading ? 'Mise à jour...' : 'Enregistrer les modifications' }}
                  </button>
              </div>
          </form>
      </div>

      <!-- Notifications Section -->
      <div class="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-stone-200/50 border border-white/50 space-y-8">
          <h3 class="text-xl font-bold text-[#4a3728] flex items-center gap-3">
              <Bell class="w-6 h-6 text-primary" /> Rappels Automatiques
          </h3>

          <div class="space-y-6">
              <!-- Email -->
              <div class="flex items-center justify-between p-4 bg-surface rounded-2xl border border-gray-100">
                  <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                          <Settings class="w-6 h-6" />
                      </div>
                      <div>
                          <p class="font-bold text-[#4a3728]">Rappels Email</p>
                          <p class="text-xs text-gray-500">Envoyer un email de confirmation aux clients.</p>
                      </div>
                  </div>
                  <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" name="toggle" id="email-toggle" v-model="notifications.email" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                      <label for="email-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
              </div>

              <!-- SMS (Pro Only) -->
              <div class="flex items-center justify-between p-4 bg-surface rounded-2xl border border-gray-100 relative overflow-hidden" :class="{'opacity-75': !isPro}">
                  <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                          <Smartphone class="w-6 h-6" />
                      </div>
                      <div>
                          <p class="font-bold text-[#4a3728] flex items-center gap-2">
                              Rappels SMS
                              <span v-if="!isPro" class="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] uppercase font-black rounded-md flex items-center gap-1"><Lock class="w-3 h-3" /> PRO</span>
                          </p>
                          <p class="text-xs text-gray-500">Envoyer un SMS automatique 24h avant.</p>
                      </div>
                  </div>
                  
                  <div v-if="isPro" class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" name="toggle" id="sms-toggle" v-model="notifications.sms" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                      <label for="sms-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                  <router-link v-else to="/pricing" class="px-4 py-2 bg-[#4a3728] text-white text-xs font-bold rounded-xl hover:bg-[#8b5e3c] transition-colors">
                      Passer PRO
                  </router-link>
              </div>

              <!-- WhatsApp (Pro Only) -->
              <div class="flex items-center justify-between p-4 bg-surface rounded-2xl border border-gray-100 relative overflow-hidden" :class="{'opacity-75': !isPro}">
                  <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                          <MessageCircle class="w-6 h-6" />
                      </div>
                      <div>
                          <p class="font-bold text-[#4a3728] flex items-center gap-2">
                              Rappels WhatsApp
                              <span v-if="!isPro" class="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] uppercase font-black rounded-md flex items-center gap-1"><Lock class="w-3 h-3" /> PRO</span>
                          </p>
                          <p class="text-xs text-gray-500">Envoyer une notification WhatsApp.</p>
                      </div>
                  </div>
                  
                  <div v-if="isPro" class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" name="toggle" id="whatsapp-toggle" v-model="notifications.whatsapp" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                      <label for="whatsapp-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                   <router-link v-else to="/pricing" class="px-4 py-2 bg-[#4a3728] text-white text-xs font-bold rounded-xl hover:bg-[#8b5e3c] transition-colors">
                      Passer PRO
                  </router-link>
              </div>
          </div>
      </div>

      <!-- Billing & Subscription Section -->
      <div class="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-stone-200/50 border border-white/50 space-y-8">
          <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-[#4a3728] flex items-center gap-3">
                  <Smartphone class="w-6 h-6 text-primary" /> Abonnement & Facturation
              </h3>
              <div class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                  Plan {{ authStore.user?.plan }}
              </div>
          </div>
          
          <div class="p-6 bg-surface rounded-[2rem] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="space-y-1">
                  <p class="text-xs font-black uppercase text-gray-400">Statut de l'abonnement</p>
                  <p class="font-bold text-[#4a3728]">
                      {{ authStore.user?.plan === 'free' ? 'Version Gratuite (Illimitée)' : 'Abonnement Actif' }}
                  </p>
                  <p v-if="authStore.user?.plan_expire_at" class="text-xs text-gray-500">
                      Expire le : {{ new Date(authStore.user.plan_expire_at).toLocaleDateString('fr-FR') }}
                  </p>
              </div>
              
              <div v-if="authStore.user?.plan !== 'pro'" class="flex gap-4">
                  <router-link to="/pricing" class="px-6 py-3 bg-secondary text-primary-dark rounded-xl font-black text-xs hover:scale-[1.02] transition-all shadow-md">
                      Améliorer mon plan
                  </router-link>
              </div>
              <div v-else class="text-primary font-black text-xs flex items-center gap-2">
                  <Lock class="w-4 h-4" /> Plan Professional Activé
              </div>
          </div>
      </div>

      <!-- Logout Section -->
      <div class="bg-red-50/50 rounded-[2.5rem] border-2 border-red-100 p-8 sm:p-12" v-motion-fade>
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="text-center sm:text-left">
            <h4 class="text-xl font-black text-red-600 mb-1">Session</h4>
            <p class="text-gray-500 font-medium italic text-sm">Vous allez être déconnecté de DwalaBook.</p>
          </div>
          <button 
            @click="authStore.logout()"
            class="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 hover:-translate-y-1 transition-all active:scale-95 group"
          >
            <LogOut class="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.toggle-checkbox:checked {
  right: 0;
  border-color: #68D391;
}
.toggle-checkbox:checked + .toggle-label {
  background-color: #68D391;
}
.toggle-checkbox {
    position: absolute;
    display: block;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 9999px;
    background-color: white;
    border-width: 4px;
    appearance: none;
    cursor: pointer;
    right: auto;
    left: 0;
    transition: all 0.3s;
}
.toggle-checkbox:checked {
    right: 0;
    left: auto;
}
</style>
