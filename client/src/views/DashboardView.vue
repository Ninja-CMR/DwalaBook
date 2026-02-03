<script setup lang="ts">
import AppLayout from '../components/AppLayout.vue';
import PaymentModal from '../components/PaymentModal.vue';
import { onMounted, computed, ref } from 'vue';
import { useAppointmentStore } from '../stores/appointments.store';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';
import type { Appointment } from '../types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Search,
  LayoutDashboard,
  Crown,
  Zap,
  TrendingUp,
  BarChart3,
  UserCheck
} from 'lucide-vue-next';

const appointmentStore = useAppointmentStore();
const authStore = useAuthStore();
const router = useRouter();
const showPaymentModal = ref(false);

onMounted(() => {
  appointmentStore.fetchAppointments();
});

const pendingAppointmentsCount = computed(() => {
  return appointmentStore.appointments.filter((a: Appointment) => a.status === 'scheduled').length;
});

const todayAppointmentsCount = computed(() => {
  const today = new Date().toDateString();
  return appointmentStore.appointments.filter((a: Appointment) => new Date(a.date).toDateString() === today).length;
});

const weekAppointmentsCount = computed(() => {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0,0,0,0);
  return appointmentStore.appointments.filter((a: Appointment) => new Date(a.date) >= startOfWeek).length;
});

// Premium Stats
const attendanceRate = computed(() => {
  const total = appointmentStore.appointments.filter(a => ['completed', 'cancelled', 'noshow'].includes(a.status)).length;
  if (total === 0) return 0;
  const completed = appointmentStore.appointments.filter(a => a.status === 'completed').length;
  return Math.round((completed / total) * 100);
});

const cancellationRate = computed(() => {
  const total = appointmentStore.appointments.length;
  if (total === 0) return 0;
  const cancelled = appointmentStore.appointments.filter(a => a.status === 'cancelled').length;
  return Math.round((cancelled / total) * 100);
});

const peakHours = computed(() => {
  const hourMap = new Map<string, number>();
  appointmentStore.appointments.forEach(a => {
      const h = new Date(a.date).getHours() + 'h';
      hourMap.set(h, (hourMap.get(h) || 0) + 1);
  });
  return Array.from(hourMap.entries()).sort((a,b) => b[1] - a[1]).slice(0, 3);
});

const topClients = computed(() => {
   const clientMap = new Map<string, number>();
   appointmentStore.appointments.forEach(a => {
       clientMap.set(a.customer_name, (clientMap.get(a.customer_name) || 0) + 1);
   });
   return Array.from(clientMap.entries()).sort((a,b) => b[1] - a[1]).slice(0, 3);
});

