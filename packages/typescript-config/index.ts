import { z } from 'zod'

export const SignupSchema = z.object({
    fullname: z.string().max(30).nonempty("Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
  
  export type SignupFormValues = z.infer<typeof SignupSchema>;