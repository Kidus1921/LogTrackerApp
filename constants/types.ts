export type ID = string;

export interface Purchase {
  id: ID;
  item_name: string;
  category?: string | null;
  price?: number | null;
  purchase_date?: string | null;
  vendor?: string | null;
  warranty_months?: number | null;
  receipt_uri?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Repair {
  id: ID;
  item_name: string;
  issue: string;
  cost?: number | null;
  repair_date?: string | null;
  provider?: string | null;
  status?: 'pending' | 'completed' | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface StoreData {
  purchases: Purchase[];
  repairs: Repair[];
  categories: Category[];
}


