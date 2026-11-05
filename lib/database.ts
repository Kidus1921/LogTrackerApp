/**
 * Database Service Layer
 * Provides functions for interacting with the Supabase database
 * All CRUD operations for purchases and repairs
 */

import { Activity, Category, Purchase, Repair, supabase, Task } from './supabase';

/**
 * Error handling wrapper
 */
const handleError = (operation: string, error: any): any => {
    console.error(`Database error (${operation}):`, error);
    throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
};

// =============================================
// PURCHASES OPERATIONS
// =============================================

/**
 * Load all purchases from the database
 * @returns Array of purchases sorted by created_at DESC
 */
export async function loadPurchases(): Promise<Purchase[]> {
    try {
        const { data, error } = await supabase
            .from('purchases')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return handleError('load purchases', error);
        return (data || []) as Purchase[];
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to load purchases')) throw error;
        return handleError('load purchases', error);
    }
}

/**
 * Add a new purchase to the database
 * @param purchase - Purchase data (without id, created_at, updated_at)
 * @returns The newly created purchase
 */
export async function addPurchase(
    purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>
): Promise<Purchase> {
    try {
        const { data, error } = await supabase
            .from('purchases')
            .insert([purchase])
            .select()
            .single();

        if (error) return handleError('add purchase', error);
        return data as Purchase;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to add purchase')) throw error;
        return handleError('add purchase', error);
    }
}

/**
 * Update an existing purchase
 * @param id - Purchase ID
 * @param updates - Partial purchase data to update
 * @returns The updated purchase
 */
export async function updatePurchase(
    id: string,
    updates: Partial<Omit<Purchase, 'id' | 'created_at' | 'updated_at'>>
): Promise<Purchase> {
    try {
        const { data, error } = await supabase
            .from('purchases')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) return handleError('update purchase', error);
        return data as Purchase;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to update purchase')) throw error;
        return handleError('update purchase', error);
    }
}

/**
 * Delete a purchase by ID
 * @param id - Purchase ID
 */
export async function deletePurchase(id: string): Promise<void> {
    try {
        const { error } = await (supabase as any)
            .from('purchases')
            .delete()
            .eq('id', id);

        if (error) handleError('delete purchase', error);
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to delete purchase')) throw error;
        handleError('delete purchase', error);
    }
}

// =============================================
// TASKS OPERATIONS
// =============================================

/**
 * Load all tasks from the database
 * @returns Array of tasks sorted by due_date ASC
 */
export async function loadTasks(): Promise<Task[]> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('due_date', { ascending: true });

        if (error) return handleError('load tasks', error);
        return (data || []) as Task[];
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to load tasks')) throw error;
        return handleError('load tasks', error);
    }
}

/**
 * Add a new task to the database
 * @param task - Task data (without id, created_at, updated_at)
 * @returns The newly created task
 */
export async function addTask(
    task: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<Task> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert([task])
            .select()
            .single();

        if (error) return handleError('add task', error);
        return data as Task;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to add task')) throw error;
        return handleError('add task', error);
    }
}

/**
 * Update an existing task
 * @param id - Task ID
 * @param updates - Partial task data to update
 * @returns The updated task
 */
export async function updateTask(
    id: string,
    updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
): Promise<Task> {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) return handleError('update task', error);
        return data as Task;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to update task')) throw error;
        return handleError('update task', error);
    }
}

/**
 * Delete a task by ID
 * @param id - Task ID
 */
export async function deleteTask(id: string): Promise<void> {
    try {
        const { error } = await (supabase as any)
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) handleError('delete task', error);
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to delete task')) throw error;
        handleError('delete task', error);
    }
}

/**
 * Get task statistics for dashboard
 */
export async function getTaskStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    dueToday: number;
}> {
    try {
        const tasks = await loadTasks();
        const today = new Date().toISOString().split('T')[0];

        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const pending = total - completed;
        const dueToday = tasks.filter(t => t.due_date && t.due_date.startsWith(today)).length;

        return { total, completed, pending, dueToday };
    } catch (error) {
        return handleError('get task stats', error);
    }
}

// =============================================
// REPAIRS OPERATIONS
// =============================================

/**
 * Load all repairs from the database
 * @returns Array of repairs sorted by created_at DESC
 */
