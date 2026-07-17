export default function PrimaryButton({ children, onClick, variant = 'primary', disabled = false, icon = null, type = 'button' }) {
  const styles = {
    primary: { background: 'var(--tangerine)', color: '#fff', boxShadow: '0 6px 0 #d9713f' },
    sky: { background: 'var(--sky)', color: '#fff', boxShadow: '0 5px 0 #2c86ab' },
    secondary: { background: 'var(--paper-sunk)', color: 'var(--ink-soft)', border: '1px solid var(--line)' },
    locked: { background: 'var(--paper-sunk)', color: 'var(--ink-faint)', border: '1px solid var(--line)' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="font-display"
      style={{
        appearance: 'none',
        border: 'none',
        width: '100%',
        padding: 14,
        borderRadius: 16,
        fontWeight: 700,
        fontSize: 15,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        ...styles[disabled ? 'locked' : variant],
      }}
    >
      {icon}
      {children}
    </button>
  );
}
