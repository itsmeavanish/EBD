import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Package, RefreshCw, Calendar, DollarSign, Shield, Search } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface Order {
  id: string;
  orderId: string;
  price: string;
  date: string;
  productName: string;
  address: string;
  reviewerName: string;
  mediatorName: string;
  screenshot: string | null;
  submittedAt: string;
  userId: string;
  userName: string;
  userEmail: string;
}

interface Refund {
  id: string;
  orderId: string;
  refundAmount: string;
  reason: string;
  productName: string;
  originalOrderDate: string;
  customerName: string;
  mediatorName: string;
  screenshot: string | null;
  submittedAt: string;
  status: string;
  userId: string;
  userName: string;
  userEmail: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'refunds'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);
console.log("user h "+user);
  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [usersRes, ordersRes, refundsRes] = await Promise.all([
        fetch('https://ebd-mocha.vercel.app/api/auth/admin/users', { headers }),
        fetch('https://ebd-mocha.vercel.app/api/auth/admin/orders', { headers }),
        fetch('https://ebd-mocha.vercel.app/api/auth/admin/refunds', { headers })
      ]);

      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();
      const refundsData = await refundsRes.json();

      if (usersData.success) {
        setUsers(usersData.users);
      }
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
      if (refundsData.success) {
        setRefunds(refundsData.refunds);
      }
      console.log(ordersData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRefunds = refunds.filter(r => 
    r.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const placedOrders = orders.filter(order => order.isPlaced === true);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name} - System Administrator</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{placedOrders.length}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <RefreshCw className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">{refunds.length}</p>
                  <p className="text-sm text-gray-600">Refund Requests</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{orders.reduce((sum, order) => sum + parseFloat(order.price || '0'), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg mb-8">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Orders ({placedOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('refunds')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'refunds'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Refunds ({refunds.length})
            </button>
          </div>

          <div className="p-6">
            {/* Search Bar */}
            {activeTab !== 'overview' && (
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Content based on active tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {placedOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">#{order.orderId}</p>
                          <p className="text-sm text-gray-600">{order.userName}</p>
                        </div>
                        <p className="font-bold text-green-600">₹{order.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((u) => (
                      <div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-gray-600">{u.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No users found</p>
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <div key={u.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{u.name}</h3>
                          <p className="text-gray-600">{u.email}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Joined {formatDate(u.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role === 'admin' ? 'Administrator' : 'User'}
                          </span>
                          <p className="text-sm text-gray-500 mt-2">
                            {orders.filter(o => o.userId === u.id).length} orders
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {placedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </div>
                ) : (
                  placedOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderId}</h3>
                          <p className="text-gray-600">{order.productName}</p>
                          <p className="text-sm text-blue-600 font-medium">Customer: {order.userName} ({order.userEmail})</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">₹{order.price}</p>
                          <p className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(order.submittedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><span className="font-medium">Address:</span> {order.address}</p>
                          <p><span className="font-medium">Reviewer:</span> {order.reviewerName}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Order Date:</span> {order.date}</p>
                          <p><span className="font-medium">Mediator:</span> {order.mediatorName}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'refunds' && (
              <div className="space-y-4">
                {filteredRefunds.length === 0 ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No refund requests found</p>
                  </div>
                ) : (
                  filteredRefunds.map((refund) => (
                    <div key={refund.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Refund for Order #{refund.orderId}</h3>
                          <p className="text-gray-600">{refund.productName}</p>
                          <p className="text-sm text-blue-600 font-medium">Customer: {refund.userName} ({refund.userEmail})</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                            refund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            refund.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">₹{refund.refundAmount}</p>
                          <p className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(refund.submittedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><span className="font-medium">Reason:</span> {refund.reason}</p>
                          <p><span className="font-medium">Customer Name:</span> {refund.customerName}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Original Order Date:</span> {refund.originalOrderDate}</p>
                          <p><span className="font-medium">Mediator:</span> {refund.mediatorName}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;