export async function loadRepairs(): Promise<Repair[]> {
    try {
        const { data, error } = await supabase
            .from('repairs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return handleError('load repairs', error);
        return (data || []) as Repair[];
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to load repairs')) throw error;
        return handleError('load repairs', error);
    }
}

/**
 * Add a new repair to the database
 * @param repair - Repair data (without id, created_at, updated_at)
 * @returns The newly created repair
 */
export async function addRepair(
    repair: Omit<Repair, 'id' | 'created_at' | 'updated_at'>
): Promise<Repair> {
    try {
        const { data, error } = await supabase
            .from('repairs')
            .insert([repair])
            .select()
            .single();

        if (error) return handleError('add repair', error);
        return data as Repair;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to add repair')) throw error;
        return handleError('add repair', error);
    }
}

/**
 * Update an existing repair
 * @param id - Repair ID
 * @param updates - Partial repair data to update
 * @returns The updated repair
 */
export async function updateRepair(
    id: string,
    updates: Partial<Omit<Repair, 'id' | 'created_at' | 'updated_at'>>
): Promise<Repair> {
    try {
        const { data, error } = await supabase
            .from('repairs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) return handleError('update repair', error);
        return data as Repair;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to update repair')) throw error;
        return handleError('update repair', error);
    }
}

/**
 * Delete a repair by ID
 * @param id - Repair ID
 */
export async function deleteRepair(id: string): Promise<void> {
    try {
        const { error } = await (supabase as any)
            .from('repairs')
            .delete()
            .eq('id', id);

        if (error) handleError('delete repair', error);
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to delete repair')) throw error;
        handleError('delete repair', error);
    }
}

// =============================================
// CATEGORIES OPERATIONS
// =============================================

/**
 * Load all categories from the database
 * @returns Array of categories sorted by name
 */
export async function loadCategories(): Promise<Category[]> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) return handleError('load categories', error);
        return (data || []) as Category[];
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to load categories')) throw error;
        return handleError('load categories', error);
    }
}

/**
 * Add a new category to the database
 * @param name - Category name
 * @returns The newly created category
 */
export async function addCategory(name: string): Promise<Category> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert([{ name }])
            .select()
            .single();

        if (error) return handleError('add category', error);
        return data as Category;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to add category')) throw error;
        return handleError('add category', error);
    }
}

/**
 * Delete a category by ID
 * @param id - Category ID
 */
export async function deleteCategory(id: string): Promise<void> {
    try {
        const { error } = await (supabase as any)
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) handleError('delete category', error);
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to delete category')) throw error;
        handleError('delete category', error);
    }
}

// =============================================
// COMBINED OPERATIONS
// =============================================

/**
 * Load recent activity from both purchases and repairs
 * Used for dashboard display
 * @param limit - Maximum number of items to return
 * @returns Combined array of recent purchases and repairs
 */
export async function loadRecentActivity(limit: number = 6): Promise<Activity[]> {
    try {
        // Fetch recent purchases
        const { data: purchases, error: purchasesError } = await (supabase as any)
            .from('purchases')
            .select('id, item_name, created_at, price, category')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (purchasesError) return handleError('load recent purchases', purchasesError);

        // Fetch recent repairs
        const { data: repairs, error: repairsError } = await (supabase as any)
            .from('repairs')
            .select('id, item_name, created_at, cost, issue')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (repairsError) return handleError('load recent repairs', repairsError);

        // Merge and sort
        const merged: Activity[] = [
            ...(purchases || []).map((p: any) => ({
                type: 'purchase' as const,
                id: p.id,
                item_name: p.item_name,
                date: p.created_at,
                price: p.price,
                category: p.category,
            })),
            ...(repairs || []).map((r: any) => ({
                type: 'repair' as const,
                id: r.id,
                item_name: r.item_name,
                date: r.created_at,
                cost: r.cost,
                issue: r.issue,
            })),
        ].sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

        return merged.slice(0, limit);
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to load recent')) throw error;
        return handleError('load recent activity', error);
    }
}

/**
 * Load filtered activity from both purchases and repairs within a date range
 * @param startDate - ISO string
 * @param endDate - ISO string
 * @returns Combined array of filtered purchases and repairs
 */
export async function loadFilteredActivity(
    startDate: string,
    endDate: string
): Promise<
    Array<{
        type: 'purchase' | 'repair';
        id: string;
        label: string;
        date: string;
        cost?: number | null;
        category?: string | null;
    }>
