<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';
import { Check, Loader2, RefreshCw, Users, CreditCard, ExternalLink, ShieldCheck, XCircle } from 'lucide-vue-next';

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
    payment_proof?: string;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    plan: string;
    is_active: boolean;
    days_left?: number;
    created_at: string;
}

const activeTab = ref<'payments' | 'users'>('payments');
const payments = ref<Payment[]>([]);
const users = ref<User[]>([]);
const loading = ref(true);
const processingId = ref<number | null>(null);
const message = ref<{ text: string, type: 'success' | 'error' } | null>(null);

const fetchData = async () => {
    loading.value = true;
    message.value = null;
    try {
        if (activeTab.value === 'payments') {
            const res = await api.get('/admin/pending-payments');
            payments.value = res.data.payments || [];
        } else {
            const res = await api.get('/admin/users');
            users.value = res.data.users || [];
        }
    } catch (err) {
        console.error(err);
        message.value = { text: "Erreur lors du chargement des données.", type: 'error' };
    } finally {
        loading.value = false;
    }
};

const handleAction = async (paymentId: number, action: 'approve' | 'reject') => {
    processingId.value = paymentId;
    message.value = null;
    try {
        const endpoint = action === 'approve' ? `/admin/activate-payment/${paymentId}` : `/admin/reject-payment/${paymentId}`;
        await api.post(endpoint);
        
        message.value = { 
            text: `Paiement ${action === 'approve' ? 'validé' : 'rejeté'} avec succès.`, 
            type: 'success' 
        };
        
        // Remove from list
        payments.value = payments.value.filter(p => p.id !== paymentId);
    } catch (err: any) {
        console.error(err);
        message.value = { 
            text: err.response?.data?.message || "Erreur lors de l'action.", 
            type: 'error' 
        };
    } finally {
        processingId.value = null;
    }
};

