import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type Props = {
  size: "max" | "min";
  label: string;
  icon: JSX.Element;
  path?: string;
  current?: string;
  onSignOut?(): void;
};
const MenuItem = ({ size, path, icon, label, current, onSignOut }: Props) => {
  switch (size) {
    case "max":
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            "flex items-center gap-2 px-1 py-2 rounded-lg my-1 focus:outline-none", // Add focus:outline-none
            !current
              ? "text-gray-500"
              : current == path
              ? "bg-[#0082D6] font-bold text-white"
              : "text-black"
          )}
          href={path ? `/${path}` : "#"}
        >
          {icon} {label}
        </Link>
      );
    case "min":
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            !current
              ? "text-white"
              : current == path
              ? "bg-[#0082D6] font-bold text-white"
              : "text-black",
            "rounded-lg py-2 my-1 px-3"
          )}
          href={path ? `/${path}` : "#"}
        >
          {icon}
        </Link>
      );
    default:
      return null;
  }
};

export default MenuItem;
