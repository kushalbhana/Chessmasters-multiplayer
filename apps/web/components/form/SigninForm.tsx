'use client';
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from 'next/navigation'; // Import useRouter
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";
import { SigninSchema, SigninFormValues } from '@repo/typescript-config';
import { useToast } from "../ui/use-toast";
import { signIn } from 'next-auth/react';

export function SigninForm() {
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
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl px-2 md:px-2 shadow-input bg-white dark:bg-slate-950">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Sign In</h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Sign in to continue playing chess
      </p>

      <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="youremail@fc.com"
            type="email"
            {...register("email")}
          />
          {errors.email && <span className="text-red-500">{errors.email?.message}</span>}
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            {...register("password")}
          />
          {errors.password && <span className="text-red-500">{errors.password?.message}</span>}
        </LabelInputContainer>

        <Button
          className={cn(
            "relative group/btn w-full",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : "Sign in →"}
          <BottomGradient />
        </Button>
      </form>
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-5px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
  </>
);

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>
    {children}
  </div>
);

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
);
