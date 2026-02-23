<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';
import { Users, Plus, Pencil, Trash2, Star, Loader2 } from 'lucide-vue-next';

const staff = ref<any[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref('');
const isModalOpen = ref(false);
const editingStaff = ref<any>(null);

const form = ref({
  name: '',
  role: '',
  specialty: '',
  is_active: true
});

const loadStaff = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/staff');
    staff.value = response.data;
  } catch (err: any) {
    error.value = "Erreur lors du chargement de l'équipe.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadStaff);

const openModal = (item: any = null) => {
  if (item) {
    editingStaff.value = item;
    form.value = { ...item };
  } else {
    editingStaff.value = null;
    form.value = { name: '', role: '', specialty: '', is_active: true };
  }
  isModalOpen.value = true;
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    if (editingStaff.value) {
      await api.put(`/staff/${editingStaff.value.id}`, form.value);
    } else {
      await api.post('/staff', form.value);
    }
    await loadStaff();
    isModalOpen.value = false;
  } catch (err: any) {
    error.value = "Erreur lors de l'enregistrement.";
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Supprimer ce collaborateur ?')) return;
  try {
    await api.delete(`/staff/${id}`);
    await loadStaff();
  } catch (err: any) {
    error.value = "Erreur lors de la suppression.";
  }
};
</script>

<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-black text-[#4a3728]">Mon Équipe</h1>
        <p class="text-gray-500">Gérez vos collaborateurs et leurs spécialités.</p>
      </div>
      <button 
        @click="openModal()" 
        class="flex items-center gap-2 bg-[#8b5e3c] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#4a3728] transition-all shadow-lg active:scale-95"
      >
        <Plus class="w-5 h-5" /> Ajouter un membre
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <Loader2 class="w-10 h-10 animate-spin text-[#8b5e3c]" />
    </div>

    <div v-else-if="staff.length === 0" class="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200">
      <Users class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-xl font-bold text-[#4a3728]">Aucun membre d'équipe</h3>
      <p class="text-gray-500 mb-6">Commencez par ajouter votre premier collaborateur.</p>
      <button @click="openModal()" class="text-[#8b5e3c] font-black uppercase tracking-widest hover:underline">Ajouter maintenant</button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="member in staff" 
        :key="member.id"
        class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 group hover:shadow-xl transition-all"
        :class="{ 'opacity-50' : !member.is_active }"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="w-12 h-12 rounded-2xl bg-[#8b5e3c]/10 flex items-center justify-center text-[#8b5e3c]">
            <Users class="w-6 h-6" />
          </div>
          <div class="flex gap-2">
            <button @click="openModal(member)" class="p-2 text-gray-400 hover:text-[#8b5e3c] transition-colors"><Pencil class="w-4 h-4" /></button>
            <button @click="handleDelete(member.id)" class="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 class="w-4 h-4" /></button>
          </div>
        </div>
        
        <h3 class="text-lg font-black text-[#4a3728]">{{ member.name }}</h3>
        <p class="text-sm font-bold text-[#8b5e3c] uppercase tracking-widest mb-2">{{ member.role }}</p>
        <p v-if="member.specialty" class="text-sm text-gray-500 flex items-center gap-1">
          <Star class="w-3 h-3 text-yellow-500" /> {{ member.specialty }}
        </p>

        <div class="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span class="text-xs font-bold" :class="member.is_active ? 'text-green-600' : 'text-gray-400'">
            {{ member.is_active ? '● Actif' : '○ Inactif' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl scale-in-center">
        <h2 class="text-2xl font-black text-[#4a3728] mb-6">{{ editingStaff ? 'Modifier' : 'Nouveau' }} collaborateur</h2>
        
        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Nom complet</label>
            <input v-model="form.name" type="text" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#8b5e3c]/20" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Rôle / Poste</label>
            <input v-model="form.role" type="text" placeholder="ex: Coiffeur Senior" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#8b5e3c]/20" />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Spécialité</label>
            <input v-model="form.specialty" type="text" placeholder="ex: Coloration, Coupe homme" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#8b5e3c]/20" />
          </div>
          <div class="flex items-center gap-2 py-2">
            <input v-model="form.is_active" type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#8b5e3c] focus:ring-[#8b5e3c]" />
            <label class="text-sm font-bold text-gray-700">Membre actif</label>
          </div>

          <div class="flex gap-3 mt-8">
            <button type="button" @click="isModalOpen = false" class="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Annuler</button>
            <button type="submit" :disabled="isSaving" class="flex-1 bg-[#8b5e3c] text-white py-4 font-bold rounded-xl shadow-lg hover:bg-[#4a3728] transition-all disabled:opacity-70">
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
