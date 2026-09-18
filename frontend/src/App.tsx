import { useState, useEffect } from 'react';
import api from './services/api';
import Sidebar, { type TabType } from './components/Sidebar';
import Header from './components/Header';
import DashboardTab from './features/dashboard/DashboardTab';
import OrdersTab from './features/orders/OrdersTab';
import LogisticsTab from './features/logistics/LogisticsTab';
import CatalogTab from './features/catalog/CatalogTab';
import SettingsTab from './features/settings/SettingsTab';
import ShippingModal from './features/orders/components/ShippingModal';
import LoginPage from './features/auth/LoginPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [blanks, setBlanks] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingBlanks, setLoadingBlanks] = useState(true);
  const [shippingModalOrder, setShippingModalOrder] = useState<any | null>(null);

  // Authentication State
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('printing_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Fetch functions (only run if logged in)
  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchBlanks = async () => {
    if (!user) return;
    setLoadingBlanks(true);
    try {
      // Admin thấy cả phôi đã tắt (?all=1) để quản lý; role khác chỉ thấy active.
      const res = await api.get(user.role === 'ADMIN' ? '/api/blanks?all=1' : '/api/blanks');
      setBlanks(res.data);
    } catch (err) {
      console.error('Error fetching blanks:', err);
    } finally {
      setLoadingBlanks(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchBlanks();
      // Poll for changes every 10 seconds
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLoginSuccess = (token: string, userData: any) => {
    localStorage.setItem('printing_auth_token', token);
    localStorage.setItem('printing_auth_user', JSON.stringify(userData));
    setUser(userData);
    setActiveTab('dashboard');
  };

  // Tab guard: tự động chuyển về dashboard nếu role hiện tại không có quyền truy cập tab đó
  useEffect(() => {
    if (!user) return;
    if (user.role === 'OPERATOR' && ['logistics', 'catalog', 'settings'].includes(activeTab)) {
      setActiveTab('dashboard');
    } else if (user.role === 'LOGISTICS' && ['orders', 'catalog', 'settings'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [user, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('printing_auth_token');
    localStorage.removeItem('printing_auth_user');
    setUser(null);
    setOrders([]);
    setBlanks([]);
  };

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'RECEIVED') nextStatus = 'PRINTING';
    else if (currentStatus === 'PRINTING') nextStatus = 'PACKAGED';
    else return;

    try {
      const res = await api.put(`/api/orders/${orderId}/status`, { status: nextStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
    } catch (err: any) {
      alert('Lỗi cập nhật trạng thái: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleShipOrder = async (carrier: 'GHN' | 'GHTK') => {
    if (!shippingModalOrder) return;
    try {
      const res = await api.post(`/api/orders/${shippingModalOrder._id}/ship`, { carrier });
      setOrders(prev => prev.map(o => o._id === shippingModalOrder._id ? res.data : o));
      setShippingModalOrder(null);
    } catch (err: any) {
      alert('Lỗi ủy quyền vận chuyển: ' + (err.response?.data?.error || err.message));
      throw err;
    }
  };

  // If not logged in, render the login page
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Helper stats builder
  const stats = {
    received: orders.filter(o => o.status === 'RECEIVED').length,
    printing: orders.filter(o => o.status === 'PRINTING').length,
    packaged: orders.filter(o => o.status === 'PACKAGED').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    totalRevenue: blanks.length > 0 ? orders.reduce((sum, o) => {
      const orderCost = o.items.reduce((itemSum: number, item: any) => {
        let cost = 50000;
        for (const b of blanks) {
          const match = b.variations?.find((v: any) => v.sku === item.sku);
          if (match) {
            cost = match.base_cost;
            break;
          }
        }
        return itemSum + (cost * item.quantity);
      }, 0);
      return sum + orderCost;
    }, 0) : 0
  };

  const pendingJobsCount = stats.received + stats.printing + stats.packaged;

  return (
    <div className="min-h-screen flex text-slate-800 bg-slate-50 font-sans">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingJobsCount={pendingJobsCount}
        onRefresh={() => { fetchOrders(); fetchBlanks(); }}
        userRole={user.role}
      />

      {/* Main panel */}
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
        {/* Header */}
        <Header activeTab={activeTab} user={user} onLogout={handleLogout} />

        {/* Tab display switch */}
        <div className="flex-1 p-6 md:p-8 animate-fade-in">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              orders={orders}
              blanks={blanks}
              stats={stats}
              loadingOrders={loadingOrders}
              onUpdateStatus={handleUpdateStatus}
              onOpenShipModal={setShippingModalOrder}
              onNavigateToOrders={() => setActiveTab('orders')}
              onNavigateToLogistics={() => setActiveTab('logistics')}
              userRole={user.role}
            />
          )}

          {activeTab === 'orders' && (user.role === 'ADMIN' || user.role === 'OPERATOR') && (
            <OrdersTab 
              orders={orders}
              loadingOrders={loadingOrders}
              onUpdateStatus={handleUpdateStatus}
              onOpenShipModal={setShippingModalOrder}
              onRefresh={fetchOrders}
              userRole={user.role}
            />
          )}

          {activeTab === 'logistics' && (user.role === 'ADMIN' || user.role === 'LOGISTICS') && (
            <LogisticsTab
              orders={orders}
              userRole={user.role}
              onOpenShipModal={setShippingModalOrder}
            />
          )}

          {activeTab === 'catalog' && user.role === 'ADMIN' && (
            <CatalogTab 
              blanks={blanks}
              loadingBlanks={loadingBlanks}
              userRole={user.role}
              onRefresh={fetchBlanks}
            />
          )}

          {activeTab === 'settings' && user.role === 'ADMIN' && (
            <SettingsTab user={user} />
          )}
        </div>
      </main>

      {/* Shipping Modal */}
      {shippingModalOrder && (
        <ShippingModal 
          order={shippingModalOrder}
          onClose={() => setShippingModalOrder(null)}
          onShip={handleShipOrder}
        />
      )}
    </div>
  );
}

