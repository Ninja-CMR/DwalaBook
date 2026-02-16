<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppointmentStore } from '../stores/appointments.store';
import AppLayout from '../components/AppLayout.vue';
import NewAppointmentModal from '../components/NewAppointmentModal.vue';
import type { Appointment } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Phone, 
  Calendar as CalendarIcon,
  X,
  Clock,
  LayoutList,
  CalendarDays,
  UserCheck,
  Download
} from 'lucide-vue-next';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

const appointmentStore = useAppointmentStore();
const showModal = ref(false);
const filterStatus = ref('all');
const searchQuery = ref('');
// Force list by default for everyone, but let Premium switch if they want
const viewMode = ref<'list' | 'calendar'>(appointmentStore.authStore.user?.plan !== 'free' ? 'calendar' : 'list');

onMounted(() => {
  appointmentStore.fetchAppointments();
});

const filteredAppointments = computed(() => {
  let filtered = appointmentStore.appointments;
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter((a: Appointment) => a.status === filterStatus.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter((a: Appointment) => 
      a.customer_name.toLowerCase().includes(q) || a.phone.includes(q)
    );
  }
  return filtered;
});

// FullCalendar Config
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek',
  locale: frLocale,
  headerToolbar: {
    left: window.innerWidth < 768 ? 'prev,next' : 'prev,next today',
    center: 'title',
    right: window.innerWidth < 768 ? '' : 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  events: appointmentStore.appointments.map(apt => ({
    id: String(apt.id),
    title: `${apt.customer_name} (${apt.staff_name || 'Équipe'})`,
    start: apt.date,
    backgroundColor: getEventColor(apt.status),
    borderColor: 'transparent',
    extendedProps: { ...apt }
  })),
  eventClick: (info: any) => {
    // Potentially open edit modal
    console.log('Event clicked:', info.event.extendedProps);
  },
  height: window.innerWidth < 768 ? 600 : 'auto',
  allDaySlot: false,
  slotMinTime: '07:00:00',
  slotMaxTime: '21:00:00',
  contentHeight: window.innerWidth < 768 ? 500 : 'auto',
  expandRows: true
}));

const getEventColor = (status: string) => {
  switch (status) {
    case 'confirmed': return '#9C6644';
    case 'scheduled': return '#DDB892';
    case 'completed': return '#606C38';
    case 'cancelled': return '#ef4444';
    default: return '#9C6644';
  }
};

