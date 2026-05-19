import React, { useState, useEffect } from "react";
import SpareParts from "./components/SpareParts";
import StockOperations from "./components/StockOperations";
import Reports from "./components/Reports";
import Login from "./components/Login";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState("spareParts");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteAllReports = async () => {
    if (!window.confirm('Are you sure you want to delete ALL reports and stock operations? This cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch('/api/stock-operations/all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete all reports');
      }

      alert('All reports and stock operations deleted successfully');
      window.location.reload();
    } catch (err) {
      alert('Error: ' + err.message);
      console.error('Error deleting all reports:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      window.localStorage.setItem("user", JSON.stringify(user));
    } else {
      window.localStorage.removeItem("user");
    }
  }, [user]);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-500">
      <header className="bg-blue-600 text-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">XYZ_LTD Company</h1>
          <p className="text-sm text-blue-100">Inventory Management System</p>
          <p className="text-sm text-blue-100">Signed in as {user.UserName} ({user.role})</p>
        </div>
        <div className="flex gap-2">
          {user.role === 'admin' && (
            <button
              onClick={handleDeleteAllReports}
              disabled={deleteLoading}
              className="rounded-md bg-red-500 px-4 py-2 text-white font-semibold shadow-sm hover:bg-red-600 disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : 'Delete All Reports'}
            </button>
          )}
          <button
            onClick={() => setUser(null)}
            className="rounded-md bg-white px-4 py-2 text-blue-600 font-semibold shadow-sm hover:bg-blue-50"
          >
            Logout
          </button>
        </div>
      </header>
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("spareParts")}
              className={`py-2 px-4 ${activeTab === "spareParts" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
            >
              Manage Spare Parts
            </button>
            <button
              onClick={() => setActiveTab("stockOperations")}
              className={`py-2 px-4 ${activeTab === "stockOperations" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
            >
              Stock Operations
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`py-2 px-4 ${activeTab === "reports" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
            >
              Reports
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4">
        {activeTab === "spareParts" && <SpareParts isAdmin={user.role === "admin"} />}
        {activeTab === "stockOperations" && <StockOperations isAdmin={user.role === "admin"} />}
        {activeTab === "reports" && <Reports />}
      </main>
    </div>
  );
}