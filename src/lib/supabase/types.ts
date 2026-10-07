/**
 * Minimal database typing.
 *
 * This mirrors what `supabase gen types typescript --project-id <ref>` produces.
 * Once the Supabase project exists, regenerate and replace this file:
 *
 *   npx supabase gen types typescript --project-id <ref> --schema public > src/lib/supabase/types.ts
 *
 * Keeping the shape accurate means the rest of the app stays type-safe after
 * regeneration without code changes.
 */

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type ContactStatus = "new" | "in_progress" | "resolved" | "spam";

export type StaffRole = "admin" | "staff";

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          category: string;
          details: string[];
          duration_minutes: number;
          price_note: string | null;
          image_url: string | null;
          featured: boolean;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          summary?: string;
          category?: string;
          details?: string[];
          duration_minutes?: number;
          price_note?: string | null;
          image_url?: string | null;
          featured?: boolean;
          active?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      opening_hours: {
        Row: {
          id: string;
          weekday: number;
          label: string;
          opens_at: string | null;
          closes_at: string | null;
          closed: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          weekday: number;
          label: string;
          opens_at?: string | null;
          closes_at?: string | null;
          closed?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["opening_hours"]["Insert"]>;
        Relationships: [];
      };
      time_off: {
        Row: {
          id: string;
          starts_at: string;
          ends_at: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          starts_at: string;
          ends_at: string;
          reason?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["time_off"]["Insert"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          reference: string;
          service_id: string | null;
          patient_name: string;
          patient_email: string;
          patient_phone: string;
          starts_at: string;
          ends_at: string;
          status: AppointmentStatus;
          is_new_patient: boolean;
          notes: string | null;
          locale: string | null;
          internal_note: string | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference?: string;
          service_id?: string | null;
          patient_name: string;
          patient_email: string;
          patient_phone: string;
          starts_at: string;
          ends_at: string;
          status?: AppointmentStatus;
          is_new_patient?: boolean;
          notes?: string | null;
          locale?: string | null;
          source?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]> & {
          internal_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: ContactStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: ContactStatus;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Insert"]>;
        Relationships: [];
      };
      staff_profiles: {
        Row: {
          user_id: string;
          full_name: string;
          role: StaffRole;
          active: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          full_name: string;
          role?: StaffRole;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["staff_profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      /**
       * Patient-safe projections used by the public availability engine.
       * They expose time ranges only — never patient details (see 0002_functions.sql).
       */
      appointment_slots: {
        Row: { starts_at: string; ends_at: string };
        Relationships: [];
      };
      time_off_slots: {
        Row: { starts_at: string; ends_at: string };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      appointment_status: AppointmentStatus;
      contact_status: ContactStatus;
      staff_role: StaffRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
