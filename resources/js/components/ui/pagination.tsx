import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
  from?: number;
  to?: number;
}

export function Pagination({
  currentPage,
  lastPage,
  onPageChange,
  totalRecords,
  from,
  to,
}: PaginationProps) {
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);
  const showPages = pages.filter(
    (page) =>
      page === 1 ||
      page === lastPage ||
      Math.abs(page - currentPage) <= 1
  );

  const pageNumbers = showPages.reduce((acc: (number | string)[], page, i) => {
    if (i > 0 && page - showPages[i - 1] > 1) {
      acc.push("...");
    }
    acc.push(page);
    return acc;
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          variant="outline"
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        {totalRecords !== undefined && from !== undefined && to !== undefined && (
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{from}</span> to{" "}
              <span className="font-medium">{to}</span> of{" "}
              <span className="font-medium">{totalRecords}</span> results
            </p>
          </div>
        )}
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <Button
              variant="outline"
              className={cn(
                "relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0",
                currentPage === 1 && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </Button>
            {pageNumbers.map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    "relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20",
                    currentPage === page
                      ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                  )}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              className={cn(
                "relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0",
                currentPage === lastPage && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}