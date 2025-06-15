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
      project_templates: {
        Row: {
          category: Database["public"]["Enums"]["project_category"]
          complexity: Database["public"]["Enums"]["project_complexity"]
          created_at: string | null
          description: string | null
          estimated_hours: string | null
          github_url: string | null
          id: string
          learning_objectives: string[] | null
          name: string
          roles: Database["public"]["Enums"]["project_role"][] | null
          tech_stack: Database["public"]["Enums"]["tech_stack"][] | null
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["project_category"]
          complexity: Database["public"]["Enums"]["project_complexity"]
          created_at?: string | null
          description?: string | null
          estimated_hours?: string | null
          github_url?: string | null
          id?: string
          learning_objectives?: string[] | null
          name: string
          roles?: Database["public"]["Enums"]["project_role"][] | null
          tech_stack?: Database["public"]["Enums"]["tech_stack"][] | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["project_category"]
          complexity?: Database["public"]["Enums"]["project_complexity"]
          created_at?: string | null
          description?: string | null
          estimated_hours?: string | null
          github_url?: string | null
          id?: string
          learning_objectives?: string[] | null
          name?: string
          roles?: Database["public"]["Enums"]["project_role"][] | null
          tech_stack?: Database["public"]["Enums"]["tech_stack"][] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: Database["public"]["Enums"]["project_category"] | null
          complexity: Database["public"]["Enums"]["project_complexity"] | null
          created_at: string | null
          description: string | null
          estimated_hours: string | null
          id: string
          name: string
          roles: Database["public"]["Enums"]["project_role"][] | null
          tech_stack: Database["public"]["Enums"]["tech_stack"][] | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["project_category"] | null
          complexity?: Database["public"]["Enums"]["project_complexity"] | null
          created_at?: string | null
          description?: string | null
          estimated_hours?: string | null
          id?: string
          name: string
          roles?: Database["public"]["Enums"]["project_role"][] | null
          tech_stack?: Database["public"]["Enums"]["tech_stack"][] | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["project_category"] | null
          complexity?: Database["public"]["Enums"]["project_complexity"] | null
          created_at?: string | null
          description?: string | null
          estimated_hours?: string | null
          id?: string
          name?: string
          roles?: Database["public"]["Enums"]["project_role"][] | null
          tech_stack?: Database["public"]["Enums"]["tech_stack"][] | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "project_templates"
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
      project_category: "web-app" | "api" | "full-stack" | "mobile" | "desktop"
      project_complexity: "Simple" | "Beginner" | "Intermediate" | "Advanced"
      project_role:
        | "developer"
        | "designer"
        | "product manager"
        | "security"
        | "devops"
        | "qa"
        | "ai practitioner"
        | "researcher"
        | "customer"
        | "technical writer"
        | "ux designer"
        | "data analyst"
        | "customer success"
        | "manager"
        | "seo"
        | "job seeker"
        | "student"
        | "machine learning engineer"
      project_type:
        | "keycloak"
        | "spring-boot"
        | "microservices"
        | "full-stack"
        | "web-app"
        | "api"
        | "mobile"
        | "desktop"
      tech_stack:
        | "React"
        | "TypeScript"
        | "Supabase"
        | "Tailwind CSS"
        | "Framer Motion"
        | "Chart.js"
        | "PWA"
        | "TinyMCE"
        | "React Query"
        | "DnD Kit"
        | "Next.js"
        | "Stripe"
        | "Socket.IO"
        | "Hugging Face"
        | "llama.cpp"
        | "GitHub API"
        | "Recharts"
        | "PapaParse"
        | "PDF"
        | "Swagger"
        | "Markdown"
        | "Docker"
        | "onnxruntime-web"
        | "Web Workers"
        | "Vercel"
        | "Other"
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
    Enums: {
      project_category: ["web-app", "api", "full-stack", "mobile", "desktop"],
      project_complexity: ["Simple", "Beginner", "Intermediate", "Advanced"],
      project_role: [
        "developer",
        "designer",
        "product manager",
        "security",
        "devops",
        "qa",
        "ai practitioner",
        "researcher",
        "customer",
        "technical writer",
        "ux designer",
        "data analyst",
        "customer success",
        "manager",
        "seo",
        "job seeker",
        "student",
        "machine learning engineer",
      ],
      project_type: [
        "keycloak",
        "spring-boot",
        "microservices",
        "full-stack",
        "web-app",
        "api",
        "mobile",
        "desktop",
      ],
      tech_stack: [
        "React",
        "TypeScript",
        "Supabase",
        "Tailwind CSS",
        "Framer Motion",
        "Chart.js",
        "PWA",
        "TinyMCE",
        "React Query",
        "DnD Kit",
        "Next.js",
        "Stripe",
        "Socket.IO",
        "Hugging Face",
        "llama.cpp",
        "GitHub API",
        "Recharts",
        "PapaParse",
        "PDF",
        "Swagger",
        "Markdown",
        "Docker",
        "onnxruntime-web",
        "Web Workers",
        "Vercel",
        "Other",
      ],
    },
  },
} as const
