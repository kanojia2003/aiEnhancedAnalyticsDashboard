import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';

/**
 * Export data as CSV file
 * @param {Array} data - Array of data objects
 * @param {string} filename - Name of the file to download
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Convert data to CSV using PapaParse
    const csv = Papa.unparse(data);

    // Create a blob from the CSV string
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    // Create download link and trigger download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, message: 'CSV exported successfully' };
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export data as JSON file
 * @param {Object} data - Data object to export
 * @param {string} filename - Name of the file to download
 */
export const exportToJSON = (data, filename = 'export.json') => {
  try {
    if (!data) {
      throw new Error('No data to export');
    }

    // Convert data to JSON string with formatting
    const jsonString = JSON.stringify(data, null, 2);

    // Create a blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link and trigger download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, message: 'JSON exported successfully' };
  } catch (error) {
    console.error('Error exporting JSON:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export data as Excel file (Enhanced CSV with .xlsx extension)
 * @param {Array} data - Array of data objects
 * @param {string} filename - Name of the file to download
 */
export const exportToExcel = (data, filename = 'export.xlsx') => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // For now, we'll export as CSV with .xlsx extension
    // In a production app, you'd use a library like xlsx or exceljs for true Excel format
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, message: 'Excel file exported successfully' };
  } catch (error) {
    console.error('Error exporting Excel:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Capture element as image
 * @param {HTMLElement} element - DOM element to capture
 * @param {Object} options - html2canvas options
 */
export const captureElementAsImage = async (element, options = {}) => {
  try {
    const defaultOptions = {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff', // White background for PDF
      ...options,
    };

    const canvas = await html2canvas(element, defaultOptions);
    return canvas;
  } catch (error) {
    console.error('Error capturing element:', error);
    throw error;
  }
};

/**
 * Export current view as PDF with charts and insights
 * @param {Object} exportData - Data to include in PDF
 */
export const exportToPDF = async (exportData) => {
  try {
    const {
      csvData,
      dataStats,
      aiInsights,
      aiRecommendations,
      chartConfigs,
      includeCharts = true,
      includeInsights = true,
      includeData = false,
    } = exportData;

    // Initialize PDF (A4 size)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let currentY = margin;

    // Helper function to check if we need a new page
    const checkNewPage = (requiredHeight) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with wrapping
    const addText = (text, fontSize, isBold = false, color = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(...color);
      
      const lines = pdf.splitTextToSize(text, pageWidth - (margin * 2));
      const lineHeight = fontSize * 0.5;
      
      checkNewPage(lines.length * lineHeight);
      
      lines.forEach(line => {
        pdf.text(line, margin, currentY);
        currentY += lineHeight;
      });
      
      currentY += 3; // Add spacing after text
    };

    // White background (default for PDF)
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Title Section (Blue header)
    pdf.setFillColor(59, 130, 246); // Blue-500
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Analytics Dashboard Report', margin, 20);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(255, 255, 255); // White text on blue background
    pdf.text(`Generated on ${new Date().toLocaleString()}`, margin, 30);
    
    currentY = 50;

    // Data Summary Section
    addText('Data Summary', 16, true, [30, 64, 175]); // Dark Blue
    
    pdf.setFillColor(240, 245, 255); // Light blue background
    pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), 30, 3, 3, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0); // Black text
    
    const statsY = currentY + 8;
    const totalRows = dataStats?.totalRows || csvData?.length || 0;
    const totalColumns = dataStats?.totalColumns || (csvData?.[0] ? Object.keys(csvData[0]).length : 0);
    
    pdf.text(`Total Rows: ${totalRows}`, margin + 5, statsY);
    pdf.text(`Columns: ${totalColumns}`, margin + 5, statsY + 7);
    
    if (dataStats?.dateRange) {
      pdf.text(`Date Range: ${dataStats.dateRange}`, margin + 5, statsY + 14);
    }
    
    currentY += 40;

    // AI Insights Section
    if (includeInsights) {
      checkNewPage(40);
      addText('AI-Generated Insights', 16, true, [30, 64, 175]); // Dark Blue
      
      if (aiInsights && aiInsights.length > 0) {
        aiInsights.slice(0, 5).forEach((insight, index) => {
          checkNewPage(25);
          
          pdf.setFillColor(245, 250, 255); // Very light blue
          pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), 20, 3, 3, 'F');
          
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 64, 175); // Dark blue
          pdf.text(`${index + 1}. ${insight.type || 'Insight'}`, margin + 5, currentY + 7);
          
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(60, 60, 60); // Dark gray
          const insightText = pdf.splitTextToSize(insight.text || insight.message || '', pageWidth - (margin * 2) - 10);
          pdf.text(insightText[0] || '', margin + 5, currentY + 14);
          
          currentY += 25;
        });
      } else {
        // Add placeholder when no AI insights available
        pdf.setFillColor(245, 250, 255); // Very light blue
        pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), 25, 3, 3, 'F');
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100); // Gray
        pdf.text('No AI insights generated yet.', margin + 5, currentY + 10);
        pdf.text('Visit the AI Insights page to generate intelligent analysis of your data.', margin + 5, currentY + 17);
        
        currentY += 30;
      }
      
      currentY += 5;
    }

    // Recommendations Section
    if (includeInsights) {
      checkNewPage(40);
      addText('AI Recommendations', 16, true, [21, 128, 61]); // Dark Green
      
      if (aiRecommendations && aiRecommendations.length > 0) {
        aiRecommendations.slice(0, 5).forEach((rec, index) => {
          checkNewPage(25);
          
          pdf.setFillColor(240, 253, 244); // Very light green
          pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), 20, 3, 3, 'F');
          
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(21, 128, 61); // Dark green
          pdf.text(`${index + 1}. ${rec.title || 'Recommendation'}`, margin + 5, currentY + 7);
          
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(60, 60, 60); // Dark gray
          const recText = pdf.splitTextToSize(rec.description || rec.text || '', pageWidth - (margin * 2) - 10);
          pdf.text(recText[0] || '', margin + 5, currentY + 14);
          
          currentY += 25;
        });
      } else {
        // Add placeholder when no recommendations available
        pdf.setFillColor(240, 253, 244); // Very light green
        pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), 25, 3, 3, 'F');
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100); // Gray
        pdf.text('No AI recommendations available yet.', margin + 5, currentY + 10);
        pdf.text('Generate AI insights to receive actionable recommendations.', margin + 5, currentY + 17);
        
        currentY += 30;
      }
      
      currentY += 5;
    }

    // Charts Section
    if (includeCharts) {
      checkNewPage(40);
      addText('Dashboard Charts', 16, true, [30, 64, 175]); // Dark Blue
      
      if (chartConfigs && chartConfigs.length > 0) {
        // Note about charts
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100); // Gray
        pdf.text('Chart snapshots captured from dashboard', margin, currentY);
        currentY += 10;
        
        // Try to capture chart elements
        for (let i = 0; i < Math.min(chartConfigs.length, 3); i++) {
          const chartElement = document.querySelector(`[data-chart-id="${chartConfigs[i].id}"]`);
          
          if (chartElement) {
            try {
              const canvas = await captureElementAsImage(chartElement);
              const imgData = canvas.toDataURL('image/png');
              
              checkNewPage(80);
              
              // Add chart title
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0); // Black text
            pdf.text(chartConfigs[i].title || `Chart ${i + 1}`, margin, currentY);
            currentY += 7;
            
            // Add chart image
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, Math.min(imgHeight, 70));
            currentY += Math.min(imgHeight, 70) + 10;
          } catch (error) {
            console.error('Error capturing chart:', error);
          }
        }
      }
    } else {
        // Add placeholder when no charts available
        pdf.setFillColor(240, 245, 255); // Light blue
        pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), 25, 3, 3, 'F');
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100); // Gray
        pdf.text('No charts configured yet.', margin + 5, currentY + 10);
        pdf.text('Create charts on the Dashboard page to include them in reports.', margin + 5, currentY + 17);
        
        currentY += 30;
      }
    }

    // Data Table Section (optional, can be large)
    if (includeData && csvData && csvData.length > 0) {
      pdf.addPage();
      currentY = margin;
      
      addText('Data Preview (First 20 Rows)', 16, true, [30, 64, 175]); // Dark Blue
      
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0); // Black
      
      const headers = Object.keys(csvData[0]);
      const colWidth = (pageWidth - (margin * 2)) / Math.min(headers.length, 6);
      
      // Headers
      pdf.setFont('helvetica', 'bold');
      headers.slice(0, 6).forEach((header, i) => {
        pdf.text(header.substring(0, 15), margin + (i * colWidth), currentY);
      });
      currentY += 5;
      
      // Rows
      pdf.setFont('helvetica', 'normal');
      csvData.slice(0, 20).forEach((row) => {
        checkNewPage(5);
        headers.slice(0, 6).forEach((header, i) => {
          const value = String(row[header] || '').substring(0, 15);
          pdf.text(value, margin + (i * colWidth), currentY);
        });
        currentY += 5;
      });
    }

    // Footer on last page
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100); // Gray
      pdf.text(
        `Page ${i} of ${totalPages} | AI-Enhanced Analytics Dashboard`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const filename = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    return { success: true, message: 'PDF exported successfully', filename };
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Prepare complete export data package
 * @param {Object} storeData - Data from Zustand store
 */
export const prepareExportData = (storeData) => {
  const {
    csvData,
    dataStats,
    chartConfigs,
    aiInsights,
    aiRecommendations,
    aiPredictions,
    aiAnomalies,
  } = storeData;

  return {
    metadata: {
      exportDate: new Date().toISOString(),
      dataRows: csvData?.length || 0,
      totalCharts: chartConfigs?.length || 0,
      hasAIInsights: (aiInsights?.length || 0) > 0,
    },
    data: csvData || [],
    statistics: dataStats || {},
    charts: chartConfigs || [],
    aiAnalysis: {
      insights: aiInsights || [],
      recommendations: aiRecommendations || [],
      predictions: aiPredictions || null,
      anomalies: aiAnomalies || [],
    },
  };
};
