import React from 'react';
import { flushSync } from 'react-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/config/theme';
import { useT } from '@/shared/i18n/I18nProvider';
import { withReveal } from '@/shared/utils/interactionFx';

/**
 * Light / dark switch: shows the mode it switches to; the icon spins in on change.
 * With Click animations → Expressive the new theme spreads out from the click as a circle.
 */
const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const t = useT();
    const label = theme === 'dark' ? t('Switch to light mode') : t('Switch to dark mode');
    const Icon = theme === 'dark' ? Sun : Moon;

    return (
        <button
            key={theme}
            type="button"
            onClick={() => withReveal(() => flushSync(() => setTheme(theme === 'dark' ? 'light' : 'dark')))}
            className="header-icon-btn fx-spin-in"
            aria-label={label}
            data-tip={label}
        >
            <Icon size={18} />
        </button>
    );
};

export default ThemeToggle;
