<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppointmentStore } from '../stores/appointments.store';
import { useAuthStore } from '../stores/auth.store';
import { Users, Search, Phone, Calendar, Clock, ChevronRight, User } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';

const appointmentStore = useAppointmentStore();
const authStore = useAuthStore();
const searchQuery = ref('');
const selectedClient = ref<any>(null);

onMounted(() => {
    appointmentStore.fetchAppointments();
});

// Aggregate clients from appointments
const clients = computed(() => {
    const clientMap = new Map();

    appointmentStore.appointments.forEach(apt => {
        // Use phone as unique identifier
        const key = apt.phone;
        if (!clientMap.has(key)) {
            clientMap.set(key, {
                phone: apt.phone,
                name: apt.customer_name,
                appointments: [],
                lastAppointment: null
            });
        }
        const client = clientMap.get(key);
        // Update name if most recent appointment has newer name? Keep simple for now.
        client.appointments.push(apt);
        // Track last appointment
        if (!client.lastAppointment || new Date(apt.date) > new Date(client.lastAppointment.date)) {
            client.lastAppointment = apt;
        }
    });

    return Array.from(clientMap.values()).sort((a, b) => {
        // Sort by most recent appointment
        return new Date(b.lastAppointment.date).getTime() - new Date(a.lastAppointment.date).getTime();
    });
});

