export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    plan: 'free' | 'starter' | 'pro';
    appointment_limit: number;
    plan_expire_at?: string | null;
    business_slug?: string;
    email_notifications?: boolean;
    sms_notifications?: boolean;
    whatsapp_notifications?: boolean;
}

export interface Appointment {
    id: number;
    user_id: number;
    customer_name: string;
    phone: string;
    date: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    staff_name?: string;
    created_at: string;
}
