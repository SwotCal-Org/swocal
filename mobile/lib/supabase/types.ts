export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      generated_offers: {
        Row: {
          context_signals: Json
          created_at: string
          discount_percent: number
          expires_at: string
          headline: string
          id: string
          merchant_id: string
          status: string
          subline: string
          token: string
          user_id: string | null
          user_session: string | null
        }
        Insert: {
          context_signals?: Json
          created_at?: string
          discount_percent: number
          expires_at?: string
          headline: string
          id?: string
          merchant_id: string
          status?: string
          subline: string
          token?: string
          user_id?: string | null
          user_session?: string | null
        }
        Update: {
          context_signals?: Json
          created_at?: string
          discount_percent?: number
          expires_at?: string
          headline?: string
          id?: string
          merchant_id?: string
          status?: string
          subline?: string
          token?: string
          user_id?: string | null
          user_session?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_offers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address: string | null
          category: string
          created_at: string
          id: string
          image_url: string | null
          lat: number | null
          lng: number | null
          name: string
          owner_id: string | null
          rules: Json
          transaction_volume: string
        }
        Insert: {
          address?: string | null
          category: string
          created_at?: string
          id?: string
          image_url?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          owner_id?: string | null
          rules?: Json
          transaction_volume?: string
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          owner_id?: string | null
          rules?: Json
          transaction_volume?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          intent_vector: Json
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          intent_vector?: Json
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          intent_vector?: Json
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          id: string
          offer_id: string
          redeemed_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          offer_id: string
          redeemed_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          offer_id?: string
          redeemed_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "generated_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          created_at: string
          direction: string
          id: string
          offer_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          offer_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          offer_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swipes_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "generated_offers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
