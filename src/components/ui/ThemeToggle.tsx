import React from 'react';
import { RiMoonLine, RiSunLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useTheme, isDarkTheme, type MedicalTheme } from '../../hooks/useTheme';

const THEME_LABELS: Record<MedicalTheme, string> = {
  'catppuccin-mocha': 'Moka Relajante',
  'catppuccin-latte': 'Crema Suave',
  'tailwind-dark': 'Clinico Oscuro',
  'tailwind-light': 'Clinico Claro',
  'nord': 'Artico Quirurgico',
  'nord-light': 'Polar Claro',
};

export const ThemeToggle: React.FC = () => { // eslint-disable-line react/display-name
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();

    toast.custom(
      (t) => (
        <div
          className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border border-border
            bg-surface-elevated text-text
            ${t.visible ? 'animate-enter' : 'animate-leave'}`}
        >
          {isDarkTheme(theme)
            ? <RiSunLine className="text-xl text-text" />
            : <RiMoonLine className="text-xl text-text" />
          }
          <span className="font-medium">
            Tematica {THEME_LABELS[theme]}
          </span>
        </div>
      ),
      { duration: 1500, position: 'top-center' }
    );
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      className=""
      aria-label={`Cambiar tema. Actual: ${THEME_LABELS[theme]}`}
    >
      {isDarkTheme(theme)
        ? <RiSunLine className="" />
        : <RiMoonLine className="" />
      }
    </button>
  )
}
