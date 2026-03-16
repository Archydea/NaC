import { createContext, useContext, useState, useEffect } from 'react';

const StatsContext = createContext();

const DEFAULT_STATS = {
  xWins: 0,
  oWins: 0,
  draws: 0,
  totalGames: 0,
  xStreak: 0,
  oStreak: 0,
};

export function StatsProvider({ children }) {
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt-stats');
      if (!saved) return DEFAULT_STATS;
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATS, ...parsed };
    } catch {
      return DEFAULT_STATS;
    }
  });

  useEffect(() => {
    localStorage.setItem('ttt-stats', JSON.stringify(stats));
  }, [stats]);

  const updateStats = (result) =>
    setStats((prev) => {
      const xWins  = result === 'X'    ? prev.xWins + 1  : prev.xWins;
      const oWins  = result === 'O'    ? prev.oWins + 1  : prev.oWins;
      const draws  = result === 'draw' ? prev.draws + 1  : prev.draws;
      // Streak: win extends streak, opponent win resets it, draw keeps it
      const xStreak =
        result === 'X' ? prev.xStreak + 1 :
        result === 'O' ? 0 :
        prev.xStreak;
      const oStreak =
        result === 'O' ? prev.oStreak + 1 :
        result === 'X' ? 0 :
        prev.oStreak;
      return { xWins, oWins, draws, totalGames: prev.totalGames + 1, xStreak, oStreak };
    });

  const resetStats = () => setStats(DEFAULT_STATS);

  return (
    <StatsContext.Provider value={{ stats, updateStats, resetStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export const useStats = () => useContext(StatsContext);
