// import { Header } from "@/components/layout/header";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ChevronsRight } from "lucide-react";
import { Activity } from "lucide-react";
import { CalendarCheck } from "lucide-react";
import { Trophy } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Hero Section with Background Image */}
        <section 
        className="relative h-[400px] 
            md:h-[450px] 
            lg:h-[450px] 
            xl:h-[450px] 
            flex flex-col 
            items-center 
            justify-center 
            px-6 py-24 
            bg-[image:url('/hero_image.jpg')] 
            bg-no-repeat 
            bg-[position:100%_60%] 
            filter saturate-150 
            bg-[size:120%] 
            md:bg-[size:110%] 
            sm:bg-[size:140%]"
        >
        {/* style={{
            backgroundImage: "url('/hero_image.jpg')",
            backgroundSize: "120%",
            backgroundPosition: "100% 60%",
            backgroundRepeat: "no-repeat",
            // filter: "brightness(0.7)"
        }} */}
        {/* Gradient overlay */}
        <div className="absolute inset-0 
            bg-gradient-to-b 
            from-black/50 to-black/20 
            dark:from-black/70 dark:to-black/40">
        </div>
        
        {/* Content container */}
        <div className="max-w-5xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 mt-1 translate-y-4
            [text-shadow:_0_2px_8px_rgba(0,0,0,0.15)] dark:[text-shadow:_0_2px_10px_rgba(255,255,255,0.1)]">
            Welcome to <span className="text-orange-400/60">SUSTracker</span>
            </h1>
            <p className="text-[clamp(1rem,3vw,1.25rem)] text-lg md:text-xl max-w-2xl mx-auto mb-10 translate-y-1 text-foreground [text-shadow:_0_2px_8px_rgba(0,0,0,0.15)] dark:[text-shadow:_0_2px_10px_rgba(255,255,255,0.1)]">
            Your very own personal health assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
                size="lg" 
                asChild 
                variant="outline" 
                className="px-8 -translate-y-3 w-[clamp(150px,80vw,180px)]
                    bg-black/20
                    border-foreground/20
                    hover:bg-black/30
                    backdrop-blur-sm 
                    dark:bg-black/20 
                    dark:hover:bg-black/30 
                    dark:backdrop-blur-sm 
                    dark:border-white/30"
                >
                <Link href="/sign-up" className="text-white hover:text-white">
                    <span className="relative top-[-2px]">Start tracking</span>
                    <ChevronsRight className="w-5 h-5 ml-1" />
                </Link>
                </Button>
            </div>
        </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-muted-foreground">Monitor your training statistics and track your progress over time.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CalendarCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personalized Training</h3>
                <p className="text-muted-foreground">Plan your workouts ahead of time and compare them to the workout you managed to do.</p>
              </div>
              
              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Competition</h3>
                <p className="text-muted-foreground">Compare your training journey with others to gain insights.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-6 bg-primary/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to start your training journey?</h2>
            <p className="text-lg text-muted-foreground mb-8 -mt-3">
              Join thousands of users who are making a difference with SUStracker.
            </p>
            <Button size="lg" asChild className="px-8 -mt-3">
              <Link href="/sign-up">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-8 px-6 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © 2025 SUStracker. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}