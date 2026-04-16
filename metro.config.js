const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot   = __dirname;                          // game/games/
const workspaceRoot = path.resolve(projectRoot, '..');    // game/   (monorepo root)

const config = getDefaultConfig(projectRoot);

// games/packages/ 와 monorepo 루트를 모두 감시
config.watchFolders = [
  path.resolve(projectRoot,   'packages'),
  workspaceRoot,
];

// 모듈 탐색 순서: games/node_modules → 루트 node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot,   'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// @game/* 는 games/packages/ 로 고정
// react 계열은 루트 node_modules 의 단일 인스턴스로 강제
//   → "multiple copies of react" 오류 방지
const rootNm = path.resolve(workspaceRoot, 'node_modules');

config.resolver.extraNodeModules = {
  '@game/2048':                     path.resolve(projectRoot, 'packages/game-2048'),
  '@game/arrow-break':              path.resolve(projectRoot, 'packages/game-arrow-break'),
  '@game/yellow-remember':          path.resolve(projectRoot, 'packages/game-yellow-remember'),

  'react':                          path.resolve(rootNm, 'react'),
  'react-dom':                      path.resolve(rootNm, 'react-dom'),
  'react-native':                   path.resolve(rootNm, 'react-native'),
  'react-native-reanimated':        path.resolve(rootNm, 'react-native-reanimated'),
  'react-native-worklets':          path.resolve(rootNm, 'react-native-worklets'),
  'react-native-safe-area-context': path.resolve(rootNm, 'react-native-safe-area-context'),
  'react-native-screens':           path.resolve(rootNm, 'react-native-screens'),
  'react-native-gesture-handler':   path.resolve(rootNm, 'react-native-gesture-handler'),
  'expo':                           path.resolve(rootNm, 'expo'),
  'expo-router':                    path.resolve(rootNm, 'expo-router'),
  'expo-status-bar':                path.resolve(rootNm, 'expo-status-bar'),
  'zustand':                        path.resolve(rootNm, 'zustand'),
};

module.exports = config;
