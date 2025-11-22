import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Sparkles, Zap, Image, Rocket } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-slide-in">
            <div className="inline-block">
              <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/30 text-xs sm:text-sm text-primary">
                Powered by Advanced AI
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight px-4">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-glow-pulse">
                Imagination
              </span>
              {" "}Into Reality
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Create stunning AI-generated images with simple text prompts. 
              Experience the future of digital creativity with imagifant.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 px-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="glow-button bg-primary hover:bg-primary/90 text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Creating
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/gallery")}
                className="border-primary/30 hover:border-primary text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 w-full sm:w-auto"
              >
                View Gallery
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold">Lightning Fast</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Generate high-quality images in seconds with our optimized AI models
              </p>
            </div>

            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4 hover:border-secondary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Image className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold">Unlimited Creativity</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Choose how many images to generate and explore endless possibilities
              </p>
            </div>

            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4 hover:border-primary/50 transition-all sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold">Easy to Use</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Simple interface designed for creators of all skill levels
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="glass-card p-8 sm:p-12 rounded-3xl text-center space-y-6 max-w-3xl mx-auto border-primary/30">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Ready to Create Magic?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Join thousands of creators bringing their ideas to life
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="glow-button bg-primary hover:bg-primary/90 text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Get Started Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
