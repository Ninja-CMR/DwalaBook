import { defineStore } from 'pinia';
import api from '../api';
import { useAuthStore } from './auth.store';
import { useNotificationStore } from './notifications.store';
import type { Appointment } from '../types';

export const useAppointmentStore = defineStore('appointments', {
    state: () => ({
        appointments: [] as Appointment[],
        loading: false,
        updatingIds: new Set<number>(),
        error: null as string | null,
        authStore: useAuthStore(),
    }),
    getters: {
        hasReachedLimit: (state) => {
            const authStore = useAuthStore();
            return authStore.isFree && state.appointments.length >= 5;
        }
    },
    actions: {
        async fetchAppointments() {
            // Only show full loading spinner if we don't have data yet
            if (this.appointments.length === 0) this.loading = true;
            try {
                const response = await api.get('/appointments');
                this.appointments = response.data;
            } catch (error: any) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async createAppointment(data: any) {
            const notifications = useNotificationStore();
            try {
                const response = await api.post('/appointments', data);
                // Prepend to top of list for immediate feedback
                this.appointments.unshift(response.data);
                // Background refresh to ensure everything is perfect
                this.fetchAppointments();

                notifications.success('Rendez-vous ajouté avec succès !');
                return response.data;
            } catch (error: any) {
                this.error = error.message;
                notifications.error(error.message || "Erreur lors de l'ajout du rendez-vous.");
                throw error;
            }
        },
        async updateStatus(id: number, status: string) {
            const notifications = useNotificationStore();
            this.updatingIds.add(id);
            try {
                const response = await api.patch(`/appointments/${id}/status`, { status });
                const index = this.appointments.findIndex((a) => a.id === id);
                if (index !== -1) {
                    // Use splice for guaranteed reactivity in all Vue environments
                    this.appointments.splice(index, 1, response.data);
                }

                const statusLabels: Record<string, string> = {
                    confirmed: 'confirmé',
                    completed: 'terminé',
                    cancelled: 'annulé'
                };
                notifications.success(`Rendez-vous ${statusLabels[status] || status} !`);
            } catch (error: any) {
                this.error = error.message;
                notifications.error("Impossible de mettre à jour le statut.");
                throw error;
            } finally {
                this.updatingIds.delete(id);
            }
        },
    },
});
