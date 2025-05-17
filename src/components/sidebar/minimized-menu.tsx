import React from "react";
import { LogOut, Menu as MenuIcon } from "lucide-react"; // Import a menu/hamburger icon
import MenuItem from "./menu-items";
import { SIDE_BAR_MENU } from "@/constants/sidebar";

type MinMenuProps = {
  onShrink(): void;
  current: string;
  onSignOut(): void;
};

export const MinMenu = ({
  onShrink,
  current,
  onSignOut,
}: MinMenuProps) => {
  return (
    <div className="p-3 flex flex-col items-center h-full">
      {/* Use a menu/hamburger icon to indicate hidden menu */}
      <span
        className="animate-fade-in opacity-100 cursor-pointer mb-6"
        onClick={onShrink}
        title="Expand menu"
      >
        <MenuIcon className="w-8 h-8 text-[#0091EE] hover:text-[#005fa3] transition-colors" />
      </span>
      <div className="animate-fade-in opacity-100 flex flex-col justify-between h-full pt-10">
        <div className="flex flex-col">
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem size="min" {...menu} key={key} current={current} />
          ))}
        </div>
        <div className="flex flex-col">
          <MenuItem
            size="min"
            label="Sign out"
            icon={<LogOut className="text-black" />}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </div>
  );
};
