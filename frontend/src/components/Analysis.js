import React from 'react';

const Analysis = ({ analysis, result }) => {
  const payload = analysis ?? result;

  const isEmptyObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
  const isEmpty = payload == null || isEmptyObject(payload);

  if (isEmpty) {
    return <div className="text-gray-600">No analysis yet</div>;
  }

  return (
    <div className="border rounded p-3 bg-gray-50">
      <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(payload, null, 2)}</pre>
    </div>
  );
};

export default Analysis;
