# MathClay | 클레이모피즘 수학 학습 시뮬레이션 포털 🎨📐

> **수학을 보고, 만지고, 가지고 노는 인터랙티브 시뮬레이션 허브**  
> Vercel 배포에 최적화된 모던 웹 애플리케이션 (React + Vite + Tailwind CSS + Canvas API)

![MathClay Preview](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 주요 특징

1. **클레이모피즘(Claymorphism) 디자인 시스템**:
   - 부드러운 3D 점토(Clay) 질감의 볼록한 카드와 인셋(오목) 패널
   - 포근하고 경쾌한 파스텔 톤 팔레트 (라벤더 퍼플, 민트, 피치 코랄, 버터 옐로우)
   - 쫀득한 클릭감의 촉각적 마이크로 인터랙션 (호버 부유, 클릭 스쿼시)
2. **실시간 인터랙티브 수학 시뮬레이션**:
   - **단위원 & 하모닉 사인/코사인 파동기**: 각도 회전과 파동 전파 실시간 동기화
   - **몬테카를로 파이(π) 추정 실험실**: 수천 개의 무작위 다트로 원주율 값 수렴 유도
   - **피타고라스 나무 프랙탈**: 재귀 함수 깊이 및 분기 각도 실시간 렌더링
   - **정규분포 갈톤 보드 (Galton Board)**: 구슬 튕김 물리 시뮬레이션 및 중심극한정리
3. **상단 플로팅 네비게이션 바**:
   - 3D 클레이 로고, 코스 메뉴, 반응형 검색창, 모바일 드로어
4. **Vercel 최적화 (100% Zero-Config)**:
   - `vercel.json` SPA 라우팅 및 캐싱 헤더 완비
   - 빌드 번들 최적화 (`dist/`)

---

## 🚀 로컬 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev

# 3. 프로덕션 빌드 테스트
npm run build
```

---

## ☁️ Vercel 배포 방법 (3가지 중 택 1)

### 방법 1. Vercel CLI로 1초 만에 즉시 배포 (가장 빠름)
```bash
# Vercel CLI 전역 설치 (최초 1회)
npm install -g vercel

# 프로젝트 디렉토리에서 바로 배포 실행
vercel
```
터미널의 안내에 따라 Enter 키를 몇 번 누르면 수 초 내에 실 서비스 URL이 발급됩니다!

### 방법 2. GitHub 저장소 연동 (자동 CI/CD 추천)
1. 현재 프로젝트를 GitHub 저장소(예: `mathclay-hub`)에 푸시합니다.
2. [Vercel 대시보드](https://vercel.com)에 로그인 후 **"Add New Project"**를 클릭합니다.
3. 해당 GitHub 저장소를 선택(Import)하고 **"Deploy"**를 누릅니다.
4. 이후 코드를 `git push`할 때마다 Vercel이 자동으로 빌드 및 무중단 배포를 수행합니다.

### 방법 3. 빌드 결과물 Vercel 대시보드 드래그 앤 드롭
```bash
npm run build
```
생성된 `dist` 폴더를 Vercel 웹사이트 화면에 그대로 드래그 앤 드롭하면 즉시 배포됩니다.
