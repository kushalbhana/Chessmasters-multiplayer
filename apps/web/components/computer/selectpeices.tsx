"use client"

import * as React from "react"
import { useSetRecoilState } from "recoil"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { peicesVariety } from "@repo/lib/board-acessories" // your actual path
import { differentPeices } from "@/store/atoms/bot" // your actual path

export function PeicesCategoryDropdown() {
  const setPieces = useSetRecoilState(differentPeices)
  const [selectedKey, setSelectedKey] = React.useState("dubrovny") // default

  const handleChange = (key: keyof typeof peicesVariety) => {
    setSelectedKey(key)
    setPieces(peicesVariety[key]) 
  }

  return (
    <Select value={selectedKey} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px] bg-slate-600/60">
        <SelectValue placeholder="Select a style" className="bg-slate-600" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="">
          <SelectLabel>Piece Styles</SelectLabel>
          {Object.keys(peicesVariety).map((key) => (
            <SelectItem key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
