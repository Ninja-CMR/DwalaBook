import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAppointmentStore } from '../stores/appointments.store';
import { useAuthStore } from '../stores/auth.store';
import api from '../api';
import type { Appointment } from '../types';

export function useDashboard() {
    const appointmentStore = useAppointmentStore();
    const authStore = useAuthStore();
    const route = useRoute();
    const staffMembers = ref<any[]>([]);

    const loadStaff = async () => {
        try {
            const response = await api.get('/staff');
            staffMembers.value = response.data;
        } catch (err) {
            console.error("Error loading staff for dashboard", err);
        }
    };

    const loadData = () => {
        appointmentStore.fetchAppointments();
        if (authStore.isPro) {
            loadStaff();
        }
    };

    onMounted(loadData);

    watch(() => route?.path, (newPath) => {
        if (newPath === '/dashboard') {
            loadData();
        }
    });

    const recentActivities = computed(() => {
        return [...appointmentStore.appointments]
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, 6);
    });

    const pendingAppointmentsCount = computed(() => {
        return appointmentStore.appointments.filter((a: Appointment) => a.status === 'scheduled').length;
    });

    const todayAppointmentsCount = computed(() => {
        const today = new Date().toDateString();
        return appointmentStore.appointments.filter((a: Appointment) => new Date(a.date).toDateString() === today).length;
    });

    const tomorrowAppointmentsCount = computed(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toDateString();
        return appointmentStore.appointments.filter((a: Appointment) => new Date(a.date).toDateString() === tomorrowStr).length;
    });

    const isEmpty = computed(() => appointmentStore.appointments.length === 0 && !appointmentStore.loading);

    const usagePercentage = computed(() => {
        const limit = authStore.user?.appointment_limit || 5;
        return Math.min((appointmentStore.appointments.length / limit) * 100, 100);
    });

    const isLimitReached = computed(() => authStore.isFree && appointmentStore.appointments.length >= 5);

    const currentLimit = computed(() => authStore.user?.appointment_limit || 5);

    return {
        appointmentStore,
        authStore,
        staffMembers,
        recentActivities,
        pendingAppointmentsCount,
        todayAppointmentsCount,
        tomorrowAppointmentsCount,
        isEmpty,
        usagePercentage,
        isLimitReached,
        currentLimit,
        loadData
    };
}
