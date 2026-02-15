<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';
import { Check, Loader2, RefreshCw } from 'lucide-vue-next';

interface Payment {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    provider: string;
    transaction_id: string;
    amount: number;
    plan: string;
    status: string;
    phone?: string;
    created_at: string;
}

const payments = ref<Payment[]>([]);
const loading = ref(true);
const processingId = ref<string | null>(null);
const message = ref<string | null>(null);

    const fetchPayments = async () => {
    loading.value = true;
    try {
        const res = await api.get('/admin/payments/pending');
        console.log('[ADMIN VIEW DATA]', res.data);
        // Fix: Access the 'payments' property from the response object
        payments.value = res.data.payments || res.data; 
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const handleAction = async (transactionId: string, action: 'approve' | 'reject') => {
    processingId.value = transactionId;
    message.value = null;
    try {
        const endpoint = action === 'approve' ? '/admin/payments/approve' : '/admin/payments/reject';
        await api.post(endpoint, { transactionId });
        
        message.value = `Paiement ${action === 'approve' ? 'validé' : 'rejeté'} avec succès.`;
        
        // Remove from list
        payments.value = payments.value.filter(p => p.transaction_id !== transactionId);
    } catch (err) {
        console.error(err);
        message.value = "Erreur lors de l'action.";
    } finally {
        processingId.value = null;
    }
};

onMounted(() => {
    fetchPayments();
});
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-6 sm:p-12">
        <div class="max-w-6xl mx-auto space-y-8">
            <div class="flex items-center justify-between">
                <div>
                     <h1 class="text-3xl font-black text-gray-900">Admin Dashboard</h1>
                     <p class="text-gray-500">Validation des paiements manuels</p>
                </div>
                <button @click="fetchPayments" class="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all">
                    <RefreshCw class="w-5 h-5 text-gray-600" :class="{ 'animate-spin': loading }" />
                </button>
            </div>

            <div v-if="message" class="p-4 bg-green-100 text-green-800 rounded-xl font-bold text-center">
                {{ message }}
            </div>

            <div v-if="loading" class="text-center py-20">
                <Loader2 class="w-10 h-10 animate-spin mx-auto text-gray-400" />
            </div>

            <div v-else-if="payments.length === 0" class="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-gray-100">
                <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check class="w-10 h-10 text-green-500" />
                </div>
                <h3 class="text-xl font-bold text-gray-900">Tout est à jour</h3>
                <p class="text-gray-500">Aucun paiement en attente de validation.</p>
            </div>

            <div v-else class="grid gap-6">
                <div v-for="payment in payments" :key="payment.transaction_id" class="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-start gap-6">
                    <!-- Payment Proof Image -->
                    <div v-if="payment.payment_proof" class="w-full md:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 cursor-pointer group relative" @click="window.open(payment.payment_proof, '_blank')">
                         <img :src="payment.payment_proof" alt="Preuve" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                         <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                             <div class="opacity-0 group-hover:opacity-100 bg-white/90 p-1 rounded-full text-xs font-bold px-2">Voir</div>
                         </div>
                    </div>
                    <div v-else class="w-full md:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs text-center p-2 border border-gray-200 border-dashed">
                        Pas de preuve
                    </div>

                    <div class="space-y-1 flex-1">
                        <div class="flex items-center gap-3">
                            <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-black uppercase tracking-wider">
                                {{ payment.plan }}
                            </span>
                            <span class="text-xs text-gray-400 font-mono">{{ payment.transaction_id }}</span>
                        </div>
                        <h4 class="text-lg font-bold text-gray-900">{{ payment.user_name }}</h4>
                        <div class="text-sm text-gray-600 space-y-0.5">
                            <p>Email: <strong class="text-gray-900">{{ payment.user_email }}</strong></p>
                            <p>Montant: <strong class="text-gray-900">{{ payment.amount }} FCFA</strong></p>
                            <p>Tel: <strong class="text-gray-900">{{ payment.phone }}</strong></p>
                            <p class="text-xs text-gray-400">{{ new Date(payment.created_at).toLocaleString() }}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <button 
                            @click="handleAction(payment.transaction_id, 'reject')"
                            :disabled="processingId === payment.transaction_id"
                            class="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            Rejeter
                        </button>
                        <button 
                            @click="handleAction(payment.transaction_id, 'approve')"
                            :disabled="processingId === payment.transaction_id"
                            class="flex-1 md:flex-none px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Loader2 v-if="processingId === payment.transaction_id" class="w-4 h-4 animate-spin" />
                            Valider
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
