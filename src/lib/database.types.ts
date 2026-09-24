// Types du schéma Supabase.
// Écrits à la main au format de `supabase gen types typescript` : peuvent être régénérés avec `pnpm db:types`.
// À garder synchronisé avec supabase/migrations/.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: number
          title: string
          type: Database['public']['Enums']['event_type']
          starts_on: string
          ends_on: string | null
          location: string | null
          description: string | null
          participants: string | null
          details: string | null
          has_details: boolean
          is_featured: boolean
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          title: string
          type?: Database['public']['Enums']['event_type']
          starts_on: string
          ends_on?: string | null
          location?: string | null
          description?: string | null
          participants?: string | null
          details?: string | null
          has_details?: never
          is_featured?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['events']['Insert']>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      event_type:
        | 'Sortie'
        | 'Roulage'
        | 'Initiation'
        | 'Formation'
        | 'Compétition'
        | 'Rassemblement'
        | 'Rallye'
        | 'Solidarité'
        | 'Atelier'
        | 'AG'
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
