
import { createRoot } from 'react-dom/client'
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
// Same font stack as hims-ui-new: Noto Sans for Hindi / Odia text, JetBrains Mono for code and keys.
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/500.css";
import "@fontsource/noto-sans-devanagari/600.css";
import "@fontsource/noto-sans-oriya/400.css";
import "@fontsource/noto-sans-oriya/500.css";
import "@fontsource/noto-sans-oriya/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import '@/styles/index.css';
import App from '@/app/App';
import { initInteractionEffects } from '@/shared/utils/interactionFx';

initInteractionEffects();

createRoot(document.getElementById('root')!).render(
  <App />
);
