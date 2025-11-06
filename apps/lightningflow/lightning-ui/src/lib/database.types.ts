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
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          settings: Json | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          settings?: Json | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          settings?: Json | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_users: {
        Row: {
          tenant_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          tenant_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          tenant_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_users_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          description: string
          amount_sats: number
          original_amount_sats: number | null
          discount_percent: number | null
          status: string
          currency: string
          payment_method: string
          lnurl_data: Json | null
          reference_id: string | null
          expiry_seconds: number | null
          expires_at: string | null
          completed_at: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          description: string
          amount_sats: number
          original_amount_sats?: number | null
          discount_percent?: number | null
          status?: string
          currency?: string
          payment_method?: string
          lnurl_data?: Json | null
          reference_id?: string | null
          expiry_seconds?: number | null
          expires_at?: string | null
          completed_at?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          description?: string
          amount_sats?: number
          original_amount_sats?: number | null
          discount_percent?: number | null
          status?: string
          currency?: string
          payment_method?: string
          lnurl_data?: Json | null
          reference_id?: string | null
          expiry_seconds?: number | null
          expires_at?: string | null
          completed_at?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_payments: {
        Row: {
          id: string
          invoice_id: string
          amount_sats: number
          status: string
          payment_method: string
          payment_request: string | null
          preimage: string | null
          payment_hash: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount_sats: number
          status?: string
          payment_method: string
          payment_request?: string | null
          preimage?: string | null
          payment_hash?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount_sats?: number
          status?: string
          payment_method?: string
          payment_request?: string | null
          preimage?: string | null
          payment_hash?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_methods: {
        Row: {
          id: string
          tenant_id: string
          name: string
          type: string
          is_enabled: boolean
          config: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          type: string
          is_enabled?: boolean
          config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          type?: string
          is_enabled?: boolean
          config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_webhooks: {
        Row: {
          id: string
          tenant_id: string
          invoice_id: string | null
          payment_id: string | null
          event_type: string
          payload: Json | null
          status: string
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          invoice_id?: string | null
          payment_id?: string | null
          event_type: string
          payload?: Json | null
          status?: string
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          invoice_id?: string | null
          payment_id?: string | null
          event_type?: string
          payload?: Json | null
          status?: string
          processed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_webhooks_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_webhooks_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_webhooks_payment_id_fkey"
            columns: ["payment_id"]
            referencedRelation: "invoice_payments"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_analytics: {
        Row: {
          id: string
          tenant_id: string
          date: string
          total_invoices: number
          total_amount_sats: number
          completed_invoices: number
          completed_amount_sats: number
          conversion_rate: number | null
          metrics: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          date: string
          total_invoices?: number
          total_amount_sats?: number
          completed_invoices?: number
          completed_amount_sats?: number
          conversion_rate?: number | null
          metrics?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          date?: string
          total_invoices?: number
          total_amount_sats?: number
          completed_invoices?: number
          completed_amount_sats?: number
          conversion_rate?: number | null
          metrics?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          theme: string | null
          timezone: string | null
          subscription_tier: string | null
          billing_status: string | null
          stripe_customer_id: string | null
          node_pubkey: string | null
          node_alias: string | null
          node_host: string | null
          node_type: string | null
          is_self_hosted: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          theme?: string | null
          timezone?: string | null
          subscription_tier?: string | null
          billing_status?: string | null
          stripe_customer_id?: string | null
          node_pubkey?: string | null
          node_alias?: string | null
          node_host?: string | null
          node_type?: string | null
          is_self_hosted?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          theme?: string | null
          timezone?: string | null
          subscription_tier?: string | null
          billing_status?: string | null
          stripe_customer_id?: string | null
          node_pubkey?: string | null
          node_alias?: string | null
          node_host?: string | null
          node_type?: string | null
          is_self_hosted?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          created_at: string
          model: string
          prompt_tokens: number
          completion_tokens: number
          cost_usd: number
          request_hash: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          model: string
          prompt_tokens?: number
          completion_tokens?: number
          cost_usd?: number
          request_hash?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          model?: string
          prompt_tokens?: number
          completion_tokens?: number
          cost_usd?: number
          request_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 