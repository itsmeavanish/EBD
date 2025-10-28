import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Package, RefreshCw, Calendar, DollarSign, Shield, Search, ListFilter as Filter, SquareCheck as CheckSquare, User } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface Order {
  _id: string;
  orderId: string;
  price: number;
  date: string;
  productName: string;
  brandName: string;
  address: string;
  reviewerName: string;
  mediatorName: string;
  screenshot: string | null;
  submittedAt: string;
  userId: string;
  userName: string;
  email: string;
  isPlaced: boolean;
  isConfirmed: boolean;
  isAlloted: boolean;
}

interface Refund {
  _id: string;
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

const EnhancedAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders'|'unallotedorders' | 'refunds' | 'payment'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [orderStatus, setOrderStatus] = useState('all');
  const [brands, setBrands] = useState<string[]>([]);

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showAllotModal, setShowAllotModal] = useState(false);

  const [selectedUserForPayment, setSelectedUserForPayment] = useState('');
  const [paymentHistory, setPaymentHistory] = useState<Order[]>([]);
  const [paymentTotal, setPaymentTotal] = useState(0);

  useEffect(() => {
    fetchAdminData();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (startDate || endDate || selectedBrand !== 'all' || orderStatus !== 'all') {
      fetchFilteredOrders();
    }
  }, [startDate, endDate, selectedBrand, orderStatus]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [usersRes, ordersRes, refundsRes] = await Promise.all([
        fetch('http://localhost:3001/api/auth/admin/users', { headers }),
        fetch('http://localhost:3001/api/auth/admin/orders', { headers }),
        fetch('http://localhost:3001/api/auth/admin/refunds', { headers })
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
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/brands/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBrands(data.brands);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchFilteredOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedBrand !== 'all') params.append('brandName', selectedBrand);
      if (orderStatus !== 'all') params.append('status', orderStatus);

      const response = await fetch(`http://localhost:3001/api/auth/admin/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching filtered orders:', error);
    }
  };

  const fetchPaymentHistory = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/auth/admin/users/${userId}/payment-history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setPaymentHistory(data.orders);
        setPaymentTotal(data.totalAmount);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handleBulkAllot = async () => {
    if (selectedOrders.length === 0 || !selectedUserId) {
      alert('Please select orders and a user');
      return;
    }

    const selectedUser = users.find(u => u._id === selectedUserId);
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/admin/orders/bulk-allot', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderIds: selectedOrders,
          userId: selectedUser._id,
          userName: selectedUser.name,
          userEmail: selectedUser.email
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`${data.modifiedCount} orders alloted successfully`);
        setSelectedOrders([]);
        setShowAllotModal(false);
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error bulk allotting orders:', error);
      alert('Error allotting orders');
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
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
    o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRefunds = refunds.filter(r =>
    r.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const placedOrders = orders.filter(order => order.isPlaced === true);
  const confirmedOrders = orders.filter(order => order.isConfirmed === true);
  const unAllotedOrders = orders.filter(order => !order.isAlloted);
  const allotedOrders = orders.filter(order => order.isAlloted);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-slate-600 rounded-full flex items-center justify-center mr-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name} - System Administrator</p>
            </div>
          </div>

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
                  <p className="text-sm text-gray-600">Placed Orders</p>
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
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-slate-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-slate-600">
                    ₹{orders.reduce((sum, order) => sum + (order.price || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg mb-8">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'orders'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Orders ({allotedOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('unallotedorders')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'unallotedorders'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Allot Orders ({unAllotedOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('refunds')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'refunds'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Refunds ({refunds.length})
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'payment'
                ? 'text-slate-600 border-b-2 border-slate-600 bg-slate-50'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Payment History
            </button>
          </div>

          <div className="p-6">
            {activeTab !== 'overview' && activeTab !== 'payment' && (
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {(activeTab === 'orders' || activeTab === 'unallotedorders') && (
              <div className="mb-6 space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="End Date"
                  />
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>

                {selectedOrders.length > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{selectedOrders.length} orders selected</span>
                    <button
                      onClick={() => setShowAllotModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Bulk Allot
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {placedOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
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
                      <div key={u._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-gray-600">{u.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
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
                    <div key={u._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
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
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {u.role === 'admin' ? 'Administrator' : 'User'}
                          </span>
                          <p className="text-sm text-gray-500 mt-2">
                            {orders.filter(o => o.userId === u._id).length} orders
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'unallotedorders' && (
              <div className="space-y-4">
                {unAllotedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </div>
                ) : (
                  unAllotedOrders.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => toggleOrderSelection(order._id)}
                          className="mt-1 w-5 h-5 text-blue-600"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderId}</h3>
                              <p className="text-gray-600">{order.productName}</p>
                              <p className="text-sm text-blue-600 font-medium">Customer: {order.userName} ({order.email})</p>
                              {order.brandName && (
                                <p className="text-sm text-slate-600">Brand: {order.brandName}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">₹{order.price}</p>
                              <p className="text-sm text-gray-500">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {formatDate(order.submittedAt)}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {order.isPlaced && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Placed</span>
                                )}
                                {order.isConfirmed && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Confirmed</span>
                                )}
                                {order.isAlloted && (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-full text-xs">Alloted</span>
                                )}
                              </div>
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
                    <div key={refund._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Refund for Order #{refund.orderId}</h3>
                          <p className="text-gray-600">{refund.productName}</p>
                          <p className="text-sm text-blue-600 font-medium">Customer: {refund.userName} ({refund.userEmail})</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${refund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
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
            {activeTab === 'orders' && (
                          <div className="space-y-4">
                            {allotedOrders.length === 0 ? (
                              <div className="text-center py-8">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No orders found</p>
                              </div>
                            ) : (
                              allotedOrders.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderId}</h3>
                              <p className="text-gray-600">{order.productName}</p>
                              <p className="text-sm text-blue-600 font-medium">Customer: {order.userName} ({order.email})</p>
                              {order.brandName && (
                                <p className="text-sm text-slate-600">Brand: {order.brandName}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">₹{order.price}</p>
                              <p className="text-sm text-gray-500">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {formatDate(order.submittedAt)}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {order.isPlaced && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Placed</span>
                                )}
                                {order.isConfirmed && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Confirmed</span>
                                )}
                                {order.isAlloted && (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-full text-xs">Alloted</span>
                                )}
                              </div>
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
                      </div>
                    </div>
                  ))
                            )}
                          </div>
                        )}
            

            {activeTab === 'payment' && (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User to View Payment History
                  </label>
                  <select
                    value={selectedUserForPayment}
                    onChange={(e) => {
                      setSelectedUserForPayment(e.target.value);
                      if (e.target.value) {
                        fetchPaymentHistory(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a user</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>

                {selectedUserForPayment && (
                  <div>
                    <div className="bg-slate-50 p-6 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Orders</p>
                          <p className="text-2xl font-bold text-slate-600">{paymentHistory.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-green-600">₹{paymentTotal.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {paymentHistory.map((order) => (
                        <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderId}</h3>
                              <p className="text-gray-600">{order.productName}</p>
                              {order.brandName && (
                                <p className="text-sm text-slate-600">Brand: {order.brandName}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600">₹{order.price}</p>
                              <p className="text-sm text-gray-500">{formatDate(order.submittedAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
            )}
          </div>
        </div>
      </div>
      

      {showAllotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Bulk Allot Orders</h3>
            <p className="text-sm text-gray-600 mb-4">
              Allotting {selectedOrders.length} order(s) to:
            </p>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-6"
            >
              <option value="">Select a user</option>
              {users.filter(u => u.role === 'user').map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <div className="flex gap-4">
              <button
                onClick={handleBulkAllot}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm Allotment
              </button>
              <button
                onClick={() => {
                  setShowAllotModal(false);
                  setSelectedUserId('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAdminDashboard;
