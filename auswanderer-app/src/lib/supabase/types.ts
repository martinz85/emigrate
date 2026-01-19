/**
 * Supabase Database Types
 * 
 * These types are generated from the Supabase schema.
 * In production, use `supabase gen types typescript` to generate these.
 * 
 * For now, we define them manually based on our schema design.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          subscription_tier: 'free' | 'pro'
          stripe_customer_id: string | null
          newsletter_opt_in: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          subscription_tier?: 'free' | 'pro'
          stripe_customer_id?: string | null
          newsletter_opt_in?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          subscription_tier?: 'free' | 'pro'
          stripe_customer_id?: string | null
          newsletter_opt_in?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      analyses: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          ratings: Json
          pre_analysis: Json | null
          result: Json | null
          paid: boolean
          paid_at: string | null
          stripe_session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          ratings: Json
          pre_analysis?: Json | null
          result?: Json | null
          paid?: boolean
          paid_at?: string | null
          stripe_session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          ratings?: Json
          pre_analysis?: Json | null
          result?: Json | null
          paid?: boolean
          paid_at?: string | null
          stripe_session_id?: string | null
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          role: 'admin' | 'super_admin'
          created_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'super_admin'
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'super_admin'
          created_at?: string
        }
      }
      discount_codes: {
        Row: {
          id: string
          code: string
          discount_percent: number
          valid_from: string | null
          valid_until: string | null
          max_uses: number | null
          current_uses: number
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_percent: number
          valid_from?: string | null
          valid_until?: string | null
          max_uses?: number | null
          current_uses?: number
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_percent?: number
          valid_from?: string | null
          valid_until?: string | null
          max_uses?: number | null
          current_uses?: number
          created_by?: string | null
          created_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          user_id: string | null
          opted_in_at: string
          source: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          user_id?: string | null
          opted_in_at?: string
          source?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          user_id?: string | null
          opted_in_at?: string
          source?: string | null
          unsubscribed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'pro'
      admin_role: 'admin' | 'super_admin'
    }
  }
}

// Convenience types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Analysis = Database['public']['Tables']['analyses']['Row']
export type AnalysisInsert = Database['public']['Tables']['analyses']['Insert']
export type AnalysisUpdate = Database['public']['Tables']['analyses']['Update']

export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type DiscountCode = Database['public']['Tables']['discount_codes']['Row']
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']

