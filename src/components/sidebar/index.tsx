"use client"

import { cn } from '@/lib/utils';
import React from 'react'
import MaxMenu from './maximized-menu';
import useSideBar from '@/hooks/sidebar/use-sidebar';
import { MinMenu } from './minimized-menu';

type Props = {}

const SideBar = (props: Props) => {
  const { expand, onExpand, page, onSignOut } = useSideBar();
  return (
    <aside
      className={cn(
        "bg-white dark:bg-neutral-950 h-full w-[60px] md:w-[220px] transition-all duration-300 fixed md:relative border-r border-gray-200 shadow-sm z-30",
        expand === undefined && "",
        expand === true
          ? "animate-open-sidebar w-[220px]"
          : expand === false && "animate-close-sidebar w-[60px]"
      )}
      aria-label="Sidebar"
    >
      {/* Logo/Header */}
        {expand === false && (
          <div className="flex items-center justify-center py-6 border-b border-gray-100 dark:border-neutral-800">
            <img
          src="/images/davislogo.png"
          alt="Davis & Shirtliff Logo"
          className="h-8 object-contain select-none"
            />
          </div>
        )}
        {/* Menu */}
      <nav className="flex-1 flex flex-col">
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
      </nav>
      {/* Footer/Collapse Button */}
      <div className="py-4 flex justify-center border-t border-gray-100 dark:border-neutral-800">
        <button
          onClick={onExpand}
          className="rounded-full p-2 hover:bg-blue-50 dark:hover:bg-neutral-900 transition"
          aria-label={expand ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span className="sr-only">{expand ? "Collapse sidebar" : "Expand sidebar"}</span>
          {/* You can use an icon here if you want */}
          <svg
            className="w-5 h-5 text-[#2563eb]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {expand ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>
    </aside>
  );
}

export default SideBar