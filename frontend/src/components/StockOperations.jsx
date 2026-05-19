import React, { useState, useEffect } from "react";

const API_BASE_URL = '/api';

export default function StockOperations({ isAdmin = false }) {
  const [operations, setOperations] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [formData, setFormData] = useState({
    type: "in", // "in" or "out"
    sparePartId: "",
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpareParts();
    fetchOperations();
  }, []);

  const fetchSpareParts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchased-spareparts`);
      if (!response.ok) {
        throw new Error('Failed to fetch spare parts');
      }
      const data = await response.json();
      setSpareParts(data);
    } catch (err) {
      console.error('Error fetching spare parts:', err);
      setError('Failed to load spare parts');
    }
  };

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/stock-operations`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock operations');
      }
      const data = await response.json();
      setOperations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stock operations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const quantity = Number(formData.quantity);
    if (!Number.isFinite(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
      setError('Quantity must be a non-negative whole number.');
      return;
    }
    if (!formData.sparePartId) {
      setError('Please select a spare part.');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/stock-operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          P_id: formData.sparePartId,
          quality: quantity,
          date: formData.date,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to record stock operation';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage);
      }

      await fetchOperations(); // Refresh the operations list
      await fetchSpareParts();
      setFormData({
        type: "in",
        sparePartId: "",
        quantity: 0,
        date: new Date().toISOString().split('T')[0],
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error recording stock operation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Stock Operations</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          You are signed in as a read-only user. Stock operations are disabled.
        </div>
      )}

      {isAdmin && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="border p-2 rounded"
              required
              disabled={loading}
            >
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
            <select
              value={formData.sparePartId}
              onChange={(e) => setFormData({ ...formData, sparePartId: e.target.value })}
              className="border p-2 rounded"
              required
              disabled={loading}
            >
              <option value="">Select Spare Part</option>
              {spareParts.map((part) => (
                <option key={part.P_id} value={part.P_id}>{part.P_name}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? '' : Number(e.target.value) })}
              className="border p-2 rounded"
              required
              disabled={loading}
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="border p-2 rounded"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Recording...' : 'Record Operation'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading && !operations.length ? (
          <div className="p-6 text-center">Loading stock operations...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spare Part</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operations.map((op) => (
                <tr key={op.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      op.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {op.type === 'in' ? 'Stock In' : 'Stock Out'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{op.spare_part_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{op.quality}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{op.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}