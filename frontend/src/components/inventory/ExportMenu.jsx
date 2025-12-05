import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ExportMenu({ products, filteredProducts }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportToCSV = () => {
    const headers = ['Item Name', 'SKU', 'Category', 'Stock', 'Reorder Point', 'Price', 'Status', 'Last Updated'];
    const csvData = filteredProducts.map(product => [
      product.name,
      product.sku,
      product.category,
      product.stock,
      product.reorderPoint,
      `$${product.price.toFixed(2)}`,
      product.status,
      product.lastUpdated
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowMenu(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Inventory Management Report', 14, 22);
    
    // Add metadata
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Items: ${filteredProducts.length}`, 14, 36);
    
    // Calculate totals
    const totalStockValue = filteredProducts.reduce((acc, p) => acc + (p.stock * p.price), 0);
    const lowStockItems = filteredProducts.filter(p => p.stock < p.reorderPoint && p.stock > 0).length;
    const outOfStockItems = filteredProducts.filter(p => p.stock === 0).length;
    
    doc.text(`Total Stock Value: $${totalStockValue.toFixed(2)}`, 14, 42);
    doc.text(`Low Stock Items: ${lowStockItems}`, 14, 48);
    doc.text(`Out of Stock Items: ${outOfStockItems}`, 14, 54);
    
    // Add table
    const tableData = filteredProducts.map(product => [
      product.name,
      product.sku,
      product.category,
      product.stock.toString(),
      `$${product.price.toFixed(2)}`,
      product.status
    ]);

    doc.autoTable({
      startY: 62,
      head: [['Item Name', 'SKU', 'Category', 'Stock', 'Price', 'Status']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 }
      }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`inventory_${new Date().toISOString().split('T')[0]}.pdf`);
    
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button
            onClick={exportToCSV}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition text-left"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Export as CSV</p>
              <p className="text-xs text-gray-500">Excel compatible</p>
            </div>
          </button>
          
          <div className="border-t border-gray-200"></div>
          
          <button
            onClick={exportToPDF}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition text-left"
          >
            <FileText className="w-4 h-4 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Export as PDF</p>
              <p className="text-xs text-gray-500">Print-ready format</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}