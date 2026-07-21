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
      agent_settings: {
        Row: {
          agent_name: string | null
          auto_reply_enabled: boolean | null
          created_at: string | null
          fallback_message: string | null
          human_handoff_phrases: string[] | null
          id: string
          tone: string | null
          updated_at: string | null
          user_id: string
          welcome_message: string | null
        }
        Insert: {
          agent_name?: string | null
          auto_reply_enabled?: boolean | null
          created_at?: string | null
          fallback_message?: string | null
          human_handoff_phrases?: string[] | null
          id?: string
          tone?: string | null
          updated_at?: string | null
          user_id: string
          welcome_message?: string | null
        }
        Update: {
          agent_name?: string | null
          auto_reply_enabled?: boolean | null
          created_at?: string | null
          fallback_message?: string | null
          human_handoff_phrases?: string[] | null
          id?: string
          tone?: string | null
          updated_at?: string | null
          user_id?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      agent_withdrawals: {
        Row: {
          agent_id: string
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          momo_name: string | null
          momo_number: string | null
          status: string
        }
        Insert: {
          agent_id: string
          amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          momo_name?: string | null
          momo_number?: string | null
          status?: string
        }
        Update: {
          agent_id?: string
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          momo_name?: string | null
          momo_number?: string | null
          status?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          created_at: string
          key: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          value: string
        }
        Update: {
          created_at?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      autopilot_settings: {
        Row: {
          created_at: string
          enabled: boolean
          last_run_at: string | null
          last_slot: string | null
          post_times: string[]
          timezone: string
          tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          last_run_at?: string | null
          last_slot?: string | null
          post_times?: string[]
          timezone?: string
          tone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          last_run_at?: string | null
          last_slot?: string | null
          post_times?: string[]
          timezone?: string
          tone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commercial_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          product_id: string | null
          result_url: string | null
          shot_count: number
          source_image_url: string | null
          status: string
          template_id: string
          tokens_charged: number
          user_id: string
          vibe_prompt: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          product_id?: string | null
          result_url?: string | null
          shot_count: number
          source_image_url?: string | null
          status?: string
          template_id: string
          tokens_charged?: number
          user_id: string
          vibe_prompt?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          product_id?: string | null
          result_url?: string | null
          shot_count?: number
          source_image_url?: string | null
          status?: string
          template_id?: string
          tokens_charged?: number
          user_id?: string
          vibe_prompt?: string | null
        }
        Relationships: []
      }
      commercial_shots: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          job_id: string
          provider_job_id: string | null
          shot_index: number
          status: string
          video_url: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_id: string
          provider_job_id?: string | null
          shot_index: number
          status?: string
          video_url?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_id?: string
          provider_job_id?: string | null
          shot_index?: number
          status?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_shots_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "commercial_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      meta_connections: {
        Row: {
          connected_at: string | null
          id: string
          ig_access_token: string | null
          ig_account_id: string | null
          is_active: boolean | null
          page_access_token: string | null
          page_id: string | null
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connected_at?: string | null
          id?: string
          ig_access_token?: string | null
          ig_account_id?: string | null
          is_active?: boolean | null
          page_access_token?: string | null
          page_id?: string | null
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connected_at?: string | null
          id?: string
          ig_access_token?: string | null
          ig_account_id?: string | null
          is_active?: boolean | null
          page_access_token?: string | null
          page_id?: string | null
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meta_conversations: {
        Row: {
          ai_reply_generated: boolean | null
          content: string
          created_at: string | null
          direction: string
          external_user_id: string
          id: string
          page_or_ig_id: string | null
          platform: string
          raw_event: Json | null
          user_id: string | null
        }
        Insert: {
          ai_reply_generated?: boolean | null
          content: string
          created_at?: string | null
          direction: string
          external_user_id: string
          id?: string
          page_or_ig_id?: string | null
          platform: string
          raw_event?: Json | null
          user_id?: string | null
        }
        Update: {
          ai_reply_generated?: boolean | null
          content?: string
          created_at?: string | null
          direction?: string
          external_user_id?: string
          id?: string
          page_or_ig_id?: string | null
          platform?: string
          raw_event?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          id: string
          notes: string | null
          product_id: string | null
          product_name: string
          quantity: number
          seller_id: string
          status: string
          total: number
          variant: string | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          seller_id: string
          status?: string
          total: number
          variant?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          seller_id?: string
          status?: string
          total?: number
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
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
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          position: number
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          position?: number
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          attributes: Json | null
          category: string | null
          condition: string | null
          created_at: string
          description: string | null
          discount_price: number | null
          id: string
          image_url: string | null
          is_featured: boolean
          listing_type: string | null
          name: string
          price: number
          subcategory: string | null
          updated_at: string
          user_id: string
          variants_text: string | null
          view_count: number
          whatsapp_taps: number
        }
        Insert: {
          attributes?: Json | null
          category?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          listing_type?: string | null
          name: string
          price: number
          subcategory?: string | null
          updated_at?: string
          user_id: string
          variants_text?: string | null
          view_count?: number
          whatsapp_taps?: number
        }
        Update: {
          attributes?: Json | null
          category?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          listing_type?: string | null
          name?: string
          price?: number
          subcategory?: string | null
          updated_at?: string
          user_id?: string
          variants_text?: string | null
          view_count?: number
          whatsapp_taps?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accent_color: string | null
          ai_assistant_enabled: boolean
          building: string | null
          business_type: string | null
          category: string | null
          city: string | null
          country: string | null
          cover_photo_url: string | null
          created_at: string
          currency: string | null
          delivery_areas: string | null
          district: string | null
          email: string | null
          facebook_url: string | null
          first_name: string | null
          id: string
          instagram_url: string | null
          is_online_only: boolean
          last_active_at: string
          momo_name: string | null
          momo_number: string | null
          phone: string | null
          profile_picture_url: string | null
          referred_by: string | null
          shop_number: string | null
          store_bio: string | null
          store_name: string | null
          store_slug: string | null
          street: string | null
          tiktok_url: string | null
          token_balance: number
          view_count: number
          welcome_message: string | null
          whatsapp_number: string | null
        }
        Insert: {
          accent_color?: string | null
          ai_assistant_enabled?: boolean
          building?: string | null
          business_type?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          cover_photo_url?: string | null
          created_at?: string
          currency?: string | null
          delivery_areas?: string | null
          district?: string | null
          email?: string | null
          facebook_url?: string | null
          first_name?: string | null
          id: string
          instagram_url?: string | null
          is_online_only?: boolean
          last_active_at?: string
          momo_name?: string | null
          momo_number?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          referred_by?: string | null
          shop_number?: string | null
          store_bio?: string | null
          store_name?: string | null
          store_slug?: string | null
          street?: string | null
          tiktok_url?: string | null
          token_balance?: number
          view_count?: number
          welcome_message?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          accent_color?: string | null
          ai_assistant_enabled?: boolean
          building?: string | null
          business_type?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          cover_photo_url?: string | null
          created_at?: string
          currency?: string | null
          delivery_areas?: string | null
          district?: string | null
          email?: string | null
          facebook_url?: string | null
          first_name?: string | null
          id?: string
          instagram_url?: string | null
          is_online_only?: boolean
          last_active_at?: string
          momo_name?: string | null
          momo_number?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          referred_by?: string | null
          shop_number?: string | null
          store_bio?: string | null
          store_name?: string | null
          store_slug?: string | null
          street?: string | null
          tiktok_url?: string | null
          token_balance?: number
          view_count?: number
          welcome_message?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          caption: string | null
          created_at: string
          error: string | null
          fb_post_id: string | null
          id: string
          ig_post_id: string | null
          image_url: string | null
          posted_at: string | null
          product_id: string | null
          scheduled_for: string
          slot: string | null
          status: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          error?: string | null
          fb_post_id?: string | null
          id?: string
          ig_post_id?: string | null
          image_url?: string | null
          posted_at?: string | null
          product_id?: string | null
          scheduled_for?: string
          slot?: string | null
          status?: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          error?: string | null
          fb_post_id?: string | null
          id?: string
          ig_post_id?: string | null
          image_url?: string | null
          posted_at?: string | null
          product_id?: string | null
          scheduled_for?: string
          slot?: string | null
          status?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_agents: {
        Row: {
          active: boolean
          created_at: string
          created_by_agent: string | null
          duration_days: number | null
          id: string
          lane_from: string
          lane_to: string
          logo_url: string | null
          mode: string
          name: string
          notes: string | null
          rate_amount: number
          rate_currency: string
          rate_unit: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by_agent?: string | null
          duration_days?: number | null
          id?: string
          lane_from: string
          lane_to?: string
          logo_url?: string | null
          mode: string
          name: string
          notes?: string | null
          rate_amount: number
          rate_currency?: string
          rate_unit: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by_agent?: string | null
          duration_days?: number | null
          id?: string
          lane_from?: string
          lane_to?: string
          logo_url?: string | null
          mode?: string
          name?: string
          notes?: string | null
          rate_amount?: number
          rate_currency?: string
          rate_unit?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      supplier_payments: {
        Row: {
          admin_note: string | null
          amount_foreign: number
          amount_foreign_total: number
          amount_ugx: number
          bank_proof_url: string | null
          buyer_id: string
          created_at: string
          currency: string
          fee_pct: number
          fx_locked_at: string
          fx_rate: number
          id: string
          method: string
          momo_phone: string | null
          note: string | null
          settled_at: string | null
          status: string
          supplier_id: string
          supplier_product_id: string | null
          updated_at: string
          yo_ref: string | null
        }
        Insert: {
          admin_note?: string | null
          amount_foreign: number
          amount_foreign_total: number
          amount_ugx: number
          bank_proof_url?: string | null
          buyer_id: string
          created_at?: string
          currency: string
          fee_pct?: number
          fx_locked_at: string
          fx_rate: number
          id?: string
          method: string
          momo_phone?: string | null
          note?: string | null
          settled_at?: string | null
          status?: string
          supplier_id: string
          supplier_product_id?: string | null
          updated_at?: string
          yo_ref?: string | null
        }
        Update: {
          admin_note?: string | null
          amount_foreign?: number
          amount_foreign_total?: number
          amount_ugx?: number
          bank_proof_url?: string | null
          buyer_id?: string
          created_at?: string
          currency?: string
          fee_pct?: number
          fx_locked_at?: string
          fx_rate?: number
          id?: string
          method?: string
          momo_phone?: string | null
          note?: string | null
          settled_at?: string | null
          status?: string
          supplier_id?: string
          supplier_product_id?: string | null
          updated_at?: string
          yo_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_product_id_fkey"
            columns: ["supplier_product_id"]
            isOneToOne: false
            referencedRelation: "supplier_products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          active: boolean
          attributes: Json | null
          category: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          images: string[]
          lead_time_days: number | null
          moq: number
          name: string
          subcategory: string | null
          supplier_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          attributes?: Json | null
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          images?: string[]
          lead_time_days?: number | null
          moq?: number
          name: string
          subcategory?: string | null
          supplier_id: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          attributes?: Json | null
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          images?: string[]
          lead_time_days?: number | null
          moq?: number
          name?: string
          subcategory?: string | null
          supplier_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          bank_details: Json | null
          bio: string | null
          business_name: string
          contact_name: string | null
          country: string
          created_at: string
          created_by_agent: string | null
          currency: string
          email: string | null
          id: string
          lead_time_days: number | null
          logo_url: string | null
          must_change_password: boolean
          status: string
          supplier_code: string
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          bank_details?: Json | null
          bio?: string | null
          business_name: string
          contact_name?: string | null
          country: string
          created_at?: string
          created_by_agent?: string | null
          currency?: string
          email?: string | null
          id?: string
          lead_time_days?: number | null
          logo_url?: string | null
          must_change_password?: boolean
          status?: string
          supplier_code: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          bank_details?: Json | null
          bio?: string | null
          business_name?: string
          contact_name?: string | null
          country?: string
          created_at?: string
          created_by_agent?: string | null
          currency?: string
          email?: string | null
          id?: string
          lead_time_days?: number | null
          logo_url?: string | null
          must_change_password?: boolean
          status?: string
          supplier_code?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      token_payments: {
        Row: {
          amount_local: number | null
          amount_ugx: number
          completed_at: string | null
          created_at: string
          currency: string
          eversend_payment_id: string | null
          id: string
          package_id: string
          status: string
          tokens: number
          user_id: string
        }
        Insert: {
          amount_local?: number | null
          amount_ugx: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          eversend_payment_id?: string | null
          id?: string
          package_id: string
          status?: string
          tokens: number
          user_id: string
        }
        Update: {
          amount_local?: number | null
          amount_ugx?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          eversend_payment_id?: string | null
          id?: string
          package_id?: string
          status?: string
          tokens?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      token_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_design_templates: {
        Row: {
          created_at: string
          id: string
          image_url: string
          label: string
          prompt: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          label: string
          prompt?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          label?: string
          prompt?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      video_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          prompt: string | null
          provider: string
          provider_job_id: string | null
          result_url: string | null
          source_image_url: string
          status: string
          template: string
          tokens_charged: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          prompt?: string | null
          provider?: string
          provider_job_id?: string | null
          result_url?: string | null
          source_image_url: string
          status?: string
          template: string
          tokens_charged?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          prompt?: string | null
          provider?: string
          provider_job_id?: string | null
          result_url?: string | null
          source_image_url?: string
          status?: string
          template?: string
          tokens_charged?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      suppliers_public: {
        Row: {
          bio: string | null
          business_name: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          id: string | null
          lead_time_days: number | null
          logo_url: string | null
          status: string | null
          supplier_code: string | null
          whatsapp: string | null
        }
        Insert: {
          bio?: string | null
          business_name?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string | null
          lead_time_days?: number | null
          logo_url?: string | null
          status?: string | null
          supplier_code?: string | null
          whatsapp?: string | null
        }
        Update: {
          bio?: string | null
          business_name?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string | null
          lead_time_days?: number | null
          logo_url?: string | null
          status?: string | null
          supplier_code?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_delete_seller: {
        Args: { _admin_id: string; _seller_id: string }
        Returns: undefined
      }
      credit_tokens: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      deduct_tokens: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      increment_product_views: { Args: { p_id: string }; Returns: undefined }
      increment_store_views: { Args: { slug: string }; Returns: undefined }
      increment_whatsapp_taps: { Args: { p_id: string }; Returns: undefined }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_agent: { Args: { _user_id: string }; Returns: boolean }
      is_supplier: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
