import { useTheme } from '../contexts/ThemeContext';

export default function Header({ currentPage, onNavigate }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo" aria-hidden="true">✕○</span>
        <span className="header-title">КиН</span>
      </div>

      <nav className="header-nav" aria-label="Навигация">
        <button
          className={`nav-btn${currentPage === 'game' ? ' active' : ''}`}
          onClick={() => onNavigate('game')}
        >
          Игра
        </button>
        <button
          className={`nav-btn${currentPage === 'profile' ? ' active' : ''}`}
          onClick={() => onNavigate('profile')}
        >
          Профиль
        </button>
      </nav>

      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
        aria-label={theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
