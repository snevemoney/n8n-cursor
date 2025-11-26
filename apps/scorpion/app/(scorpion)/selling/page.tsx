'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, DataTable, useToast, Modal, Button, Input, Textarea, Select, PageLoadingBar, LoadingState } from '@/components/scorpion';
import { DollarSign, TrendingUp, Users, ShoppingCart, CreditCard, Package, X, Save, Copy } from 'lucide-react';
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

interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  currency: string;
  status: 'active' | 'draft' | 'archived';
}

export default function SellingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    status: 'draft'
  });

  useEffect(() => {
    // Defer data fetch aggressively so page renders instantly
    const loadData = () => {
      loadSellingData();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
  }, []);

  const loadSellingData = async () => {
    try {
      setError(null);
      // Only show loading spinner on initial load
      if (products.length === 0 && !metrics) {
        setLoading(true);
      }
      const response = await fetch('/api/selling');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to load: ${response.statusText}`);
      }
      
      const result = await response.json();
      const data = result.data || result; // Handle both wrapped and unwrapped responses
      
      setProducts(data.products || []);
      setMetrics(data.metrics || {
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalSales: 0,
        activeCustomers: 0,
        conversionRate: 0,
        avgOrderValue: 0
      });
    } catch (error: any) {
      console.error('Failed to load selling data:', error);
      setError(error.message || 'Failed to load selling data. Please try again.');
      showToast('error', error.message || 'Failed to load selling data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      currency: 'USD',
      status: 'draft'
    });
    setShowCreateModal(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name.trim()) {
      showToast('error', 'Product name is required');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/selling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to save product');
      }

      showToast('success', `Product "${formData.name}" ${showEditModal ? 'updated' : 'created'} successfully`);
      setShowCreateModal(false);
      setShowEditModal(false);
      await loadSellingData();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      showToast('error', error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleViewAnalytics = () => {
    setShowAnalyticsModal(true);
  };

  const handleExportData = () => {
    if (products.length === 0) {
      showToast('warning', 'No sales data to export yet.');
      return;
    }
    
    try {
      // Export as JSON for now
      const dataStr = JSON.stringify({ products, metrics, exportedAt: new Date().toISOString() }, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('success', 'Sales data exported successfully!');
    } catch (error: any) {
      console.error('Failed to export data:', error);
      showToast('error', 'Failed to export data');
    }
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: '',
      price: product.price,
      currency: product.currency,
      status: product.status
    });
    setShowEditModal(true);
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const duplicatedProduct = {
        ...formData,
        name: `${product.name} (Copy)`,
        description: '',
        price: product.price,
        currency: product.currency,
        status: 'draft' as const
      };

      setFormData(duplicatedProduct);
      setShowCreateModal(true);
      showToast('info', `Duplicating ${product.name}...`);
    } catch (error: any) {
      console.error('Failed to duplicate product:', error);
      showToast('error', 'Failed to duplicate product');
    }
  };

  const handlePaymentIntegration = () => {
    setShowPaymentModal(true);
  };

  const handleManageCustomers = () => {
    showToast('info', 'Customer management feature coming soon! This will connect to your customer database.');
    // Future: router.push('/selling/customers');
  };

  const handleViewOrders = () => {
    showToast('info', 'Orders management feature coming soon! This will show all customer orders.');
    // Future: router.push('/selling/orders');
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

  return (
    <>
      <PageLoadingBar loading={loading && products.length === 0 && !metrics} />
    <div className="h-full overflow-y-auto p-4 space-y-4" suppressHydrationWarning>
      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-red-400">⚠️</div>
            <div className="text-sm text-red-300">{error}</div>
          </div>
          <button
            onClick={loadSellingData}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-xs text-red-300 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Loading State - Show inside page */}
      {loading && products.length === 0 && !metrics ? (
        <Panel>
          <LoadingState text="Loading selling data..." />
        </Panel>
      ) : (
        <>
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
          {products.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-lg text-white/60">No products configured yet</div>
              <div className="text-sm text-white/40 max-w-md mx-auto">
                Create your first product to start tracking sales and revenue. Products will appear here once created.
              </div>
              <button
                onClick={handleCreateProduct}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-sm transition-colors flex items-center gap-2 mx-auto"
              >
                <Package className="h-4 w-4" />
                Create Your First Product
              </button>
            </div>
          ) : (
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
          )}
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

      {/* Create/Edit Product Modal */}
      <Modal
        open={showCreateModal || showEditModal}
        onClose={() => { setShowCreateModal(false); setShowEditModal(false); }}
        title={showEditModal ? 'Edit Product' : 'Create Product'}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveProduct}
              disabled={saving || !formData.name.trim()}
              loading={saving}
              icon={<Save className="h-4 w-4" />}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="sc-title block mb-1">Product Name *</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>
          <div>
            <label className="sc-title block mb-1">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="sc-title block mb-1">Price</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price.toString()}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="sc-title block mb-1">Currency</label>
              <Select
                options={[
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'GBP', label: 'GBP' },
                  { value: 'JPY', label: 'JPY' },
                ]}
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="sc-title block mb-1">Status</label>
            <Select
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            />
          </div>
        </div>
      </Modal>

      {/* Payment Integration Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Payment Integration"
        size="sm"
        footer={
          <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            Connect your payment providers to start accepting payments. This feature will be available soon.
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-white/5 border border-white/10 rounded flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Stripe</div>
                <div className="text-xs text-white/60">Credit cards, Apple Pay, Google Pay</div>
              </div>
              <Button variant="primary" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-yellow-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">PayPal</div>
                <div className="text-xs text-white/60">PayPal accounts and credit cards</div>
              </div>
              <Button variant="warning" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Analytics Modal */}
      <Modal
        open={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        title="Sales Analytics"
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setShowAnalyticsModal(false)}>
            Close
          </Button>
        }
      >
        <div>
          <p className="text-sm text-white/60 mb-4">
            Sales analytics dashboard coming soon! This will include:
          </p>
          <ul className="space-y-2 text-sm text-white/60">
            <li>• Revenue trends and forecasting</li>
            <li>• Product performance metrics</li>
            <li>• Customer acquisition and retention</li>
            <li>• Conversion funnel analysis</li>
            <li>• Geographic sales distribution</li>
            <li>• Time-based sales patterns</li>
          </ul>
        </div>
      </Modal>
        </>
      )}
      </div>
    </>
  );
}

