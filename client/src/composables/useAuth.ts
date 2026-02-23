import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

export function useAuth() {
    const authStore = useAuthStore();
    const router = useRouter();

    const user = computed(() => authStore.user);
    const isAuthenticated = computed(() => !!authStore.user);
    const isFree = computed(() => authStore.isFree);
    const isPro = computed(() => authStore.isPro);
    const userPlan = computed(() => authStore.user?.plan || 'free');

    const logout = () => {
        authStore.logout();
        router.push('/login');
    };

    const checkAccess = (requiredPlan?: string) => {
        if (!isAuthenticated.value) {
            router.push('/login');
            return false;
        }

        if (requiredPlan === 'pro' && isFree.value) {
            router.push('/pricing');
            return false;
        }

        return true;
    };

    return {
        user,
        isAuthenticated,
        isFree,
        isPro,
        userPlan,
        logout,
        checkAccess,
        authStore
    };
}
