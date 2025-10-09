import React, { useEffect, useState } from 'react';
import { CreditCard as Edit2, Trash2, Package, Calendar, DollarSign, User } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
export interface Order {
  id: string;
  address: string;
  product: string;
  orderDate: string;
  quantity: number;
  amount: number;
  link: string;
  email?: string; // <-- added to track allotted user
}

interface OrderListProps {
  orders: Order[];
  onDeleteOrder: (id: string) => void;
  onUpdateOrder: (id: string, updatedOrder: Partial<Order>) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onDeleteOrder, onUpdateOrder }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Order>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [allot, setAllot] = useState(false);
  const [allotedId, setAllottedid] = useState<string>("");

  const token = localStorage.getItem('token');

  // fetch users for allotment
  useEffect(() => {
    const headers = {
      'Authorization': `Bearer ${token}`,
    };
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://ebd-mocha.vercel.app/api/auth/admin/users', { headers });
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setEditForm(order);
  };

  const handleSave = () => {
    if (editingId && editForm) {
      onUpdateOrder(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  function handleAllot(id: string) {
    setAllot(true);
    setAllottedid(id);
  }

  async function handleAllotUpdate(email: string) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // update email for selected order
      const response = await fetch(`http://localhost:3001/api/auth/admin/orders/${allotedId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed to allot order');

      const updatedOrder = await response.json();

      // update UI via parent callback
      onUpdateOrder(allotedId, { email });

      setAllot(false);
      setAllottedid("");
    } catch (error) {
      console.error('Error allotting order:', error);
    }
  }

  if (!orders.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No orders yet</p>
          <p className="text-gray-400">Add your first order using the form above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" /> Orders List
          </h2>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full">
            {orders.map((order) => {
              return (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
                  {editingId === order.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={editForm.address || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Address"
                        />
                        <input
                          type="text"
                          value={editForm.product || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, product: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Product"
                        />
                        <input
                          type="date"
                          value={editForm.orderDate || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, orderDate: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="number"
                          value={editForm.quantity || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Quantity"
                          min="1"
                        />
                        <input
                          type="number"
                          value={editForm.amount || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Amount"
                          step="0.01"
                          min="0"
                        />
                        <input
                          type="text"
                          value={editForm.link || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, link: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Link for order"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{order.address}</h3>
                            <p className="text-gray-600 text-sm">{order.product}</p>
                            {order.email && (
                              <p className="text-xs text-gray-500">Allotted to: {order.email}</p>
                            )}
                          </div>
                        </div>
                        <button
                          className={`px-3 py-3 rounded-full text-xs font-bold ${getStatusColor("delivered")}`}
                          onClick={() => handleAllot(order.id)}
                        >
                          Allot Order
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.date)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="w-4 h-4" />
                          Qty: {order.quantity}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(order.price)}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Edit Order"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Allot Modal */}

<AnimatePresence>
  {allot && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Modal container */}
      <motion.div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Close button */}
        <button
          onClick={() => setAllot(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold text-gray-800 mb-4">Allot Order</h3>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {users?.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <button
                onClick={() => handleAllotUpdate(u.email)}
                className="text-left"
              >
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-gray-600">{u.email}</p>
              </button>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  u.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default OrderList;
