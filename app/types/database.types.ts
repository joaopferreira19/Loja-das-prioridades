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
      items: {
        Row: {
          id: string
          created_at: string
          name: string
          price: number
          icon: string
          category: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          price: number
          icon: string
          category?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          price?: number
          icon?: string
          category?: string
        }
      }
      players: {
        Row: {
          id: string
          created_at: string
          name: string
          budget: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          budget?: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          budget?: number
        }
      }
      game_state: {
        Row: {
          id: number
          current_round: number
          is_open: boolean
        }
        Insert: {
          id?: number
          current_round?: number
          is_open?: boolean
        }
        Update: {
          id?: number
          current_round?: number
          is_open?: boolean
        }
      }
      purchases: {
        Row: {
          id: string
          player_id: string
          item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          item_id?: string
          created_at?: string
        }
      }
    }
  }
}