> {
    try {
        // Fetch filtered purchases
        const { data: purchases, error: purchasesError } = await (supabase as any)
            .from('purchases')
            .select('id, item_name, purchase_date, price, category')
            .gte('purchase_date', startDate)
            .lte('purchase_date', endDate)
            .order('purchase_date', { ascending: false });

        if (purchasesError) return handleError('filter purchases', purchasesError);

        // Fetch filtered repairs
        const { data: repairs, error: repairsError } = await (supabase as any)
            .from('repairs')
            .select('id, item_name, repair_date, cost, status')
            .gte('repair_date', startDate)
            .lte('repair_date', endDate)
            .order('repair_date', { ascending: false });

        if (repairsError) return handleError('filter repairs', repairsError);

        // Merge and sort
        const merged = [
            ...(purchases || []).map((p: any) => ({
                type: 'purchase' as const,
                id: p.id,
                label: p.item_name,
                date: p.purchase_date,
                cost: p.price,
                category: p.category,
            })),
            ...(repairs || []).map((r: any) => ({
                type: 'repair' as const,
                id: r.id,
                label: r.item_name,
                date: r.repair_date,
                cost: r.cost,
                category: r.status,
            })),
        ].sort((a, b) => (new Date(a.date).getTime() < new Date(b.date).getTime() ? 1 : -1));

        return merged;
    } catch (error) {
        return handleError('load filtered activity', error);
    }
}

/**
 * Load all records (purchases and repairs) from the database
 * @returns Combined array of all purchases and repairs
 */
export async function loadAllRecords(): Promise<
    Array<{
        type: 'purchase' | 'repair';
        id: string;
        item_name: string;
        category?: string | null;
        price?: number | null;
        purchase_date?: string | null;
        vendor?: string | null;
        warranty_months?: number | null;
        issue?: string | null;
        cost?: number | null;
        repair_date?: string | null;
        provider?: string | null;
        status?: 'pending' | 'completed' | null;
        notes?: string | null;
        created_at: string;
    }>
> {
    try {
        const purchases = await loadPurchases();
        const repairs = await loadRepairs();

        const merged = [
            ...purchases.map(p => ({
                ...p,
                type: 'purchase' as const,
                date: p.purchase_date // For generic sorting if needed
            })),
            ...repairs.map(r => ({
                ...r,
                type: 'repair' as const,
                date: r.repair_date // For generic sorting if needed
            }))
        ].sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

        return merged as any[];
    } catch (error) {
        return handleError('load all records', error);
    }
}

/**
 * Get statistics for dashboard
 * @returns Object containing counts and totals
 */
export async function getStatistics(): Promise<{
    totalPurchases: number;
    totalRepairCost: number;
    totalSpend: number;
    purchaseCost: number;
}> {
    try {
        const purchases = await loadPurchases();
        const repairs = await loadRepairs();

        const purchaseCount = (purchases || []).length;
        const repairCost = (repairs || []).reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
        const purchaseCost = (purchases || []).reduce((sum, p) => sum + (Number(p.price) || 0), 0);

        return {
            totalPurchases: purchaseCount,
            totalRepairCost: repairCost,
            totalSpend: purchaseCost + repairCost,
            purchaseCost,
        };
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to get statistics')) throw error;
        return handleError('get statistics', error);
    }
}

/**
 * Export data as CSV
 * @returns CSV string
 */
export async function exportCSV(): Promise<string> {
    try {
        const purchases = await loadPurchases();
        const repairs = await loadRepairs();

        const rows: string[] = [];
        rows.push('type,id,itemName,category/issue,price/cost,date,vendor/provider,notes,createdAt');

        (purchases || []).forEach((p) => {
            rows.push(
                `purchase,${p.id},"${p.item_name}","${p.category ?? ''}","${p.price ?? ''}","${p.purchase_date ?? ''}","${p.vendor ?? ''}","${(p.notes ?? '').replace(/"/g, '""')}",${p.created_at}`
            );
        });

        (repairs || []).forEach((r) => {
            rows.push(
                `repair,${r.id},"${r.item_name}","${r.issue}","${r.cost ?? ''}","${r.repair_date ?? ''}","${r.provider ?? ''}","${(r.notes ?? '').replace(/"/g, '""')}",${r.created_at}`
            );
        });

        return rows.join('\n');
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to export CSV')) throw error;
        return handleError('export CSV', error);
    }
}
