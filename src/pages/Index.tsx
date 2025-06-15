
import { MainHeader } from "@/components/MainHeader";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Hero image from placeholder_images context
const heroImg =
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=1200&q=80";

const Index = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative w-full max-w-6xl mx-auto mt-2 mb-10 rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
        <img
          src={heroImg}
          alt=""
          className="w-full h-[320px] object-cover object-center brightness-[0.77] grayscale-0"
          style={{ minHeight: 180 }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 p-6">
          <div className="mb-2">
            <span className="inline-block text-xs font-semibold tracking-wider uppercase bg-white/90 text-purple-700 rounded-full px-3 py-1 shadow backdrop-blur">
              AI-Powered Open Source Infra
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white drop-shadow-lg mb-4 text-center leading-snug max-w-3xl">
            Effortless Infrastructure Generation.<br />
            <span className="text-pink-200">From Zero to Production</span>—in Minutes.
          </h1>
          <p className="text-lg text-white/90 mb-6 text-center max-w-lg">
            Instantly build, organize and deploy cloud infrastructure code with AI—own your stack from Keycloak to Terraform & beyond!
          </p>
          <Button
            className="bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 text-white px-7 py-3 text-lg shadow-lg hover-scale border-0"
            size="lg"
            onClick={() => {
              // Scroll down to projects
              const el = document.getElementById("projects-section");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <section className="w-full max-w-7xl space-y-8" id="projects-section">
        <MainHeader />
        <ProjectDashboard />
      </section>
    </main>
  );
};

export default Index;
