import { createContext, useContext, useState, useEffect } from 'react';

const StatsContext = createContext();

const DEFAULT_STATS = { xWins: 0, oWins: 0, draws: 0, totalGames: 0 };

export function StatsProvider({ children }) {
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt-stats');
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  // Синхронизируем статистику с localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('ttt-stats', JSON.stringify(stats));
  }, [stats]);

  // result: 'X' | 'O' | 'draw'
  const updateStats = (result) => {
    setStats(prev => ({
      xWins:      result === 'X'     ? prev.xWins + 1     : prev.xWins,
      oWins:      result === 'O'     ? prev.oWins + 1     : prev.oWins,
      draws:      result === 'draw'  ? prev.draws + 1     : prev.draws,
      totalGames: prev.totalGames + 1,
    }));
  };

  const resetStats = () => setStats(DEFAULT_STATS);

  return (
    <StatsContext.Provider value={{ stats, updateStats, resetStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export const useStats = () => useContext(StatsContext);
