import { cn } from '@/lib/utils';

export function AdminDataTable({
  columns,
  rows,
  className,
}: {
  columns: string[];
  rows: React.ReactNode[][];
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800', className)}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-muted/50 dark:border-slate-800">
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, ri) => (
            <tr key={ri} className="border-b border-slate-100 last:border-0 dark:border-slate-900">
              {cells.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
