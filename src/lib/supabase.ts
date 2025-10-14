import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});

// Database types
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    name: string;
                    email: string;
                    role: 'admin' | 'customer';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    email: string;
                    role?: 'admin' | 'customer';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    email?: string;
                    role?: 'admin' | 'customer';
                    updated_at?: string;
                };
            };
            bookings: {
                Row: {
                    id: string;
                    user_id: string;
                    room_id: string;
                    check_in: string;
                    check_out: string;
                    guest_count: number;
                    total_price: number;
                    status: 'pending' | 'confirmed' | 'cancelled';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    room_id: string;
                    check_in: string;
                    check_out: string;
                    guest_count: number;
                    total_price: number;
                    status?: 'pending' | 'confirmed' | 'cancelled';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    room_id?: string;
                    check_in?: string;
                    check_out?: string;
                    guest_count?: number;
                    total_price?: number;
                    status?: 'pending' | 'confirmed' | 'cancelled';
                    updated_at?: string;
                };
            };
        };
    };
}

// Export database type
export type DatabaseType = Database;