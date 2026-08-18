import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  Map,
  Waypoints,
  Megaphone,
  Users,
  Wallet,
  Target,
  Clapperboard,
  Package,
  Link2,
  Kanban,
  BarChart3,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  children?: { label: string; href: string }[];
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Planejamento",
    items: [
      {
        label: "Planejamento",
        href: "/planejamento/calendario",
        icon: CalendarDays,
        children: [
          { label: "Calendário", href: "/planejamento/calendario" },
          { label: "Roadmap", href: "/planejamento/roadmap" },
          { label: "Mapa da Estratégia", href: "/planejamento/mapa-estrategia" },
        ],
      },
    ],
  },
  {
    title: "Comercial",
    items: [
      {
        label: "Campanhas",
        href: "/campanhas",
        icon: Megaphone,
        children: [
          { label: "Todas", href: "/campanhas" },
          { label: "Meta Ads", href: "/campanhas?plataforma=meta" },
          { label: "Google Ads", href: "/campanhas?plataforma=google" },
        ],
      },
      { label: "Atendentes", href: "/atendentes", icon: Users },
      {
        label: "Faturamento",
        href: "/faturamento/hoje",
        icon: Wallet,
        children: [
          { label: "Hoje", href: "/faturamento/hoje" },
          { label: "Por hora", href: "/faturamento/por-hora" },
          { label: "Por atendente", href: "/faturamento/por-atendente" },
          { label: "Por campanha", href: "/faturamento/por-campanha" },
          { label: "Por plataforma", href: "/faturamento/por-plataforma" },
          { label: "Mensal", href: "/faturamento/mensal" },
        ],
      },
    ],
  },
  {
    title: "Biblioteca",
    items: [
      { label: "Públicos", href: "/publicos", icon: Target },
      {
        label: "Criativos",
        href: "/criativos",
        icon: Clapperboard,
        children: [
          { label: "Todos", href: "/criativos" },
          { label: "Vídeos", href: "/criativos?tipo=video" },
          { label: "Artes", href: "/criativos?tipo=image" },
          { label: "Google Drive", href: "/criativos?tipo=drive" },
        ],
      },
      { label: "Produtos / Ofertas", href: "/produtos", icon: Package },
      { label: "Landing Pages", href: "/landing-pages", icon: Link2 },
    ],
  },
  {
    title: "Gestão",
    items: [
      {
        label: "Kanban",
        href: "/kanban",
        icon: Kanban,
        children: [
          { label: "Marketing", href: "/kanban" },
          { label: "Comercial", href: "/kanban/comercial" },
        ],
      },
      { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
    ],
  },
  {
    items: [{ label: "Configurações", href: "/configuracoes", icon: Settings }],
  },
];

export const STRATEGY_MAP_ICON = Waypoints;
