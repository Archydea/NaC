import { useStats } from '../contexts/StatsContext';

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card" style={{ '--accent': color }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Profile() {
  const { stats, resetStats } = useStats();
  const { xWins, oWins, draws, totalGames } = stats;

  // Процент игр с победителем (не ничьих)
  const decidedRate =
    totalGames > 0 ? Math.round(((xWins + oWins) / totalGames) * 100) : 0;

  function handleReset() {
    if (window.confirm('Сбросить всю статистику? Это действие нельзя отменить.')) {
      resetStats();
    }
  }

  return (
    <div className="profile-page">
      {/* Шапка профиля */}
      <div className="profile-header">
        <div className="profile-avatar" aria-hidden="true">👤</div>
        <div className="profile-info">
          <h2 className="profile-name">Игрок</h2>
          <p className="profile-sub">Локальная статистика</p>
        </div>
      </div>

      {/* Карточки статистики */}
      <div className="stats-grid">
        <StatCard
          label="Всего игр"
          value={totalGames}
          color="var(--primary)"
        />
        <StatCard
          label="Победы X"
          value={xWins}
          color="var(--x-color)"
        />
        <StatCard
          label="Победы O"
          value={oWins}
          color="var(--o-color)"
        />
        <StatCard
          label="Ничьи"
          value={draws}
          color="var(--text-muted)"
        />
      </div>

      {/* Прогресс-бар: доля игр с победителем */}
      {totalGames > 0 && (
        <div className="winrate-section">
          <div className="winrate-label">
            Игры с победителем (без ничьих)
          </div>
          <div className="winrate-bar" role="progressbar" aria-valuenow={decidedRate} aria-valuemin={0} aria-valuemax={100}>
            <div className="winrate-fill" style={{ width: `${decidedRate}%` }} />
          </div>
          <div className="winrate-value">{decidedRate}%</div>
        </div>
      )}

      {totalGames === 0 && (
        <p className="empty-state">Сыграйте первую партию, чтобы увидеть статистику!</p>
      )}

      <button className="btn-danger" onClick={handleReset}>
        Сбросить статистику
      </button>
    </div>
  );
}
