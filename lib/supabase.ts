import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Diagnostic logging
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error('Missing Supabase environment variables. Please check your .env file and restart your server.');
}

/**
 * Database Types - Auto-generated from Supabase schema
 */
export interface Purchase {
    id: string;
    item_name: string;
    category?: string | null;
    price?: number | null;
    purchase_date?: string | null;
    vendor?: string | null;
    warranty_months?: number | null;
    receipt_uri?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Repair {
    id: string;
    item_name: string;
    issue: string;
    cost?: number | null;
    repair_date?: string | null;
    provider?: string | null;
    status?: 'pending' | 'completed' | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    created_at: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string | null;
    related_item_id?: string | null;
    related_item_type?: 'purchase' | 'repair' | null;
    due_date?: string | null;
    priority: 'Low' | 'Medium' | 'High';
    category: 'Repair' | 'Maintenance' | 'Purchase Follow-up' | 'General';
    status: 'pending' | 'in_progress' | 'completed';
    is_recurring: boolean;
    recurring_interval?: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
    reminders_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface Activity {
    id: string;
    type: 'purchase' | 'repair';
    item_name: string;
    date: string;
    price?: number | null;
    cost?: number | null;
    category?: string | null;
    issue?: string | null;
}

export type Database = {
    public: {
        Tables: {
            purchases: {
                Row: Purchase;
                Insert: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Purchase, 'id' | 'created_at' | 'updated_at'>>;
            };
            repairs: {
                Row: Repair;
                Insert: Omit<Repair, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Repair, 'id' | 'created_at' | 'updated_at'>>;
            };
            categories: {
                Row: Category;
                Insert: Omit<Category, 'id' | 'created_at'>;
                Update: Partial<Omit<Category, 'id' | 'created_at'>>;
            };
            tasks: {
                Row: Task;
                Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
            };
        };
    };
};

const isWebServer = Platform.OS === 'web' && typeof window === 'undefined';

/**
 * Initialize Supabase client
 * Uses the publishable key for client-side operations
 * Safely handles SSR by checking for window existence
 */
export const supabase = createClient<Database>(SUPABASE_URL as string, SUPABASE_PUBLISHABLE_KEY as string, {
    auth: {
        storage: isWebServer ? undefined : (AsyncStorage as any),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web' && !isWebServer,
    },
});

// Export database types for use in other modules
// (Database is already exported by its definition above)

