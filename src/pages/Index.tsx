
import { MainHeader } from "@/components/MainHeader";
import { ProjectDashboard } from "@/components/ProjectDashboard";

const Index = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-background py-12">
      <section className="w-full max-w-7xl space-y-8">
        <MainHeader />
        <ProjectDashboard />
      </section>
    </main>
  );
};

export default Index;
