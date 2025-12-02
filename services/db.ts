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
      console.log("Data synced to cloud successfully");
    } catch (e: any) {
      console.error("Cloud sync push failed:", e.message);
    }
  }
}

export const db = new DatabaseService();