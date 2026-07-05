export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      graph_edges: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          source: string
          target: string
          type: string
          user_id: string | null
          weight: number
        }
        Insert: {
          created_at?: string | null
          id: string
          metadata?: Json | null
          source: string
          target: string
          type: string
          user_id?: string | null
          weight?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          target?: string
          type?: string
          user_id?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "graph_edges_source_fkey"
            columns: ["source"]
            isOneToOne: false
            referencedRelation: "graph_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graph_edges_target_fkey"
            columns: ["target"]
            isOneToOne: false
            referencedRelation: "graph_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graph_edges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      graph_nodes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          layer: string
          metadata: Json | null
          metrics_snapshot: Json | null
          related_ids: string[] | null
          resonance_score: number | null
          timestamp: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id: string
          layer: string
          metadata?: Json | null
          metrics_snapshot?: Json | null
          related_ids?: string[] | null
          resonance_score?: number | null
          timestamp?: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          layer?: string
          metadata?: Json | null
          metrics_snapshot?: Json | null
          related_ids?: string[] | null
          resonance_score?: number | null
          timestamp?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "graph_nodes_user_id_fkey"
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
          content: Json | null
          created_at: string | null
          doc_type: string | null
          evidence: Json | null
          facet: string | null
          id: string
          layer: string | null
          section: string | null
          tags: string[] | null
          title: string | null
          trust_level: number | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          doc_type?: string | null
          evidence?: Json | null
          facet?: string | null
          id?: string
          layer?: string | null
          section?: string | null
          tags?: string[] | null
          title?: string | null
          trust_level?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          doc_type?: string | null
          evidence?: Json | null
          facet?: string | null
          id?: string
          layer?: string | null
          section?: string | null
          tags?: string[] | null
          title?: string | null
          trust_level?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          foresight: number | null
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
          foresight?: number | null
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
          foresight?: number | null
          id?: string
          interrupt?: number | null
          mirror_sync?: number | null
          pain?: number | null
          phase?: string | null
          rhythm?: number | null
          silence_mass?: number | null
          trust?: number | null
          user_id?: string
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
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          hits: number
          ip: string
          reset_time: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          hits?: number
          ip: string
          reset_time: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          hits?: number
          ip?: string
          reset_time?: string
        }
        Relationships: []
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
      check_rate_limit: {
        Args: {
          client_ip: string
          max_hits: number
          target_endpoint: string
          window_minutes: number
        }
        Returns: boolean
      }
      claim_legacy_data: { Args: { legacy_device_id: string }; Returns: Json }
      graph_bfs_traversal: {
        Args: { max_depth?: number; min_weight?: number; start_id: string }
        Returns: {
          depth: number
          node_id: string
          path: string[]
        }[]
      }
      graph_create_edge: {
        Args: {
          p_id: string
          p_metadata?: Json
          p_source: string
          p_target: string
          p_type: string
          p_weight?: number
        }
        Returns: {
          created_at: string | null
          id: string
          metadata: Json | null
          source: string
          target: string
          type: string
          user_id: string | null
          weight: number
        }
        SetofOptions: {
          from: "*"
          to: "graph_edges"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      graph_create_node: {
        Args: {
          p_content: string
          p_id: string
          p_layer: string
          p_metadata?: Json
          p_metrics_snapshot?: Json
          p_related_ids?: string[]
          p_resonance_score?: number
          p_timestamp?: string
          p_type: string
        }
        Returns: {
          content: string
          created_at: string | null
          id: string
          layer: string
          metadata: Json | null
          metrics_snapshot: Json | null
          related_ids: string[] | null
          resonance_score: number | null
          timestamp: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "graph_nodes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      graph_delete_node: { Args: { p_node_id: string }; Returns: undefined }
      graph_find_resonant: {
        Args: { limit_count?: number; min_resonance?: number }
        Returns: {
          content: string
          id: string
          layer: string
          resonance_score: number
          type: string
        }[]
      }
      graph_find_resonant_nodes: {
        Args: { p_limit_count?: number; p_min_resonance?: number }
        Returns: {
          content: string
          created_at: string | null
          id: string
          layer: string
          metadata: Json | null
          metrics_snapshot: Json | null
          related_ids: string[] | null
          resonance_score: number | null
          timestamp: string
          type: string
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "graph_nodes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      graph_get_connection_candidates: {
        Args: { p_limit_count?: number; p_node_id: string }
        Returns: {
          content: string
          created_at: string | null
          id: string
          layer: string
          metadata: Json | null
          metrics_snapshot: Json | null
          related_ids: string[] | null
          resonance_score: number | null
          timestamp: string
          type: string
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "graph_nodes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      graph_get_node_with_edges: { Args: { node_id: string }; Returns: Json }
      graph_get_stats: { Args: never; Returns: Json }
      graph_get_user_nodes: {
        Args: {
          p_layer?: string
          p_limit_count?: number
          p_node_ids?: string[]
          p_type?: string
        }
        Returns: {
          content: string
          created_at: string | null
          id: string
          layer: string
          metadata: Json | null
          metrics_snapshot: Json | null
          related_ids: string[] | null
          resonance_score: number | null
          timestamp: string
          type: string
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "graph_nodes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      graph_search_nodes: {
        Args: { p_limit_count?: number; p_query: string }
        Returns: {
          content: string
          created_at: string | null
          id: string
          layer: string
          metadata: Json | null
          metrics_snapshot: Json | null
          related_ids: string[] | null
          resonance_score: number | null
          timestamp: string
          type: string
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "graph_nodes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      graph_traverse_bfs_nodes: {
        Args: {
          p_max_depth?: number
          p_min_weight?: number
          p_start_id: string
        }
        Returns: {
          content: string
          created_at: string | null
          id: string
          layer: string
          metadata: Json | null
          metrics_snapshot: Json | null
          related_ids: string[] | null
          resonance_score: number | null
          timestamp: string
          type: string
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "graph_nodes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      graph_update_node_resonance: {
        Args: {
          p_metrics_snapshot: Json
          p_node_id: string
          p_resonance_score: number
        }
        Returns: {
          content: string
          created_at: string | null
          id: string
          layer: string
          metadata: Json | null
          metrics_snapshot: Json | null
          related_ids: string[] | null
          resonance_score: number | null
          timestamp: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "graph_nodes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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

