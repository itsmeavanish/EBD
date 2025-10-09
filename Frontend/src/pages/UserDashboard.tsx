import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, RefreshCw, Calendar, DollarSign, User, CheckCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
  isPlaced: boolean;
}

interface AllottedOrder {
  _id: string;
  product: string;
  price: number;
  quantity: number;
  address: string;
  date: string;
  link: string;
  email: string;
  isPlaced: boolean;
  createdAt: string;
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
}

const UserDashboard: React.FC = () => {
  const { user, updateOrder,orders: globalOrders } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allottedOrders, setAllottedOrders] = useState<AllottedOrder[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'allotted' | 'placed' | 'refunds'>('allotted');
  
  useEffect(() => {
    const fetchUserData = async () => {
    if (!user?.email) {
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [placedOrdersRes, allottedOrdersRes, refundOrdersRes] = await Promise.all([
        fetch(`https://ebd-mocha.vercel.app/api/auth/upload/fetchfile?email=${user.email}`, { headers }),
        fetch(`https://ebd-mocha.vercel.app/api/auth/admin/orders`, { headers }),
        fetch(`https://ebd-mocha.vercel.app/api/refunds/refunds`, { headers })
      ]);

      const placedData = await placedOrdersRes.json();
      const allottedData = await allottedOrdersRes.json();
      const refundData = await refundOrdersRes.json();

      if (placedOrdersRes.ok && placedData.success) {
        setOrders(placedData.files);
      }
      if (refundOrdersRes.ok && refundData.success) {
        console.log("refund vala",refundData.refunds);
        setRefunds(refundData.refunds);
      }
      if (allottedOrdersRes.ok && allottedData.success) {
        const userAllotted = allottedData.orders.filter((order: AllottedOrder) => order.email === user.email);
        setAllottedOrders(userAllotted);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

    fetchUserData();
  }, [orders.length, user?.email]);

 
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const handlePlaceOrder = (orderId: string) => {
  const order = pendingOrders.find(o => o._id === orderId);

  if (order) {
    updateOrder(order); // store the full order object
    console.log("Placing order:", order);
  }

  navigate('/forms/orderforms');
};

const handleRefund = (orderId: string) => {
  const order = placedOrders.find(o => o._id === orderId);

  if (order) {
    updateOrder(order); // store the full order object
    console.log("Requesting refund for order:", order);
  }

  navigate('/forms/refundforms');
};

  const placedOrders = orders.filter(order => order.isPlaced === true);
  console.log("placed vala",placedOrders);
  const  pendingOrders = orders.filter(order => order.isPlaced === false);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
              <p className="text-gray-600">Manage your orders and track your progress</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-orange-50 p-4 rounded-lg cursor-pointer"
            >
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">{pendingOrders.length}</p>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-blue-50 p-4 rounded-lg cursor-pointer"
            >
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{placedOrders.length}</p>
                  <p className="text-sm text-gray-600">Placed Orders</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-green-50 p-4 rounded-lg cursor-pointer"
            >
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{orders.length}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-purple-50 p-4 rounded-lg cursor-pointer"
            >
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{[...orders, ...allottedOrders].reduce((sum, order) => sum + parseFloat(order.price?.toString() || '0'), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Value</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg mb-8">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('allotted')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors relative ${
                activeTab === 'allotted'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Pending Orders ({pendingOrders.length})</span>
              </div>
              {activeTab === 'allotted' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('placed')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors relative ${
                activeTab === 'placed'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Placed Orders ({placedOrders.length})</span>
              </div>
              {activeTab === 'placed' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('refunds')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors relative ${
                activeTab === 'refunds'
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5" />
                <span>Refunds ({refunds.length})</span>
              </div>
              {activeTab === 'refunds' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                />
              )}
            </button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'allotted' && (
                <motion.div
                  key="allotted"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {pendingOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No pending orders</p>
                      <p className="text-gray-400 text-sm">All orders have been placed</p>
                    </div>
                  ) : (
                    pendingOrders.map((order) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                              <h3 className="text-lg font-semibold text-gray-900">Action Required</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-800 mb-2">{order.product}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                Qty: {order.quantity}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ₹{order.price}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(order.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/50 rounded-lg p-4 mb-4">
                          <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Delivery Address:</span> {order.address}</p>
                          {order.link && (
                            <a
                              href={order.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Product Link
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handlePlaceOrder(order._id)}
                          className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <Package className="w-5 h-5" />
                          Place This Order Now
                        </button>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

             {activeTab === 'placed' && (
  <motion.div
    key="placed"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
    className="space-y-4"
  >
    {placedOrders.length === 0 ? (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No orders placed yet</p>
        <p className="text-gray-400 text-sm">Start placing your allotted orders</p>
      </div>
    ) : (
      placedOrders.map((order) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">PLACED</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderId}</h3>
              <p className="text-gray-600">{order.productName}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">₹{order.price}</p>
              <p className="text-sm text-gray-500">
                <Calendar className="w-4 h-4 inline mr-1" />
                {formatDate(order.submittedAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p><span className="font-medium">Address:</span> {order.address}</p>
              <p><span className="font-medium">Reviewer:</span> {order.reviewerName}</p>
            </div>
            <div>
              <p><span className="font-medium">Order Date:</span> {order.date}</p>
              <p><span className="font-medium">Mediator:</span> {order.mediatorName}</p>
            </div>
          </div>

          {/* Refund Button */}
          <div className="text-right">
            <button
              onClick={() => handleRefund(order._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Refund
            </button>
          </div>
        </motion.div>
      ))
    )}
  </motion.div>
)}

              {activeTab === 'refunds' && (
                <motion.div
                  key="refunds"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {refunds.length === 0 ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No refund requests</p>
                      <p className="text-gray-400 text-sm">You haven't requested any refunds</p>
                    </div>
                  ) : (
                    refunds.map((refund) => (
                      <div key={refund.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Refund for Order #{refund.orderId}</h3>
                            <p className="text-gray-600">{refund.productName}</p>
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
                            <p><span className="font-medium">Customer:</span> {refund.customerName}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Original Order Date:</span> {refund.originalOrderDate}</p>
                            <p><span className="font-medium">Mediator:</span> {refund.mediatorName}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
