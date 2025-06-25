import * as React from "react";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Dropdown({ type }: { type: "video" | "audio" }) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function listDevices() {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const filtered = allDevices.filter((device) =>
        type === "video" ? device.kind === "videoinput" : device.kind === "audioinput"
      );
      setDevices(filtered);
    }

    listDevices();
  }, [type]);

  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={`Default ${type} device`} />
      </SelectTrigger>
      <SelectContent>tt
        <SelectGroup>
          <SelectLabel>
            {type === "video" ? "Video Devices" : "Audio Devices"}
          </SelectLabel>
          {devices.length > 0 ? (
            devices.map((device, index) => (
              <SelectItem
                key={device.deviceId || `device-${index}`}
                value={device.deviceId || `device-${index}`}
              >
                {device.label || `${type} device ${index + 1}`}
              </SelectItem>
            ))
          ) : (
            <SelectItem disabled value="no-device">
              No devices found
            </SelectItem>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
