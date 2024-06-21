import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"

import {AuthTab} from "./AuthTab"

export function AuthDialogbox() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className=" w-40 bg-orange-500">Signin/ Signup</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle> Authenticate</DialogTitle>
          <DialogDescription>
            Authenticate yourself. Click Signin/Signup to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 mr-2">
          < AuthTab />
          
        </div>
      </DialogContent>
    </Dialog>
  )
}
