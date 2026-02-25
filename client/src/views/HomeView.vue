<script setup lang="ts">
import { 
  Calendar, 
  CheckCircle2, 
  Smartphone, 
  Zap,
  Users,
  Star,
  ChevronRight,
  Menu,
  X,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  MapPin,
  Phone
} from 'lucide-vue-next';
import { ref, onMounted } from 'vue';

const isMenuOpen = ref(false);
const scrollY = ref(0);

const handleScroll = () => {
  scrollY.value = window.scrollY;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

const features = [
  {
    title: "Prise de RDV simplifiée",
    description: "Vos clients réservent en 3 clics, 24h/24, sans que vous ayez à décrocher le téléphone.",
    icon: Calendar,
    color: "bg-orange-100 text-orange-600"
  },
  {
    title: "Rappels WhatsApp & SMS",
    description: "Réduisez les oublis de 80% grâce aux rappels automatiques envoyés directement sur leur mobile.",
    icon: Smartphone,
    color: "bg-green-100 text-green-600"
  },
  {
    title: "Gestion d'Équipe",
    description: "Gérez les plannings de vos collaborateurs et suivez leurs performances en temps réel.",
    icon: Users,
    color: "bg-blue-100 text-blue-600"
  }
];

const stats = [
  { label: "Rendez-vous gérés", value: "50k+" },
  { label: "Salons & Cliniques", value: "100+" },
  { label: "Heures gagnées / mois", value: "20h" },
];

const testimonials = [
  {
    name: "Jean-Pierre T.",
    role: "Propriétaire de Salon",
    content: "DwalaBook a radicalement changé ma façon de travailler. Plus de doublons et mes clients adorent les rappels WhatsApp.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JP"
  },
  {
    name: "Marie-Louise M.",
    role: "Directrice Spa",
    content: "L'interface est intuitive et le support est exceptionnel. Un outil indispensable pour tout business à Douala.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie"
  }
];

const plans = [
  {
    id: 'free',
    name: 'Freemium',
    price: '0',
    description: 'Pour débuter votre activité sans frais.',
    features: ['5 rendez-vous / mois', '1 seul utilisateur', 'Statut de base'],
    buttonText: 'Commencer Gratuitement',
    highlight: false
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '5 000',
    description: 'L’essentiel pour les salons en croissance.',
    features: ['Rendez-vous illimités', 'Gestion complète clients', 'Statistiques basiques', 'Support prioritaire'],
    buttonText: 'Choisir Starter',
    highlight: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '10 000',
    description: 'La puissance totale pour votre business.',
    features: ['Rappels SMS / WhatsApp', 'Multi-employés', 'Gestion du stock', 'Logo personnalisé'],
    buttonText: 'Choisir PRO',
    highlight: false
  }
];
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-slate-900 selection:bg-primary/20">
    <!-- SEO Meta (Simulated for this template, usually handled in index.html or with vue-meta) -->
    <component :is="'title'">DwalaBook | La gestion de rendez-vous réinventée à Douala</component>
    
    <!-- Navigation -->
    <nav 
      class="fixed w-full z-50 transition-all duration-300"
      :class="scrollY > 20 ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'"
    >
      <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Calendar class="w-6 h-6" />
          </div>
          <span class="text-2xl font-black tracking-tighter text-primary-dark">DwalaBook</span>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest text-slate-600">
          <a href="#features" class="hover:text-primary transition-colors">Fonctionnalités</a>
          <a href="#pricing" class="hover:text-primary transition-colors">Tarifs</a>
          <a href="#testimonials" class="hover:text-primary transition-colors">Avis</a>
          <router-link to="/login" class="hover:text-primary transition-colors">Connexion</router-link>
          <router-link to="/register" class="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            Essai Gratuit
          </router-link>
        </div>

        <!-- Mobile Menu Toggle -->
        <button @click="isMenuOpen = !isMenuOpen" class="md:hidden text-slate-900">
          <Menu v-if="!isMenuOpen" class="w-8 h-8" />
          <X v-else class="w-8 h-8" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition 
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="isMenuOpen" class="md:hidden bg-white border-t p-6 space-y-4 shadow-xl">
          <a href="#features" @click="isMenuOpen = false" class="block font-bold py-2">Fonctionnalités</a>
          <a href="#pricing" @click="isMenuOpen = false" class="block font-bold py-2">Tarifs</a>
          <router-link to="/login" class="block font-bold py-2">Connexion</router-link>
          <router-link to="/register" class="block bg-primary text-white text-center py-4 rounded-xl font-black">
            Commencer 
          </router-link>
        </div>
      </transition>
    </nav>

    <!-- Hero Section -->
    <header class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <!-- Decor -->
      <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl -z-10"></div>

      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div class="space-y-8 text-center lg:text-left">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-bold text-xs uppercase tracking-[0.2em] animate-fade-in">
            <Zap class="w-4 h-4 fill-primary" /> Nouveau : Rappels WhatsApp inclus
          </div>
          <h1 class="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-slate-900">
            Gagnez du temps. <br/>
            <span class="text-primary italic">Boostez</span> vos rendez-vous.
          </h1>
          <p class="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            La plateforme de gestion de rendez-vous n°1 au Cameroun. Conçue pour simplifier la vie des professionnels et de leurs clients.
          </p>
          <div class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <router-link to="/register" class="w-full sm:w-auto px-10 py-5 bg-primary text-white font-black text-lg rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              Commencer maintenant <ChevronRight class="w-5 h-5" />
            </router-link>
            <router-link to="/pricing" class="w-full sm:w-auto px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 font-black text-lg rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center">
              Voir les tarifs
            </router-link>
          </div>
          
          <!-- Trust Badges -->
          <div class="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500">
             <div class="flex items-center gap-2 font-black text-xl italic uppercase">OM</div>
             <div class="flex items-center gap-2 font-black text-xl italic uppercase">MTN</div>
             <div class="flex items-center gap-2 font-black text-xl italic uppercase">Stripe</div>
          </div>
        </div>

        <div class="relative">
          <!-- Main App Mockup -->
          <div class="relative z-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border-8 border-slate-900/5 overflow-hidden animate-float">
             <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1470&auto=format&fit=crop" alt="Dashboard Preview" class="w-full h-auto" />
             <div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
             
             <!-- Floating Element -->
             <div class="absolute bottom-6 left-6 right-6 p-6 bg-white/95 backdrop-blur-md rounded-3xl shadow-xl flex items-center gap-4">
                <div class="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white">
                   <CheckCircle2 class="w-8 h-8" />
                </div>
                <div>
                   <p class="font-black text-slate-900">Rendez-vous confirmé !</p>
                   <p class="text-xs text-slate-500">Rappel envoyé par WhatsApp 🚀</p>
                </div>
             </div>
          </div>
          
          <!-- Background Shape -->
          <div class="absolute -top-10 -right-10 w-full h-full bg-primary/10 rounded-[4rem] -rotate-6 -z-10"></div>
        </div>
      </div>
    </header>

    <!-- Stats -->
    <section class="bg-primary-dark py-12">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="stat in stats" :key="stat.label" class="text-center space-y-2">
          <p class="text-4xl lg:text-6xl font-black text-secondary-light">{{ stat.value }}</p>
          <p class="text-primary-light font-bold uppercase tracking-widest text-xs">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-32 bg-slate-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-20 space-y-4">
           <h2 class="text-xs font-black text-primary uppercase tracking-[0.3em]">Excellence opérationnelle</h2>
           <h3 class="text-4xl lg:text-5xl font-black text-slate-900">Tout ce dont vous avez besoin pour gérer votre salon.</h3>
           <p class="text-lg text-slate-500 font-medium">Nous avons écouté les professionnels locaux pour créer la solution la plus adaptée au marché camerounais.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div v-for="feature in features" :key="feature.title" class="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div :class="['w-16 h-16 rounded-3xl flex items-center justify-center mb-8', feature.color]">
              <component :is="feature.icon" class="w-8 h-8" />
            </div>
            <h4 class="text-2xl font-black text-slate-900 mb-4">{{ feature.title }}</h4>
            <p class="text-slate-500 leading-relaxed font-medium">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section (Bento Inspired Design) -->
    <section id="pricing" class="py-32 bg-white overflow-hidden">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Section Title Area -->
          <div class="lg:col-span-4 flex flex-col justify-center space-y-6">
            <h2 class="text-xs font-black text-primary uppercase tracking-[0.3em]">Tarifs Flexibles</h2>
            <h3 class="text-4xl lg:text-6xl font-black text-slate-900 leading-none tracking-tighter">
              Un plan pour chaque <span class="text-primary italic">taille</span>.
            </h3>
            <p class="text-lg text-slate-500 font-medium leading-relaxed">
              Paiement simple par <strong>Mobile Money</strong> (OM/MTN) ou carte Bancaire. Pas d'engagement, annulez quand vous voulez.
            </p>
            <div class="pt-4 flex items-center gap-4">
              <div class="flex -space-x-3">
                <img v-for="i in 4" :key="i" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*123}`" class="w-10 h-10 rounded-full border-2 border-white bg-slate-100" />
              </div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">+100 pros nous font confiance</p>
            </div>
          </div>

          <!-- Pricing Grid (Bento Style) -->
          <div class="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 relative">
            
            <!-- Freemium Card -->
            <div class="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-2xl transition-all duration-500 group">
              <div>
                <div class="flex justify-between items-start mb-6">
                  <h4 class="text-xl font-black text-slate-400 uppercase tracking-widest">Base</h4>
                  <div class="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-200">
                    <Zap class="w-5 h-5 text-slate-300" />
                  </div>
                </div>
                <p class="text-3xl font-black text-slate-900 mb-2">Freemium</p>
                <p class="text-sm text-slate-500 font-medium mb-8">Idéal pour les auto-entrepreneurs.</p>
                <ul class="space-y-3 mb-8">
                  <li v-for="f in plans?.[0]?.features" :key="f" class="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <CheckCircle2 class="w-4 h-4 text-primary" /> {{ f }}
                  </li>
                </ul>
              </div>
              <router-link to="/register" class="w-full py-4 bg-white border-2 border-slate-200 text-slate-900 text-center font-black rounded-2xl group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                Démarrer
              </router-link>
            </div>

            <!-- Starter Card (Highlight) -->
            <div class="row-span-2 bg-primary-dark p-10 rounded-[3rem] text-white shadow-2xl shadow-primary/40 relative overflow-hidden flex flex-col justify-between group">
              <!-- Decor -->
              <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div>
                <div class="inline-block px-4 py-1 bg-secondary text-primary-dark rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                  Plus Populaire
                </div>
                <h4 class="text-5xl font-black mb-2 italic">Starter</h4>
                <div class="flex items-baseline gap-2 mb-8">
                  <span class="text-6xl font-black">5.000</span>
                  <span class="text-sm font-bold opacity-70 uppercase tracking-widest">FCFA/mois</span>
                </div>
                <p class="text-primary-light font-medium mb-10 leading-relaxed text-lg">
                  La solution complète pour les salons professionnels qui veulent passer à la vitesse supérieure.
                </p>
                <ul class="space-y-4 mb-12">
                  <li v-for="f in plans?.[1]?.features" :key="f" class="flex items-center gap-4 text-md font-black">
                    <div class="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                       <CheckCircle2 class="w-4 h-4 text-secondary-light" />
                    </div>
                    {{ f }}
                  </li>
                </ul>
              </div>

              <router-link to="/register" class="w-full py-6 bg-secondary text-primary-dark text-center font-black text-xl rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                Choisir Starter
              </router-link>
            </div>

            <!-- Pro Card -->
            <div class="bg-secondary-light/30 p-8 rounded-[3rem] border border-secondary-light/50 flex flex-col justify-between hover:bg-white hover:shadow-2xl transition-all duration-500 group">
              <div>
                <div class="flex justify-between items-start mb-6">
                  <h4 class="text-xl font-black text-primary uppercase tracking-widest">Master</h4>
                  <div class="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-secondary">
                    <Star class="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div class="flex items-baseline gap-2 mb-2">
                  <span class="text-3xl font-black text-slate-900 text-slate-900">10.000</span>
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">FCFA/m</span>
                </div>
                <p class="text-slate-900 font-black text-2xl mb-6">Version PRO</p>
                <ul class="space-y-3 mb-8">
                  <li v-for="f in plans?.[2]?.features" :key="f" class="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <CheckCircle2 class="w-4 h-4 text-primary" /> {{ f }}
                  </li>
                </ul>
              </div>
              <router-link to="/register" class="w-full py-4 bg-primary text-white text-center font-black rounded-2xl hover:bg-primary-dark transition-all">
                Passer Pro
              </router-link>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-32">
      <div class="max-w-7xl mx-auto px-6">
        <div class="bg-gradient-to-br from-primary-dark to-primary rounded-[4rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-3xl shadow-primary/40">
           <!-- Decor -->
           <div class="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
           <div class="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl"></div>

           <div class="relative z-10 max-w-3xl mx-auto space-y-10">
              <h3 class="text-4xl lg:text-7xl font-black tracking-tighter leading-none">
                Prêt à faire passer votre business au niveau supérieur ?
              </h3>
              <p class="text-xl text-primary-light font-medium opacity-90">
                Rejoignez les centaines de professionnels qui font confiance à DwalaBook à Douala, Yaoundé et partout au Cameroun.
              </p>
              <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <router-link to="/register" class="w-full sm:w-auto px-12 py-6 bg-secondary text-primary-dark font-black text-xl rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                    Commencer Gratuitement
                 </router-link>
                 <a href="https://wa.me/237XXXXXXXXX" target="_blank" class="w-full sm:w-auto px-12 py-6 bg-white/10 backdrop-blur-md text-white font-black text-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                    <Smartphone class="w-6 h-6" /> Support WhatsApp
                 </a>
              </div>
           </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section id="testimonials" class="py-32 bg-white">
      <div class="max-w-7xl mx-auto px-6">
         <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
               <h3 class="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Ils nous font confiance</h3>
               <h4 class="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-8">Ce que disent nos partenaires.</h4>
               <p class="text-xl text-slate-500 font-medium leading-relaxed mb-10">
                 La satisfaction de nos clients est notre meilleure publicité. Découvrez comment DwalaBook aide les entreprises locales au quotidien.
               </p>
               <div class="flex items-center gap-2 text-yellow-500">
                  <Star v-for="i in 5" :key="i" class="w-6 h-6 fill-yellow-500" />
                  <span class="ml-2 font-black text-slate-900">4.9/5 sur Google Reviews</span>
               </div>
            </div>

            <div class="space-y-8">
               <div v-for="t in testimonials" :key="t.name" class="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 relative group transition-all duration-500 hover:bg-white hover:shadow-2xl">
                  <div class="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-black italic shadow-lg shadow-primary/30">“</div>
                  <p class="text-lg text-slate-600 font-medium italic mb-8 leading-relaxed">
                    “{{ t.content }}”
                  </p>
                  <div class="flex items-center gap-4">
                     <img :src="t.avatar" alt="Avatar" class="w-14 h-14 rounded-2xl bg-slate-200" />
                     <div>
                        <p class="font-black text-slate-900 uppercase tracking-widest text-sm">{{ t.name }}</p>
                        <p class="text-primary font-bold text-xs uppercase tracking-widest">{{ t.role }}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-900 pt-32 pb-10 text-white">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 pb-20 border-b border-white/5">
        <div class="space-y-6">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <Calendar class="w-6 h-6" />
            </div>
            <span class="text-2xl font-black tracking-tighter">DwalaBook</span>
          </div>
          <p class="text-slate-400 font-medium leading-relaxed">
            Simplifiez la gestion de vos rendez-vous. Présent à Douala, Yaoundé et Bafoussam. 🇨🇲
          </p>
          <div class="flex items-center gap-4">
            <a href="https://facebook.com/dwalabook" target="_blank" class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-primary transition-colors"><Facebook class="w-5 h-5 text-slate-400 group-hover:text-white" /></a>
            <a href="https://instagram.com/dwalabook" target="_blank" class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-primary transition-colors"><Instagram class="w-5 h-5" /></a>
            <a href="https://twitter.com/dwalabook" target="_blank" class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-primary transition-colors"><Twitter class="w-5 h-5" /></a>
          </div>
        </div>

        <div class="space-y-8">
          <h5 class="text-xs font-black uppercase tracking-[0.3em] text-primary">Plateforme</h5>
          <ul class="space-y-4 font-bold text-slate-400 text-sm italic">
            <li><router-link to="/pricing" class="hover:text-white transition-colors">Nos Tarifs</router-link></li>
            <li><router-link to="/register" class="hover:text-white transition-colors">Créer un compte</router-link></li>
            <li><router-link to="/login" class="hover:text-white transition-colors">Espace Pro</router-link></li>
            <li><a href="mailto:contact@dwalabook.cm" class="hover:text-white transition-colors">Support Technique</a></li>
          </ul>
        </div>

        <div class="space-y-8">
          <h5 class="text-xs font-black uppercase tracking-[0.3em] text-primary">Légal</h5>
          <ul class="space-y-4 font-bold text-slate-400 text-sm italic">
            <li><router-link to="/legal" class="hover:text-white transition-colors">Mentions Légales</router-link></li>
            <li><router-link to="/privacy" class="hover:text-white transition-colors">Confidentialité</router-link></li>
            <li><router-link to="/terms" class="hover:text-white transition-colors">CGV / CGU</router-link></li>
            <li><router-link to="/privacy" class="hover:text-white transition-colors">Cookies</router-link></li>
          </ul>
        </div>

        <div class="space-y-8">
          <h5 class="text-xs font-black uppercase tracking-[0.3em] text-primary">Contact</h5>
          <ul class="space-y-4 font-bold text-slate-400 text-sm">
            <li class="flex items-center gap-3"><Mail class="w-4 h-4 text-primary" /> contact@dwalabook.cm</li>
            <li class="flex items-center gap-3"><Phone class="w-4 h-4 text-primary" /> +237 6 77 00 00 00</li>
            <li class="flex items-center gap-3 italic"><MapPin class="w-4 h-4 text-primary" /> Akwa, Douala, Cameroun</li>
          </ul>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 font-bold text-xs uppercase tracking-widest text-center">
        <p>© 2026 DwalaBook. Tous droits réservés.</p>
        <p>Fièrement développé au 🇨🇲 pour les professionnels du monde entier.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}

nav {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.shadow-3xl {
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
}

/* Custom selection color */
::selection {
  background-color: theme('colors.primary.DEFAULT');
  color: white;
}
</style>
