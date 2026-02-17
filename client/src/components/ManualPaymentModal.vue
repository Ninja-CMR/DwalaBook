<script setup lang="ts">
import { ref } from 'vue';
import { X, Upload, CheckCircle2, Copy, Loader2, AlertCircle } from 'lucide-vue-next';
import api from '../api';

const props = defineProps<{
  isOpen: boolean;
  planId: 'starter' | 'pro';
  amount: number;
}>();

const emit = defineEmits(['close', 'success']);

const step = ref(1); // 1: Instructions, 2: Upload Proof
const isProcessing = ref(false);
const error = ref<string | null>(null);
const transactionId = ref<string | null>(null);
const selectedMethod = ref<'om' | 'mtn' | null>(null);
const proofUrl = ref<string | null>(null);
const isUploading = ref(false);

const paymentNumbers = {
  om: import.meta.env.VITE_OM_NUMBER || '+237 6XX XX XX XX',
  mtn: import.meta.env.VITE_MTN_NUMBER || '+237 6XX XX XX XX'
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  // Optional: Add toast notification locally if needed
};

const initiateManualPayment = async (method: 'om' | 'mtn') => {
  try {
    isProcessing.value = true;
    selectedMethod.value = method;
    error.value = null;

    const response = await api.post('/payments/manual/request', {
      plan: props.planId,
      method: method
    });

    transactionId.value = response.data.transaction_id;
    step.value = 2;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Erreur d'initiation";
  } finally {
    isProcessing.value = false;
  }
};

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    isUploading.value = true;
    error.value = null;

    // In a real app, you'd upload to S3/Cloudinary and get a URL
    // For this prototype, we'll simulate the upload and send the "URL"
    // (Or use a local endpoint if we had a dedicated upload route)
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For now, we'll just use a dummy URL for the proof
    const mockUrl = `https://picsum.photos/seed/${transactionId.value}/800/1200`;
    
    await api.post('/payments/manual/upload-proof', {
      transaction_id: transactionId.value,
      proof_url: mockUrl
    });

    proofUrl.value = mockUrl;
    step.value = 3;
  } catch (err: any) {
    error.value = "Échec de l'upload de la preuve.";
  } finally {
    isUploading.value = false;
  }
};

