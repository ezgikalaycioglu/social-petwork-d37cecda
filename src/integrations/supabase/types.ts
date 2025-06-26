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
      adventures: {
        Row: {
          adventure_date: string
          created_at: string
          description: string | null
          id: string
          owner_id: string
          pet_id: string
          photos: string[] | null
          tagged_pet_ids: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          adventure_date: string
          created_at?: string
          description?: string | null
          id?: string
          owner_id: string
          pet_id: string
          photos?: string[] | null
          tagged_pet_ids?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          adventure_date?: string
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          pet_id?: string
          photos?: string[] | null
          tagged_pet_ids?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          address: string | null
          business_category: string
          business_name: string
          created_at: string
          description: string | null
          email: string
          id: string
          is_verified: boolean | null
          logo_url: string | null
          phone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          business_category: string
          business_name: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          business_category?: string
          business_name?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      deal_redemptions: {
        Row: {
          claimed_at: string
          deal_id: string
          id: string
          is_redeemed: boolean | null
          pet_id: string | null
          redeemed_at: string | null
          redemption_code: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          deal_id: string
          id?: string
          is_redeemed?: boolean | null
          pet_id?: string | null
          redeemed_at?: string | null
          redemption_code: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          deal_id?: string
          id?: string
          is_redeemed?: boolean | null
          pet_id?: string | null
          redeemed_at?: string | null
          redemption_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_redemptions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_redemptions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_redemptions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          business_id: string
          created_at: string
          current_redemptions: number | null
          description: string
          discount_amount: number | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          max_redemptions: number | null
          terms: string | null
          title: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          current_redemptions?: number | null
          description: string
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          terms?: string | null
          title: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          current_redemptions?: number | null
          description?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          terms?: string | null
          title?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          creator_id: string
          event_type: string
          id: string
          location_lat: number | null
          location_lon: number | null
          location_name: string
          message: string | null
          participants: string[]
          scheduled_time: string
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          event_type: string
          id?: string
          location_lat?: number | null
          location_lon?: number | null
          location_name: string
          message?: string | null
          participants?: string[]
          scheduled_time: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          event_type?: string
          id?: string
          location_lat?: number | null
          location_lon?: number | null
          location_name?: string
          message?: string | null
          participants?: string[]
          scheduled_time?: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fcm_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          event_reminders: boolean | null
          id: string
          new_follower_alerts: boolean | null
          playdate_confirmations: boolean | null
          playdate_requests: boolean | null
          updated_at: string | null
          user_id: string | null
          weekly_newsletter: boolean | null
        }
        Insert: {
          created_at?: string | null
          event_reminders?: boolean | null
          id?: string
          new_follower_alerts?: boolean | null
          playdate_confirmations?: boolean | null
          playdate_requests?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          weekly_newsletter?: boolean | null
        }
        Update: {
          created_at?: string | null
          event_reminders?: boolean | null
          id?: string
          new_follower_alerts?: boolean | null
          playdate_confirmations?: boolean | null
          playdate_requests?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          weekly_newsletter?: boolean | null
        }
        Relationships: []
      }
      pet_friendships: {
        Row: {
          created_at: string
          id: string
          recipient_pet_id: string
          requester_pet_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_pet_id: string
          requester_pet_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_pet_id?: string
          requester_pet_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_friendships_recipient_pet_id_fkey"
            columns: ["recipient_pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_friendships_recipient_pet_id_fkey"
            columns: ["recipient_pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_friendships_requester_pet_id_fkey"
            columns: ["requester_pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_friendships_requester_pet_id_fkey"
            columns: ["requester_pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_profiles: {
        Row: {
          about: string | null
          age: number | null
          bio: string | null
          breed: string
          created_at: string
          gender: string | null
          id: string
          is_available: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          personality_traits: string[] | null
          photos: string[] | null
          profile_photo_url: string | null
          unique_code: string | null
          updated_at: string
          user_id: string
          vaccination_status: string | null
        }
        Insert: {
          about?: string | null
          age?: number | null
          bio?: string | null
          breed: string
          created_at?: string
          gender?: string | null
          id?: string
          is_available?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          personality_traits?: string[] | null
          photos?: string[] | null
          profile_photo_url?: string | null
          unique_code?: string | null
          updated_at?: string
          user_id: string
          vaccination_status?: string | null
        }
        Update: {
          about?: string | null
          age?: number | null
          bio?: string | null
          breed?: string
          created_at?: string
          gender?: string | null
          id?: string
          is_available?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          personality_traits?: string[] | null
          photos?: string[] | null
          profile_photo_url?: string | null
          unique_code?: string | null
          updated_at?: string
          user_id?: string
          vaccination_status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          city: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          neighborhood: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          neighborhood?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          neighborhood?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      feed_items_view: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string | null
          id: string | null
          image_url: string | null
          item_type: string | null
          location_name: string | null
          title: string | null
          user_display_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
      pet_profiles_public: {
        Row: {
          about: string | null
          age: number | null
          approx_latitude: number | null
          approx_longitude: number | null
          bio: string | null
          breed: string | null
          created_at: string | null
          gender: string | null
          id: string | null
          is_available: boolean | null
          name: string | null
          personality_traits: string[] | null
          photos: string[] | null
          profile_photo_url: string | null
          unique_code: string | null
          updated_at: string | null
          user_id: string | null
          vaccination_status: string | null
        }
        Insert: {
          about?: string | null
          age?: number | null
          approx_latitude?: never
          approx_longitude?: never
          bio?: string | null
          breed?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string | null
          is_available?: boolean | null
          name?: string | null
          personality_traits?: string[] | null
          photos?: string[] | null
          profile_photo_url?: string | null
          unique_code?: string | null
          updated_at?: string | null
          user_id?: string | null
          vaccination_status?: string | null
        }
        Update: {
          about?: string | null
          age?: number | null
          approx_latitude?: never
          approx_longitude?: never
          bio?: string | null
          breed?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string | null
          is_available?: boolean | null
          name?: string | null
          personality_traits?: string[] | null
          photos?: string[] | null
          profile_photo_url?: string | null
          unique_code?: string | null
          updated_at?: string | null
          user_id?: string | null
          vaccination_status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      generate_redemption_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
