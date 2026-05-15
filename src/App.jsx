import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import SplashScreen from './components/SplashScreen';

const Home = lazy(() => import('./pages/Home'));
const OngoingAnime = lazy(() => import('./pages/OngoingAnime'));
const CompletedAnime = lazy(() => import('./pages/CompletedAnime'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const AnimeDetail = lazy(() => import('./pages/AnimeDetail'));
const EpisodeWatch = lazy(() => import('./pages/EpisodeWatch'));
const Schedule = lazy(() => import('./pages/Schedule'));
const BookmarkList = lazy(() => import('./pages/BookmarkList'));
const GenrePage = lazy(() => import('./pages/GenrePage.jsx'));
const Settings = lazy(() => import('./pages/Settings'));
const MangaList = lazy(() => import('./pages/MangaList'));
const MangaDetail = lazy(() => import('./pages/MangaDetail'));
const MangaReader = lazy(() => import('./pages/MangaReader'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const DonghuaList = lazy(() => import('./pages/DonghuaList'));
const DonghuaDetail = lazy(() => import('./pages/DonghuaDetail'));
const DonghuaEpisodeWatch = lazy(() => import('./pages/DonghuaEpisodeWatch'));
const DonghuaHistory = lazy(() => import('./pages/DonghuaHistory'));
const MangaHistory = lazy(() => import('./pages/MangaHistory'));
const StaffPanel = lazy(() => import('./pages/StaffPanel'));
const MyTickets = lazy(() => import('./pages/MyTickets'));
const WatchParty = lazy(() => import('./pages/WatchParty'));
const NobarLobby = lazy(() => import('./pages/NobarLobby'));

function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [splashDone, setSplashDone] = React.useState(false);

  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/ongoing" element={<OngoingAnime />} />
        <Route path="/completed" element={<CompletedAnime />} />
        <Route path="/cari" element={<SearchResults />} />
        <Route path="/anime/:animeId" element={<AnimeDetail />} />
        <Route path="/episode/:episodeId" element={<EpisodeWatch />} />
        <Route path="/jadwal" element={<Schedule />} />
        <Route path="/bookmark" element={<BookmarkList />} />
        <Route path="/genre/:genreSlug" element={<GenrePage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/manga" element={<MangaList />} />
        <Route path="/manga/history" element={<MangaHistory />} />
        <Route path="/manga/chapter/*" element={<MangaReader />} />
        <Route path="/manga/:slug" element={<MangaDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/donghua" element={<DonghuaList />} />
        <Route path="/donghua/history" element={<DonghuaHistory />} />
        <Route path="/donghua/episode/:episodeSlug" element={<DonghuaEpisodeWatch />} />
        <Route path="/donghua/:slug" element={<DonghuaDetail />} />
        <Route path="/staff" element={<StaffPanel />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/nonton-bareng/:roomId" element={<WatchParty />} />
        <Route path="/nobar" element={<NobarLobby />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>    </Routes>
  </Suspense>
)
}

export default App
