// // src/components/auth/reset-password-form.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/auth-context";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// export function ResetPasswordForm() {
//   const [email, setEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const { resetPassword } = useAuth();
//   const router = useRouter();

//   const handleResetPassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     try {
//       await resetPassword(email);
//       // Success toast is shown in the auth context
//     } catch (error) {
//       // Error is handled in the auth context
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto">
//       <CardHeader>
//         <CardTitle className="text-2xl">Reset Password</CardTitle>
//         <CardDescription>
//           Enter your email address and we'll send you a link to reset your password
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleResetPassword} className="space-y-4">
//           <div className="space-y-2">
//             <label htmlFor="email" className="text-sm font-medium">
//               Email
//             </label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="name@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               disabled={isLoading}
//             />
//           </div>
//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? "Sending..." : "Send Reset Link"}
//           </Button>
//         </form>
//       </CardContent>
//       <CardFooter className="flex justify-center">
//         <Button
//           variant="link"
//           onClick={() => router.push("/sign-in")}
//         >
//           Back to Sign In
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }