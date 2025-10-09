import React, { useState } from 'react';
import { Package, DollarSign, Calendar, TrendingUp, Search, Lock, LogIn } from 'lucide-react';

interface Order {
  _id: string;
  orderId: string;
  price: number;
  date: string;
  productName: string;
  brandName: string;
  season?: string;
  userName: string;
  email: string;
  isPlaced: boolean;
  isAlloted: boolean;
  isConfirmed: boolean;
  submittedAt: string;
  quantity: number;
  address: string;
}

interface BrandStats {
  totalOrders: number;
  totalRevenue: number;
  allOrders: number;
  pendingOrders: number;
  allotedOrders: number;
  confirmedOrders: number;
}

interface BrandData {
  brandName: string;
  stats: BrandStats;
  orders: Order[];
}

const BrandAccess: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://ebd-mocha.vercel.app/api/brands/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brandName, accessKey }),
      });

      const data = await response.json();

      if (data.success) {
        setBrandData(data);
        setIsAuthenticated(true);
        sessionStorage.setItem('brandAccess', JSON.stringify({ brandName, accessKey }));
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setBrandData(null);
    setBrandName('');
    setAccessKey('');
    sessionStorage.removeItem('brandAccess');
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

  const filterOrders = () => {
    if (!brandData) return [];

    let filtered = brandData.orders;

    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.submittedAt);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });
    }

    if (selectedSeason) {
      filtered = filtered.filter(order => order.season === selectedSeason);
    }

    if (selectedStatus === 'placed') {
      filtered = filtered.filter(order => order.isPlaced);
    } else if (selectedStatus === 'alloted') {
      filtered = filtered.filter(order => order.isAlloted);
    } else if (selectedStatus === 'confirmed') {
      filtered = filtered.filter(order => order.isConfirmed);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredOrders = filterOrders();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Brand Portal Access</h2>
              <p className="text-gray-600">Enter your credentials to view your orders</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  id="brandName"
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your brand name"
                />
              </div>

              <div>
                <label htmlFor="accessKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Access Key
                </label>
                <input
                  id="accessKey"
                  type="password"
                  required
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your access key"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Access Portal
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> If you don't have access credentials, please contact your account manager.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{brandData?.brandName}</h1>
                <p className="text-gray-600">Brand Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {brandData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{brandData.stats.totalOrders}</p>
                  <p className="text-xs text-gray-600 text-center">Placed</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-2">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                  </div>
                  <p className="text-2xl font-bold text-teal-600">₹{brandData.stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 text-center">Revenue</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{brandData.stats.allOrders}</p>
                  <p className="text-xs text-gray-600 text-center">All Orders</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{brandData.stats.pendingOrders}</p>
                  <p className="text-xs text-gray-600 text-center">Pending</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-sky-600" />
                  </div>
                  <p className="text-2xl font-bold text-sky-600">{brandData.stats.allotedOrders}</p>
                  <p className="text-xs text-gray-600 text-center">Allotted</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{brandData.stats.confirmedOrders}</p>
                  <p className="text-xs text-gray-600 text-center">Confirmed</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Filter Orders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Seasons</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Status</option>
                    <option value="placed">Placed</option>
                    <option value="alloted">Allotted</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Orders</h2>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderId}</h3>
                          <p className="text-gray-600">{order.productName}</p>
                          <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                          <p className="text-sm text-blue-600 font-medium">Customer: {order.userName} ({order.email})</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">₹{order.price.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(order.submittedAt)}
                          </p>
                          <div className="flex gap-2 mt-2 justify-end">
                            {order.isPlaced && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Placed</span>
                            )}
                            {order.isAlloted && (
                              <span className="px-2 py-1 bg-sky-100 text-sky-800 rounded-full text-xs">Allotted</span>
                            )}
                            {order.isConfirmed && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Confirmed</span>
                            )}
                            {!order.isPlaced && !order.isAlloted && !order.isConfirmed && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Order Date:</span> {order.date}</p>
                        {order.season && <p><span className="font-medium">Season:</span> {order.season}</p>}
                        <p><span className="font-medium">Delivery Address:</span> {order.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrandAccess;
