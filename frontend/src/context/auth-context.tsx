// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { 
  fetchSignInMethodsForEmail,
  // Include other imports you already have
} from "firebase/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithGithub: () => Promise<UserCredential>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Create the context with explicit naming to avoid any potential conflicts
const FirebaseAuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged(auth, callback) : Firebase function listens for changes in the user's authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => { 
      if (user) { // when user is authenticated 
        setUser(user); // set user to the state above 
        const token = await user.getIdToken();
        Cookies.set('firebase-token', token, { 
          // property name expected by js-cookie : secure and sameSite.
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      } else {
        setUser(null);
        Cookies.remove('firebase-token');
      }
      setLoading(false); // Regardless of the state (user or no user), setLoading(false) is called to signal that the authentication check is complete.
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => { 
    try {
      return await createUserWithEmailAndPassword(auth, email, password); // return in userCredential object (contain user info)
    } catch (error: any) {
      toast.error("Error signing up", {
        description: error.message
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      toast.error("Error signing in", {
        description: error.message
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast.error("Error signing in with Google", {
        description: error.message
      });
      throw error;
    }
  };

  // const signInWithGithub = async () => {
  //   try {
  //     const provider = new GithubAuthProvider();
  //     return await signInWithPopup(auth, provider);
  //   } catch (error: any) {
  //     toast.error("Error signing in with GitHub", {
  //       description: error.message
  //     });
  //     throw error;
  //   }
  // };
  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Check if it's the "account-exists-with-different-credential" error
      if (error.code === 'auth/account-exists-with-different-credential') {
        // Get the email from the error
        const email = error.customData?.email;
        
        if (email) {
          // Fetch sign-in methods for this email
          const methods = await fetchSignInMethodsForEmail(auth, email);
          
          // Create a user-friendly list of sign-in methods
          const methodNames: Record<string, string> = {
            'password': 'Email/Password',
            'google.com': 'Google',
            'github.com': 'GitHub',
            'facebook.com': 'Facebook',
            'twitter.com': 'Twitter',
            'microsoft.com': 'Microsoft',
            'apple.com': 'Apple'
          };
          
          const friendlyMethods = methods.map(method => 
            methodNames[method] || method
          ).join(', ');
          
          toast.error(
            "Account already exists", 
            { 
              description: `This email is already used with ${friendlyMethods}. Please sign in using that method instead.` 
            }
          );
        } else {
          toast.error("Account already exists", {
            description: "This email is already associated with another account. Please use your original sign-in method."
          });
        }
      } else {
        toast.error("Error signing in with GitHub", {
          description: error.message
        });
      }
      throw error;
    }
  };


  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent", {
        description: "Check your email for a password reset link"
      });
    } catch (error: any) {
      toast.error("Error sending password reset", {
        description: error.message
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error("Error signing out", {
        description: error.message
      });
      throw error;
    }
  };

  // Use the explicitly named context
  return (
    <FirebaseAuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithGithub,
      resetPassword,
      logout
    }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}