import clsx from 'clsx';

/** Join conditional class names. No tailwind-merge here — this project has no Tailwind. */
export function cn(...inputs) {
  return clsx(...inputs);
}
