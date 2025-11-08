"use client";

import { useEffect, useState } from 'react';
import { fetchStats, fetchInvoiceTrends, fetchTopVendors, fetchCategorySpend, fetchCashOutflow, fetchInvoices } from '@/lib/api';
import type { Stats, InvoiceTrend, VendorSpend, CategorySpend, CashOutflow, Invoice } from '@/lib/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#5B47FB', '#FF6B6B', '#4ECDC4', '#FFE66D'];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trends, setTrends] = useState<InvoiceTrend[]>([]);
  const [vendors, setVendors] = useState<VendorSpend[]>([]);
  const [categories, setCategories] = useState<CategorySpend[]>([]);
  const [cashFlow, setCashFlow] = useState<CashOutflow[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, trendsData, vendorsData, categoriesData, cashFlowData, invoicesData] = await Promise.all([
          fetchStats(),
          fetchInvoiceTrends(),
          fetchTopVendors(),
          fetchCategorySpend(),
          fetchCashOutflow(),
          fetchInvoices({ limit: 10 })
        ]);
        
        setStats(statsData);
        setTrends(trendsData);
        setVendors(vendorsData);
        setCategories(categoriesData);
        setCashFlow(cashFlowData);
        setInvoices(invoicesData.invoices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Spend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Total Spend</p>
              <p className="text-xs text-gray-500 mb-2">(YTD)</p>
              <p className="text-2xl font-bold text-gray-900">€ {stats?.totalSpend.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 font-medium">+{stats?.totalSpendChange}%</span>
                <span className="text-xs text-gray-500 ml-1">from last month</span>
              </div>
            </div>
            <div className="text-green-500">
              <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                <path d="M2 20 L12 15 L22 18 L32 10 L42 12 L46 8" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Total Invoices Processed</p>
              <p className="text-xs text-gray-500 mb-2"></p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalInvoices}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 font-medium">+{stats?.totalInvoicesChange}%</span>
                <span className="text-xs text-gray-500 ml-1">from last month</span>
              </div>
            </div>
            <div className="text-green-500">
              <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                <path d="M2 22 L12 18 L22 20 L32 12 L42 14 L46 10" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Documents Uploaded */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Documents Uploaded</p>
              <p className="text-xs text-gray-500 mb-2">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.documentsUploaded}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-red-600 font-medium">-{stats?.documentsUploadedChange}%</span>
                <span className="text-xs text-gray-500 ml-1">less from last month</span>
              </div>
            </div>
            <div className="text-red-500">
              <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                <path d="M2 12 L12 16 L22 14 L32 22 L42 20 L46 24" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Average Invoice Value */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Average Invoice Value</p>
              <p className="text-xs text-gray-500 mb-2"></p>
              <p className="text-2xl font-bold text-gray-900">€ {stats?.averageInvoiceValue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 font-medium">+{stats?.averageInvoiceValueChange}%</span>
                <span className="text-xs text-gray-500 ml-1">from last month</span>
              </div>
            </div>
            <div className="text-green-500">
              <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                <path d="M2 18 L12 14 L22 16 L32 8 L42 10 L46 6" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Volume + Value Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Invoice Volume + Value Trend</h3>
            <p className="text-sm text-gray-500">Invoice count and total spend over 12 months.</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="invoiceCount" stroke="#5B47FB" strokeWidth={2} name="Invoice Count" />
              <Line type="monotone" dataKey="totalSpend" stroke="#10B981" strokeWidth={2} name="Total Spend (€)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Spend by Vendor (Top 10) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Spend by Vendor (Top 10)</h3>
            <p className="text-sm text-gray-500">Vendor spend with cumulative percentage distribution.</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendors} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis type="category" dataKey="vendorName" stroke="#9CA3AF" style={{ fontSize: '11px' }} width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="totalSpend" fill="#5B47FB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Spend by Category</h3>
            <p className="text-sm text-gray-500">Distribution of spending across different categories.</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                dataKey="total"
                label={(entry) => entry.category}
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categories.slice(0, 3).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-gray-700">{cat.category}</span>
                </div>
                <span className="font-semibold text-gray-900">${cat.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Outflow Forecast */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cash Outflow Forecast</h3>
            <p className="text-sm text-gray-500">Expected payment obligations grouped by due date ranges.</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cashFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" stroke="#9CA3AF" style={{ fontSize: '11px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="amount" fill="#5B47FB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Invoices by Vendor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Invoices by Vendor</h3>
            <p className="text-sm text-gray-500">Top vendors by invoice count and net value.</p>
          </div>
          <div className="overflow-auto" style={{ maxHeight: '280px' }}>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Vendor</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500"># Invoices</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.slice(0, 7).map((invoice, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">{invoice.vendorName}</td>
                    <td className="px-3 py-2 text-gray-600">{invoice.invoiceDate?.split('-')[2]}.{invoice.invoiceDate?.split('-')[1]}.{invoice.invoiceDate?.split('-')[0]}</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-900">€ {invoice.invoiceTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
