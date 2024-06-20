import { signIn, signOut } from "next-auth/react"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs"
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { ScrollArea } from "../ui/scroll-area"
import { SignupForm } from "../form/SignupForm"
import { SigninForm } from "../form/SigninForm"

export function AuthTab() {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Signin</TabsTrigger>
        <TabsTrigger value="password">Signup</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardContent className="space-y-2 mt-5">
            <SigninForm />
          </CardContent>
            <div className="flex justify-center">
              <p className="pb-2 text-slate-500">or</p>
            </div>
          <CardFooter>
            <Button className="w-full gap-3" onClick={async () => {
            await signIn("google");}}><FcGoogle /> Sign in with Google</Button>
          </CardFooter>
          <CardFooter>
            <Button className="w-full gap-3"><FaGithub /> Sign in with Github</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
            <ScrollArea className="h-[500px] w-[400px] rounded-md border p-4">
              <SignupForm></SignupForm>
            </ScrollArea>
         
          <CardFooter>

          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
