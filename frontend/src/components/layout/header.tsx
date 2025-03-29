// Updated src/components/layout/header.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UserMenu } from "@/components/auth/user-menu";
import { ModeToggle } from "../theme/mode-toggle";

export function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between py-4 px-5">
        <Link href="/" className="text-xl font-bold">
          SUSTracker
        </Link>
        <div className="flex">
          <nav className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <UserMenu />
                ) : (
                  <>
                    <Button
                      onClick={() => router.push("/sign-in")}
                      variant="ghost"
                      size="sm"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => router.push("/sign-up")}
                      variant="default"
                      size="sm"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </>
            )}
            <ModeToggle />
          </nav>

        </div>
      </div>
    </header>
  );
}