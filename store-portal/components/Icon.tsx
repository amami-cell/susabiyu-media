"use client";
import {
  LayoutDashboard, CalendarDays, Store, Megaphone, MessageSquareText, KeyRound,
  Briefcase, Package, Car, Ruler, Landmark, Building2, Presentation, FileText,
  ListChecks, Bell, ClipboardCheck, FilePenLine, Workflow, UserPlus, Lightbulb,
  BookOpen, Database, History, Instagram, ExternalLink, ChevronsLeft, ChevronsRight,
  X, Menu, Plus, Search, TriangleAlert, Square, Zap, Activity, PencilRuler, LogOut,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const MAP: Record<string, ComponentType<LucideProps>> = {
  LayoutDashboard, CalendarDays, Store, Megaphone, MessageSquareText, KeyRound,
  Briefcase, Package, Car, Ruler, Landmark, Building2, Presentation, FileText,
  ListChecks, Bell, ClipboardCheck, FilePenLine, Workflow, UserPlus, Lightbulb,
  BookOpen, Database, History, Instagram, ExternalLink, ChevronsLeft, ChevronsRight,
  X, Menu, Plus, Search, TriangleAlert, Square, Zap, Activity, PencilRuler, LogOut,
};

export function Icon({ name, size = 17, strokeWidth = 1.7, ...rest }: { name: string } & LucideProps) {
  const C = MAP[name] ?? Square;
  return <C size={size} strokeWidth={strokeWidth} {...rest} />;
}
