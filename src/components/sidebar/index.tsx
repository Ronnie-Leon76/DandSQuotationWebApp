"use client";

import { cn } from "@/lib/utils";
import React from "react";
import MaxMenu from "./maximized-menu";
import useSideBar from "@/hooks/sidebar/use-sidebar";
import { MinMenu } from "./minimized-menu";

type Props = {};

const SideBar = (props: Props) => {
  const { expand, onExpand, page, onSignOut } = useSideBar();

  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-950 h-full fixed md:relative border-r border-gray-200 dark:border-neutral-800 z-50 shadow-lg transition-all duration-300",
        expand === undefined && "",
        expand === true
          ? "w-[240px] animate-open-sidebar"
          : expand === false && "w-[60px] animate-close-sidebar"
      )}
    >
      {/* Sidebar Content */}
      {expand ? (
        <MaxMenu
          current={page!}
          onExpand={onExpand}
          onSignOut={onSignOut}
        />
      ) : (
        <MinMenu
          onShrink={onExpand}
          current={page!}
          onSignOut={onSignOut}
        />
      )}
    </div>
  );
};

export default SideBar;