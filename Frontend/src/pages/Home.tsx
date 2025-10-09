import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, LayoutDashboard, Users, Inbox, Activity, CreditCard, MapPin, Clock, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userCards = [
    { title: 'My Dashboard', icon: LayoutDashboard, path: '/user-dashboard', color: 'from-blue-500 to-cyan-500' },
    { title: 'Forms', icon: FileText, path: '/forms', color: 'from-green-500 to-emerald-500' },
    { title: 'Teams', icon: Users, path: '/team', color: 'from-orange-500 to-red-500' },
  ];

  const adminCards = [
    { title: 'Admin Dashboard', icon: Shield, path: '/admin-dashboard', color: 'from-blue-600 to-blue-800' },
    { title: 'Allot Orders', icon: Inbox, path: '/allot-orders', color: 'from-green-600 to-green-800' },
    { title: 'Teams', icon: Users, path: '/team', color: 'from-orange-600 to-orange-800' },
  ];

  const guestCards = [
    { title: 'Teams', icon: Users, path: '/team', color: 'from-blue-500 to-cyan-500' },
    { title: 'Mediators', icon: Inbox, path: '/mediator', color: 'from-green-500 to-emerald-500' },
  ];

  const cards = user?.role === 'admin' ? adminCards : user ? userCards : guestCards;

  const handleCardClick = (path: string) => {
    if (path && path !== '#') {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4 tracking-tight">
            EBD
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {user ? `Welcome back, ${user.name}!` : 'Your Order Management System'}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
        </motion.div>

        {!user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-12 max-w-2xl mx-auto text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
            <p className="text-gray-600 mb-6">Login to access all features and manage your orders</p>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105"
            >
              Login Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleCardClick(card.path)}
                className="group cursor-pointer"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:scale-105 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{card.title}</h3>
                  <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center">
              <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">Active</p>
              <p className="text-sm text-gray-600">System Status</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">24/7</p>
              <p className="text-sm text-gray-600">Support</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center">
              <CreditCard className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">Secure</p>
              <p className="text-sm text-gray-600">Payments</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center">
              <MapPin className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">Track</p>
              <p className="text-sm text-gray-600">Real-time</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;
