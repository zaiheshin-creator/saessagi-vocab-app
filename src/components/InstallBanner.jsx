import { useEffect, useState } from 'react';

// 브라우저의 PWA 설치 프롬프트(beforeinstallprompt)를 가로채 두었다가, 사용자가 원할 때 띄운다.
// 이벤트가 아예 발생하지 않는 환경(이미 설치됨 / iOS Safari 등 미지원)에서는 아무것도 렌더링하지 않는다.
export default function InstallBanner() {
  const [installEvent, setInstallEvent] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setInstallEvent(e);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!installEvent || dismissed) return null;

  function handleInstall() {
    installEvent.prompt();
    installEvent.userChoice?.finally(() => {
      setInstallEvent(null);
    });
  }

  return (
    <div
      className="flex items-center gap-2"
      style={{
        background: 'var(--sprout-tint)', border: '1px solid var(--sprout)', borderRadius: 14,
        margin: '0 12px 8px', padding: '10px 12px',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--sprout-deep)', flex: 1, lineHeight: 1.4 }}>
        📲 홈 화면에 추가하고 오프라인으로 써보세요
      </span>
      <button
        onClick={handleInstall}
        className="font-display"
        style={{
          background: 'var(--sprout)', color: '#fff', border: 'none', borderRadius: 10,
          padding: '7px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
        }}
      >
        추가하기
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="닫기"
        style={{
          background: 'none', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer',
          fontSize: 14, padding: 4, flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
