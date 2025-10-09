import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, DollarSign, Calendar, TrendingUp, ListFilter as Filter, Search } from 'lucide-react';

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
}

interface BrandStats {
  totalOrders: number;
  totalRevenue: number;
  allOrders: number;
  pendingOrders: number;
  allotedOrders: number;
  confirmedOrders: number;
}

const BrandPortal: React.FC = () => {
  const { user } = useAuth();
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<BrandStats | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchBrandData();
    }
  }, [selectedBrand, startDate, endDate, selectedSeason, selectedStatus]);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ebd-mocha.vercel.app/api/brands/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBrands(data.brands);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrandData = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedSeason) params.append('season', selectedSeason);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(
        `https://ebd-mocha.vercel.app/api/brands/dashboard/${selectedBrand}?${params}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching brand data:', error);
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

  const filteredOrders = orders.filter(o =>
    o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const placedOrders = filteredOrders.filter(o => o.isPlaced);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-8 h-8 animate-pulse text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading brand portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand Portal</h1>
              <p className="text-gray-600">View orders and performance metrics by brand</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Choose a brand</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedBrand && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{stats.totalOrders}</p>
                  <p className="text-xs text-gray-600 text-center">Placed</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-2">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                  </div>
                  <p className="text-2xl font-bold text-teal-600">₹{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 text-center">Revenue</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.allOrders}</p>
                  <p className="text-xs text-gray-600 text-center">All Orders</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                  <p className="text-xs text-gray-600 text-center">Pending</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-sky-600" />
                  </div>
                  <p className="text-2xl font-bold text-sky-600">{stats.allotedOrders}</p>
                  <p className="text-xs text-gray-600 text-center">Allotted</p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{stats.confirmedOrders}</p>
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">Orders for {selectedBrand}</h2>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders found for this brand</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderId}</h3>
                          <p className="text-gray-600">{order.productName}</p>
                          <p className="text-sm text-blue-600 font-medium">Customer: {order.userName} ({order.email})</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">₹{order.price}</p>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {placedOrders.length > 0 && (
              <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Completed Orders</p>
                    <p className="text-2xl font-bold text-green-600">{placedOrders.length}</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Payment</p>
                    <p className="text-2xl font-bold text-teal-600">
                      ₹{placedOrders.reduce((sum, order) => sum + order.price, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{placedOrders.length > 0 ? Math.round(placedOrders.reduce((sum, order) => sum + order.price, 0) / placedOrders.length).toLocaleString() : 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!selectedBrand && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Brand</h3>
            <p className="text-gray-600">Choose a brand from the dropdown above to view its orders and performance metrics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandPortal;
