import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { StatsProvider } from './contexts/StatsContext';
import Header from './components/Header';
import Board from './components/Board';
import Profile from './components/Profile';

export default function App() {
  const [page, setPage] = useState('game');

  return (
    <ThemeProvider>
      <StatsProvider>
        <div className="app">
          {/* Animated gradient background blobs */}
          <div className="bg-blobs" aria-hidden="true">
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
          </div>

          <Header currentPage={page} onNavigate={setPage} />

          <main className="main">
            {page === 'game' ? <Board /> : <Profile />}
          </main>
        </div>
      </StatsProvider>
    </ThemeProvider>
  );
}
