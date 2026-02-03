<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppointmentStore } from '../stores/appointments.store';
import { useAuthStore } from '../stores/auth.store';
import { Calendar, Clock, User, Phone } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';

const appointmentStore = useAppointmentStore();
const authStore = useAuthStore();

onMounted(async () => {
  await appointmentStore.fetchAppointments();
});

const attributes = computed(() => [
  ...appointmentStore.appointments.map(apt => ({
    key: apt.id,
    dot: {
      color: apt.status === 'confirmed' ? 'green' : apt.status === 'cancelled' ? 'red' : 'yellow',
      class: 'w-2 h-2'
    },
    dates: new Date(apt.date),
    customData: apt,
  })),
  {
    key: 'today',
    highlight: {
      color: 'brown',
      fillMode: 'light',
    },
    dates: new Date(),
  },
]);

const selectedDate = ref(new Date());
const viewMode = ref<'day' | 'week' | 'month'>('day');
const selectedStaff = ref('');

const staffList = computed(() => {
    // Extract unique staff names from appointments
    const staff = new Set(appointmentStore.appointments.map(a => a.staff_name).filter(Boolean));
    return Array.from(staff);
});

const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const filteredAppointments = computed(() => {
    const sorted = [...appointmentStore.appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sorted.filter(apt => {
        const aptDate = new Date(apt.date);
        
        // Staff Filter
        if (selectedStaff.value && apt.staff_name !== selectedStaff.value) {
            return false;
        }
        
        if (viewMode.value === 'day') {
            return aptDate.toDateString() === selectedDate.value.toDateString();
        } else if (viewMode.value === 'week') {
            const startStr = getWeekStart(selectedDate.value).toDateString();
            const aptWeekStart = getWeekStart(aptDate).toDateString();
            return startStr === aptWeekStart;
        } else {
            // Month
            return aptDate.getMonth() === selectedDate.value.getMonth() && 
                   aptDate.getFullYear() === selectedDate.value.getFullYear();
        }
    });
});

function onDayClick(day: any) {
    selectedDate.value = day.date;
    // Switch to day view on click if not already
    viewMode.value = 'day';
}
</script>

<template>
  <AppLayout>
    <div class="relative min-h-[600px]">
      <!-- Premium Overlay for Free Users -->
      <div v-if="authStore.isFree" class="absolute inset-0 z-20 backdrop-blur-md bg-[#fcf9f4]/60 flex items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-[3rem]" v-motion-fade>
        <div class="max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6 border border-gray-100">
           <div class="w-20 h-20 bg-yellow-50 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <Calendar class="w-10 h-10 text-yellow-600" />
           </div>
           <div class="space-y-2">
              <h3 class="text-2xl font-black text-[#4a3728]">Agenda Pro requis</h3>
              <p class="text-gray-500 font-medium">La vue agenda avec gestion par employé et planification avancée est réservée aux membres **Starter** et **Pro**.</p>
           </div>
           <button @click="$router.push('/pricing')" class="w-full py-4 bg-[#4a3728] text-white rounded-2xl font-black shadow-lg shadow-stone-900/20 hover:scale-[1.02] transition-all">
              Découvrir les plans Premium
           </button>
        </div>
      </div>

      <div class="space-y-8" v-motion-fade :class="{'opacity-20 pointer-events-none grayscale': authStore.isFree}">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-3xl font-black text-[#4a3728] tracking-tight flex items-center gap-3">
              <Calendar class="w-8 h-8 text-primary" />
              Agenda
            </h2>
            <p class="text-gray-500 font-medium">Gérez votre emploi du temps efficacement.</p>
          </div>

          <div class="flex items-center gap-4">
            <!-- Staff Filter (Premium) -->
            <div v-if="authStore.user?.plan === 'pro'" class="relative">
                 <select 
                    v-model="selectedStaff" 
                    class="appearance-none bg-white border border-gray-100 text-gray-700 py-2 pl-4 pr-8 rounded-xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                 >
                    <option value="">Tous les employés</option>
                    <option v-for="staff in staffList" :key="staff" :value="staff">{{ staff }}</option>
                 </select>
                 <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <User class="w-4 h-4 text-gray-400" />
                 </div>
            </div>
            
            <!-- View Toggles -->
            <div class="bg-white p-1 rounded-xl flex items-center shadow-sm border border-gray-100">
            <button 
                @click="viewMode = 'day'"
                class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                :class="viewMode === 'day' ? 'bg-[#8b5e3c] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'"
            >
                Jour
            </button>
            <button 
                @click="viewMode = 'week'"
                class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                :class="viewMode === 'week' ? 'bg-[#8b5e3c] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'"
            >
                Semaine
            </button>
            <button 
                @click="viewMode = 'month'"
                class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                :class="viewMode === 'month' ? 'bg-[#8b5e3c] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'"
            >
                Mois
            </button>
          </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Calendar Widget -->
          <div class="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/50 border border-white/50">
            <VCalendar
                expanded
                borderless
                transparent
                :attributes="attributes"
                @dayclick="onDayClick"
                class="custom-calendar"
            >
                <template #footer>
                    <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-yellow-400"></span> En attente
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-green-500"></span> Confirmé
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-red-500"></span> Annulé
                        </div>
                    </div>
                </template>
            </VCalendar>
          </div>

          <!-- Selected Period Details -->
          <div class="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/50 border border-white/50 flex flex-col h-[600px]">
            <h3 class="text-xl font-bold text-[#4a3728] mb-6 flex items-center justify-between">
                <div class="flex flex-col leading-tight">
                    <span class="text-gray-400 text-xs uppercase font-bold tracking-wider">Vue {{ viewMode === 'day' ? 'Journalière' : viewMode === 'week' ? 'Hebdomadaire' : 'Mensuelle' }}</span>
                    <span v-if="viewMode === 'day'" class="text-2xl font-black">
                        {{ selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) }}
                    </span>
                    <span v-else-if="viewMode === 'month'" class="text-2xl font-black capitalize">
                        {{ selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }}
                    </span>
                    <span v-else class="text-xl font-black">
                        Semaine du {{ getWeekStart(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }}
                    </span>
                </div>
                <span class="bg-[#fcf9f4] px-3 py-1 rounded-full text-xs font-black text-[#8b5e3c]">
                    {{ filteredAppointments.length }} RDV
                </span>
            </h3>

            <div class="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                <div v-if="filteredAppointments.length === 0" class="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                    <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Calendar class="w-8 h-8 opacity-20" />
                    </div>
                    <p class="font-medium text-sm">Aucun rendez-vous pour cette période.</p>
                </div>

                <div 
                    v-for="apt in filteredAppointments" 
                    :key="apt.id"
                    class="p-4 rounded-2xl border border-gray-100 bg-surface group hover:border-primary/20 hover:shadow-md transition-all relative overflow-hidden"
                >
                    <div class="absolute left-0 top-0 bottom-0 w-1" 
                        :class="{
                            'bg-green-400': apt.status === 'confirmed',
                            'bg-yellow-400': apt.status === 'scheduled',
                            'bg-red-400': apt.status === 'cancelled'
                        }"
                    ></div>
                    
                    <div class="pl-3">
                        <div class="flex items-start justify-between mb-1">
                            <span class="text-xs font-bold text-gray-400 flex items-center gap-1">
                                 <span v-if="viewMode !== 'day'" class="mr-1 text-[#8b5e3c]">{{ new Date(apt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }} -</span>
                                <Clock class="w-3 h-3" />
                                {{ new Date(apt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
                            </span>
                            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                :class="{
                                    'bg-green-100 text-green-700': apt.status === 'confirmed',
                                    'bg-yellow-100 text-yellow-700': apt.status === 'scheduled',
                                    'bg-red-100 text-red-700': apt.status === 'cancelled'
                                }"
                            >
                                {{ apt.status === 'scheduled' ? 'En attente' : apt.status }}
                            </span>
                        </div>
                        
                        <h4 class="font-bold text-[#4a3728] text-base group-hover:text-primary transition-colors">{{ apt.customer_name }}</h4>
                        
                        <div class="flex flex-col gap-1 text-xs font-medium text-gray-500 mt-2">
                            <span class="flex items-center gap-2"><Phone class="w-3 h-3" /> {{ apt.phone }}</span>
                            <span v-if="apt.staff_name" class="flex items-center gap-2 text-primary"><User class="w-3 h-3" /> {{ apt.staff_name }}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>


<style scoped>
/* Minimalist overrides for V-Calendar to match DwalaBook theme */
:deep(.vc-container) {
    font-family: inherit;
    --vc-font-bold: 900;
    --vc-rounded-full: 9999px;
    --vc-color-primary-600: #8b5e3c; /* Brown primary */
    --vc-color-primary: #8b5e3c;
}
:deep(.vc-day-content:hover) {
    background-color: #fcf9f4;
}
:deep(.vc-highlight) {
    background-color: #8b5e3c !important;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
