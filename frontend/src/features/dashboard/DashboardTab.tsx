import AdminDashboard from './components/AdminDashboard';
import OperatorDashboard from './components/OperatorDashboard';
import LogisticsDashboard from './components/LogisticsDashboard';

interface DashboardTabProps {
  orders: any[];
  blanks: any[];
  stats: {
    received: number;
    printing: number;
    packaged: number;
    shipped: number;
    totalRevenue: number;
  };
  loadingOrders: boolean;
  onUpdateStatus: (orderId: string, currentStatus: string) => void;
  onOpenShipModal: (order: any) => void;
  onNavigateToOrders: () => void;
  onNavigateToLogistics?: () => void;
  userRole: string;
}

export default function DashboardTab({
  orders,
  blanks,
  stats,
  loadingOrders,
  onUpdateStatus,
  onOpenShipModal,
  onNavigateToOrders,
  onNavigateToLogistics = onNavigateToOrders,
  userRole
}: DashboardTabProps) {
  if (userRole === 'OPERATOR') {
    return (
      <OperatorDashboard
        orders={orders}
        stats={stats}
        loadingOrders={loadingOrders}
        onUpdateStatus={onUpdateStatus}
        onNavigateToOrders={onNavigateToOrders}
      />
    );
  }

  if (userRole === 'LOGISTICS') {
    return (
      <LogisticsDashboard
        orders={orders}
        stats={stats}
        loadingOrders={loadingOrders}
        onOpenShipModal={onOpenShipModal}
        onNavigateToLogistics={onNavigateToLogistics}
      />
    );
  }

  // Default: ADMIN layout with complete financial & operational view
  return (
    <AdminDashboard
      orders={orders}
      blanks={blanks}
      stats={stats}
      loadingOrders={loadingOrders}
      onUpdateStatus={onUpdateStatus}
      onOpenShipModal={onOpenShipModal}
      onNavigateToOrders={onNavigateToOrders}
    />
  );
}
