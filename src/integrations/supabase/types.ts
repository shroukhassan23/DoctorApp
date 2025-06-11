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
      diagnosis_history: {
        Row: {
          id: string
          last_used: string
          text: string
          usage_count: number | null
        }
        Insert: {
          id?: string
          last_used?: string
          text: string
          usage_count?: number | null
        }
        Update: {
          id?: string
          last_used?: string
          text?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      doctor_profile: {
        Row: {
          clinic_address: string | null
          clinic_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          qualification: string | null
          specialization: string | null
          title: string
          updated_at: string
        }
        Insert: {
          clinic_address?: string | null
          clinic_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          qualification?: string | null
          specialization?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          clinic_address?: string | null
          clinic_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          qualification?: string | null
          specialization?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      dosage_history: {
        Row: {
          id: string
          last_used: string
          text: string
          usage_count: number | null
        }
        Insert: {
          id?: string
          last_used?: string
          text: string
          usage_count?: number | null
        }
        Update: {
          id?: string
          last_used?: string
          text?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      duration_history: {
        Row: {
          id: string
          last_used: string
          text: string
          usage_count: number | null
        }
        Insert: {
          id?: string
          last_used?: string
          text: string
          usage_count?: number | null
        }
        Update: {
          id?: string
          last_used?: string
          text?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      imaging_studies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      instruction_history: {
        Row: {
          id: string
          last_used: string
          text: string
          usage_count: number | null
        }
        Insert: {
          id?: string
          last_used?: string
          text: string
          usage_count?: number | null
        }
        Update: {
          id?: string
          last_used?: string
          text?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      lab_tests: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          created_at: string
          dosage: string | null
          form: string | null
          id: string
          manufacturer: string | null
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          form?: string | null
          id?: string
          manufacturer?: string | null
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          form?: string | null
          id?: string
          manufacturer?: string | null
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notes_history: {
        Row: {
          id: string
          last_used: string
          text: string
          usage_count: number | null
        }
        Insert: {
          id?: string
          last_used?: string
          text: string
          usage_count?: number | null
        }
        Update: {
          id?: string
          last_used?: string
          text?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      patient_files: {
        Row: {
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          patient_id: string
          uploaded_at: string
          visit_id: string | null
        }
        Insert: {
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          patient_id: string
          uploaded_at?: string
          visit_id?: string | null
        }
        Update: {
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          patient_id?: string
          uploaded_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_files_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_files_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "patient_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_visits: {
        Row: {
          chief_complaint: string | null
          created_at: string
          diagnosis: string | null
          id: string
          notes: string | null
          patient_id: string
          status: string | null
          visit_date: string
          visit_type: string
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: string | null
          visit_date?: string
          visit_type?: string
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string | null
          visit_date?: string
          visit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age: number
          created_at: string
          date_of_birth: string | null
          gender: string
          id: string
          medical_history: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          age: number
          created_at?: string
          date_of_birth?: string | null
          gender: string
          id?: string
          medical_history?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          age?: number
          created_at?: string
          date_of_birth?: string | null
          gender?: string
          id?: string
          medical_history?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prescription_imaging_studies: {
        Row: {
          id: string
          imaging_study_id: string
          notes: string | null
          prescription_id: string
        }
        Insert: {
          id?: string
          imaging_study_id: string
          notes?: string | null
          prescription_id: string
        }
        Update: {
          id?: string
          imaging_study_id?: string
          notes?: string | null
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescription_imaging_studies_imaging_study_id_fkey"
            columns: ["imaging_study_id"]
            isOneToOne: false
            referencedRelation: "imaging_studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_imaging_studies_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_items: {
        Row: {
          dosage: string
          duration: string
          frequency: string
          id: string
          instructions: string | null
          medicine_id: string
          prescription_id: string
        }
        Insert: {
          dosage: string
          duration: string
          frequency: string
          id?: string
          instructions?: string | null
          medicine_id: string
          prescription_id: string
        }
        Update: {
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          instructions?: string | null
          medicine_id?: string
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_lab_tests: {
        Row: {
          id: string
          lab_test_id: string
          notes: string | null
          prescription_id: string
        }
        Insert: {
          id?: string
          lab_test_id: string
          notes?: string | null
          prescription_id: string
        }
        Update: {
          id?: string
          lab_test_id?: string
          notes?: string | null
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescription_lab_tests_lab_test_id_fkey"
            columns: ["lab_test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_lab_tests_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          prescription_date: string
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          prescription_date?: string
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          prescription_date?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "patient_visits"
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
