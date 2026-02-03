<script setup lang="ts">
import { ref } from 'vue';
import { useAppointmentStore } from '../stores/appointments.store';
import { X, Calendar, Clock, User, CheckCircle2, AlertCircle, UserCheck } from 'lucide-vue-next';

const emit = defineEmits(['close']);
const appointmentStore = useAppointmentStore();

const form = ref({
  customer_name: '',
  phone: '',
  email: '',
  date: '',
  time: '',
  staff_name: ''
});

const isSubmitting = ref(false);
const error = ref('');

const staffList = [
  'Équipe DwalaBook',
  'Moussa (Coiffeur/Pro)',
  'Fabiola (Esthétique)',
  'Jean (Consultant)',
  'Carole (Soins)'
];

const handleSubmit = async () => {
  if (!form.value.customer_name || !form.value.date || !form.value.time) return;
  
  isSubmitting.value = true;
  error.value = '';
  try {
    // Robust date construction
    const dateStr = `${form.value.date}T${form.value.time}`;
    const dateTime = new Date(dateStr);
    
    if (isNaN(dateTime.getTime())) {
      throw new Error("Date ou heure invalide.");
    }

    await appointmentStore.createAppointment({
      customer_name: form.value.customer_name,
      phone: form.value.phone,
      email: form.value.email, // Pass email
      date: dateTime.toISOString(),
      staff_name: form.value.staff_name || 'Équipe DwalaBook'
    });
    emit('close');
  } catch (err: any) {
    console.error("Create Appointment Error:", err);
    error.value = err.message || "Hélas ! Impossible d'ajouter ce rendez-vous.";
    if (err.response && err.response.data && err.response.data.message) {
       error.value = err.response.data.message;
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" v-motion-fade>
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-primary-dark/80 backdrop-blur-md" @click="$emit('close')"></div>
    
    <!-- Modal -->
    <div class="relative bg-surface w-full max-w-xl rounded-[3rem] shadow-2xl shadow-black/50 overflow-hidden border border-white/20" v-motion-pop>
      <!-- Header -->
      <div class="p-8 border-b border-gray-100 flex items-center justify-between bg-primary relative">
        <div class="flex items-center gap-4 text-white relative z-10">
          <div class="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
             <Calendar class="w-6 h-6 text-secondary-light" />
          </div>
          <div>
            <h2 class="text-2xl font-black tracking-tight">Nouveau Rendez-vous</h2>
            <p v-if="!appointmentStore.authStore.isFree" class="text-xs font-bold text-primary-light uppercase tracking-widest">Édition {{ appointmentStore.authStore.user?.plan.toUpperCase() }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-3 text-white/40 hover:text-white transition-all hover:bg-white/10 rounded-2xl relative z-10">
          <X class="w-7 h-7" />
        </button>
        <!-- Decor -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-10 space-y-8 bg-surface">
        <div class="space-y-6">
          <!-- Nom Client -->
          <div class="space-y-2">
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <User class="w-3 h-3 text-primary" /> Détails Client
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <input 
                v-model="form.customer_name" 
                type="text" 
                required 
                placeholder="Nom du Client"
                class="block w-full px-5 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-900 font-bold placeholder:font-normal" 
              />
              <input 
                v-model="form.phone" 
                type="tel" 
                placeholder="Numéro (Ex: 6xx...)"
                class="block w-full px-5 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-900 font-bold placeholder:font-normal" 
              />
            </div>
             <input 
                v-model="form.email" 
                type="email" 
                placeholder="Email (Optionnel)"
                class="block w-full px-5 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-900 font-bold placeholder:font-normal" 
              />
          </div>
          
          <!-- Staff Selection (Premium Only) -->
          <div v-if="!appointmentStore.authStore.isFree" class="space-y-2" v-motion-fade>
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <UserCheck class="w-3 h-3 text-primary" /> Professionnel assigné
            </label>
            <div class="relative">
               <select 
                v-model="form.staff_name"
                class="block w-full px-5 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-900 font-black appearance-none shadow-sm cursor-pointer"
               >
                 <option value="" disabled>Sélectionner un membre...</option>
                 <option v-for="staff in staffList" :key="staff" :value="staff">{{ staff }}</option>
               </select>
               <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <UserCheck class="w-5 h-5" />
               </div>
            </div>
          </div>
          
          <!-- Date & Heure -->
          <div class="space-y-2">
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Clock class="w-3 h-3 text-primary" /> Planification
            </label>
            <div class="grid grid-cols-2 gap-4">
              <input 
                v-model="form.date" 
                type="date" 
                required 
                class="block w-full px-5 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-900 font-bold" 
              />
               <input 
                v-model="form.time" 
                type="time" 
                required 
                class="block w-full px-5 py-4 border border-gray-100 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-gray-900 font-bold uppercase" 
              />
            </div>
          </div>
        </div>

        <div v-if="appointmentStore.hasReachedLimit && appointmentStore.authStore.isFree" class="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-[2rem] text-yellow-800 text-xs font-black flex flex-col items-center gap-3 animate-pulse">
           <Crown class="w-8 h-8 text-yellow-500" />
           <p class="text-center italic uppercase tracking-wider leading-relaxed">
             Limite de 5 rendez-vous atteinte ! <br/>
             <router-link to="/pricing" class="text-primary hover:underline">Passez au pack Premium pour continuer.</router-link>
           </p>
        </div>

        <div v-if="error" class="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
           <AlertCircle class="w-5 h-5 shrink-0" />
           {{ error }}
        </div>

        <!-- Actions -->
        <div class="flex gap-4 pt-4">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="flex-1 px-8 py-5 border border-gray-200 rounded-[1.5rem] text-gray-500 font-black hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            :disabled="isSubmitting || (appointmentStore.hasReachedLimit && appointmentStore.authStore.isFree)"
            class="flex-[2] px-8 py-5 bg-primary text-white rounded-[1.5rem] font-black shadow-xl shadow-primary/30 hover:bg-primary-dark hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:grayscale flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
             <span v-if="isSubmitting" class="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
             <template v-else>
               Confirmer le RDV <CheckCircle2 class="w-6 h-6" />
             </template>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