const openInNewTab = (url: string) => {
    (window as any).open(url, '_blank');
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-4 sm:p-12">
        <div class="max-w-6xl mx-auto space-y-8">
            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                     <h1 class="text-3xl font-black text-gray-900 tracking-tighter">Admin Central</h1>
                     <p class="text-gray-500 font-medium">Gestion DwalaBook (Cameroun)</p>
                </div>
                <div class="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                    <button 
                        @click="activeTab = 'payments'; fetchData()"
                        :class="[activeTab === 'payments' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50']"
                        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all"
                    >
                        <CreditCard class="w-4 h-4" /> Paiements
                    </button>
                    <button 
                        @click="activeTab = 'users'; fetchData()"
                        :class="[activeTab === 'users' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50']"
                        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all"
                    >
                        <Users class="w-4 h-4" /> Utilisateurs
                    </button>
                    <button @click="fetchData" class="p-2 ml-2 text-gray-400 hover:text-primary transition-colors">
                        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
                    </button>
                </div>
            </div>

            <!-- Messages -->
            <div v-if="message" 
                :class="[message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100']"
                class="p-4 rounded-2xl font-bold text-center border animate-in fade-in slide-in-from-top-2"
            >
                {{ message.text }}
            </div>

            <div v-if="loading" class="text-center py-20 flex flex-col items-center gap-4">
                <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement...</p>
            </div>

            <template v-else>
                <!-- Payments View -->
                <div v-if="activeTab === 'payments'" class="space-y-6">
                    <div v-if="payments.length === 0" class="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-gray-100">
                        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check class="w-10 h-10 text-green-500" />
                        </div>
                        <h3 class="text-xl font-bold text-gray-900">Aucun paiement en attente</h3>
                        <p class="text-gray-500">Tous les paiements manuels ont été traités.</p>
                    </div>

                    <div v-else class="grid gap-6">
                        <div v-for="payment in payments" :key="payment.id" class="bg-white p-6 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center gap-8">
                            <!-- Payment Proof Display -->
                            <div class="w-full lg:w-48 h-48 flex-shrink-0 bg-gray-50 rounded-[2rem] overflow-hidden border-2 border-gray-100 relative group">
                                <template v-if="payment.payment_proof">
                                    <img :src="payment.payment_proof" class="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button @click="openInNewTab(payment.payment_proof)" class="bg-white p-3 rounded-2xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform font-black text-xs text-primary flex items-center gap-2">
                                            <ExternalLink class="w-4 h-4" /> VOIR PLEIN ÉCRAN
                                        </button>
                                    </div>
                                </template>
                                <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
                                     <XCircle class="w-8 h-8 mb-2 opacity-20" />
                                     <span class="text-[10px] font-black uppercase">Preuve non téléchargée</span>
                                </div>
                            </div>

                            <div class="flex-1 space-y-4 text-center lg:text-left">
                                <div class="flex flex-wrap justify-center lg:justify-start items-center gap-3">
                                    <span class="px-4 py-1.5 bg-secondary/10 text-secondary font-black rounded-full text-xs uppercase tracking-widest border border-secondary/20">
                                        {{ payment.plan }}
                                    </span>
                                    <span class="px-4 py-1.5 bg-primary/5 text-primary/60 font-mono rounded-full text-[10px] border border-primary/10">
                                        #{{ payment.transaction_id }}
                                    </span>
                                </div>

                                <div class="space-y-1">
                                    <h4 class="text-2xl font-black text-gray-900 tracking-tight">{{ payment.user_name }}</h4>
                                    <p class="text-gray-500 font-medium">{{ payment.user_email }}</p>
                                </div>

                                <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto lg:mx-0">
                                    <div class="p-3 bg-gray-50 rounded-2xl">
                                        <p class="text-[10px] uppercase font-black text-gray-400 mb-1">Montant</p>
                                        <p class="text-lg font-black text-primary">{{ payment.amount.toLocaleString() }} <small>FCFA</small></p>
                                    </div>
                                    <div class="p-3 bg-gray-50 rounded-2xl">
                                        <p class="text-[10px] uppercase font-black text-gray-400 mb-1">Téléphone</p>
                                        <p class="text-lg font-black text-gray-700">{{ payment.phone || 'N/A' }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <button 
                                    @click="handleAction(payment.id, 'reject')"
                                    :disabled="processingId === payment.id"
                                    class="px-8 py-5 bg-red-50 text-red-600 font-black rounded-[2rem] hover:bg-red-100 transition-all border-2 border-red-50 disabled:opacity-50 active:scale-95"
                                >
                                    REJETER
                                </button>
                                <button 
                                    @click="handleAction(payment.id, 'approve')"
                                    :disabled="processingId === payment.id"
                                    class="px-10 py-5 bg-primary text-white font-black rounded-[2rem] hover:brightness-110 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                                >
                                    <Loader2 v-if="processingId === payment.id" class="w-5 h-5 animate-spin" />
                                    VALIDER LE PLAN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Users View -->
                <div v-else class="space-y-6 animate-in fade-in duration-500">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div v-for="user in users" :key="user.id" class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                            <!-- Background Decor -->
                            <div class="absolute -top-4 -right-4 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                            
                            <div class="relative z-10 flex flex-col h-full space-y-4">
                                <div class="flex justify-between items-start">
                                    <div class="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                                        <Users class="w-6 h-6" />
                                    </div>
                                    <span 
                                        :class="[user.plan !== 'free' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-400']"
                                        class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
                                    >
                                        {{ user.plan }}
                                    </span>
                                </div>

                                <div class="space-y-1">
                                    <h5 class="text-xl font-black text-gray-900 truncate">{{ user.name }}</h5>
                                    <p class="text-xs text-gray-500 font-medium truncate">{{ user.email }}</p>
                                </div>

                                <div class="mt-auto pt-4 border-t border-gray-50 space-y-3">
                                    <div v-if="user.plan !== 'free'" class="flex items-center gap-2 text-secondary font-black text-xs">
                                        <ShieldCheck class="w-4 h-4" /> ABONNEMENT ACTIF
                                        <span class="ml-auto text-gray-400 font-medium">{{ user.days_left }}j restants</span>
                                    </div>
                                    <div v-else class="flex items-center gap-2 text-gray-400 font-bold text-[10px]">
                                        <XCircle class="w-4 h-4 opacity-50" /> PLAN GRATUIT (LIMITÉ)
                                    </div>
                                    
                                    <p class="text-[9px] text-gray-300 font-bold uppercase tracking-wider">
                                        Inscrit le : {{ new Date(user.created_at).toLocaleDateString() }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div v-if="users.length === 0" class="text-center py-20 text-gray-400 font-bold">
                        Aucun utilisateur trouvé.
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.animate-in {
    animation-duration: 0.5s;
}
</style>
