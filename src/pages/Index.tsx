
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const heroImg =
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=1200&q=80";

const Index = () => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <section className="relative w-full max-w-3xl mx-auto mt-12 rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
        <img
          src={heroImg}
          alt=""
          className="w-full h-[300px] object-cover object-center brightness-[0.85]"
          style={{ minHeight: 180 }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 p-6">
          <h1 className="text-2xl md:text-3xl font-playfair font-semibold text-white drop-shadow text-center leading-snug max-w-2xl mb-8">
            AI-powered infrastructure in minutes.
          </h1>
          <Button
            className="bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 text-white px-7 py-3 text-lg shadow-lg hover-scale border-0"
            size="lg"
            onClick={() => {
              // Scroll or navigate as needed, placeholder for now
            }}
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Index;
