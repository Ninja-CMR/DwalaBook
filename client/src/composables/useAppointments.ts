import { computed } from 'vue';
import { useAppointmentStore } from '../stores/appointments.store';
import { useAuthStore } from '../stores/auth.store';
import type { Appointment } from '../types';

export function useAppointments() {
    const appointmentStore = useAppointmentStore();
    const authStore = useAuthStore();

    const loading = computed(() => appointmentStore.loading);
    const error = computed(() => appointmentStore.error);
    const appointments = computed(() => appointmentStore.appointments);

    const isLimitReached = computed(() => {
        if (!authStore.user) return true;
        return authStore.isFree && appointmentStore.appointments.length >= 5;
    });

    const fetchAppointments = async () => {
        await appointmentStore.fetchAppointments();
    };

    const addAppointment = async (appointment: Partial<Appointment>) => {
        if (isLimitReached.value) {
            throw new Error('Limit reached');
        }
        return await appointmentStore.createAppointment(appointment);
    };

    const updateAppointmentStatus = async (id: number, status: string) => {
        return await appointmentStore.updateStatus(id, status);
    };

    return {
        loading,
        error,
        appointments,
        isLimitReached,
        fetchAppointments,
        addAppointment,
        updateAppointmentStatus
    };
}
