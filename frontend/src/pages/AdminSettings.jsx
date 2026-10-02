import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { adminAuth } from '../services/api';

const AdminSettings = () => {
  const { admin, adminToken } = useAuth();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!admin || admin.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <AlertCircle className="mx-auto mb-4" size={48} />
          <p>Unauthorized access</p>
        </div>
      </div>
    );
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Please fill all password fields');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      await adminAuth.changePassword(
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        },
        adminToken
      );
      setSuccess('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
          <p className="text-gray-600">Change your admin password</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-start gap-2">
            <CheckCircle size={18} className="mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={onChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter current password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={onChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
