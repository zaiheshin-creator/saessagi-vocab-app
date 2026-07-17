import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from './store/useStore';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import WordBookPage from './pages/WordBookPage';
import MyPage from './pages/MyPage';
import InstallBanner from './components/InstallBanner';

function ComingSoon({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 text-center" style={{ flex: 1 }}>
      <div style={{ fontSize: 34 }}>🌱</div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>{label} 화면은 곧 만나요!</p>
    </div>
  );
}

// 배포 후 GitHub Pages 주소로 교체 (acupuncture-app과 동일한 방식)
const APP_URL = typeof window !== 'undefined' ? window.location.href : '';

function ShareModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  function handleNativeShare() {
    navigator.share({
      title: '새싹이와 오늘의 단어',
      text: '초등 영단어를 매일 조금씩 배우는 오프라인 학습 앱이에요.',
      url: APP_URL,
    }).catch(() => {});
  }

  function handleCopy() {
    navigator.clipboard?.writeText(APP_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--paper)', borderRadius: 20, padding: '28px 24px', width: 300, maxWidth: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>앱 열기</div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 18 }}>
          {canNativeShare ? '카카오톡·문자로 공유하거나 QR을 스캔하세요' : '휴대폰으로 QR코드를 스캔하면 이 화면이 그대로 열려요'}
        </div>

        <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 12 }}>
          <QRCodeSVG value={APP_URL} size={180} fgColor="#26362B" />
        </div>

        <div style={{ margin: '14px 0 12px', fontSize: 11, color: 'var(--ink-soft)', wordBreak: 'break-all' }}>{APP_URL}</div>

        {canNativeShare && (
          <button
            onClick={handleNativeShare}
            className="font-display"
            style={{ width: '100%', padding: 11, marginBottom: 8, background: 'var(--tangerine)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontWeight: 700 }}
          >
            공유하기
          </button>
        )}
        <button
          onClick={handleCopy}
          style={{ width: '100%', padding: 9, marginBottom: 8, background: copied ? 'var(--sprout)' : 'var(--paper)', color: copied ? '#fff' : 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}
        >
          {copied ? '✓ 복사됨!' : '🔗 링크 복사'}
        </button>
        <button
          onClick={onClose}
          style={{ width: '100%', padding: 9, background: 'transparent', color: 'var(--ink-soft)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const activeScreen = useStore((s) => s.activeScreen);
  const [showShare, setShowShare] = useState(false);

  // 새 화면을 추가하는 에이전트는 이 맵에 자기 키 한 줄만 추가/교체하면 된다(줄 단위로 분리해 병합 충돌을 줄임)
  const PAGES = {
    home: HomePage,
    learn: LearnPage,
    test: TestPage,
    result: ResultPage,
    wordbook: WordBookPage,
    levelmap: () => <ComingSoon label="레벨맵" />,
    wrongnote: () => <ComingSoon label="오답노트" />,
    mypage: MyPage,
  };
  const Page = PAGES[activeScreen] || HomePage;

  return (
    <div className="app-shell">
      <header className="flex items-center gap-2 px-4" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <span style={{ fontSize: 20 }}>🌱</span>
        <div style={{ flex: 1 }}>
          <h1 className="font-display" style={{ fontSize: 14, margin: 0 }}>새싹이와 오늘의 단어</h1>
        </div>
        <button
          onClick={() => setShowShare(true)}
          aria-label="앱 공유"
          style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 10px', color: 'var(--ink-soft)', cursor: 'pointer', fontSize: 15 }}
        >
          📲
        </button>
      </header>

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Page />
      </main>

      <InstallBanner />
      <BottomNav />
    </div>
  );
}
