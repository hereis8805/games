import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // viewport-fit=cover + safe-area-inset 적용 (빌드 후 HTML 재생성 시에도 유지)
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport && !metaViewport.getAttribute('content')?.includes('viewport-fit')) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
    }

    // safe-area-inset CSS 주입 (100dvh 지원 브라우저 우선)
    const safeStyle = document.getElementById('safe-area-style') ?? document.createElement('style');
    safeStyle.id = 'safe-area-style';
    safeStyle.textContent = `
      #root {
        padding-top: env(safe-area-inset-top, 0px) !important;
        padding-bottom: env(safe-area-inset-bottom, 0px) !important;
        padding-left: env(safe-area-inset-left, 0px) !important;
        padding-right: env(safe-area-inset-right, 0px) !important;
        box-sizing: border-box !important;
      }
    `;
    if (!document.getElementById('safe-area-style')) {
      document.head.appendChild(safeStyle);
    }

    // 실제 보이는 높이로 고정 (100dvh 미지원 구형 브라우저 폴백)
    const setHeight = () => {
      if (CSS.supports('height', '100dvh')) return; // 100dvh 지원 시 CSS에 위임
      const h = `${window.innerHeight}px`;
      document.documentElement.style.height = h;
      document.body.style.height = h;
    };
    setHeight();
    window.addEventListener('resize', setHeight);

    // 오버스크롤·스크롤 비활성화
    const s = document.documentElement.style;
    s.overflow = 'hidden';
    (s as any).overscrollBehavior = 'none';
    const b = document.body.style;
    b.overflow = 'hidden';
    (b as any).overscrollBehavior = 'none';
    (b as any).touchAction = 'none';

    // touchmove 전체 차단 → 주소창 절대 안 뜸
    const blockScroll = (e: Event) => e.preventDefault();
    document.addEventListener('touchmove', blockScroll, { passive: false });

    return () => {
      window.removeEventListener('resize', setHeight);
      document.removeEventListener('touchmove', blockScroll);
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
