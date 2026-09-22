import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Trophy,
  Users, 
  Calendar, 
  UserCheck, 
  ShieldCheck, 
  FolderTree, 
  Award, 
  CheckCircle2, 
  Image as ImageIcon, 
  FileCheck, 
  Bell, 
  Camera, 
  FileText, 
  Settings, 
  Shield, 
  History,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';
import { useFest } from '../../context/FestContext';

export type AdminTab = 
  | 'overview'
  | 'scoreboard_admin'
  | 'students'
  | 'student_points'
  | 'programmes'
  | 'participants'
  | 'teams_admin'
  | 'categories'
  | 'judges_roster'
  | 'result_entry'
  | 'results'
  | 'posters_gallery'
  | 'certificates'
  | 'announcements'
  | 'photos'
  | 'reports'
  | 'settings'
  | 'users'
  | 'audit';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface SidebarGroup {
  title: string;
  items: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, 
  onSelectTab,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { festSettings, results, students, programmes } = useFest();
  const [searchQuery, setSearchQuery] = useState('');

  const pendingResultsCount = results.filter(r => r.status !== 'published').length;

  const sidebarGroups: SidebarGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
        { id: 'scoreboard_admin', label: 'Live Scoreboard', icon: <Trophy size={17} />, badge: 'Live' },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'students', label: 'Students & Import', icon: <Users size={17} /> },
        { id: 'student_points', label: 'Student Points', icon: <Trophy size={17} />, badge: 'Points' },
        { id: 'programmes', label: 'Programmes & Schedule', icon: <Calendar size={17} /> },
        { id: 'participants', label: 'Participants Roster', icon: <UserCheck size={17} /> },
        { id: 'teams_admin', label: 'Teams & Standings', icon: <ShieldCheck size={17} /> },
        { id: 'categories', label: 'Categories', icon: <FolderTree size={17} /> },
      ]
    },
    {
      title: 'COMPETITION',
      items: [
        { id: 'judges_roster', label: 'Judges Roster', icon: <Shield size={17} /> },
        { id: 'result_entry', label: 'Judging & Scoring', icon: <Award size={17} /> },
        { 
          id: 'results', 
          label: 'Results & Publish', 
          icon: <CheckCircle2 size={17} />,
          badge: pendingResultsCount > 0 ? `${pendingResultsCount}` : undefined
        },
      ]
    },
    {
      title: 'MEDIA & OUTPUT',
      items: [
        { id: 'posters_gallery', label: 'Result Posters', icon: <ImageIcon size={17} /> },
        { id: 'certificates', label: 'Certificates', icon: <FileCheck size={17} /> },
        { id: 'announcements', label: 'Announcements', icon: <Bell size={17} /> },
        { id: 'photos', label: 'Photos & Media', icon: <Camera size={17} /> },
        { id: 'reports', label: 'Reports & Export', icon: <FileText size={17} /> },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Fest Settings & Logo', icon: <Settings size={17} /> },
        { id: 'users', label: 'Users & Roles', icon: <ShieldCheck size={17} /> },
        { id: 'audit', label: 'Audit Logs', icon: <History size={17} /> },
      ]
    }
  ];

  return (
    <>
      {/* Mobile/Tablet Horizontal Scrollable Pill Navigation */}
      <div className="lg:hidden w-full overflow-x-auto pb-2 scrollbar-none mb-3">
        <div className="flex items-center gap-1.5 min-w-max">
          {sidebarGroups.flatMap(g => g.items).map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer touch-target shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span className={isActive ? 'text-slate-950' : 'text-amber-700'}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black ${
                    isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Left Sidebar with Grouped Navigation & Collapse support */}
      <aside 
        className={`hidden lg:flex flex-col shrink-0 bg-white border border-slate-200 rounded-3xl p-3.5 shadow-xs transition-all duration-300 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto ${
          isCollapsed ? 'w-20 items-center' : 'w-64'
        }`}
      >
        {/* Sidebar Header & Toggle */}
        <div className="flex items-center justify-between gap-2 px-2 pb-3 mb-2 border-b border-slate-100">
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-heading font-black text-xs text-slate-900 block truncate">
                {festSettings.festName}
              </span>
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-widest block">
                Admin Console
              </span>
            </div>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        {/* Grouped Nav Items */}
        <div className="space-y-4 flex-1">
          {sidebarGroups.map(group => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-1">
                  {group.title}
                </div>
              )}
              {group.items.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer group ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <span className={isActive ? 'text-slate-950' : 'text-amber-700 group-hover:text-amber-800'}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black shrink-0 ${
                        isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Quick Switch Status */}
        {!isCollapsed && (
          <div className="mt-4 pt-3 border-t border-slate-100 px-2 text-[11px] text-slate-500 font-semibold flex items-center justify-between">
            <span>Status: Online</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </aside>
    </>
  );
};
