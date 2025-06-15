
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description?: string | null;
  complexity?: string | null;
}
type Props = {
  projects: Project[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  deleteProject: (id: string) => Promise<void>;
};

export function ProjectList({
  projects,
  isLoading,
  isError,
  selectedProjectId,
  setSelectedProjectId,
  deleteProject,
}: Props) {
  const { toast } = useToast();

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading projects...</div>;
  }
  if (isError) {
    return <div className="text-center py-8 text-red-600">Error loading projects!</div>;
  }
  return (
    <div>
      <div className="text-lg font-semibold mb-4 flex items-center gap-2">
        Your Projects
        <Badge variant="secondary">{projects?.length ?? 0}</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <button
              key={project.id}
              className={`group border rounded-2xl bg-white shadow-md p-5 flex flex-col justify-between hover:shadow-xl focus:ring-2 focus:ring-purple-400 relative transition-all cursor-pointer
                ${selectedProjectId === project.id ? "ring-2 ring-purple-400 border-purple-500 bg-purple-50 scale-[1.015]" : "hover:border-purple-300"}
                `}
              tabIndex={0}
              aria-selected={selectedProjectId === project.id}
              onClick={() => setSelectedProjectId(project.id)}
              style={{ textAlign: "left" }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xl truncate max-w-[60%]" title={project.name}>{project.name}</span>
                <Badge
                  variant="secondary"
                  className={`text-xs px-2 py-1
                    ${project.complexity === "Beginner" ? "bg-green-100 text-green-800 border-green-200"
                      : project.complexity === "Intermediate" ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : project.complexity === "Advanced" ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-gray-200 text-gray-700 border-gray-300"
                    }
                  `}
                >
                  {project.complexity || "N/A"}
                </Badge>
              </div>
              <div className="text-muted-foreground mb-3 text-sm line-clamp-2">
                {project.description || <span className="italic">No description</span>}
              </div>
              <div className="flex justify-between items-center mt-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto group-hover:bg-purple-600 group-hover:text-white transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProjectId(project.id);
                    toast({
                      title: `Project: ${project.name}`,
                      description: project.description || "",
                    });
                  }}
                >
                  View Details
                </Button>
                <button
                  aria-label="Delete"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteProject(project.id);
                    toast({
                      title: "Project Deleted",
                      description: `"${project.name}" has been deleted.`,
                      duration: 1800,
                    });
                    if (selectedProjectId === project.id) setSelectedProjectId(null);
                  }}
                  className="ml-2 text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </button>
          ))
        ) : (
          <div className="text-muted-foreground text-center col-span-full">
            No projects found. Create or combine one below!
          </div>
        )}
      </div>
    </div>
  );
}
