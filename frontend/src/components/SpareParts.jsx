import React, { useState, useEffect } from "react";

const API_BASE_URL = '/api';

export default function SpareParts({ isAdmin = false }) {
  const [spareParts, setSpareParts] = useState([]);
  const [formData, setFormData] = useState({
    P_name: "",
    quality: "",
    total_price: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch spare parts from API
  useEffect(() => {
    fetchSpareParts();
  }, []);

  const fetchSpareParts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/purchased-spareparts`);
      if (!response.ok) {
        throw new Error('Failed to fetch spare parts');
      }
      const data = await response.json();
      setSpareParts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching spare parts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const quality = String(formData.quality || '').trim();
    const price = Number(formData.total_price);
    if (!formData.P_name.trim()) {
      setError('Spare part name is required.');
      return;
    }
    if (!quality) {
      setError('Quality is required and must be text.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Total price must be a non-negative number.');
      return;
    }
    // Check if the product already exists when adding a new one
    if (!editingId && spareParts.some(part => part.P_name.toLowerCase() === formData.P_name.trim().toLowerCase())) {
      alert('The product that you are trying to stock is currently in stock, so you can go to stockin and add other number of the item');
      return;
    }
    try {
      setLoading(true);
      const url = editingId
        ? `${API_BASE_URL}/purchased-spareparts/${editingId}`
        : `${API_BASE_URL}/purchased-spareparts`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quality,
          total_price: price,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save spare part');
      }

      await fetchSpareParts(); // Refresh the list
      setFormData({ P_name: "", quality: "", total_price: 0 });
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error saving spare part:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (part) => {
    setFormData({
      P_name: part.P_name,
      quality: part.quality || "",
      total_price: part.total_price,
    });
    setEditingId(part.P_id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this spare part?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/purchased-spareparts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete spare part');
      }

      await fetchSpareParts(); // Refresh the list
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting spare part:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Manage Spare Parts</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          You are signed in as a read-only user. Editing and deletion are disabled.
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Spare Part Name"
            value={formData.P_name}
            onChange={(e) => setFormData({ ...formData, P_name: e.target.value })}
            className="border p-2 rounded"
            required
            disabled={loading || !isAdmin}
          />
          <input
            type="text"
            placeholder="Quality (e.g., High, Medium, Low)"
            value={formData.quality}
            onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
            className="border p-2 rounded"
            required
            disabled={loading || !isAdmin}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Total Price"
            value={formData.total_price}
            onChange={(e) => setFormData({ ...formData, total_price: e.target.value === '' ? '' : Number(e.target.value) })}
            className="border p-2 rounded"
            required
            disabled={loading || !isAdmin}
          />
        </div>
        {isAdmin && (
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editingId ? "Update" : "Add") + " Spare Part"}
          </button>
        )}
        {editingId && isAdmin && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ P_name: "", quality: "", total_price: 0 });
            }}
            className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading && !spareParts.length ? (
          <div className="p-6 text-center">Loading spare parts...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {spareParts.map((part) => (
                <tr key={part.P_id}>
                  <td className="px-6 py-4 whitespace-nowrap">{part.P_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{part.quality}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${part.total_price}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => handleEdit(part)}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(part.P_id)}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}