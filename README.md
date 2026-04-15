# MileScape

MileScape is a frontend-first MVP for a Human-Centric Computing coursework project. It turns repeated short runs into an accumulative virtual travel experience: users choose a themed route, set a lightweight running goal, complete a simulated run, and unlock landmarks as their total distance grows over time.

## Overview

The current MVP is built for demo quality rather than backend complexity:

- Route selection with themed city journeys
- Run goal setup with lightweight motivational UI
- Progress mapping from real run distance to virtual route distance
- Landmark milestone unlocks with celebration states
- Local persistence through `localStorage`
- Responsive, mobile-first UI with reusable components

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Lucide React
- localStorage
- vercel

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Folder Structure

```text
src/
  assets/
  components/
    layout/
    profile/
    route/
    run/
    ui/
  context/
  data/
  hooks/
  pages/
  router/
  types/
  utils/
```

## Architecture Notes

- `src/data/routes.ts` contains the mock virtual route catalog.
- `src/context/AppContext.tsx` manages selected route, progress, run history, and latest run result.
- `src/utils/progress.ts` centralizes progress calculations, landmark unlocking, and route completion logic.
- `src/utils/storage.ts` handles `localStorage` persistence.
- `src/pages/*` contains the main user flow pages for onboarding, exploration, run setup, results, achievements, and dashboard.
- `src/components/*` keeps the UI modular and beginner-friendly for future student work.

## Future Improvements

- Add a dedicated streak and consistency model
- Expand the achievement system into badges and route completion trophies
- Replace image URLs with local branded illustrations
- Add richer simulated run states or real fitness tracker integration
- Introduce backend sync and multi-user accounts when the product direction is stable
- Add process reminders based on heart rate
