import { PAGE_SIZE_OPTIONS } from '../../configuration/constants';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = total === 0 ? 0 : Math.min(page * limit, total);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{startIdx}</span>–
        <span className="font-semibold text-gray-900">{endIdx}</span> of{' '}
        <span className="font-semibold text-gray-900">{total.toLocaleString()}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600" htmlFor="page-size">
            Rows
          </label>
          <select
            id="page-size"
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
            className="input py-1"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
            Prev
          </Button>
          <span className="text-sm text-gray-700">
            Page <span className="font-semibold">{page}</span> of{' '}
            <span className="font-semibold">{Math.max(pages, 1)}</span>
          </span>
          <Button
            variant="secondary"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
