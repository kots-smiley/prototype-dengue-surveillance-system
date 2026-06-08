import { format } from 'date-fns';

/** Format an ISO date string as "MMM dd, yyyy". */
export function formatDate(value?: string | null): string {
  if (!value) return 'N/A';
  try {
    return format(new Date(value), 'MMM dd, yyyy');
  } catch {
    return 'N/A';
  }
}

/** Convert an ISO date string to a yyyy-MM-dd value for date inputs. */
export function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  return value.split('T')[0];
}

/** Format an ISO date string as "MMM dd, yyyy h:mm a". */
export function formatDateTime(value?: string | null): string {
  if (!value) return 'N/A';
  try {
    return format(new Date(value), 'MMM dd, yyyy h:mm a');
  } catch {
    return 'N/A';
  }
}

/** Turn an ENUM_LIKE_VALUE into "Enum like value". */
export function humanize(value?: string | null): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Tailwind badge class for a risk level. */
export function riskLevelBadge(level?: string | null): string {
  switch (level) {
    case 'HIGH':
      return 'badge badge-danger';
    case 'MEDIUM':
      return 'badge badge-warning';
    case 'LOW':
      return 'badge badge-success';
    default:
      return 'badge badge-info';
  }
}

/** Tailwind badge class for a case status. */
export function caseStatusBadge(status?: string | null): string {
  switch (status) {
    case 'CONFIRMED':
      return 'badge badge-danger';
    case 'PROBABLE':
      return 'badge badge-warning';
    case 'SUSPECTED':
      return 'badge badge-info';
    default:
      return 'badge badge-info';
  }
}
