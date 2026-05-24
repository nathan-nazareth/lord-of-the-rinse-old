import { createFileRoute } from '@tanstack/react-router';
import {
  IconPackage,
  IconCoin,
  IconClock,
  IconLeaf,
  IconArrowUpRight,
  IconArrowDownRight,
  IconEye,
  IconCheck,
} from '@tabler/icons-react';

interface Stat {
  label: string;
  value: string;
  change: number;
  icon: typeof IconPackage;
  color: 'terra' | 'botanical' | 'dusty' | 'ink';
}

interface Order {
  id: string;
  customer: string;
  items: string;
  total: string;
  status: 'confirmed' | 'pending' | 'shipped';
  date: string;
}

const stats: Stat[] = [
  { label: 'Total Orders', value: '1,284', change: 12.5, icon: IconPackage, color: 'terra' },
  { label: 'Revenue', value: '$24,680', change: 8.3, icon: IconCoin, color: 'botanical' },
  { label: 'Pending', value: '23', change: -4.2, icon: IconClock, color: 'dusty' },
  { label: 'Products', value: '36', change: 2.1, icon: IconLeaf, color: 'ink' },
];

const recentOrders: Order[] = [
  {
    id: '#ORD-0421',
    customer: 'Eleanor Vance',
    items: 'Lavender Dream × 2',
    total: '$58.00',
    status: 'confirmed',
    date: '2 min ago',
  },
  {
    id: '#ORD-0420',
    customer: 'Marcus Webb',
    items: 'Charcoal Detox × 1',
    total: '$32.00',
    status: 'shipped',
    date: '18 min ago',
  },
  {
    id: '#ORD-0419',
    customer: 'Sylvia Park',
    items: 'Rose Petal × 3, Honey Oat × 1',
    total: '$112.00',
    status: 'confirmed',
    date: '1 hr ago',
  },
  {
    id: '#ORD-0418',
    customer: 'Julian Hart',
    items: 'Tea Tree Mint × 2',
    total: '$54.00',
    status: 'pending',
    date: '2 hr ago',
  },
  {
    id: '#ORD-0417',
    customer: 'Clara Moss',
    items: 'Citrus Burst × 1, Lavender × 1',
    total: '$64.00',
    status: 'confirmed',
    date: '3 hr ago',
  },
];

const topProducts = [
  { name: 'Lavender Dream', sold: 342, revenue: '$10,944', trend: 'up' },
  { name: 'Charcoal Detox', sold: 218, revenue: '$6,976', trend: 'up' },
  { name: 'Honey Oat', sold: 187, revenue: '$6,358', trend: 'down' },
  { name: 'Rose Petal', sold: 156, revenue: '$5,772', trend: 'up' },
  { name: 'Tea Tree Mint', sold: 134, revenue: '$4,288', trend: 'down' },
];

const statusColor: Record<Order['status'], string> = {
  confirmed: 'bg-botanical-100 text-botanical-600 border-botanical-300',
  pending: 'bg-dusty-100 text-dusty-500 border-dusty-300',
  shipped: 'bg-[#e8e0f0] text-[#7a5a8a] border-[#d4c0e0]',
};

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const colorMap = {
    terra: 'bg-terra-100 text-terra-600',
    botanical: 'bg-botanical-100 text-botanical-600',
    dusty: 'bg-dusty-100 text-dusty-500',
    ink: 'bg-ink-100 text-ink-600',
  };

  return (
    <div
      className="card-apothecary p-5 animate-enter"
      style={{ animationDelay: `${0.06 * (index + 1)}s` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-accent tracking-widest uppercase text-ink-400">{stat.label}</p>
          <p className="font-display text-3xl font-semibold text-ink-800 tracking-tight">
            {stat.value}
          </p>
          <div
            className={`flex items-center gap-1 text-xs font-medium ${stat.change >= 0 ? 'text-botanical-600' : 'text-terra-500'}`}
          >
            {stat.change >= 0 ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
            <span>{Math.abs(stat.change)}%</span>
            <span className="text-ink-400 font-normal">vs last month</span>
          </div>
        </div>
        <div className={`rounded-xl p-3 ${colorMap[stat.color]}`}>
          <stat.icon size={22} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Order['status'] }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-accent font-medium tracking-wide border ${statusColor[status]}`}
    >
      {status === 'confirmed' && <IconCheck size={12} />}
      {status === 'pending' && <IconClock size={12} />}
      {status === 'shipped' && <IconPackage size={12} />}
      {status}
    </span>
  );
}

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-parchment-100">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-10 animate-enter">
          <div>
            <p className="text-xs font-accent tracking-[0.2em] uppercase text-ink-400 mb-1.5">
              Apothecary Back-office
            </p>
            <h1 className="font-display text-4xl font-semibold text-ink-800 tracking-tight">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="btn-apothecary btn-ghost text-sm gap-2">
              <IconEye size={16} />
              Preview Store
            </button>
            <button type="button" className="btn-apothecary btn-primary text-sm">
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 card-apothecary p-6 animate-enter delay-3">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-ink-700">Recent Orders</h2>
              <button
                type="button"
                className="text-sm font-accent tracking-wide text-terra-400 hover:text-terra-500 transition-colors"
              >
                View All &rarr;
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-parchment-300">
                    <th className="text-left pb-3 font-accent text-xs tracking-widest uppercase text-ink-400 font-medium">
                      Order
                    </th>
                    <th className="text-left pb-3 font-accent text-xs tracking-widest uppercase text-ink-400 font-medium">
                      Customer
                    </th>
                    <th className="text-left pb-3 font-accent text-xs tracking-widest uppercase text-ink-400 font-medium">
                      Items
                    </th>
                    <th className="text-right pb-3 font-accent text-xs tracking-widest uppercase text-ink-400 font-medium">
                      Total
                    </th>
                    <th className="text-center pb-3 font-accent text-xs tracking-widest uppercase text-ink-400 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-parchment-200/60 last:border-0 group transition-colors hover:bg-parchment-100/50"
                    >
                      <td className="py-3.5 font-accent text-xs text-ink-600">{order.id}</td>
                      <td className="py-3.5 font-medium text-ink-700">{order.customer}</td>
                      <td className="py-3.5 text-ink-500 max-w-[200px] truncate">{order.items}</td>
                      <td className="py-3.5 text-right font-accent font-medium text-ink-700">
                        {order.total}
                      </td>
                      <td className="py-3.5 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products Sidebar */}
          <div className="card-apothecary p-6 animate-enter delay-4">
            <h2 className="font-display text-xl font-semibold text-ink-700 mb-5">Top Products</h2>
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-4 group cursor-pointer">
                  <span className="font-accent text-xs text-ink-400 w-5 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-700 truncate group-hover:text-terra-500 transition-colors">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-ink-400 font-accent">{product.sold} sold</span>
                      <span className="text-xs font-accent font-medium text-botanical-600">
                        {product.revenue}
                      </span>
                    </div>
                  </div>
                  {product.trend === 'up' ? (
                    <IconArrowUpRight size={16} className="text-botanical-500 shrink-0" />
                  ) : (
                    <IconArrowDownRight size={16} className="text-dusty-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-parchment-300">
              <button
                type="button"
                className="w-full text-sm font-accent tracking-wide text-terra-400 hover:text-terra-500 transition-colors text-center"
              >
                View All Products &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center animate-enter delay-5">
          <div className="botanical-divider" />
          <p className="font-accent text-xs tracking-wider text-ink-400">
            Lord of the Rinse &middot; Apothecary Admin v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});
