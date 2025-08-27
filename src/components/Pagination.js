import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useI18n } from '../utils/translationHelpers';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  showInfo = true,
  showSizeSelector = false,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  className = ''
}) => {
  const { tPagination } = useI18n();
  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const delta = 2; // Nombre de pages à afficher de chaque côté de la page courante
    const range = [];
    const rangeWithDots = [];

    // Calcul des bornes
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    // Générer la plage de pages
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Ajouter la première page et les points si nécessaire
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push('...');
      }
    }

    // Ajouter la plage courante
    rangeWithDots.push(...range);

    // Ajouter les points et la dernière page si nécessaire
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  // Calcul des informations d'affichage
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Informations */}
      {showInfo && (
        <div className="text-sm text-gray-700 order-2 sm:order-1">
          {tPagination('showing')} <span className="font-medium">{startItem}</span> {tPagination('to')}{' '}
          <span className="font-medium">{endItem}</span> {tPagination('of')}{' '}
          <span className="font-medium">{totalItems}</span> {tPagination('results')}
        </div>
      )}

      {/* Sélecteur de taille de page */}
      {showSizeSelector && onPageSizeChange && (
        <div className="flex items-center gap-2 text-sm text-gray-700 order-1 sm:order-2">
          <span>{tPagination('show')}</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>{tPagination('itemsPerPage')}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center space-x-1 order-3">
        {/* Bouton Précédent */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title={tPagination('previous')}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numéros de page */}
        {pageNumbers.map((pageNumber, index) => (
          <React.Fragment key={index}>
            {pageNumber === '...' ? (
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            ) : (
              <button
                onClick={() => onPageChange(pageNumber)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  currentPage === pageNumber
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Bouton Suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title={tPagination('next')}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Composant de pagination simple pour les petites listes
export const SimplePagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = ''
}) => {
  const { tPagination } = useI18n();
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {tPagination('previous')}
      </button>
      
      <span className="px-3 py-1 text-sm text-gray-700">
        {tPagination('page')} {currentPage} {tPagination('of')} {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {tPagination('next')}
      </button>
    </div>
  );
};

// Hook personnalisé pour gérer la pagination
export const usePagination = (initialPage = 1, initialPageSize = 20) => {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Retourner à la première page
  };

  const reset = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    reset
  };
};

export default Pagination;