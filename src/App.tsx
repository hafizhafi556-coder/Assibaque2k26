import React, { useState } from 'react';
import { FestProvider, useFest } from './context/FestContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileAppNavBar } from './components/common/MobileAppNavBar';
import { LoginModal } from './components/auth/LoginModal';
import { HomeView } from './components/public/HomeView';
import { LiveScoreboard } from './components/public/LiveScoreboard';
import { StudentResultSearch } from './components/student/StudentResultSearch';
import { TeamDashboard } from './components/team/TeamDashboard';
import { ProgrammesView } from './components/public/ProgrammesView';
import { AnnouncementsPublicView } from './components/public/AnnouncementsPublicView';
import { CertificateVerificationView } from './components/public/CertificateVerificationView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { JudgePortal } from './components/judge/JudgePortal';
import { IslamicGeometricCanvas } from './components/common/IslamicPattern';
import { FestPosterModal } from './components/common/FestPosterModal';
import { TeamId } from './types';

const MainApp: React.FC = () => {
  const { currentUser, festSettings } = useFest();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId>('nayro');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState<boolean>(false);

  React.useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (path.includes('verify') || params.get('tab') === 'verify_cert' || params.has('number')) {
      setCurrentTab('verify_cert');
    }
  }, []);

  const handleNavigate = (tab: string, extraId?: string) => {
    if (tab === 'teams' && extraId) {
      setSelectedTeamId(extraId as TeamId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-fest-canvas text-slate-950 dark:text-slate-100 relative selection:bg-amber-500 selection:text-slate-950 font-sans pb-20 lg:pb-0 transition-colors duration-200">
      {/* Background Decorative Islamic Canvas */}
      <IslamicGeometricCanvas />

      {/* Official Fest Logo Watermark across Fest Portal */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none">
        <img
          src={festSettings.festLogo || '/thanimiyyath-logo.svg'}
          alt=""
          className="w-[680px] max-w-[85vw] max-h-[85vh] object-contain opacity-[0.06] filter grayscale contrast-125"
        />
      </div>

      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full relative z-10">
        {currentTab === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onOpenPoster={() => setIsPosterModalOpen(true)}
          />
        )}

        {currentTab === 'scoreboard' && (
          <LiveScoreboard
            onSelectTeam={(tId) => handleNavigate('teams', tId)}
          />
        )}

        {currentTab === 'student_result' && (
          <StudentResultSearch />
        )}

        {currentTab === 'teams' && (
          <TeamDashboard initialTeamId={selectedTeamId} />
        )}

        {currentTab === 'programmes' && (
          <ProgrammesView />
        )}

        {currentTab === 'announcements' && (
          <AnnouncementsPublicView />
        )}

        {currentTab === 'verify_cert' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <CertificateVerificationView />
          </div>
        )}

        {currentTab === 'admin' && (
          <AdminDashboard onOpenLogin={() => setIsLoginModalOpen(true)} />
        )}

        {currentTab === 'judge' && (
          <JudgePortal onOpenLogin={() => setIsLoginModalOpen(true)} />
        )}
      </main>

      {/* Native App-Style Mobile Bottom Navigation Bar (Shown on Mobile / Tablet) */}
      <MobileAppNavBar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenPoster={() => setIsPosterModalOpen(true)}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Auth Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessRoleRedirect={(role) => {
          if (role === 'admin') setCurrentTab('admin');
          else if (role === 'judge') setCurrentTab('judge');
          else if (role === 'team_manager') setCurrentTab('teams');
        }}
      />

      {/* Official Fest Poster Generator Modal */}
      <FestPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FestProvider>
      <MainApp />
    </FestProvider>
  );
}
