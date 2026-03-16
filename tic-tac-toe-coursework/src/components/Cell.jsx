export default function Cell({ value, onClick, isWinning, disabled }) {
  const classes = [
    'cell',
    value === 'X' ? 'cell-x' : value === 'O' ? 'cell-o' : '',
    isWinning ? 'cell-winning' : '',
    !value && !disabled ? 'cell-empty' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={!!value || disabled}
      aria-label={value || 'пустая клетка'}
    >
      {value}
    </button>
  );
}
