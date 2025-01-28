"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IoLogoGoogle } from "react-icons/io5";

import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { SigninSchema, SigninFormValues } from '@repo/typescript-config';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(SigninSchema),
  });

  const onSubmit: SubmitHandler<SigninFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const response = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (response?.error) {
        toast({
          variant: "destructive",
          title: "Sign-in failed",
          description: response.error,
        });
      } else {
        toast({
          title: "Sign-in successful",
          description: "You have signed in successfully!",
        });

        
        // Add redirect or other post-sign-in logic here
        router.push('/'); 
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign-in failed",
        description: "There was a problem signing in. Please try again later.",
      });
      console.error("Failed to sign in", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit(onSubmit)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold">Login to your account</h1>
          <p className="text-balance text-md text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...register("email")} required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="ml-auto text-md underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <Input id="password" placeholder="********" type="password" {...register("password")} required />
          </div>
          <Button type="submit" className={cn(
            "relative group/btn w-full",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : "Sign in →"}
          </Button>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
         
        </div>
        
      </form>
      <div className="mt-5">
        <Button variant="outline" className="w-full h-12" 
            onClick={async () => {
                await signIn("google");
            }}>
            <IoLogoGoogle />
              Login with Google
        </Button>
        
      </div>
    </>
  )
}

const Spinner = () => (
  <svg className="animate-spin h-10 w-10 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
</svg>

);
