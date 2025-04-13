"use client";
import * as React from "react"

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
import { useRouter } from "next/navigation";

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
          isActive: false, 
        },
        {
          title: "Completed Tasks",
          url: "/dashboard/completed-tasks",
          isActive: false,
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
          url: "#",
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
  const [active, setIsActive] = React.useState(false);
  const router = useRouter(); 
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
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={(e) => {
                        e.preventDefault();
                        setIsActive(true);  
                        router.push(item.url);
                      }}
                      asChild
                      // isActive={active}
                      className={item.title === 'Ask AI'
                        ? 'relative bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-[#ffffff30] hover:border-[#ffffff50] hover:bg-[#ffffff15] transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#ff2d55] before:via-[#2ac3ff] before:to-[#0a84ff] before:opacity-[0.25] before:blur-xl before:-z-10 before:translate-y-0'
                        : ''
                      }
                    >
                      <a href={item.url} className="relative z-10">
                        {item.title}
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
