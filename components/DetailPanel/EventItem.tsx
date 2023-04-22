import { EventFragment } from "ethers";
import { useState } from "react";

export default function EventItem({
  event,
  isSelected,
}: {
  event: EventFragment;
  isSelected?: boolean;
  setSelected?: (event: EventFragment) => void;
}) {
  return (
    <div className={`text-xs ${isSelected ? "text-blue-600" : "text-gray-600"}`}>
      {event.format("full")}
    </div>
  );
}
