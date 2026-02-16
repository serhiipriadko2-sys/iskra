export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          category: string | null
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          category?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          category?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          created_at: string | null
          delta_signature: Json | null
          id: string
          role: string
          text: string
          user_id: string
          voice_name: string | null
        }
        Insert: {
          created_at?: string | null
          delta_signature?: Json | null
          id?: string
          role: string
          text: string
          user_id: string
          voice_name?: string | null
        }
        Update: {
          created_at?: string | null
          delta_signature?: Json | null
          id?: string
          role?: string
          text?: string
          user_id?: string
          voice_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          completed_today: boolean | null
          created_at: string | null
          id: string
          last_completed: string | null
          ritual_tag: string | null
          streak: number | null
          title: string
          user_id: string
        }
        Insert: {
          completed_today?: boolean | null
          created_at?: string | null
          id?: string
          last_completed?: string | null
          ritual_tag?: string | null
          streak?: number | null
          title: string
          user_id: string
        }
        Update: {
          completed_today?: boolean | null
          created_at?: string | null
          id?: string
          last_completed?: string | null
          ritual_tag?: string | null
          streak?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          analysis_mood: string | null
          analysis_reflection: string | null
          analysis_signature: string | null
          created_at: string | null
          id: string
          prompt_question: string | null
          prompt_why: string | null
          text: string
          user_energy: number | null
          user_id: string
          user_mood: number | null
        }
        Insert: {
          analysis_mood?: string | null
          analysis_reflection?: string | null
          analysis_signature?: string | null
          created_at?: string | null
          id?: string
          prompt_question?: string | null
          prompt_why?: string | null
          text: string
          user_energy?: number | null
          user_id: string
          user_mood?: number | null
        }
        Update: {
          analysis_mood?: string | null
          analysis_reflection?: string | null
          analysis_signature?: string | null
          created_at?: string | null
          id?: string
          prompt_question?: string | null
          prompt_why?: string | null
          text?: string
          user_energy?: number | null
          user_id?: string
          user_mood?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_nodes: {
        Row: {
          content: Json
          created_at: string | null
          doc_type: string | null
          evidence: Json | null
          facet: string | null
          id: string
          layer: string
          section: string | null
          tags: string[] | null
          title: string
          trust_level: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          doc_type?: string | null
          evidence?: Json | null
          facet?: string | null
          id?: string
          layer: string
          section?: string | null
          tags?: string[] | null
          title: string
          trust_level?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          doc_type?: string | null
          evidence?: Json | null
          facet?: string | null
          id?: string
          layer?: string
          section?: string | null
          tags?: string[] | null
          title?: string
          trust_level?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_nodes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_snapshots: {
        Row: {
          chaos: number | null
          clarity: number | null
          created_at: string | null
          ctx_switch: number | null
          drift: number | null
          echo: number | null
          id: string
          interrupt: number | null
          mirror_sync: number | null
          pain: number | null
          phase: string | null
          rhythm: number | null
          silence_mass: number | null
          trust: number | null
          user_id: string
        }
        Insert: {
          chaos?: number | null
          clarity?: number | null
          created_at?: string | null
          ctx_switch?: number | null
          drift?: number | null
          echo?: number | null
          id?: string
          interrupt?: number | null
          mirror_sync?: number | null
          pain?: number | null
          phase?: string | null
          rhythm?: number | null
          silence_mass?: number | null
          trust?: number | null
          user_id: string
        }
        Update: {
          chaos?: number | null
          clarity?: number | null
          created_at?: string | null
          ctx_switch?: number | null
          drift?: number | null
          echo?: number | null
          id?: string
          interrupt?: number | null
          mirror_sync?: number | null
          pain?: number | null
          phase?: string | null
          rhythm?: number | null
          silence_mass?: number | null
          trust?: number | null
          user_id: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          date: string | null
          done: boolean | null
          duration: number | null
          id: string
          priority: string | null
          ritual_tag: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          done?: boolean | null
          duration?: number | null
          id?: string
          priority?: string | null
          ritual_tag?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          done?: boolean | null
          duration?: number | null
          id?: string
          priority?: string | null
          ritual_tag?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          onboarding_complete: boolean | null
          settings: Json | null
          tutorial_complete: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          onboarding_complete?: boolean | null
          settings?: Json | null
          tutorial_complete?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          onboarding_complete?: boolean | null
          settings?: Json | null
          tutorial_complete?: boolean | null
        }
        Relationships: []
      }
      voice_preferences: {
        Row: {
          id: string
          updated_at: string | null
          user_id: string
          voice_name: string
          weight: number | null
        }
        Insert: {
          id?: string
          updated_at?: string | null
          user_id: string
          voice_name: string
          weight?: number | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          user_id?: string
          voice_name?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
