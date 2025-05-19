import { LogOut } from "lucide-react";
import Image from "next/image";
import React from "react";

import MenuItem from "./menu-items";
import { SIDE_BAR_MENU } from "@/constants/sidebar";

type Props = {
  onExpand(): void;
  current: string;
  onSignOut(): void;
};

const MaxMenu = ({ current, onExpand, onSignOut }: Props) => {
  return (
    <div className="py-4 px-2 flex flex-col h-[calc(100vh-32px)] bg-gradient-to-b from-[#0091EE] to-[#005fa3] rounded-r-2xl shadow-xl transition-all duration-300">
      {/* Logo Section */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="bg-white rounded-lg p-2 shadow transition-transform duration-200 hover:scale-105">
          <Image
            src="/images/davislogo.png"
            alt="LOGO"
            sizes="100vw"
            className="cursor-pointer"
            style={{
              width: "140px",
              height: "auto",
            }}
            onClick={onExpand}
            width={140}
            height={40}
          />
        </div>
      </div>
      {/* Menu Section */}
      <div className="flex flex-col justify-between flex-1 h-full">
        <div>
          <p className="text-lg text-white mb-4 px-4 font-bold tracking-wide">MENU</p>
          <nav className="flex flex-col gap-1">
            {SIDE_BAR_MENU.map((menu, key) => (
              <MenuItem
                size="max"
                {...menu}
                key={key}
                current={current}
                className={`rounded-lg px-4 py-2 transition-all duration-200 ${
                  current === menu.path
                    ? "bg-white/90 text-[#0091EE] font-bold shadow"
                    : "text-white hover:bg-white/20 hover:text-white"
                }`}
              />
            ))}
          </nav>
        </div>
        {/* Options Section */}
        <div className="flex flex-col mb-4">
          <p className="text-lg text-white font-semibold px-4 mb-2">OPTIONS</p>
          <MenuItem
            size="max"
            label={<span className="text-white">Sign out</span>}
            icon={<LogOut className="text-[#0091EE] group-hover:text-white transition-colors" />}
            onSignOut={onSignOut}
            className="rounded-lg px-4 py-2 text-[#0091EE] bg-white/90 hover:bg-red-500 hover:text-white transition-all duration-200 font-semibold shadow"
          />
        </div>
      </div>
    </div>
  );
};

export default MaxMenu;
