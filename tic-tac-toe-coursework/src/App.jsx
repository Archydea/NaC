import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { StatsProvider } from './contexts/StatsContext';
import Header from './components/Header';
import Board from './components/Board';
import Profile from './components/Profile';

export default function App() {
  // Текущая страница: 'game' или 'profile'
  const [page, setPage] = useState('game');

  return (
    <ThemeProvider>
      <StatsProvider>
        <div className="app">
          <Header currentPage={page} onNavigate={setPage} />
          <main className="main">
            {page === 'game' ? <Board /> : <Profile />}
          </main>
        </div>
      </StatsProvider>
    </ThemeProvider>
  );
}
