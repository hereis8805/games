import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // visualViewport: 주소창 + 하단 플로팅 바까지 모두 제외한 정확한 visible 높이
    const setHeight = () => {
      const h = `${window.visualViewport?.height ?? window.innerHeight}px`;
      document.documentElement.style.height = h;
      document.body.style.height = h;
    };
    setHeight();
    window.visualViewport?.addEventListener('resize', setHeight);
    window.addEventListener('resize', setHeight);

    // 스크롤·오버스크롤 비활성화 (touch-action 은 설정 안 함 → 터치 이벤트 정상 동작)
    const s = document.documentElement.style;
    s.overflow = 'hidden';
    (s as any).overscrollBehavior = 'none';
    const b = document.body.style;
    b.overflow = 'hidden';
    (b as any).overscrollBehavior = 'none';

    // touchmove 차단 → 주소창 스크롤 방지 (tap/swipe 는 touchstart/touchend 로 처리)
    const blockScroll = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', blockScroll, { passive: false });

    return () => {
      window.visualViewport?.removeEventListener('resize', setHeight);
      window.removeEventListener('resize', setHeight);
      document.removeEventListener('touchmove', blockScroll);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
