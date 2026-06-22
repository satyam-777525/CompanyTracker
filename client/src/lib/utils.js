import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case 'Easy': return 'text-success bg-success/10 border-success/20';
    case 'Medium': return 'text-warning bg-warning/10 border-warning/20';
    case 'Hard': return 'text-danger bg-danger/10 border-danger/20';
    default: return 'text-muted bg-card border-border';
  }
}

export function getStatusColor(status) {
  switch (status) {
    case 'solved': return 'text-success';
    case 'revision': return 'text-warning';
    default: return 'text-muted';
  }
}

export function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
