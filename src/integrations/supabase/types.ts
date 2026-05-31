export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      appointments: {
        Row: {
          business_id: string;
          created_at: string;
          customer_email: string | null;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          duration_minutes: number;
          id: string;
          notes: string | null;
          professional_id: string | null;
          scheduled_at: string;
          service_id: string;
          status: Database["public"]["Enums"]["appointment_status"];
          updated_at: string;
        };
        Insert: {
          business_id: string;
          created_at?: string;
          customer_email?: string | null;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          duration_minutes?: number;
          id?: string;
          notes?: string | null;
          professional_id?: string | null;
          scheduled_at: string;
          service_id: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          customer_email?: string | null;
          customer_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          duration_minutes?: number;
          id?: string;
          notes?: string | null;
          professional_id?: string | null;
          scheduled_at?: string;
          service_id?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "professionals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      businesses: {
        Row: {
          address: string | null;
          category: Database["public"]["Enums"]["business_category"];
          close_time: string;
          cover_url: string | null;
          created_at: string;
          description: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          open_time: string;
          owner_id: string;
          phone: string | null;
          slug: string;
          status: Database["public"]["Enums"]["business_status"];
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          category: Database["public"]["Enums"]["business_category"];
          close_time?: string;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          open_time?: string;
          owner_id: string;
          phone?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["business_status"];
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          category?: Database["public"]["Enums"]["business_category"];
          close_time?: string;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          open_time?: string;
          owner_id?: string;
          phone?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["business_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount_cents: number;
          business_id: string;
          category: string;
          created_at: string;
          description: string;
          id: string;
          notes: string | null;
          owner_id: string;
          spent_on: string;
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          business_id: string;
          category?: string;
          created_at?: string;
          description: string;
          id?: string;
          notes?: string | null;
          owner_id: string;
          spent_on?: string;
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          business_id?: string;
          category?: string;
          created_at?: string;
          description?: string;
          id?: string;
          notes?: string | null;
          owner_id?: string;
          spent_on?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      professionals: {
        Row: {
          active: boolean;
          avatar_url: string | null;
          business_id: string;
          created_at: string;
          id: string;
          name: string;
          role: string | null;
        };
        Insert: {
          active?: boolean;
          avatar_url?: string | null;
          business_id: string;
          created_at?: string;
          id?: string;
          name: string;
          role?: string | null;
        };
        Update: {
          active?: boolean;
          avatar_url?: string | null;
          business_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "professionals_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          active: boolean;
          business_id: string;
          created_at: string;
          description: string | null;
          duration_minutes: number;
          id: string;
          name: string;
          price_cents: number;
        };
        Insert: {
          active?: boolean;
          business_id: string;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          name: string;
          price_cents?: number;
        };
        Update: {
          active?: boolean;
          business_id?: string;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          name?: string;
          price_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          business_id: string | null;
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          business_id?: string | null;
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          business_id?: string | null;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_business_owner: {
        Args: { _business_id: string; _user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "super_admin" | "business_owner" | "staff" | "customer";
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
      business_category: "barbearia" | "lava_jato" | "manicure" | "salao_beleza";
      business_status: "active" | "paused" | "suspended";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "business_owner", "staff", "customer"],
      appointment_status: ["pending", "confirmed", "completed", "cancelled", "no_show"],
      business_category: ["barbearia", "lava_jato", "manicure", "salao_beleza"],
      business_status: ["active", "paused", "suspended"],
    },
  },
} as const;
