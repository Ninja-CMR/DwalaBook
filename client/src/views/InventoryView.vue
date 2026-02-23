<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../api';
import { Package, Plus, Pencil, Trash2, AlertTriangle, Loader2 } from 'lucide-vue-next';

const inventory = ref<any[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref('');
const isModalOpen = ref(false);
const editingItem = ref<any>(null);

const form = ref({
  name: '',
  quantity: 0,
  alert_threshold: 5,
  unit_price: 0
});

const loadInventory = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/inventory');
    inventory.value = response.data;
  } catch (err: any) {
    error.value = "Erreur lors du chargement de l'inventaire.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadInventory);

const openModal = (item: any = null) => {
  if (item) {
    editingItem.value = item;
    form.value = { ...item };
  } else {
    editingItem.value = null;
    form.value = { name: '', quantity: 0, alert_threshold: 5, unit_price: 0 };
  }
  isModalOpen.value = true;
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    if (editingItem.value) {
      await api.put(`/inventory/${editingItem.value.id}`, form.value);
    } else {
      await api.post('/inventory', form.value);
    }
    await loadInventory();
    isModalOpen.value = false;
  } catch (err: any) {
    error.value = "Erreur lors de l'enregistrement.";
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Supprimer ce produit ?')) return;
  try {
    await api.delete(`/inventory/${id}`);
    await loadInventory();
  } catch (err: any) {
    error.value = "Erreur lors de la suppression.";
  }
};

const lowStockItems = computed(() => {
  return inventory.value.filter(item => item.quantity <= item.alert_threshold);
});
</script>

<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-black text-[#4a3728]">Gestion du Stock</h1>
        <p class="text-gray-500">Suivez vos produits et soyez alerté avant la rupture.</p>
      </div>
      <button 
        @click="openModal()" 
        class="flex items-center gap-2 bg-[#8b5e3c] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#4a3728] transition-all shadow-lg active:scale-95"
      >
        <Plus class="w-5 h-5" /> Ajouter un produit
      </button>
    </div>

    <!-- Alerts Summary -->
    <div v-if="lowStockItems.length > 0" class="mb-8 p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl flex items-center gap-4 text-orange-800">
      <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
        <AlertTriangle class="w-6 h-6" />
      </div>
      <div>
        <p class="font-bold">Alerte de stock bas !</p>
        <p class="text-sm">{{ lowStockItems.length }} produit(s) nécessitent votre attention.</p>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <Loader2 class="w-10 h-10 animate-spin text-[#8b5e3c]" />
    </div>

    <div v-else class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="p-6 text-sm font-black text-[#8b5e3c] uppercase tracking-widest">Produit</th>
            <th class="p-6 text-sm font-black text-[#8b5e3c] uppercase tracking-widest">Quantité</th>
            <th class="p-6 text-sm font-black text-[#8b5e3c] uppercase tracking-widest">Prix Unitaire</th>
            <th class="p-6 text-sm font-black text-[#8b5e3c] uppercase tracking-widest">Statut</th>
            <th class="p-6 text-sm font-black text-[#8b5e3c] uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in inventory" :key="item.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
            <td class="p-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#8b5e3c]/10 flex items-center justify-center text-[#8b5e3c]">
                  <Package class="w-5 h-5" />
                </div>
                <span class="font-bold text-[#4a3728]">{{ item.name }}</span>
              </div>
            </td>
            <td class="p-6 font-bold text-gray-700">{{ item.quantity }}</td>
            <td class="p-6 font-bold text-gray-700">{{ item.unit_price.toLocaleString() }} FCFA</td>
            <td class="p-6">
              <span 
                class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                :class="item.quantity <= item.alert_threshold ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'"
              >
                {{ item.quantity <= item.alert_threshold ? 'STOCK BAS' : 'OPTIMAL' }}
              </span>
            </td>
            <td class="p-6 text-right">
              <div class="flex justify-end gap-2">
                <button @click="openModal(item)" class="p-2 text-gray-400 hover:text-[#8b5e3c] transition-colors"><Pencil class="w-4 h-4" /></button>
                <button @click="handleDelete(item.id)" class="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="inventory.length === 0">
            <td colspan="5" class="p-20 text-center text-gray-400 font-medium">
              Votre inventaire est vide.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
        <h2 class="text-2xl font-black text-[#4a3728] mb-6">{{ editingItem ? 'Modifier' : 'Nouveau' }} produit</h2>
        
        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Nom du produit</label>
            <input v-model="form.name" type="text" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#8b5e3c]/20" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Quantité</label>
              <input v-model.number="form.quantity" type="number" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#8b5e3c]/20" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Alerte stock bas</label>
              <input v-model.number="form.alert_threshold" type="number" required class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#8b5e3c]/20" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Prix unitaire (FCFA)</label>
            <input v-model.number="form.unit_price" type="number" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#8b5e3c]/20" />
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
