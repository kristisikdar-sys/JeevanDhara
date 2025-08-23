import React from 'react';

function getColumns(data) {
  const columnSet = new Set();
  data.forEach((row) => {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      Object.keys(row).forEach((k) => columnSet.add(k));
    }
  });
  return Array.from(columnSet);
}

function formatCell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const DataView = ({ data }) => {
  const rows = Array.isArray(data) ? data : [];

  if (!rows.length) {
    return <div className="text-gray-600">No data loaded</div>;
  }

  const columns = getColumns(rows);

  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 font-medium text-gray-700 border-b">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className={idx % 2 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 border-b align-top">{formatCell(row?.[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataView;
