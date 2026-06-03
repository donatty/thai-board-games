# 🎮 Thai Board Games — เกมกระดานไทยออนไลน์

Real-time multiplayer Thai board games built with **Next.js 14 + TypeScript + Supabase + Vercel**.

![Thai Board Games](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green?logo=supabase)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

---

## 🕹️ เกมที่มีในขณะนี้

| เกม | สถานะ |
|-----|--------|
| หมากฮอส (Makhos) — 8 ตัว | ✅ พร้อมใช้งาน |
| หมากรุก (Chess)           | 🔜 เร็วๆ นี้ |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USER/thai-board-games.git
cd thai-board-games
npm install
```

### 2. Setup Supabase
1. ไปที่ [supabase.com](https://supabase.com) → สร้าง project ใหม่
2. ไปที่ **SQL Editor** → วาง SQL จากไฟล์ `supabase-schema.sql` แล้ว **Run**
3. ไปที่ **Settings → API** → คัดลอก `Project URL` และ `anon key`

### 3. สร้าง `.env.local`
```bash
cp .env.example .env.local
# แก้ไขค่า Supabase ใน .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run Dev Server
```bash
npm run dev
# เปิด http://localhost:3000
```

---

## 📦 Deploy to Vercel

1. Push code ไปที่ GitHub
2. ไปที่ [vercel.com](https://vercel.com) → Import Project
3. เพิ่ม Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

---

## 🗂️ โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── page.tsx              # หน้าหลัก + เลือกเกม
│   ├── lobby/page.tsx        # ล็อบบี้ สร้าง/เข้าห้อง
│   ├── game/[roomId]/page.tsx # หน้าเล่นเกม
│   └── leaderboard/page.tsx  # กระดานคะแนน
│
├── components/
│   ├── ui/
│   │   ├── NeonBackground.tsx  # พื้นหลัง animated
│   │   └── ParticlesBurst.tsx  # เอฟเฟกต์ชนะ
│   └── games/
│       └── makhos/
│           └── MakhosBoard.tsx # กระดานหมากฮอส
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts    # Supabase client
│   │   └── db.ts        # Database helpers
│   ├── games/
│   │   └── makhos.ts    # Game engine + rules
│   └── hooks/
│       ├── usePlayerStore.ts  # Zustand store
│       └── useRoom.ts         # Realtime room hook
│
└── types/index.ts   # ← GAME_REGISTRY อยู่ที่นี่
```

---

## ➕ วิธีเพิ่มเกมใหม่ (เช่น หมากรุก)

### 1. เพิ่มในทะเบียนเกม — `src/types/index.ts`
```ts
chess: {
  id:          'chess',
  name:        'หมากรุก',
  nameEn:      'Chess',
  description: 'หมากรุกสากล',
  icon:        '♟',
  minPlayers:  2,
  maxPlayers:  2,
  available:   true,   // ← เปลี่ยนเป็น true
},
```

### 2. สร้าง Game Engine — `src/lib/games/chess.ts`
```ts
export function createInitialChessState() { ... }
export function getValidChessMoves(...) { ... }
export function applyChessMove(...) { ... }
```

### 3. สร้าง Board Component — `src/components/games/chess/ChessBoard.tsx`

### 4. ลงทะเบียนใน Game Page — `src/app/game/[roomId]/page.tsx`
```ts
if (room.game_type === 'chess') {
  return <ChessBoard room={room} player={player} pushMove={pushMove} />
}
```

เท่านี้ก็เสร็จ! 🎉 Lobby, Leaderboard, Realtime ทำงานอัตโนมัติ

---

## 🏗️ Tech Stack

| ชั้น | เทคโนโลยี |
|------|-----------|
| Framework  | Next.js 14 (App Router) |
| Language   | TypeScript 5 |
| Styling    | Tailwind CSS |
| Animation  | Framer Motion |
| State      | Zustand |
| Backend    | Supabase (PostgreSQL + Realtime) |
| Deploy     | Vercel |
| CI/CD      | GitHub Actions |

---

## 📜 License
MIT
