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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      abuse_reports: {
        Row: {
          abuse_type: string
          created_at: string
          description: string | null
          id: string
          reported_content_id: string | null
          reported_content_type: string
          reported_pet_name: string | null
          reported_user_name: string | null
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          abuse_type: string
          created_at?: string
          description?: string | null
          id?: string
          reported_content_id?: string | null
          reported_content_type: string
          reported_pet_name?: string | null
          reported_user_name?: string | null
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          abuse_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reported_content_id?: string | null
          reported_content_type?: string
          reported_pet_name?: string | null
          reported_user_name?: string | null
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      ai_generated_content: {
        Row: {
          content_type: string
          created_at: string
          generated_text: string
          id: string
          pet_id: string | null
          prompt_data: Json | null
          updated_at: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          generated_text: string
          id?: string
          pet_id?: string | null
          prompt_data?: Json | null
          updated_at?: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          generated_text?: string
          id?: string
          pet_id?: string | null
          prompt_data?: Json | null
          updated_at?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      app_configurations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: boolean
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: boolean
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: boolean
        }
        Relationships: []
      }
      beta_testers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
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
      event_responses: {
        Row: {
          created_at: string
          event_id: string
          id: string
          response: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          response?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          response?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          creator_id: string
          event_type: string
          id: string
          invited_participants: string[] | null
          invited_pet_ids: string[] | null
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
          invited_participants?: string[] | null
          invited_pet_ids?: string[] | null
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
          invited_participants?: string[] | null
          invited_pet_ids?: string[] | null
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
          hide_pwa_popup: boolean | null
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
          hide_pwa_popup?: boolean | null
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
          hide_pwa_popup?: boolean | null
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
      pack_announcements: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          event_id: string | null
          expires_at: string | null
          id: string
          is_pinned: boolean
          pack_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          event_id?: string | null
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          pack_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          event_id?: string | null
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          pack_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_announcements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pack_announcements_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_contest_submissions: {
        Row: {
          contest_id: string
          created_at: string
          id: string
          pet_id: string | null
          pet_name: string
          photo_url: string
          user_id: string
          vote_count: number
        }
        Insert: {
          contest_id: string
          created_at?: string
          id?: string
          pet_id?: string | null
          pet_name: string
          photo_url: string
          user_id: string
          vote_count?: number
        }
        Update: {
          contest_id?: string
          created_at?: string
          id?: string
          pet_id?: string | null
          pet_name?: string
          photo_url?: string
          user_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "pack_contest_submissions_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "pack_photo_contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pack_contest_submissions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_contest_votes: {
        Row: {
          created_at: string
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_contest_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "pack_contest_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_members: {
        Row: {
          id: string
          joined_at: string
          pack_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          pack_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          pack_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_members_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: []
      }
      pack_message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pack_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          media_url: string | null
          message_type: string
          pack_id: string
          replied_to_message_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          media_url?: string | null
          message_type?: string
          pack_id: string
          replied_to_message_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          media_url?: string | null
          message_type?: string
          pack_id?: string
          replied_to_message_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pack_photo_contests: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          ends_at: string
          id: string
          is_active: boolean
          pack_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          ends_at: string
          id?: string
          is_active?: boolean
          pack_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean
          pack_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_photo_contests_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "pack_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_polls: {
        Row: {
          created_at: string
          creator_id: string
          expires_at: string | null
          id: string
          is_active: boolean
          options: Json
          pack_id: string
          question: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          options?: Json
          pack_id: string
          question: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          options?: Json
          pack_id?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_polls_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_typing_indicators: {
        Row: {
          id: string
          is_typing: boolean
          pack_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_typing?: boolean
          pack_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_typing?: boolean
          pack_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      packs: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          privacy: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          privacy?: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          privacy?: string
          updated_at?: string
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
            foreignKeyName: "pet_friendships_requester_pet_id_fkey"
            columns: ["requester_pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_profiles: {
        Row: {
          about: string | null
          age: number | null
          bio: string | null
          boop_count: number
          breed: string
          created_at: string
          gender: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          personality_traits: string[] | null
          pet_username: string
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
          boop_count?: number
          breed: string
          created_at?: string
          gender?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          personality_traits?: string[] | null
          pet_username: string
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
          boop_count?: number
          breed?: string
          created_at?: string
          gender?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          personality_traits?: string[] | null
          pet_username?: string
          photos?: string[] | null
          profile_photo_url?: string | null
          unique_code?: string | null
          updated_at?: string
          user_id?: string
          vaccination_status?: string | null
        }
        Relationships: []
      }
      pet_tweets: {
        Row: {
          content: string
          created_at: string
          id: string
          owner_id: string
          pet_id: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          owner_id: string
          pet_id: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          owner_id?: string
          pet_id?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_tweets_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      push_subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription_details: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_details: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_details?: Json
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          action: string
          attempt_count: number
          created_at: string
          id: string
          identifier: string
          updated_at: string
          window_start: string
        }
        Insert: {
          action: string
          attempt_count?: number
          created_at?: string
          id?: string
          identifier: string
          updated_at?: string
          window_start?: string
        }
        Update: {
          action?: string
          attempt_count?: number
          created_at?: string
          id?: string
          identifier?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          details: Json | null
          email: string | null
          event_type: string
          id: string
          ip_address: unknown
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          email?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          email?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sitter_availability: {
        Row: {
          available_date: string
          created_at: string
          id: string
          sitter_id: string
          updated_at: string
        }
        Insert: {
          available_date: string
          created_at?: string
          id?: string
          sitter_id: string
          updated_at?: string
        }
        Update: {
          available_date?: string
          created_at?: string
          id?: string
          sitter_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sitter_bookings: {
        Row: {
          completed_at: string | null
          created_at: string
          end_date: string
          id: string
          initial_message: string | null
          owner_completed: boolean | null
          owner_id: string
          pet_id: string
          sitter_completed: boolean | null
          sitter_id: string
          special_instructions: string | null
          start_date: string
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          end_date: string
          id?: string
          initial_message?: string | null
          owner_completed?: boolean | null
          owner_id: string
          pet_id: string
          sitter_completed?: boolean | null
          sitter_id: string
          special_instructions?: string | null
          start_date: string
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          end_date?: string
          id?: string
          initial_message?: string | null
          owner_completed?: boolean | null
          owner_id?: string
          pet_id?: string
          sitter_completed?: boolean | null
          sitter_id?: string
          special_instructions?: string | null
          start_date?: string
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sitter_bookings_owner_profiles"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sitter_bookings_pet_profiles"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sitter_bookings_sitter_profiles"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "sitter_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sitter_bookings_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_conversations: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          last_message_at: string | null
          participant_a: string
          participant_b: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_a: string
          participant_b: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_a?: string
          participant_b?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sitter_conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "sitter_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_user_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_user_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sitter_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "sitter_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          photo_url: string
          sitter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          photo_url: string
          sitter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          photo_url?: string
          sitter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sitter_photos_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "sitter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_profiles: {
        Row: {
          accepted_pet_types: string[] | null
          bio: string | null
          created_at: string
          currency: string
          headline: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          location: string | null
          name: string | null
          profile_photo_url: string | null
          rate_per_day: number | null
          response_time: string | null
          updated_at: string
          user_id: string
          years_experience: string | null
        }
        Insert: {
          accepted_pet_types?: string[] | null
          bio?: string | null
          created_at?: string
          currency?: string
          headline?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          name?: string | null
          profile_photo_url?: string | null
          rate_per_day?: number | null
          response_time?: string | null
          updated_at?: string
          user_id: string
          years_experience?: string | null
        }
        Update: {
          accepted_pet_types?: string[] | null
          bio?: string | null
          created_at?: string
          currency?: string
          headline?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          name?: string | null
          profile_photo_url?: string | null
          rate_per_day?: number | null
          response_time?: string | null
          updated_at?: string
          user_id?: string
          years_experience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sitter_profiles_user_profiles"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          owner_id: string
          rating: number
          sitter_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          owner_id: string
          rating: number
          sitter_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          rating?: number
          sitter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sitter_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "sitter_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_services: {
        Row: {
          created_at: string
          id: string
          service_type: string
          sitter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_type: string
          sitter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_type?: string
          sitter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sitter_services_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "sitter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tweet_reactions: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          pet_id: string
          reaction_type: string
          tweet_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          pet_id: string
          reaction_type: string
          tweet_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          pet_id?: string
          reaction_type?: string
          tweet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tweet_reactions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tweet_reactions_tweet_id_fkey"
            columns: ["tweet_id"]
            isOneToOne: false
            referencedRelation: "pet_tweets"
            referencedColumns: ["id"]
          },
        ]
      }
      tweet_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          owner_id: string
          pet_id: string
          tweet_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          owner_id: string
          pet_id: string
          tweet_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          owner_id?: string
          pet_id?: string
          tweet_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tweet_replies_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pet_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tweet_replies_tweet_id_fkey"
            columns: ["tweet_id"]
            isOneToOne: false
            referencedRelation: "pet_tweets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          city: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_private: boolean | null
          neighborhood: string | null
          onesignal_player_id: string | null
          phone_number: string | null
          tour_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_private?: boolean | null
          neighborhood?: string | null
          onesignal_player_id?: string | null
          phone_number?: string | null
          tour_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_private?: boolean | null
          neighborhood?: string | null
          onesignal_player_id?: string | null
          phone_number?: string | null
          tour_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      waitlist_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_pet_profile: {
        Args: { _pet_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_phone_number: {
        Args: { profile_owner_id: string; viewer_id: string }
        Returns: boolean
      }
      can_view_user_content: {
        Args: { content_owner_id: string; viewer_id: string }
        Returns: boolean
      }
      cleanup_rate_limit_attempts: { Args: never; Returns: undefined }
      cleanup_security_events: { Args: never; Returns: undefined }
      delete_user_account: {
        Args: { user_id_to_delete: string }
        Returns: undefined
      }
      delete_user_data_only: {
        Args: { user_id_to_clear: string }
        Returns: undefined
      }
      find_or_create_conversation: {
        Args: { linked_booking_id?: string; user_a: string; user_b: string }
        Returns: string
      }
      generate_redemption_code: { Args: never; Returns: string }
      generate_unique_pet_username: {
        Args: { base_name: string }
        Returns: string
      }
      get_approximate_distance: {
        Args: { pet_id: string; user_lat: number; user_lng: number }
        Returns: string
      }
      get_nearby_pets_count: {
        Args: { radius_km?: number; user_lat: number; user_lng: number }
        Returns: number
      }
      get_waitlist_count: { Args: never; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      secure_delete_user_account: {
        Args: { user_email: string; user_password: string }
        Returns: Json
      }
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
