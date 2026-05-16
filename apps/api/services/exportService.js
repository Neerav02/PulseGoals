const XLSX = require('xlsx');

/**
 * Generate a formatted Excel report for achievement data
 */
function generateAchievementReport(data, quarter, year) {
  const wb = XLSX.utils.book_new();
  
  // Prepare rows
  const rows = data.map(item => ({
    'Employee': item.employeeName,
    'Goal Title': item.goalTitle,
    'Thrust Area': item.thrustArea,
    'UoM': item.uomType,
    'Target': item.target,
    'Actual': item.actualValue || '—',
    'Progress Score': item.progressScore != null ? `${Math.round(item.progressScore)}%` : '—',
    'Status': item.status || 'NOT_STARTED',
    'Check-in Comment': item.checkInComment || '—',
  }));

  // Add summary row
  const avgScore = data.filter(d => d.progressScore != null).reduce((sum, d) => sum + d.progressScore, 0) / 
    Math.max(data.filter(d => d.progressScore != null).length, 1);
  
  rows.push({
    'Employee': 'AVERAGE',
    'Goal Title': '',
    'Thrust Area': '',
    'UoM': '',
    'Target': '',
    'Actual': '',
    'Progress Score': `${Math.round(avgScore)}%`,
    'Status': '',
    'Check-in Comment': '',
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  
  // Auto-width columns
  const colWidths = Object.keys(rows[0] || {}).map(key => ({
    wch: Math.max(key.length, ...rows.map(r => String(r[key] || '').length)) + 2
  }));
  ws['!cols'] = colWidths;

  // Style header row (coral accent)
  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        fill: { fgColor: { rgb: 'FF6B47' } },
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center' },
      };
    }
  }

  // Conditional coloring for Progress Score column
  for (let row = 1; row <= headerRange.e.r; row++) {
    const scoreCell = XLSX.utils.encode_cell({ r: row, c: 6 }); // Progress Score column
    if (ws[scoreCell] && ws[scoreCell].v) {
      const scoreVal = parseFloat(ws[scoreCell].v);
      let bgColor = 'FFFFFF';
      if (!isNaN(scoreVal)) {
        if (scoreVal >= 80) bgColor = '10B981';
        else if (scoreVal >= 50) bgColor = 'F59E0B';
        else bgColor = 'EF4444';
      }
      ws[scoreCell].s = {
        fill: { fgColor: { rgb: bgColor } },
        font: { color: { rgb: 'FFFFFF' }, bold: true },
      };
    }
  }

  const sheetName = `${quarter} Achievement Report — ${year}`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = { generateAchievementReport };
