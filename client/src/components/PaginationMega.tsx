import { GrFormNext, GrFormPrevious } from "react-icons/gr";

const PaginationMega = ({
  currentPage,
  onPageChange,
  totalPages,
  totalItems,
  limit,
  setLimit,
}: {
  currentPage: number;
  onPageChange: (pageIndex: number) => void;
  totalPages: number;
  totalItems: number;
  limit: number;
  setLimit: (limit: number) => void;
}) => {
  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (pageIndex: number) => {
    onPageChange(pageIndex);
  };

  const renderPageIndexes = () => {
    const pages = [];
    const maxPageButtons = 5;
    const halfMaxPageButtons = Math.floor(maxPageButtons / 2);

    let startPage = Math.max(
      1,
      Math.min(
        currentPage + 1 - halfMaxPageButtons,
        totalPages - maxPageButtons + 1
      )
    );
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageClick(0)}
          className={`px-2 py-1 mx-1 rounded-md ${currentPage === 0 ? "bg-main-black text-white" : "text-main-black"
            }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="mx-1">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i - 1)}
          className={`px-2 py-1 rounded-md ${currentPage === i - 1 ? "bg-main-black text-white" : "text-main-black"
            }`}
        >
          {Math.floor(i)}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className="">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages - 1)}
          className={`px-2 py-1 rounded-md ${currentPage === totalPages - 1
            ? "bg-main-black text-white"
            : "text-main-black"
            }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-between py-4 lg:flex-row flex-col gap-4">
      <div>
        <select
          value={limit}
          onChange={(e: any) => setLimit(parseInt(e.target.value))}
          class="text-main-black bg-main-white"
        >
          {[5, 10, 25, 50, 100].map((limit) => (
            <option key={limit} value={limit}>
              Show {limit} items
            </option>
          ))}
        </select>
      </div>
      <div>Page {currentPage + 1} of {totalPages} (total {totalItems})</div>
      <div className="flex items-center overflow-x-auto">
        {currentPage > 0 && (
          <button
            onClick={handlePrevious}
            className="px-2 py-2 text-main-black border border-[#01424E] rounded-md"
          >
            <GrFormPrevious />
          </button>
        )}

        <span className="flex mx-1">{renderPageIndexes()}</span>

        {currentPage < totalPages - 1 && (
          <button
            onClick={handleNext}
            className="px-2 py-2 text-main-black border border-[#01424E] rounded-md"
          >
            <GrFormNext />
          </button>
        )}
      </div>
    </nav>
  );
};

export default PaginationMega;
