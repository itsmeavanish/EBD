import React, { useEffect, useState } from 'react';
import { CreditCard as Edit2, Trash2, Package, Calendar, DollarSign, User } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
export interface Order {
  id: string;
  address: string;
  product: string;
  ecommercePlatform?: string;
  orderDate: string;
  quantity: number;
  amount: number;
  link: string;
  email?: string; // <-- added to track allotted user
  isAlloted?: boolean;
  isPaymentUploaded?: boolean;
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
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [allocateForOrderId, setAllocateForOrderId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [rows, setRows] = useState<Array<{ address: string; quantity: number; paymentAmount: number }>>([
    { address: '', quantity: 1, paymentAmount: 0 }
  ]);
  const [allocateUploading, setAllocateUploading] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentUploadingFor, setPaymentUploadingFor] = useState<string | null>(null);

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

  function openAllocate(orderId: string) {
    setAllocateForOrderId(orderId);
    setAllocateOpen(true);
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

  async function handleUploadPayment(orderId: string, file: File) {
    try {
      setPaymentUploadingFor(orderId);
      const form = new FormData();
      form.append('paymentScreenshot', file);
      const response = await fetch(`https://ebd-mocha.vercel.app/api/auth/upload/orders/${orderId}/payment-screenshot`, {
        method: 'POST',
        body: form,
      });
      if (!response.ok) throw new Error('Payment upload failed');
      const data = await response.json();
      onUpdateOrder(orderId, { isPaymentUploaded: true } as any);
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentUploadingFor(null);
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
                        <div className="flex gap-2">
                          <button
                            className={`px-3 py-3 rounded-full text-xs font-bold ${getStatusColor("delivered")}`}
                            onClick={() => handleAllot(order.id)}
                          >
                            Quick Allot
                          </button>
                          <button
                            className="px-3 py-3 rounded-full text-xs font-bold bg-sky-100 text-sky-700 hover:bg-sky-200"
                            onClick={() => openAllocate(order.id)}
                          >
                            Allocate (Multi)
                          </button>
                        </div>
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
                        {order.ecommercePlatform && (
                          <div className="text-xs text-gray-500">{order.ecommercePlatform}</div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 items-center">
                        {order.isAlloted && !order.isPaymentUploaded && (
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-red-600 font-medium">Payment Left</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadPayment(order.id, f);
                              }}
                              className="text-xs"
                            />
                          </div>
                        )}
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

      {/* Allocate Modal (Multi-address) */}
      <AnimatePresence>
        {allocateOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-4 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button onClick={() => setAllocateOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
              <h3 className="text-lg font-semibold text-gray-800">Allocate Order</h3>

              <div>
                <label className="block text-sm font-medium mb-1">Select User</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={selectedUser?.email || ''}
                  onChange={(e) => {
                    const u = users.find(x => x.email === e.target.value);
                    setSelectedUser(u ? { id: u.id || u._id || '', name: u.name, email: u.email } : null);
                  }}
                >
                  <option value="">Choose user...</option>
                  {users.map(u => (
                    <option key={u.id || u._id} value={u.email}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {rows.map((r, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      className="border rounded-lg px-3 py-2"
                      value={r.address}
                      onChange={(e) => {
                        const v = e.target.value;
                        setRows(prev => prev.map((row, i) => i===idx ? { ...row, address: v } : row));
                      }}
                    >
                      <option value="">Select address</option>
                      <option value="Ayush - Kanpur">Ayush - Kanpur</option>
                      <option value="Vivek - Kanpur">Vivek - Kanpur</option>
                      <option value="Anuj - Firozabad">Anuj - Firozabad</option>
                      <option value="Anuj - Gorakhpur">Anuj - Gorakhpur</option>
                      <option value="Rahul - Gurgaon">Rahul - Gurgaon</option>
                      <option value="Yash - Gurgaon">Yash - Gurgaon</option>
                      <option value="Yash - Morena">Yash - Morena</option>
                      <option value="Shivam - Firozabad">Shivam - Firozabad</option>
                    </select>
                    <input
                      type="number"
                      className="border rounded-lg px-3 py-2"
                      min={1}
                      value={r.quantity}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setRows(prev => prev.map((row, i) => i===idx ? { ...row, quantity: v } : row));
                      }}
                      placeholder="Quantity"
                    />
                    <input
                      type="number"
                      className="border rounded-lg px-3 py-2"
                      min={0}
                      value={r.paymentAmount}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setRows(prev => prev.map((row, i) => i===idx ? { ...row, paymentAmount: v } : row));
                      }}
                      placeholder="Payment Amount"
                    />
                  </div>
                ))}
                <div className="flex justify-between">
                  <button
                    className="px-3 py-2 text-sm bg-gray-100 rounded-lg"
                    onClick={() => setRows(prev => [...prev, { address: '', quantity: 1, paymentAmount: 0 }])}
                  >
                    + Add Row
                  </button>
                  <div className="text-sm text-gray-600">Total: {rows.reduce((s, r) => s + (r.paymentAmount || 0), 0)}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payment Screenshot (optional)</label>
                <input type="file" accept="image/*" onChange={(e)=> setPaymentFile(e.target.files?.[0] || null)} />
              </div>

              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-200 rounded-lg" onClick={()=> setAllocateOpen(false)}>Cancel</button>
                <button
                  disabled={allocateUploading}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                  onClick={async ()=>{
                    if (!selectedUser) return;
                    try {
                      setAllocateUploading(true);
                      const form = new FormData();
                      const assignments = rows
                        .filter(r => r.address && r.quantity > 0)
                        .map(r => ({
                          address: r.address,
                          quantity: r.quantity,
                          paymentAmount: r.paymentAmount,
                          email: selectedUser.email,
                          userId: selectedUser.id,
                          userName: selectedUser.name,
                        }));
                      form.append('assignments', JSON.stringify(assignments));
                      if (paymentFile) form.append('paymentScreenshot', paymentFile);

                      const resp = await fetch(`https://ebd-mocha.vercel.app/api/auth/admin/orders/${allocateForOrderId}/allocate`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: form,
                      });
                      const data = await resp.json();
                      if (!data.success) throw new Error(data.message || 'Allocate failed');
                      setAllocateOpen(false);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setAllocateUploading(false);
                    }
                  }}
                >
                  {allocateUploading ? 'Allocating...' : 'Allocate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default OrderList;
