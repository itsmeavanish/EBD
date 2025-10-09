import React, { useState, useEffect } from 'react';
import OrderForm from '../components/OrderForm';
import OrderList from '../components/OrderList';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Order {
  _id?: string; // MongoDB ID
  address: string;
  product: string;
  brand?: string;
  season?: string;
  orderDate: string;
  quantity: number;
  amount: number;
  link: string;
}

function AllotOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();
    const token = localStorage.getItem('token') || '';
  // 🔹 Fetch orders from DB on component mount
 useEffect(() => {
  const fetchOrders = async () => {
    try {
      const res = await axios.get('https://ebd-mocha.vercel.app/api/auth/admin/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        // Normalize isPlaced as string
        const normalized = res.data.orders.map((o: any) => ({
          ...o,
          isPlaced: o.isPlaced ? String(o.isPlaced) : 'pending', 
          id: o._id, // assign id for OrderList
        }));
        setOrders(normalized);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err.response?.data || err.message);
    }
  };
  fetchOrders();
}, [token]);


  // 🔹 Add order to DB and update state
  const handleAddOrder = async (orderData: Omit<Order, '_id'>) => {
    try {
      const transformedData = {
        orderId: " ",
        quantity: orderData.quantity,
        price: orderData.amount,
        date: orderData.orderDate,
        productName: orderData.product,
        brandName: orderData.brand || '',
        season: orderData.season || '',
        address: orderData.address,
        reviewerName: '',
        mediatorName: '',
        otherAddress: '',
        email: user?.email || '',
        link: orderData.link || '',
        isPlaced: false,
        isAlloted: false,
      };

      const res = await axios.post('https://ebd-mocha.vercel.app/api/auth/upload/orders', transformedData);
      setOrders(prev => [res.data.order, ...prev]);
    } catch (err) {
      console.error('Failed to add order:', err);
    }
  };

  // 🔹 Delete order from DB and update state
  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await axios.delete(`https://ebd-mocha.vercel.app/api/auth/admin/orders/${id}`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
      });
      setOrders(prev => prev.filter(order => order._id !== id));
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  // 🔹 Update order in DB and update state
  const handleUpdateOrder = async (id: string, updatedOrder: Partial<Order>) => {
    try {
      const res = await axios.put(`https://ebd-mocha.vercel.app/api/auth/admin/orders/${id}`, updatedOrder,{
        headers:{
            Authorization:`Bearer ${token}`
        }
      });
      setOrders(prev => prev.map(order => (order._id === id ? res.data.order : order)));
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-5xl">EBD</span>
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Admin Order Management System</p>
        </div>

        <div className="space-y-8">
          <OrderForm onAddOrder={handleAddOrder} />
          <OrderList
            orders={orders}
            onDeleteOrder={handleDeleteOrder}
            onUpdateOrder={handleUpdateOrder}
          />
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${orders.reduce((sum, order) => sum + order.price, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Unalloted Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(order => order.status === 'pending').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Delivered Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.filter(order => order.status === 'delivered').length}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AllotOrders;
