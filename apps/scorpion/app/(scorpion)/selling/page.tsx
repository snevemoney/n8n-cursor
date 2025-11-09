'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, DataTable, useToast } from '@/components/scorpion';
import { DollarSign, TrendingUp, Users, ShoppingCart, CreditCard, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  status: 'active' | 'draft' | 'archived';
  sales: number;
  revenue: number;
}

interface SalesMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalSales: number;
  activeCustomers: number;
  conversionRate: number;
  avgOrderValue: number;
}

export default function SellingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadSellingData();
  }, []);

  const loadSellingData = async () => {
    try {
      const response = await fetch('/api/selling');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setMetrics(data.metrics || {
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalSales: 0,
          activeCustomers: 0,
          conversionRate: 0,
          avgOrderValue: 0
        });
      }
    } catch (error) {
      console.error('Failed to load selling data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    showToast('info', 'Product creation coming soon! Will include: pricing, Stripe/PayPal integration, and inventory management.');
    // TODO: Open modal for product creation
  };

  const handleViewAnalytics = () => {
    showToast('info', 'Sales analytics dashboard coming soon!');
    // TODO: Navigate to analytics page or open modal
    // router.push('/selling/analytics');
  };

  const handleExportData = () => {
    if (products.length === 0) {
      showToast('warning', 'No sales data to export yet.');
      return;
    }
    
    // Export as JSON for now
    const dataStr = JSON.stringify({ products, metrics, exportedAt: new Date().toISOString() }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('success', 'Sales data exported successfully!');
  };

  const handleEditProduct = (product: Product) => {
    showToast('info', `Editing ${product.name} - feature coming soon!`);
    // TODO: Open edit modal
  };

  const handleDuplicateProduct = (product: Product) => {
    showToast('info', `Duplicating ${product.name} - feature coming soon!`);
    // TODO: Duplicate product logic
  };

  const handlePaymentIntegration = () => {
    showToast('info', 'Payment integration setup coming soon! Will support Stripe and PayPal.');
    // TODO: Open payment settings
  };

  const handleManageCustomers = () => {
    showToast('info', 'Customer management coming soon!');
    // TODO: Navigate to customers page
    // router.push('/selling/customers');
  };

  const handleViewOrders = () => {
    showToast('info', 'Orders management coming soon!');
    // TODO: Navigate to orders page
    // router.push('/selling/orders');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'draft': return 'text-yellow-400';
      case 'archived': return 'text-red-400';
      default: return 'text-white/40';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-white/40">
        Loading selling data...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Selling & Monetization</h1>
          <p className="text-sm text-white/40">Manage products, track revenue, and grow your business</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateProduct}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-sm transition-colors flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Create Product
          </button>
          <button
            onClick={handleViewAnalytics}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-sm transition-colors flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Analytics
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-6 gap-4">
          <Metric 
            label="Total Revenue" 
            value={formatCurrency(metrics.totalRevenue, 'USD')} 
            valueColor="text-emerald-400"
          />
          <Metric 
            label="Monthly Revenue" 
            value={formatCurrency(metrics.monthlyRevenue, 'USD')} 
            valueColor="text-blue-400"
          />
          <Metric 
            label="Total Sales" 
            value={metrics.totalSales.toString()} 
            valueColor="text-purple-400"
          />
          <Metric 
            label="Active Customers" 
            value={metrics.activeCustomers.toString()} 
            valueColor="text-cyan-400"
          />
          <Metric 
            label="Conversion Rate" 
            value={`${metrics.conversionRate}%`} 
            valueColor="text-yellow-400"
          />
          <Metric 
            label="Avg Order Value" 
            value={formatCurrency(metrics.avgOrderValue, 'USD')} 
            valueColor="text-pink-400"
          />
        </div>
      )}

      {/* Products Table */}
      <div className="grid grid-cols-[1fr_400px] gap-4">
        <Panel title="Products & Services">
          <DataTable
            columns={[
              { key: 'id', label: 'Product ID' },
              { key: 'name', label: 'Name' },
              { key: 'price', label: 'Price' },
              { key: 'sales', label: 'Sales' },
              { key: 'revenue', label: 'Revenue' },
              { key: 'status', label: 'Status' },
            ]}
            data={products.map(p => ({
              id: (
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="sc-mono hover:text-cyan-400 transition-colors"
                >
                  {p.id}
                </button>
              ),
              name: <span className="font-medium">{p.name}</span>,
              price: <span className="text-white/60">{formatCurrency(p.price, p.currency)}</span>,
              sales: <span className="text-cyan-400">{p.sales}</span>,
              revenue: <span className="text-emerald-400">{formatCurrency(p.revenue, p.currency)}</span>,
              status: <span className={getStatusColor(p.status)}>{p.status.toUpperCase()}</span>,
            }))}
          />
        </Panel>

        <div className="space-y-4">
          {/* Product Details */}
          <Panel title="Product Details">
            {selectedProduct ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-white/40 mb-1">Product</div>
                  <div className="text-sm font-semibold">{selectedProduct.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-white/40 mb-1">Price</div>
                    <div className="text-sm text-emerald-400 font-semibold">
                      {formatCurrency(selectedProduct.price, selectedProduct.currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Status</div>
                    <div className={`text-sm font-semibold ${getStatusColor(selectedProduct.status)}`}>
                      {selectedProduct.status.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-white/40 mb-1">Total Sales</div>
                    <div className="text-sm font-semibold">{selectedProduct.sales}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 mb-1">Revenue</div>
                    <div className="text-sm text-emerald-400 font-semibold">
                      {formatCurrency(selectedProduct.revenue, selectedProduct.currency)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleEditProduct(selectedProduct)}
                    className="flex-1 px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDuplicateProduct(selectedProduct)}
                    className="flex-1 px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                  >
                    Duplicate
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-white/40 text-center py-8">
                Select a product to view details
              </div>
            )}
          </Panel>

          {/* Quick Actions */}
          <Panel title="Quick Actions">
            <div className="space-y-2">
              <button
                onClick={handlePaymentIntegration}
                className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-sm transition-colors flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Payment Integration
              </button>
              <button
                onClick={handleManageCustomers}
                className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-sm transition-colors flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Manage Customers
              </button>
              <button
                onClick={handleViewOrders}
                className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-sm transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                View Orders
              </button>
              <button
                onClick={handleExportData}
                className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-sm transition-colors flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Export Data
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

