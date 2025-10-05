// 환경변수(ESBuild define) 타입
declare const process: { env: { API_BASE_URL?: string } };

// CSS 임포트 허용 (main.ts에서 './styles.css')
declare module '*.css';