
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";

// Types from Supabase enums
export type ProjectCategory = Enums<"project_category">;
export type ProjectComplexity = Enums<"project_complexity">;
export type ProjectRole = Enums<"project_role">;
export type TechStack = Enums<"tech_stack">;

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  template_id?: string | null;
  tech_stack?: TechStack[] | null;
  complexity?: ProjectComplexity | null;
  category?: ProjectCategory | null;
  estimated_hours?: string | null;
  roles?: ProjectRole[] | null;
  created_at?: string;
  updated_at?: string;
}

export type NewProject = {
  name: string;
  description?: string | null;
  template_id?: string | null;
  tech_stack?: TechStack[] | null;
  complexity?: ProjectComplexity | null;
  category?: ProjectCategory | null;
  estimated_hours?: string | null;
  roles?: ProjectRole[] | null;
};

export const fetchProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const useProjects = () => {
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const createMutation = useMutation({
    mutationFn: async (project: NewProject) => {
      // Note: Insert expects *specific* enum values, not just any string.
      const { data, error } = await supabase
        .from("projects")
        .insert([project])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Project> & { id: string }) => {
      // Type assertion to keep the updates strongly typed
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      return; // Ensures return type is Promise<void>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    projects: projectsQuery.data,
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    createProject: createMutation.mutateAsync,
    updateProject: updateMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,
  };
};
