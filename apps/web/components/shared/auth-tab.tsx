import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { LoginForm } from "@/components/form/login-form"
import { SignupForm } from "../form/signup-form-demo"

export function AuthTab() {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Login</TabsTrigger>
        <TabsTrigger value="password">Signup</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="mt-20">
            <LoginForm />
        </div>
      </TabsContent>
      <TabsContent value="password">
      <div className="mt-4">
            <SignupForm/>
        </div>
      </TabsContent>
    </Tabs>
  )
}
