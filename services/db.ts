import { ComparisonField, TVModel } from '../types';
import { INITIAL_FIELDS, INITIAL_MODELS } from '../constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const FIELDS_KEY = 'tv_compare_fields';
const MODELS_KEY = 'tv_compare_models';
const SUPABASE_CONFIG_KEY = 'tv_compare_supabase_config';

interface SupabaseConfig {
  url: string;
  key: string;
}

class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private isConnected = false;

  constructor() {
    this.initializeSupabase();
  }

  // --- Initialization ---

  private initializeSupabase() {
    const configStr = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (configStr) {
      try {
        const config: SupabaseConfig = JSON.parse(configStr);
        // Validate URL to prevent "Invalid supabaseUrl" error
        if (config.url && config.key && /^https?:\/\//.test(config.url)) {
          this.supabase = createClient(config.url, config.key);
          this.isConnected = true;
          console.log("Supabase Client Initialized");
        } else {
          console.warn("Stored Supabase config has invalid URL, skipping.");
          this.disconnect(); // Clear invalid config
        }
      } catch (e) {
        console.error("Failed to init Supabase", e);
        this.disconnect();
      }
    }
  }

  saveConfig(url: string, key: string) {
    if (!url || !key) return;

    // Strict URL validation
    if (!/^https?:\/\//.test(url)) {
      console.error("Invalid URL format");
      return; 
    }

    try {
      // Attempt to create client to verify validity
      this.supabase = createClient(url, key);
      this.isConnected = true;
      
      const config = { url, key };
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Failed to create Supabase client:", e);
      this.isConnected = false;
      this.supabase = null;
    }
  }

  disconnect() {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
    this.supabase = null;
    this.isConnected = false;
  }

  getIsConnected() {
    return this.isConnected;
  }

  // --- Data Access (Hybrid: Local First, then Cloud) ---

  getFields(): ComparisonField[] {
    const local = localStorage.getItem(FIELDS_KEY);
    if (local) {
      return JSON.parse(local);
    }
    // Initialize with default data if not exists
    localStorage.setItem(FIELDS_KEY, JSON.stringify(INITIAL_FIELDS));
    return INITIAL_FIELDS;
  }

  getModels(): TVModel[] {
    const local = localStorage.getItem(MODELS_KEY);
    if (local) {
      return JSON.parse(local);
    }
    // Initialize with default data if not exists
    localStorage.setItem(MODELS_KEY, JSON.stringify(INITIAL_MODELS));
    return INITIAL_MODELS;
  }

  // --- Saving (Syncs to Cloud if connected) ---

  async saveFields(fields: ComparisonField[]): Promise<void> {
    // 1. Save Local (Instant)
    localStorage.setItem(FIELDS_KEY, JSON.stringify(fields));
    
    // 2. Sync to Cloud
    if (this.isConnected) {
      await this.pushToCloud();
    }
  }

  async saveModels(models: TVModel[]): Promise<void> {
    // 1. Save Local (Instant)
    localStorage.setItem(MODELS_KEY, JSON.stringify(models));

    // 2. Sync to Cloud
    if (this.isConnected) {
      await this.pushToCloud();
    }
  }

  // --- Cloud Synchronization Logic (Single Row Approach) ---

  async pullFromCloud(): Promise<boolean> {
    if (!this.supabase || !this.isConnected) return false;

    try {
      // Fetch the single JSON blob from 'app_data' table, row ID 1
      const { data, error } = await this.supabase
        .from('app_data')
        .select('payload')
        .eq('id', 1)
        .single();

      if (error) {
        // Only log if it's not a "row not found" error which is expected on first run
        if (error.code !== 'PGRST116') {
             console.warn("Cloud fetch error:", error.message);
        }
        return false;
      }

      if (data && data.payload) {
        const cloudData = data.payload;
        
        // Update local storage if cloud data exists
        if (cloudData.fields) localStorage.setItem(FIELDS_KEY, JSON.stringify(cloudData.fields));
        if (cloudData.models) localStorage.setItem(MODELS_KEY, JSON.stringify(cloudData.models));
        return true;
      }
    } catch (e) {
      console.error("Sync pull failed", e);
    }
    return false;
  }

  async pushToCloud(): Promise<void> {
    if (!this.supabase || !this.isConnected) return;

    const payload = {
      fields: this.getFields(),
      models: this.getModels(),
      last_updated: new Date().toISOString()
    };

    try {
      // Upsert the single row
      const { error } = await this.supabase
        .from('app_data')
        .upsert({ id: 1, payload: payload }, { onConflict: 'id' });

      if (error) throw error;
      console.log("✅ Data synced to cloud successfully");
    } catch (e: any) {
      console.error("❌ Cloud sync push failed:", e.message);
      throw e; // Re-throw to handle in UI
    }
  }

  // Test connection and table existence
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.supabase || !this.isConnected) {
      return { success: false, message: 'Not connected to database' };
    }

    try {
      // Try to read from the table
      const { data, error } = await this.supabase
        .from('app_data')
        .select('id')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          return { 
            success: false, 
            message: 'Table "app_data" does not exist. Please run the SQL setup script.' 
          };
        }
        return { success: false, message: error.message };
      }

      // If no data exists, try to insert initial data
      if (!data) {
        const { error: insertError } = await this.supabase
          .from('app_data')
          .insert({ 
            id: 1, 
            payload: { 
              fields: this.getFields(), 
              models: this.getModels(), 
              last_updated: new Date().toISOString() 
            } 
          });

        if (insertError) {
          return { success: false, message: insertError.message };
        }
      }

      return { success: true, message: 'Connection successful!' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  // Get SQL setup instructions
  getSQLSetupInstructions(): string {
    return `-- Run this SQL in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS app_data (
  id INTEGER PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON app_data FOR ALL USING (true) WITH CHECK (true);

INSERT INTO app_data (id, payload) 
VALUES (1, '{"fields": [], "models": []}'::jsonb)
ON CONFLICT (id) DO NOTHING;`;
  }
}

export const db = new DatabaseService();