const filteredClients = computed(() => {
    if (!searchQuery.value) return clients.value;
    const q = searchQuery.value.toLowerCase();
    return clients.value.filter(c => 
        c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
});

const selectClient = (client: any) => {
    selectedClient.value = client;
};
</script>

<template>
  <AppLayout>
    <div class="relative min-h-[600px]">
      <!-- Premium Overlay for Free Users -->
      <div v-if="authStore.isFree" class="absolute inset-0 z-20 backdrop-blur-md bg-[#fcf9f4]/60 flex items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-[3rem]" v-motion-fade>
        <div class="max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6 border border-gray-100">
           <div class="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <Users class="w-10 h-10 text-blue-600" />
           </div>
           <div class="space-y-2">
              <h3 class="text-2xl font-black text-[#4a3728]">Gestion Clients Pro</h3>
              <p class="text-gray-500 font-medium">L'historique détaillé des clients et le suivi de fidélité sont réservés aux membres possédant un abonnement actif.</p>
           </div>
           <button @click="$router.push('/pricing')" class="w-full py-4 bg-[#4a3728] text-white rounded-2xl font-black shadow-lg shadow-stone-900/20 hover:scale-[1.02] transition-all">
              Passer au Premium
           </button>
        </div>
      </div>

      <div class="max-w-7xl mx-auto space-y-8" v-motion-fade :class="{'opacity-20 pointer-events-none grayscale': authStore.isFree}">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h1 class="text-3xl font-black text-[#4a3728] tracking-tight flex items-center gap-3">
               <Users class="w-8 h-8 text-primary" />
               Gestion Clients
             </h1>
             <p class="text-gray-500 font-medium">Vos clients fidèles et leur historique.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <!-- Client List -->
           <div class="lg:col-span-1 space-y-4">
              <!-- Search -->
              <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search class="w-5 h-5" />
                  </div>
                  <input 
                      v-model="searchQuery"
                      type="text" 
                      placeholder="Chercher un client..."
                      class="block w-full pl-10 pr-3 py-3.5 border border-gray-100 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                  />
              </div>

              <!-- List -->
              <div class="bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 border border-white/50 overflow-hidden max-h-[600px] overflow-y-auto custom-scrollbar">
                  <div v-if="filteredClients.length === 0" class="p-8 text-center text-gray-400">
                      <p class="font-bold">Aucun client trouvé.</p>
                  </div>
                  <div v-else class="divide-y divide-gray-50">
                      <div 
                          v-for="client in filteredClients" 
                          :key="client.phone"
                          @click="selectClient(client)"
                          class="p-4 hover:bg-surface cursor-pointer transition-colors group"
                          :class="{'bg-surface': selectedClient?.phone === client.phone}"
                      >
                          <div class="flex items-center justify-between">
                              <div class="flex items-center gap-3">
                                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                                      {{ client.name.charAt(0) }}
                                  </div>
                                  <div>
                                      <h4 class="font-bold text-[#4a3728]">{{ client.name }}</h4>
                                      <p class="text-xs text-gray-500 font-medium flex items-center gap-1">
                                          <Phone class="w-3 h-3" /> {{ client.phone }}
                                      </p>
                                  </div>
                              </div>
                              <ChevronRight class="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                          </div>
                      </div>
                  </div>
              </div>
           </div>

           <!-- Client Details -->
           <div class="lg:col-span-2">
              <div v-if="selectedClient" class="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/50 border border-white/50 min-h-[400px]" v-motion-pop>
                   <div class="flex items-start justify-between mb-8 border-b border-gray-100 pb-6">
                      <div class="flex items-center gap-5">
                           <div class="w-20 h-20 rounded-[2rem] bg-secondary/20 flex items-center justify-center text-primary border-4 border-white shadow-sm font-black text-3xl">
                               {{ selectedClient.name.charAt(0) }}
                          </div>
                          <div>
                              <h2 class="text-2xl font-black text-[#4a3728]">{{ selectedClient.name }}</h2>
                              <div class="flex flex-wrap gap-2 mt-2">
                                <span class="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-gray-600 font-bold text-xs">
                                    <Phone class="w-3 h-3" /> {{ selectedClient.phone }}
                                </span>
                                <!-- SEGMENTS (Pro Feature) -->
                                <span v-if="selectedClient.appointments.length > 5" class="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase tracking-widest">Fidèle ⭐</span>
                                <span v-else-if="selectedClient.appointments.length > 2" class="px-3 py-1 bg-secondary/20 text-secondary-dark rounded-lg text-xs font-black uppercase tracking-widest">Régulier</span>
                                <span v-else class="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs font-black uppercase tracking-widest text-[10px]">Nouveau</span>
                              </div>
                          </div>
                      </div>
                      <div class="text-right">
                          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Total RDV</p>
                          <p class="text-3xl font-black text-primary">{{ selectedClient.appointments.length }}</p>
                      </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <!-- History -->
                    <div>
                        <h3 class="font-bold text-[#4a3728] mb-4 flex items-center gap-2">
                            <Calendar class="w-5 h-5 text-gray-400" /> Historique RDV
                        </h3>
                        <div class="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            <div v-for="apt in selectedClient.appointments" :key="apt.id" class="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-surface">
                                <div class="flex items-center gap-3">
                                    <div class="flex flex-col text-center min-w-[2.5rem]">
                                        <span class="text-[9px] font-black uppercase text-gray-400">{{ new Date(apt.date).toLocaleDateString('fr-FR', { month: 'short' }) }}</span>
                                        <span class="text-lg font-black text-[#4a3728]">{{ new Date(apt.date).getDate() }}</span>
                                    </div>
                                    <div class="text-xs">
                                        <p class="font-bold text-gray-700">{{ new Date(apt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</p>
                                        <p class="text-[10px] text-primary font-black uppercase">{{ apt.staff_name || 'Équipe' }}</p>
                                    </div>
                                </div>
                                <span class="px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wider"
                                    :class="{
                                        'bg-green-100 text-green-700': apt.status === 'confirmed',
                                        'bg-yellow-100 text-yellow-700': apt.status === 'scheduled',
                                        'bg-red-100 text-red-700': apt.status === 'cancelled',
                                        'bg-gray-100 text-gray-700': apt.status === 'completed'
                                    }"
                                >{{ apt.status }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Notes (Pro Locked) -->
                    <div class="relative">
                        <h3 class="font-bold text-[#4a3728] mb-4 flex items-center gap-2">
                            <Clock class="w-5 h-5 text-gray-400" /> Notes Internes
                        </h3>
                        <div class="h-[300px] bg-gray-50/50 rounded-3xl p-6 border border-gray-100 border-dashed relative overflow-hidden group">
                           <textarea 
                            disabled
                            placeholder="Écrivez une note sur ce client (ex: préférence boissons, allergies...)"
                            class="w-full h-full bg-transparent border-none focus:ring-0 text-sm italic text-gray-400 resize-none font-medium"
                           ></textarea>

                           <!-- Lock Overlay if not Pro -->
                           <div v-if="!authStore.isPro" class="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center p-6 text-center group-hover:bg-white/10 transition-all">
                                <div class="space-y-3">
                                    <div class="w-10 h-10 bg-[#4a3728] text-white rounded-xl flex items-center justify-center mx-auto shadow-lg"><Crown class="w-5 h-5" /></div>
                                    <p class="text-[10px] font-black text-[#4a3728] uppercase tracking-widest">Inclus dans le plan PRO</p>
                                    <button @click="$router.push('/pricing')" class="text-[9px] font-black bg-[#4a3728] text-white px-3 py-1.5 rounded-lg shadow-sm">Découvrir</button>
                                </div>
                           </div>
                        </div>
                    </div>
                  </div>
              </div>

              <div v-else class="h-full bg-white rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-white/50 flex flex-col items-center justify-center p-12 text-center text-gray-400 border-dashed border-2">
                  <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <User class="w-10 h-10 opacity-20" />
                  </div>
                  <h3 class="text-xl font-bold text-gray-600 mb-2">Sélectionnez un client</h3>
                  <p class="max-w-xs mx-auto text-sm">Cliquez sur un client dans la liste pour voir son historique détaillé.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
