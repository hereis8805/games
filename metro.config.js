const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot   = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  path.resolve(projectRoot,   'packages'),
  workspaceRoot,
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot,   'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// expo-router/node_modules/react (18.3.1) 등 중첩된 구버전 React 차단
// → 루트 node_modules의 단일 인스턴스(19.x)로 강제 통일
const rootNm = path.resolve(workspaceRoot, 'node_modules');

config.resolver.extraNodeModules = {
  // @game 패키지
  '@game/2048':                     path.resolve(projectRoot, 'packages/game-2048'),
  '@game/arrow-break':              path.resolve(projectRoot, 'packages/game-arrow-break'),
  '@game/yellow-remember':          path.resolve(projectRoot, 'packages/game-yellow-remember'),

  // React 단일 인스턴스 강제 (jsx-runtime 포함)
  'react':                          path.resolve(rootNm, 'react'),
  'react/jsx-runtime':              path.resolve(rootNm, 'react/jsx-runtime'),
  'react/jsx-dev-runtime':          path.resolve(rootNm, 'react/jsx-dev-runtime'),
  'react-dom':                      path.resolve(rootNm, 'react-dom'),
  'react-dom/client':               path.resolve(rootNm, 'react-dom/client'),

  // react-native 계열
  'react-native':                   path.resolve(rootNm, 'react-native'),
  'react-native-reanimated':        path.resolve(rootNm, 'react-native-reanimated'),
  'react-native-worklets':          path.resolve(rootNm, 'react-native-worklets'),
  'react-native-safe-area-context': path.resolve(rootNm, 'react-native-safe-area-context'),
  'react-native-screens':           path.resolve(rootNm, 'react-native-screens'),
  'react-native-gesture-handler':   path.resolve(rootNm, 'react-native-gesture-handler'),

  // expo 계열
  'expo':                           path.resolve(rootNm, 'expo'),
  'expo-router':                    path.resolve(rootNm, 'expo-router'),
  'expo-status-bar':                path.resolve(rootNm, 'expo-status-bar'),

  // 상태관리
  'zustand':                        path.resolve(rootNm, 'zustand'),
};

module.exports = config;
