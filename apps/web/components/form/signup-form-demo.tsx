"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { SignupSchema, SignupFormValues } from "@repo/typescript-config";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { IoLogoGoogle } from "react-icons/io5";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_HTTP_SERVER}/api/signup/`, data, {
        headers: { "Content-Type": "application/json" },
      });

      toast({
        title: "Signup successful",
        description: "You have signed up successfully!",
      });

      const signInResponse = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      console.log(signInResponse);

      router.push("/"); // Redirect to homepage
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast({
          variant: "destructive",
          title: "Account already exists",
          description: "An account with this email already exists.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: "There was a problem signing up. Please try again later.",
        });
      }
      console.error("Failed to signup", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-6 shadow-input">
      <h2 className="font-bold text-xl text-neutral-800">Welcome to Chessmasters</h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-1">
        Signup to continue playing chess
      </p>

      <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="fullname" className="text-slate-950">
            Full Name
          </Label>
          <Input
            id="fullname"
            placeholder="Magnus Carlsen"
            type="text"
            className="!bg-white !text-black border border-gray-300 focus:ring-2 focus:ring-blue-500"
            {...register("fullname")}
          />
          {errors.fullname && <span className="text-red-500">{errors.fullname.message}</span>}
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="email" className="text-slate-950">
            Email Address
          </Label>
          <Input
            id="email"
            placeholder="youremail@fc.com"
            type="email"
            className="!bg-white !text-black border border-gray-300 focus:ring-2 focus:ring-blue-500"
            {...register("email")}
          />
          {errors.email && <span className="text-red-500">{errors.email.message}</span>}
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="password" className="text-slate-950">
            Password
          </Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            className="!bg-white !text-black border border-gray-300 focus:ring-2 focus:ring-blue-500"
            {...register("password")}
          />
          {errors.password && <span className="text-red-500">{errors.password.message}</span>}
        </LabelInputContainer>

        <LabelInputContainer className="mb-8">
          <Label htmlFor="confirmPassword" className="text-slate-950">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            placeholder="••••••••"
            type="password"
            className="!bg-white !text-black border border-gray-300 focus:ring-2 focus:ring-blue-500"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <span className="text-red-500">{errors.confirmPassword.message}</span>}
        </LabelInputContainer>

        <Button
          className={cn(
            "relative group/btn w-full bg-black text-white",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : "Sign up →"}
          <BottomGradient />
        </Button>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 my-8 h-[1px] w-full" />

        <div className="flex flex-col space-y-4">
          <Button
            variant="outline"
            className="w-full h-12 bg-black text-white border border-gray-300"
            onClick={async () => {
              await signIn("google");
            }}
          >
            <IoLogoGoogle />
            Signup with Google
            <BottomGradient />
          </Button>
        </div>
      </form>
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-0.5 w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
  </>
);

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    ></path>
  </svg>
);
