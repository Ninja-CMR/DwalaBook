import { defineStore } from 'pinia';
import { ref } from 'vue';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
}

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref<Notification[]>([]);

    const add = (message: string, type: NotificationType = 'info', duration: number = 5000) => {
        const id = Date.now().toString() + Math.random().toString();
        notifications.value.push({ id, message, type, duration });

        if (duration > 0) {
            setTimeout(() => {
                remove(id);
            }, duration);
        }
    };

    const remove = (id: string) => {
        notifications.value = notifications.value.filter(n => n.id !== id);
    };

    const success = (message: string) => add(message, 'success');
    const error = (message: string) => add(message, 'error');
    const info = (message: string) => add(message, 'info');
    const warning = (message: string) => add(message, 'warning');

    return {
        notifications,
        add,
        remove,
        success,
        error,
        info,
        warning
    };
});
