import { useTheme } from '../contexts/ThemeContext';

export default function Header({ currentPage, onNavigate }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo" aria-hidden="true">✕ ○</span>
        <span className="header-title">Крестики-нолики</span>
      </div>

      <nav className="header-nav" aria-label="Навигация">
        <button
          className={`nav-btn ${currentPage === 'game' ? 'active' : ''}`}
          onClick={() => onNavigate('game')}
        >
          Игра
        </button>
        <button
          className={`nav-btn ${currentPage === 'profile' ? 'active' : ''}`}
          onClick={() => onNavigate('profile')}
        >
          Профиль
        </button>
      </nav>

      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
        aria-label="Переключить тему"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
