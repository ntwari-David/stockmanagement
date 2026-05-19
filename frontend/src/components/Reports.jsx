import React, { useState, useEffect } from "react";

const API_BASE_URL = '/api';

export default function Reports() {
  const [reportType, setReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateReport();
  }, [reportType, selectedDate, selectedMonth]);

  const generateReport = async () => {
    try {
      setLoading(true);
      const params = reportType === "daily"
        ? `date=${selectedDate}`
        : `month=${selectedMonth}`;

      const response = await fetch(`${API_BASE_URL}/reports/${reportType}?${params}`);
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      const data = await response.json();
      setReportData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error generating report:', err);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllReports = async () => {
    if (!window.confirm('Are you sure you want to delete ALL reports and stock operations? This cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(`${API_BASE_URL}/stock-operations/all`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete all reports');
      }

      alert('All reports and stock operations deleted successfully');
      setReportData([]);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting all reports:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalStockIn = reportData.reduce((sum, item) => sum + (reportType === "daily" ? item.stock_in : item.total_stock_in), 0);
  const totalStockOut = reportData.reduce((sum, item) => sum + (reportType === "daily" ? item.stock_out : item.total_stock_out), 0);
  const totalNetChange = reportData.reduce((sum, item) => sum + item.net_change, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Reports</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="daily"
                checked={reportType === "daily"}
                onChange={(e) => setReportType(e.target.value)}
                className="mr-2"
              />
              Daily Report
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="monthly"
                checked={reportType === "monthly"}
                onChange={(e) => setReportType(e.target.value)}
                className="mr-2"
              />
              Monthly Report
            </label>
          </div>
          <button
            onClick={handleDeleteAllReports}
            disabled={deleteLoading}
            className="rounded-md bg-red-500 text-white px-4 py-2 font-semibold shadow-sm hover:bg-red-600 disabled:opacity-50"
          >
            {deleteLoading ? 'Deleting...' : 'Delete All Reports'}
          </button>
        </div>

        <div className="mt-4">
          {reportType === "daily" ? (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-2 rounded"
            />
          ) : (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border p-2 rounded"
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Generating report...</div>
        ) : reportData.length === 0 ? (
          <div className="p-6 text-center">No data available for the selected period</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spare Part</th>
                {reportType === "daily" ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Out</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock Out</th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{item.spare_part}</td>
                  {reportType === "daily" ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">{item.stock_in}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.stock_out}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">{item.total_stock_in}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.total_stock_out}</td>
                    </>
                  )}
                  <td className={`px-6 py-4 whitespace-nowrap ${item.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.net_change > 0 ? '+' : ''}{item.net_change}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-bold">Total</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">{totalStockIn}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">{totalStockOut}</td>
                <td className={`px-6 py-4 whitespace-nowrap font-bold ${totalNetChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalNetChange > 0 ? '+' : ''}{totalNetChange}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}