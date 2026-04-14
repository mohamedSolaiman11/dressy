export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      atelier_memberships: {
        Row: {
          atelier_id: string;
          created_at: string;
          id: string;
          role: "owner" | "manager" | "staff";
          user_id: string;
        };
        Insert: {
          atelier_id: string;
          created_at?: string;
          id?: string;
          role?: "owner" | "manager" | "staff";
          user_id: string;
        };
        Update: {
          atelier_id?: string;
          created_at?: string;
          id?: string;
          role?: "owner" | "manager" | "staff";
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "atelier_memberships_atelier_id_fkey";
            columns: ["atelier_id"];
            isOneToOne: false;
            referencedRelation: "ateliers";
            referencedColumns: ["id"];
          }
        ];
      };
      ateliers: {
        Row: {
          branch_name: string | null;
          created_at: string;
          id: string;
          name: string;
          public_slug: string;
        };
        Insert: {
          branch_name?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          public_slug?: string;
        };
        Update: {
          branch_name?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          public_slug?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          atelier_id: string | null;
          created_at: string;
          customer_id: string;
          deposit: number;
          dress_id: string;
          fitting_stage: string;
          id: string;
          note: string;
          payment_status: "مدفوع" | "غير مدفوع";
          pickup_date: string;
          return_date: string;
          status: "محجوز" | "تم التسليم" | "تم الاسترجاع";
          time_label: string;
          total: number;
        };
        Insert: {
          atelier_id?: string | null;
          created_at?: string;
          customer_id: string;
          deposit?: number;
          dress_id: string;
          fitting_stage?: string;
          id?: string;
          note?: string;
          payment_status?: "مدفوع" | "غير مدفوع";
          pickup_date: string;
          return_date: string;
          status?: "محجوز" | "تم التسليم" | "تم الاسترجاع";
          time_label?: string;
          total?: number;
        };
        Update: {
          atelier_id?: string | null;
          created_at?: string;
          customer_id?: string;
          deposit?: number;
          dress_id?: string;
          fitting_stage?: string;
          id?: string;
          note?: string;
          payment_status?: "مدفوع" | "غير مدفوع";
          pickup_date?: string;
          return_date?: string;
          status?: "محجوز" | "تم التسليم" | "تم الاسترجاع";
          time_label?: string;
          total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_dress_id_fkey";
            columns: ["dress_id"];
            isOneToOne: false;
            referencedRelation: "dresses";
            referencedColumns: ["id"];
          }
        ];
      };
      customers: {
        Row: {
          area: string;
          atelier_id: string | null;
          created_at: string;
          id: string;
          name: string;
          phone: string;
          preferred_size: string;
        };
        Insert: {
          area?: string;
          atelier_id?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          phone: string;
          preferred_size?: string;
        };
        Update: {
          area?: string;
          atelier_id?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          phone?: string;
          preferred_size?: string;
        };
        Relationships: [];
      };
      dresses: {
        Row: {
          atelier_id: string | null;
          category: string;
          code: string;
          color: string;
          created_at: string;
          id: string;
          image_path: string;
          image_tone: string;
          name: string;
          notes: string;
          price: number;
          size: string;
          status: "متاح" | "محجوز";
        };
        Insert: {
          atelier_id?: string | null;
          category: string;
          code: string;
          color: string;
          created_at?: string;
          id?: string;
          image_path?: string;
          image_tone: string;
          name: string;
          notes?: string;
          price: number;
          size: string;
          status?: "متاح" | "محجوز";
        };
        Update: {
          atelier_id?: string | null;
          category?: string;
          code?: string;
          color?: string;
          created_at?: string;
          id?: string;
          image_path?: string;
          image_tone?: string;
          name?: string;
          notes?: string;
          price?: number;
          size?: string;
          status?: "متاح" | "محجوز";
        };
        Relationships: [];
      };
      dress_images: {
        Row: {
          atelier_id: string | null;
          created_at: string;
          dress_id: string;
          id: string;
          shot_type:
            | "general"
            | "front"
            | "side"
            | "back"
            | "detail"
            | "mannequin"
            | "model";
          sort_order: number;
          storage_path: string;
        };
        Insert: {
          atelier_id?: string | null;
          created_at?: string;
          dress_id: string;
          id?: string;
          shot_type?:
            | "general"
            | "front"
            | "side"
            | "back"
            | "detail"
            | "mannequin"
            | "model";
          sort_order?: number;
          storage_path: string;
        };
        Update: {
          atelier_id?: string | null;
          created_at?: string;
          dress_id?: string;
          id?: string;
          shot_type?:
            | "general"
            | "front"
            | "side"
            | "back"
            | "detail"
            | "mannequin"
            | "model";
          sort_order?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dress_images_atelier_id_fkey";
            columns: ["atelier_id"];
            isOneToOne: false;
            referencedRelation: "ateliers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dress_images_dress_id_fkey";
            columns: ["dress_id"];
            isOneToOne: false;
            referencedRelation: "dresses";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