const stats = computed(() => [
  { label: "Aujourd'hui", value: todayAppointmentsCount.value, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Cette Semaine', value: weekAppointmentsCount.value, icon: LayoutDashboard, color: 'text-secondary-dark', bg: 'bg-secondary/20' },
  { label: 'En attente', value: pendingAppointmentsCount.value, icon: Clock, color: 'text-accent', bg: 'bg-accent/10' },
]);

const isEmpty = computed(() => appointmentStore.appointments.length === 0 && !appointmentStore.loading);
const usagePercentage = computed(() => Math.min((appointmentStore.appointments.length / (authStore.user?.appointment_limit || 5)) * 100, 100));
const isLimitReached = computed(() => authStore.isFree && appointmentStore.appointments.length >= 5);
const currentLimit = computed(() => authStore.user?.appointment_limit || 5);

const handlePaymentSuccess = () => {
  showPaymentModal.value = false;
  // State is updated inside the modal simulation
};
</script>

<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto space-y-12 px-6 sm:px-12 lg:px-16" v-motion-fade>
      
      <!-- Welcome Banner -->
      <section class="relative overflow-hidden bg-gradient-to-br from-primary-dark to-primary p-8 md:p-12 rounded-[3rem] text-white shadow-2xl">
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="max-w-xl space-y-4">
             <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
               <Sparkles v-if="!authStore.isFree" class="w-3 h-3 text-secondary" />
               <Zap v-else class="w-3 h-3 text-yellow-400" />
               {{ authStore.isFree ? 'Version Gratuite' : `Plan ${authStore.user?.plan.toUpperCase()}` }}
             </div>
             <h1 class="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]">
               Bonjour, <span class="text-secondary-light">{{ authStore.user?.name.split(' ')[0] || 'Partenaire' }}</span> !
             </h1>
             <p class="text-lg text-primary-light font-medium leading-relaxed opacity-90 max-w-md">
              {{ authStore.isFree 
                  ? 'Faites décoller vos prises de rendez-vous avec un outil de classe mondiale.' 
                  : 'Gérez votre activité sans limites. Votre entreprise brille à Douala.' }}
             </p>
          </div>
          
          <router-link 
            v-if="!isLimitReached"
            to="/appointments" 
            class="group inline-flex items-center justify-center gap-3 px-8 py-5 bg-secondary text-primary-dark font-black rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95 shrink-0"
          >
            <Plus class="w-6 h-6 group-hover:rotate-90 transition-transform" />
            Nouveau RDV
          </router-link>

          <router-link 
            v-else
            to="/pricing"
            class="group inline-flex items-center justify-center gap-3 px-8 py-5 bg-yellow-400 text-black font-black rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95 shrink-0"
          >
            <Crown class="w-6 h-6 animate-bounce" />
            Activer l'illimité
          </router-link>
        </div>
        
        <!-- Premium Progress (If not premium) -->
        <div v-if="authStore.isFree" class="mt-12 relative z-10 p-6 bg-black/20 rounded-[2rem] border border-white/10 backdrop-blur-sm max-w-sm">
           <div class="flex justify-between items-end mb-3">
              <span class="text-xs font-black uppercase tracking-widest opacity-80">Quota de rendez-vous</span>
              <span class="text-sm font-black">{{ appointmentStore.appointments.length }}/{{ currentLimit }}</span>
           </div>
           <div class="h-3 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                class="h-full bg-secondary transition-all duration-1000 ease-out rounded-full"
                :style="{ width: `${usagePercentage}%` }"
              ></div>
           </div>
           <p class="mt-4 text-[11px] font-bold text-secondary-light flex items-center gap-2">
              <Crown class="w-3 h-3" /> Passez en Premium pour débloquer les limites.
           </p>
        </div>
        
        <!-- Abstract Decor -->
        <div class="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
      </section>

      <!-- Stats Section -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div 
          v-for="stat in stats" 
          :key="stat.label"
          class="bg-surface p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:border-primary/20 transition-all cursor-default"
        >
          <div class="space-y-1">
            <p class="text-gray-400 text-xs font-black uppercase tracking-widest">{{ stat.label }}</p>
            <p class="text-4xl font-black text-gray-900">{{ stat.value }}</p>
          </div>
          <div :class="['p-5 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-6', stat.bg]">
            <component :is="stat.icon" :class="['w-8 h-8', stat.color]" />
          </div>
        </div>
      </div>
      
      <!-- Premium Insights (Pro Only) -->
      <div class="space-y-6">
         <div class="flex items-center justify-between px-2">
            <h2 class="text-2xl font-black text-gray-900 flex items-center gap-3">
              <BarChart3 class="w-6 h-6 text-primary" />
              Performances
              <span v-if="authStore.isFree" class="px-2 py-0.5 bg-gray-200 text-gray-500 text-[10px] uppercase font-black rounded-md flex items-center gap-1"><Crown class="w-3 h-3" /> PRO</span>
            </h2>
         </div>

         <div v-if="!authStore.isFree" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" v-motion-slide-visible-once-bottom>
             <!-- Attendance Rate -->
             <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                <p class="text-xs font-black uppercase tracking-widest text-gray-400">Taux de présence</p>
                <div class="flex items-end gap-2">
                    <span class="text-4xl font-black text-green-600">{{ attendanceRate }}%</span>
                    <TrendingUp class="w-6 h-6 text-green-500 mb-1" />
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" :style="{ width: `${attendanceRate}%` }"></div>
                </div>
             </div>
             
              <!-- Cancellation Rate -->
             <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                <p class="text-xs font-black uppercase tracking-widest text-gray-400">Annulations</p>
                 <div class="flex items-end gap-2">
                    <span class="text-4xl font-black text-red-500">{{ cancellationRate }}%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                    <div class="bg-red-500 h-2 rounded-full" :style="{ width: `${cancellationRate}%` }"></div>
                </div>
             </div>

             <!-- Peak Hours -->
             <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                <p class="text-xs font-black uppercase tracking-widest text-gray-400">Heures de pointe</p>
                <div class="space-y-2">
                    <div v-for="(item, index) in peakHours" :key="item[0]" class="flex items-center justify-between text-sm font-bold">
                        <span class="flex items-center gap-2"><Clock class="w-3 h-3 text-primary" /> {{ item[0] }}</span>
                        <span class="bg-gray-100 px-2 rounded-md text-xs">{{ item[1] }} RDV</span>
                    </div>
                    <p v-if="peakHours.length === 0" class="text-xs text-gray-400 italic">Pas assez de données</p>
                </div>
             </div>

             <!-- Top Clients -->
             <div class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                <p class="text-xs font-black uppercase tracking-widest text-gray-400">Top Clients</p>
                 <div class="space-y-2">
                    <div v-for="(item, index) in topClients" :key="item[0]" class="flex items-center justify-between text-sm font-bold">
                        <span class="flex items-center gap-2 truncate max-w-[120px]"><UserCheck class="w-3 h-3 text-secondary-dark" /> {{ item[0] }}</span>
                        <span class="text-primary">{{ item[1] }}x</span>
                    </div>
                     <p v-if="topClients.length === 0" class="text-xs text-gray-400 italic">Pas assez de données</p>
                </div>
             </div>
         </div>

         <!-- Locked State -->
         <div v-else class="relative p-12 bg-gray-50 rounded-[3rem] border border-gray-200 border-dashed text-center overflow-hidden">
            <div class="relative z-10 max-w-md mx-auto space-y-4">
                <Crown class="w-12 h-12 text-yellow-500 mx-auto" />
                <h3 class="text-xl font-black text-gray-800">Débloquez les Statistiques Avancées</h3>
                <p class="text-gray-500 font-medium pb-4">Obtenez une vision claire de votre business : taux de présence, meilleures heures, clients fidèles et plus.</p>
                <button @click="router.push('/pricing')" class="px-8 py-3 bg-[#4a3728] text-white font-black rounded-xl hover:bg-[#8b5e3c] transition-colors shadow-lg">
                    Passer au plan PRO
                </button>
            </div>
            <div class="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>
         </div>
      </div>

      <!-- Main Content Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
        
        <!-- Appointments List -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between px-2">
            <h2 class="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Calendar class="w-6 h-6 text-primary" />
              Activités récentes
            </h2>
            <router-link to="/appointments" class="text-sm font-black text-primary hover:text-primary-dark flex items-center gap-1 group">
               Voir tout l'agenda <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </router-link>
          </div>

          <!-- Empty State -->
          <div v-if="isEmpty" class="bg-surface rounded-[3rem] p-16 text-center border-2 border-dashed border-gray-200 shadow-inner space-y-8" v-motion-pop>
             <div class="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                <LayoutDashboard class="w-12 h-12 text-gray-300" />
             </div>
             <div class="max-w-xs mx-auto space-y-3">
               <h3 class="text-2xl font-black text-gray-900 tracking-tight">C'est le moment !</h3>
               <p class="text-gray-500 font-medium leading-relaxed">Ajoutez votre tout premier client pour commencer à gérer votre planning DwalaBook.</p>
             </div>
             <router-link 
              to="/appointments" 
              class="inline-flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black hover:-translate-y-1 transition-all"
             >
               Commencer maintenant <Plus class="w-5 h-5" />
             </router-link>
          </div>

          <!-- List Content (if not empty) -->
          <div v-else class="bg-surface rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
             <div v-if="appointmentStore.loading" class="p-20 text-center">
                <div class="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
             <div v-else class="divide-y divide-gray-50">
                <div v-for="apt in appointmentStore.appointments.slice(0, 6)" :key="apt.id" class="p-8 flex items-center justify-between hover:bg-primary/[0.02] transition-colors group">
                  <div class="flex items-center gap-5">
                    <div class="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center text-primary font-black text-2xl border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                      {{ apt.customer_name.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-black text-gray-900 leading-tight text-lg">{{ apt.customer_name }}</p>
                      <p class="text-sm text-gray-500 font-bold mt-0.5 flex items-center gap-1">
                          <Crown v-if="apt.status === 'confirmed'" class="w-3 h-3 text-secondary" />
                          {{ apt.phone }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right flex flex-col items-end gap-3">
                    <div class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm"
                      :class="{
                        'bg-green-50 text-green-700 border-green-200 shadow-green-100': apt.status === 'confirmed',
                        'bg-yellow-50 text-yellow-700 border-yellow-200 shadow-yellow-100': apt.status === 'scheduled',
                        'bg-gray-100 text-gray-500 border-gray-200': apt.status === 'completed',
                      }"
                    >
                      {{ apt.status }}
                    </div>
                    <p class="text-xs font-black text-gray-400 uppercase tracking-widest">{{ new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(Math.ceil((new Date(apt.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)), 'day') }}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <!-- Sidebar Widgets -->
        <div class="space-y-8">
           <!-- Premium Promo (Non-premium only) -->
           <div v-if="authStore.isFree" class="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-[3rem] text-black relative overflow-hidden shadow-xl hover:scale-[1.02] transition-all cursor-pointer group" @click="router.push('/pricing')">
              <div class="relative z-10 space-y-4">
                 <Crown class="w-12 h-12 mb-2 group-hover:rotate-12 transition-transform" />
                 <h4 class="text-2xl font-black leading-tight">DwalaBook <br/> Illimité</h4>
                 <p class="text-sm font-bold opacity-80">Rappels SMS, export de données et plus.</p>
                 <button class="w-full py-3 bg-white/20 backdrop-blur-md rounded-2xl font-black text-sm border border-black/10">Passer Pro</button>
              </div>
              <div class="absolute -right-16 -bottom-16 w-48 h-48 bg-white/20 rounded-full blur-3xl text-white opacity-20"><Zap class="w-full h-full" /></div>
           </div>

           <!-- Multi-staff Widget (Pro Only) -->
           <div v-if="!authStore.isFree" class="bg-white p-8 rounded-[3rem] shadow-xl shadow-gray-100 border border-gray-100 space-y-6 border-b-8 border-b-secondary">
               <h4 class="font-black text-gray-900 uppercase tracking-widest text-xs opacity-60">Équipe Actuelle</h4>
               <div class="space-y-4">
                   <div class="flex -space-x-3 overflow-hidden">
                       <div v-for="i in 3" :key="i" class="inline-block h-10 w-10 rounded-full ring-4 ring-white bg-primary/10 flex items-center justify-center font-black text-primary text-xs italic">
                           JD
                       </div>
                       <div class="flex items-center justify-center h-10 w-10 rounded-full ring-4 ring-white bg-gray-100 font-black text-gray-400 text-xs">+</div>
                   </div>
                   <p class="text-xs text-gray-500 font-bold">3 employés configurés. Planification équilibrée.</p>
                   <button @click="router.push('/calendar')" class="text-xs font-black text-primary flex items-center gap-1">Gérer l'équipe <ArrowRight class="w-3 h-3" /></button>
               </div>
           </div>

           <!-- Search Shortcut -->
           <div class="bg-surface p-8 rounded-[3rem] shadow-lg shadow-gray-100 border border-gray-100 space-y-6">
              <h4 class="font-black text-gray-900 uppercase tracking-widest text-xs opacity-60">Recherche rapide</h4>
              <div class="relative">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Nom ou téléphone..."
                  class="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary transition-all text-sm font-black"
                />
              </div>
           </div>

           <!-- Pro Tip -->
           <div class="bg-[#2B2D42] p-8 rounded-[3rem] text-white relative overflow-hidden">
              <div class="relative z-10 space-y-6">
                <div class="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                   <Zap class="w-5 h-5 text-accent-light" />
                </div>
                <div class="space-y-2">
                  <h4 class="text-xl font-black text-secondary-light">Astuce Business</h4>
                  <p class="text-sm text-gray-400 leading-relaxed font-medium">
                    Optimisez vos matinées : les rendez-vous pris avant 10h ont <span class="text-white font-black">20%</span> de chances en moins d'être annulés.
                  </p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- MoMo / Orange Payment -->
    <PaymentModal v-if="showPaymentModal" @close="showPaymentModal = false" @success="handlePaymentSuccess" />
  </AppLayout>
</template>
