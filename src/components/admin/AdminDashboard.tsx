import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Trophy, 
  Users, 
  Calendar, 
  FileText, 
  ChevronRight,
  Home,
  CheckCircle2,
  Eye,
  Plus
} from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminStats } from './AdminStats';
import { StudentManager } from './StudentManager';
import { ProgrammeManager } from './ProgrammeManager';
import { ResultManager } from './ResultManager';
import { ResultEntryManager } from './ResultEntryManager';
import { ReportsManager } from './ReportsManager';
import { FestSettingsManager } from './FestSettingsManager';
import { ResultPostersGalleryView } from './ResultPostersGalleryView';
import { StudentPointsAnalytics } from './StudentPointsAnalytics';
import { CertificateManager } from './CertificateManager';
import { 
  CategoriesView, 
  ParticipantsView, 
  JudgesView, 
  AnnouncementsView, 
  PhotoManagerView, 
  AuditLogsView
} from './OtherAdminViews';
import { LiveScoreboard } from '../public/LiveScoreboard';
import { TeamDashboard } from '../team/TeamDashboard';

export const AdminDashboard: React.FC<{ onOpenLogin: () => void }> = ({ onOpenLogin }) => {
  const { currentUser, festSettings, programmes, results, students } = useFest();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check if current user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-slate-900 shadow-sm">
          <ShieldAlert size={48} className="mx-auto text-amber-600 mb-4" />
          <h2 className="text-xl font-black font-heading mb-2">Fest Admin Access Required</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            You must be logged in as an authorized System Administrator to access the Fest Control Center.
          </p>
          <button
            onClick={onOpenLogin}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-xs transition cursor-pointer touch-target active:scale-95"
          >
            Log in as Administrator
          </button>
        </div>
      </div>
    );
  }

  // Breadcrumb Title mapping
  const getTabLabel = (tab: AdminTab) => {
    switch (tab) {
      case 'overview': return 'Overview & Analytics';
      case 'scoreboard_admin': return 'Live Scoreboard Management';
      case 'students': return 'Students Roster & Bulk Import';
      case 'student_points': return 'Individual Student Points & Performance Analytics';
      case 'programmes': return 'Programmes Schedule & Events';
      case 'participants': return 'Participants Registry';
      case 'teams_admin': return 'Teams & Standings Dashboard';
      case 'categories': return 'Festival Categories';
      case 'judges_roster': return 'Judges Roster & Credentials';
      case 'result_entry': return 'Judging & Mark Scoring';
      case 'results': return 'Results Verification & Publishing';
      case 'posters_gallery': return 'Official Result Posters Gallery';
      case 'certificates': return 'Printable Certificates System';
      case 'announcements': return 'Festival Announcements Bulletin';
      case 'photos': return 'Media & Photo Gallery';
      case 'reports': return 'Reports & Tabulation Export';
      case 'settings': return 'Festival Configuration & Branding';
      case 'users': return 'User Access & Roles';
      case 'audit': return 'Audit Logs & Change History';
      default: return 'Admin Console';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Top Breadcrumb & Quick Action Header */}
      <div className="mb-4 sm:mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1 text-slate-900 font-bold">
            <Home size={14} className="text-amber-600" />
            <span>Admin Center</span>
          </div>
          <ChevronRight size={13} />
          <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            {getTabLabel(activeTab)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('result_entry')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition cursor-pointer"
          >
            <Sparkles size={13} className="text-amber-600" />
            <span>Score Entry</span>
          </button>
          <button
            onClick={() => setActiveTab('posters_gallery')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition shadow-xs cursor-pointer touch-target"
          >
            <Eye size={13} />
            <span>Result Posters</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Fixed Collapsible Sidebar */}
        <AdminSidebar 
          activeTab={activeTab} 
          onSelectTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <AdminStats />
              <ResultManager />
            </div>
          )}

          {activeTab === 'scoreboard_admin' && (
            <div className="space-y-6">
              <LiveScoreboard />
            </div>
          )}

          {activeTab === 'students' && <StudentManager />}
          {activeTab === 'student_points' && <StudentPointsAnalytics />}
          {activeTab === 'programmes' && <ProgrammeManager />}
          {activeTab === 'participants' && <ParticipantsView />}
          {activeTab === 'teams_admin' && <TeamDashboard initialTeamId="nayro" />}
          {activeTab === 'categories' && <CategoriesView />}
          {activeTab === 'judges_roster' && <JudgesView />}
          {activeTab === 'result_entry' && <ResultEntryManager />}
          {activeTab === 'results' && <ResultManager />}
          {activeTab === 'posters_gallery' && <ResultPostersGalleryView />}
          {activeTab === 'certificates' && <CertificateManager />}
          {activeTab === 'announcements' && <AnnouncementsView />}
          {activeTab === 'photos' && <PhotoManagerView />}
          {activeTab === 'reports' && <ReportsManager />}
          {activeTab === 'settings' && <FestSettingsManager />}
          {activeTab === 'users' && (
            <div className="space-y-6 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <ShieldAlert size={20} />
                </span>
                <h2 className="text-xl font-black font-heading text-slate-900">System Users & Permissions</h2>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl">
                Manage user access credentials across the four system roles: Public Student, Team Managers (Nayro, Zayro, Lucero), Verified Judges, and Fest Super Administrators.
              </p>
              <JudgesView />
            </div>
          )}
          {activeTab === 'audit' && <AuditLogsView />}
        </main>
      </div>
    </div>
  );
};
