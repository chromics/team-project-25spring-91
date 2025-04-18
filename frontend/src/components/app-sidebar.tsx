"use client";
import * as React from "react"
import { useRouter, usePathname } from "next/navigation"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GlowEffect } from "./motion-primitives/glow-effect"

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Training Tasks",
      url: "#",
      items: [
        {
          title: "Set Goals",
          url: "/dashboard/set-goals",
        },
        {
          title: "Completed Tasks",
          url: "/dashboard/completed-tasks",
        },
      ],
    },
    {
      title: "Gym",
      url: "#",
      items: [
        {
          title: "Make Appointment",
          url: "#",
        },
      ],
    },
    {
      title: "Diet",
      url: "#",
      items: [
        {
          title: "Diet Discussion",
          url: "#",
        },
      ],
    },
    {
      title: "Growth",
      url: "#",
      items: [
        {
          title: "Statistics",
          url: "/dashboard/statistics",
        },
        {
          title: "Online Competition",
          url: "/dashboard/competition",
        },
      ],
    },
    {
      title: "Personal",
      url: "#",
      items: [
        {
          title: "Personal Info",
          url: "#",
        },
        {
          title: "FAQ",
          url: "#",
        },
      ],
    },
    {
      title: "Coach",
      url: "#",
      items: [
        {
          title: "Ask AI",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/**
            * AI generated code 
             tool: chat-gpt 
             version: o3 mini high
             usage: i want a colorful button for 'ask ai' feature, i use ai to help me generate the gradient color   
            */}
                {item.items.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(subItem.url);
                      }}
                      isActive={pathname === subItem.url}
                                  
                      className={`
                        ${subItem.title === 'Ask AI'
                          ? 'relative bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-[#ffffff30] hover:border-[#ffffff50] hover:bg-[#ffffff15] transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#ff2d55] before:via-[#2ac3ff] before:to-[#0a84ff] before:opacity-[0.25] before:blur-xl before:-z-10 before:translate-y-0'
                          : ''
                        }
                      `}
                    >
                      <a href={subItem.url} className="relative z-10">
                        {subItem.title}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}