const close = () => {
  step.value = 1;
  transactionId.value = null;
  selectedMethod.value = null;
  proofUrl.value = null;
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
      <!-- Header -->
      <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#fcf9f4]">
        <div>
          <h3 class="text-xl font-black text-[#4a3728]">Paiement Mobile Money</h3>
          <p class="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Étape {{ step }} sur 3</p>
        </div>
        <button @click="close" class="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-red-500 shadow-sm border border-transparent hover:border-red-100">
          <X class="w-6 h-6" />
        </button>
      </div>

      <div class="p-8">
        <!-- Step 1: Selection & Instructions -->
        <div v-if="step === 1" class="space-y-6">
          <div class="text-center">
            <p class="text-gray-600">Choisissez votre opérateur pour un transfert direct de <span class="font-black text-[#8b5e3c]">{{ amount.toLocaleString() }} FCFA</span></p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="initiateManualPayment('om')"
              class="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all group"
              :class="isProcessing ? 'opacity-50 cursor-not-allowed' : 'border-gray-100 hover:border-[#F4811F] hover:bg-[#F4811F]/5'"
              :disabled="isProcessing"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/bb/Orange-logo.svg" class="w-12 h-12 rounded-lg" alt="Orange" />
              <span class="font-bold text-sm text-[#4a3728] group-hover:text-[#F4811F]">Orange Money</span>
            </button>

            <button 
              @click="initiateManualPayment('mtn')"
              class="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all group"
              :class="isProcessing ? 'opacity-50 cursor-not-allowed' : 'border-gray-100 hover:border-[#FFCC00] hover:bg-[#FFCC00]/5'"
              :disabled="isProcessing"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg" class="w-12 h-12 rounded-lg object-cover" alt="MTN" />
              <span class="font-bold text-sm text-[#4a3728] group-hover:text-[#FFCC00]">MTN MoMo</span>
            </button>
          </div>

          <div v-if="isProcessing" class="flex justify-center py-4">
            <Loader2 class="w-8 h-8 animate-spin text-[#8b5e3c]" />
          </div>

          <div v-if="error" class="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-red-600">
            <AlertCircle class="w-5 h-5 flex-shrink-0" />
            <p class="text-xs font-bold">{{ error }}</p>
          </div>
        </div>

        <!-- Step 2: Confirmation of payment & Upload Proof -->
        <div v-if="step === 2" class="space-y-6">
          <div class="bg-[#f0f9ff] p-6 rounded-3xl border border-blue-100">
            <h4 class="font-black text-[#0369a1] mb-4 flex items-center gap-2">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs">1</span>
              Instructions
            </h4>
            <p class="text-sm text-[#0c4a6e] leading-relaxed">
              Effectuez un transfert de <strong class="text-lg">{{ amount.toLocaleString() }} FCFA</strong> au numéro suivant :
            </p>
            <div class="mt-4 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-blue-200">
              <span class="font-black text-xl text-[#0c4a6e]">{{ selectedMethod === 'om' ? paymentNumbers.om : paymentNumbers.mtn }}</span>
              <button @click="copyToClipboard(selectedMethod === 'om' ? paymentNumbers.om : paymentNumbers.mtn)" class="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                <Copy class="w-5 h-5" />
              </button>
            </div>
            <p class="mt-4 text-[10px] text-blue-400 font-bold uppercase tracking-wider text-center italic">Nom du compte : DwalaBook Services</p>
          </div>

          <div class="space-y-4">
            <h4 class="font-black text-[#4a3728] flex items-center gap-2">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-[#8b5e3c] text-white text-xs">2</span>
              Preuve de paiement
            </h4>
            <p class="text-sm text-gray-500">Une fois le transfert effectué, uploadez une capture d'écran du message de confirmation.</p>
            
            <label class="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-[2rem] cursor-pointer hover:border-[#8b5e3c] hover:bg-[#8b5e3c]/5 transition-all group">
              <div v-if="!isUploading" class="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload class="w-10 h-10 text-gray-300 group-hover:text-[#8b5e3c] mb-3" />
                <p class="text-sm font-bold text-gray-400 group-hover:text-[#4a3728]">Cliquez pour uploader le screenshot</p>
                <p class="text-[10px] text-gray-300 uppercase tracking-widest mt-1">PNG, JPG ou JPEG</p>
              </div>
              <div v-else class="flex flex-col items-center">
                <Loader2 class="w-10 h-10 animate-spin text-[#8b5e3c] mb-3" />
                <p class="text-sm font-bold text-[#8b5e3c]">Envoi en cours...</p>
              </div>
              <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" :disabled="isUploading" />
            </label>
          </div>
        </div>

        <!-- Step 3: Success -->
        <div v-if="step === 3" class="text-center py-8 space-y-6">
          <div class="flex justify-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
              <CheckCircle2 class="w-12 h-12" />
            </div>
          </div>
          <div>
            <h4 class="text-2xl font-black text-[#4a3728]">Demande envoyée !</h4>
            <p class="mt-4 text-gray-600 leading-relaxed">
              Votre preuve de paiement a été reçue. Notre équipe va vérifier la transaction et activer votre pack <strong>{{ planId.toUpperCase() }}</strong> dans un délai de <strong>24h</strong>.
            </p>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Transaction :</p>
            <p class="font-mono text-xs text-gray-600">{{ transactionId }}</p>
          </div>
          <button @click="close" class="w-full bg-[#4a3728] text-white py-4 rounded-2xl font-black shadow-xl hover:-translate-y-1 transition-all active:scale-95">
            D'accord, compris !
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-in {
  animation: in 0.3s ease-out;
}
</style>
