"use client"

import * as React from "react"
import {
  AudioWaveform,
  Calendar,
  Command,
  GalleryVerticalEnd,
  Home,
  Inbox,
  ListTodo,
  Plus,
  Search,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { TeamSwitcher } from "@/components/team-switcher"
import { TrafficLights } from "@/components/traffic-lights"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import FileTree from "@/components/file-tree"
import type { AppPage } from "@/App"

// Quick actions data with soft utility colors
const quickActions = [
  {
    title: "Search",
    icon: Search,
    kbd: "⌘ K",
    iconColor: "text-soft-slate",
  },
  {
    title: "New",
    icon: Plus,
    kbd: "⌘ N",
    iconColor: "text-soft-sage",
  },
]

// Main navigation data with soft accent colors
const mainNav: {
  title: string
  page: AppPage
  icon: typeof Inbox
  iconColor: string
}[] = [
    {
      title: "Inbox",
      page: "inbox",
      icon: Inbox,
      iconColor: "text-accent-cyan",
    },
    {
      title: "Home",
      page: "home",
      icon: Home,
      iconColor: "text-accent-green",
    },
    {
      title: "Today",
      page: "today",
      icon: Calendar,
      iconColor: "text-accent-orange",
    },
    {
      title: "Tasks",
      page: "tasks",
      icon: ListTodo,
      iconColor: "text-accent-purple",
    },
  ]

// This is sample data.
const data = {
  teams: [
    {
      name: "Kaan",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
}



function SidebarHeaderContent({ teams }: { teams: typeof data.teams }) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarHeader>
      {/* Drag region + Traffic lights for macOS */}
      <div
        className={cn(
          "drag-region flex items-center h-8 shrink-0 transition-all duration-200",
          isCollapsed ? "justify-center px-0" : "justify-start px-2"
        )}
      >
        <TrafficLights compact={isCollapsed} />
      </div>
      <TeamSwitcher teams={teams} />
    </SidebarHeader>
  )
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentPage: AppPage
  onNavigate: (page: AppPage) => void
}

export function AppSidebar({ currentPage, onNavigate, ...props }: AppSidebarProps) {
  const handleNavClick = (page: AppPage) => (e: React.MouseEvent) => {
    e.preventDefault()
    onNavigate(page)
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeaderContent teams={data.teams} />
      <SidebarContent>
        {/* Quick Actions: Search & New */}
        <SidebarGroup>
          <SidebarMenu>
            {quickActions.map((action) => (
              <SidebarMenuItem key={action.title}>
                <SidebarMenuButton tooltip={action.title}>
                  <action.icon className={cn("size-4", action.iconColor)} />
                  <span>{action.title}</span>
                  <KbdGroup className="ml-auto">
                    <Kbd>{action.kbd}</Kbd>
                  </KbdGroup>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="!w-auto" />

        {/* Main Navigation: Home, Inbox, Tasks */}
        <SidebarGroup>
          <SidebarMenu>
            {mainNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={currentPage === item.page}
                  onClick={handleNavClick(item.page)}
                >
                  <item.icon className={cn("size-4", item.iconColor)} />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* File Tree */}
        <SidebarGroup className="flex-1 overflow-auto">
          <SidebarGroupLabel>Collections</SidebarGroupLabel>
          <SidebarMenu>
            <FileTree />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
