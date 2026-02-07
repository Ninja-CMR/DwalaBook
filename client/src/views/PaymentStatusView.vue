<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { CheckCircle2, XCircle, ArrowRight, Loader2, Clock } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const status = ref<'success' | 'failure' | 'pending' | 'pending_review'>('pending');

onMounted(async () => {
    const resStatus = route.query.status;
    
    if (resStatus === 'success') {
        status.value = 'success';
        // In test mode, we manually trigger the upgrade since no real webhook arrives
        try {
            const plan = route.query.plan as string;
            await authStore.upgradePlan(plan as any);
            await authStore.fetchUser();
        } catch (err) {
            console.error('Test upgrade failed', err);
        }
    } else if (resStatus === 'failure') {
        status.value = 'failure';
    } else if (resStatus === 'pending_review') {
        status.value = 'pending_review';
    } else {
        status.value = 'pending';
    }
});
</script>

<template>
    <div class="min-h-screen bg-[#fcf9f4] flex flex-col items-center justify-center p-6 text-[#4a3728]">
        <div class="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-8" v-motion-pop>
            
            <div v-if="status === 'success'" class="space-y-6">
                <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle2 class="w-16 h-16" />
                </div>
                <h1 class="text-3xl font-black uppercase tracking-tighter italic">Paiement Réussi !</h1>
                <p class="font-bold text-gray-500">Votre abonnement DwalaBook Premium est désormais actif. Profitez des outils illimités !</p>
                <button @click="router.push('/dashboard')" class="w-full py-5 bg-[#4a3728] text-white rounded-2xl font-black shadow-xl hover:bg-[#8b5e3c] transition-all flex items-center justify-center gap-3">
                    Accéder au Dashboard <ArrowRight class="w-5 h-5" />
                </button>
            </div>

            <div v-else-if="status === 'pending_review'" class="space-y-6">
                <div class="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-600">
                    <Clock class="w-16 h-16" />
                </div>
                <h1 class="text-3xl font-black uppercase tracking-tighter italic text-yellow-700">En attente de validation</h1>
                <p class="font-bold text-gray-500">Nous avons bien reçu votre déclaration. Un administrateur va vérifier votre paiement sous peu (max 24h).</p>
                <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                   <p class="text-sm text-yellow-800 font-bold">Vous recevrez un email dès l'activation.</p>
                </div>
                <button @click="router.push('/dashboard')" class="w-full py-5 bg-[#4a3728] text-white rounded-2xl font-black shadow-xl hover:bg-[#8b5e3c] transition-all flex items-center justify-center gap-3">
                    Retour au Dashboard <ArrowRight class="w-5 h-5" />
                </button>
            </div>

            <div v-else-if="status === 'failure'" class="space-y-6">
                <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                    <XCircle class="w-16 h-16" />
                </div>
                <h1 class="text-3xl font-black uppercase tracking-tighter italic">Paiement Échoué</h1>
                <p class="font-bold text-gray-500">La transaction a été annulée ou a échoué. Aucun montant n'a été débité.</p>
                <button @click="router.push('/pricing')" class="w-full py-5 border-2 border-[#4a3728] rounded-2xl font-black hover:bg-[#fcf9f4] transition-all">
                    Réessayer le paiement
                </button>
            </div>
            
            <div v-else class="space-y-6">
                <!-- Fallback loading or unknown pending -->
                <div class="w-24 h-24 bg-brown-100 rounded-full flex items-center justify-center mx-auto text-[#8b5e3c]">
                    <Loader2 class="w-16 h-16 animate-spin" />
                </div>
                <h1 class="text-3xl font-black uppercase tracking-tighter italic">Traitement...</h1>
                <p class="font-bold text-gray-500">Nous vérifions le statut de votre transaction...</p>
            </div>

        </div>
    </div>
</template>
