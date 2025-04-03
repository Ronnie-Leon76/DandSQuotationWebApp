
import { LogOut, Menu, MonitorSmartphone } from "lucide-react";
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
    <div className="py-3 px-0 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <Image
          src="/images/davislogo.png"
          alt="LOGO"
          sizes="100vw"
          className="animate-fade-in opacity-0 delay-300 fill-mode-forwards"
          style={{
            width: "100%",
            height: "auto",
            cursor:"pointer",
          }}
          onClick={onExpand}
         
          width={0}
          height={0}
        />
      </div>
      <div className="bg-[#0091EE] animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-10">
        <div className="flex flex-col">
          <p className="text-md text-gray-900 mb-3 px-4 font-bold">MENU</p>
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem size="max" {...menu} key={key} current={current} />
          ))}
        </div>
        <div className="flex flex-col">
          <p className="text-xl text-black flex ml-3 mb-3">OPTIONS</p>
          <MenuItem
            size="max"
            label="Sign out"
            icon={<LogOut className="text-black" />}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </div>
  );
};

export default MaxMenu;