const updateStatus = async (id: number, status: string) => {
  await appointmentStore.updateStatus(id, status);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'scheduled': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'confirmed': return 'bg-primary/10 text-primary border-primary/20';
    case 'completed': return 'bg-accent/10 text-accent border-accent/20';
    case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const exportToCSV = () => {
  const headers = ['Client', 'Téléphone', 'Date', 'Heure', 'Statut', 'Staff'];
  const rows = filteredAppointments.value.map((apt: Appointment) => {
    const d = new Date(apt.date);
    return [
      `"${apt.customer_name}"`,
      `"${apt.phone}"`,
      d.toLocaleDateString('fr-FR'),
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      apt.status,
      `"${apt.staff_name || 'Équipe'}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `rendez-vous_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const appointmentsHtml = filteredAppointments.value.map((apt: Appointment) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px;">${apt.customer_name}</td>
            <td style="padding: 12px;">${apt.phone}</td>
            <td style="padding: 12px;">${new Date(apt.date).toLocaleString('fr-FR')}</td>
            <td style="padding: 12px; font-weight: bold; color: #8b5e3c;">${(apt.status || 'scheduled').toUpperCase()}</td>
            <td style="padding: 12px;">${apt.staff_name || 'Équipe'}</td>
        </tr>
    `).join('');

    printWindow.document.write(`
        <html>
            <head>
                <title>Rapport de Rendez-vous - DwalaBook</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #8b5e3c; padding-bottom: 20px; margin-bottom: 40px; }
                    .logo { font-size: 24px; font-weight: 900; color: #4a3728; }
                    table { width: 100%; border-collapse: collapse; }
                    th { text-align: left; background: #fcf9f4; padding: 12px; font-size: 12px; text-transform: uppercase; color: #8b5e3c; }
                    .footer { margin-top: 40px; font-size: 10px; color: #aaa; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">DwalaBook PRO</div>
                    <div>
                        <h1 style="margin: 0; font-size: 18px;">Rapport d'activité</h1>
                        <p style="margin: 5px 0 0; font-size: 12px; color: #666;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Téléphone</th>
                            <th>Date & Heure</th>
                            <th>Statut</th>
                            <th>Staff</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appointmentsHtml}
                    </tbody>
                </table>
                <div class="footer">
                    Document officiel généré par DwalaBook Premium. © ${new Date().getFullYear()}
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); };
                <\/script>
            </body>
        </html>
    `);
    printWindow.document.close();
};
</script>

<template>
  <AppLayout>
    <div v-motion-fade class="max-w-7xl mx-auto space-y-8 w-full overflow-hidden">
      <!-- Header Area -->
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div class="space-y-1">
          <h1 class="text-4xl font-black text-gray-900 tracking-tight">Gestion du Planning</h1>
          <p class="text-gray-500 font-medium italic">Transformez vos rendez-vous en sourires à Douala.</p>
        </div>
        
        <div class="flex items-center gap-3">
           <!-- View Toggle -->
           <div class="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner">
             <button 
              v-if="appointmentStore.authStore.user?.plan !== 'free'"
              @click="viewMode = 'calendar'"
              :class="['px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all', viewMode === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700']"
             >
               <CalendarDays class="w-4 h-4" /> Calendrier
             </button>
             <button 
              @click="viewMode = 'list'"
              :class="['px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all', (viewMode === 'list' || appointmentStore.authStore.user?.plan === 'free') ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700']"
             >
               <LayoutList class="w-4 h-4" /> Liste
             </button>
           </div>
           
           <button 
            @click="exportToCSV"
            class="p-3 bg-white text-gray-700 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
            title="Exporter CSV"
           >
            <Download class="w-5 h-5" />
           </button>

           <!-- Advanced PDF Export (Pro Only) -->
           <button 
            v-if="appointmentStore.authStore.isPro"
            @click="exportToPDF"
            class="p-3 bg-[#4a3728] text-white rounded-xl shadow-lg border border-[#4a3728] hover:bg-[#8b5e3c] transition-all active:scale-95 flex items-center gap-2 px-4"
            title="Rapport Professionnel (PDF)"
           >
            <Download class="w-5 h-5" />
            <span class="text-xs font-black uppercase">PDF PRO</span>
           </button>

           <button 
            @click="showModal = true" 
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
           >
            <Plus class="w-5 h-5 font-black" /> Nouveau RDV
           </button>
        </div>
      </div>

      <!-- Controls (List View Only) -->
      <div v-if="viewMode === 'list'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" v-motion-slide-top>
        <div class="md:col-span-2 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search class="w-5 h-5" />
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Rechercher un client..."
            class="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm shadow-sm"
          />
        </div>
        
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Filter class="w-4 h-4" />
          </div>
          <select 
            v-model="filterStatus"
            class="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm appearance-none shadow-sm font-bold"
          >
            <option value="all">Tous les statuts</option>
            <option value="scheduled">Planifié</option>
            <option value="confirmed">Confirmé</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
      </div>

      <!-- Main Container -->
      <div class="bg-surface rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[500px]">
        
        <!-- Calendar View (Double Locked) -->
        <div v-if="viewMode === 'calendar' && appointmentStore.authStore.user?.plan !== 'free'" class="p-6" v-motion-fade>
           <FullCalendar :options="calendarOptions" class="premium-calendar" />
        </div>

        <!-- List View -->
        <div v-else class="overflow-x-auto w-full" v-motion-fade>
          <div v-if="appointmentStore.loading" class="p-24 text-center">
            <div class="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500 font-black tracking-tight">DwalaBook synchronise vos données...</p>
          </div>

          <div v-else-if="filteredAppointments.length === 0" class="p-24 text-center space-y-6">
              <div class="bg-gray-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-12">
                 <CalendarIcon class="w-12 h-12 text-gray-300" />
              </div>
              <div class="space-y-2">
                <h3 class="text-2xl font-black text-gray-900">Agenda vide</h3>
                <p class="text-gray-500 max-w-sm mx-auto font-medium">Votre excellence mérite d'être planifiée. Ajoutez votre premier rendez-vous !</p>
              </div>
          </div>

          <div v-else>
            <table class="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr class="bg-gray-50/50">
                  <th class="px-4 md:px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.1em] w-[35%]">
                    {{ appointmentStore.authStore.user?.plan !== 'free' ? 'Client & Staff' : 'Client' }}
                  </th>
                  <th class="px-4 md:px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.1em] w-[25%]">Date & Heure</th>
                  <th class="px-4 md:px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.1em] text-center w-[15%]">Statut</th>
                  <th class="px-4 md:px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.1em] text-right w-[25%]">
                    {{ appointmentStore.authStore.user?.plan !== 'free' ? 'Actions Premium' : 'Actions' }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="apt in filteredAppointments" :key="apt.id" class="group hover:bg-primary/[0.02] transition-all">
                  <td class="px-4 md:px-8 py-6">
                    <div class="flex items-center gap-5">
                      <div class="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center text-primary border-2 border-white shadow-sm font-black text-xl">
                        {{ apt.customer_name.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-black text-gray-900 group-hover:text-primary transition-colors text-lg">{{ apt.customer_name }}</p>
                        <div class="flex items-center gap-3 mt-1.5">
                          <span class="flex items-center gap-1 text-gray-500 text-xs font-bold bg-gray-100 px-2 py-0.5 rounded-md">
                            <Phone class="w-3 h-3" /> {{ apt.phone }}
                          </span>
                          <span v-if="appointmentStore.authStore.user?.plan !== 'free'" class="flex items-center gap-1 text-primary text-xs font-black bg-primary/5 px-2 py-0.5 rounded-md">
                            <UserCheck class="w-3 h-3" /> {{ apt.staff_name || 'Équipe' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <div class="flex flex-col">
                      <span class="text-sm font-black text-gray-900 uppercase tracking-tight">{{ new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
                      <span class="flex items-center gap-1 text-sm text-primary font-black mt-1">
                        <Clock class="w-4 h-4" /> {{ new Date(apt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
                      </span>
                    </div>
                  </td>
                  <td class="px-8 py-6 text-center">
                    <span :class="['px-4 py-2 rounded-xl text-xs font-black border uppercase tracking-widest', getStatusBadge(apt.status)]">
                      {{ apt.status }}
                    </span>
                  </td>
                   <td class="px-8 py-6 text-right">
                      <div class="flex justify-end items-center gap-3" :class="appointmentStore.updatingIds.has(apt.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-all'">
                        <button 
                         v-if="apt.status === 'scheduled'" 
                         @click="updateStatus(apt.id, 'confirmed')" 
                         :disabled="appointmentStore.updatingIds.has(apt.id)"
                         class="px-3 py-2 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-bold text-xs disabled:opacity-50 flex items-center gap-2"
                        >
                          <span v-if="appointmentStore.updatingIds.has(apt.id)" class="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                          Confirmer
                        </button>
                        <button 
                         v-if="['scheduled', 'confirmed'].includes(apt.status)" 
                         @click="updateStatus(apt.id, 'completed')" 
                         :disabled="appointmentStore.updatingIds.has(apt.id)"
                         class="px-3 py-2 bg-accent/5 text-accent rounded-xl hover:bg-accent hover:text-white transition-all font-bold text-xs disabled:opacity-50 flex items-center gap-2"
                        >
                          <span v-if="appointmentStore.updatingIds.has(apt.id)" class="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></span>
                          Terminer
                        </button>
                        <button 
                         v-if="apt.status !== 'cancelled' && apt.status !== 'completed'" 
                         @click="updateStatus(apt.id, 'cancelled')" 
                         :disabled="appointmentStore.updatingIds.has(apt.id)"
                         class="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                        >
                          <X class="w-4 h-4" />
                        </button>
                        <button class="p-2 text-gray-300 hover:text-primary transition-colors">
                           <ChevronRight class="w-6 h-6" />
                        </button>
                      </div>
                   </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <NewAppointmentModal v-if="showModal" @close="showModal = false" />
  </AppLayout>
</template>

<style>
/* FullCalendar Custom Premium Styles */
.premium-calendar {
  --fc-border-color: #f3f4f6;
  --fc-today-bg-color: rgba(156, 102, 68, 0.05);
  font-family: inherit;
}

.fc-toolbar-title {
  font-weight: 900 !important;
  color: #111827;
  text-transform: capitalize;
}

.fc-button {
  background: #9C6644 !important;
  border: none !important;
  font-weight: 700 !important;
  border-radius: 0.75rem !important;
  padding: 0.6rem 1rem !important;
  box-shadow: 0 4px 6px -1px rgba(156, 102, 68, 0.2);
}

.fc-button-active {
  background: #7F5539 !important;
}

.fc-event {
  border-radius: 0.5rem !important;
  padding: 0.2rem 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.fc-timegrid-slot {
  height: 4rem !important;
}
</style>
