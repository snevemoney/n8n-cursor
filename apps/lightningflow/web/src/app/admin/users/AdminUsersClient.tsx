'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// Move Supabase client creation to a function to avoid build-time initialization
function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Return null during SSR/build time
    return null;
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface User {
  id: string;
  email: string;
  is_admin: boolean;
  is_bot: boolean;
  created_at: string;
  last_seen_at?: string;
  user_metadata?: any;
}

export default function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'users' | 'bots' | 'admins'>('all');
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      
      // Get all users from auth and profiles
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

      if (authError) throw authError;

      // Combine auth data with profile data
      const combinedUsers = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id);
        return {
          id: authUser.id,
          email: authUser.email || authUser.user_metadata?.email || 'No email',
          is_admin: profile?.is_admin || false,
          is_bot: profile?.is_bot || authUser.user_metadata?.isBot || false,
          created_at: authUser.created_at,
          last_seen_at: authUser.last_sign_in_at,
          user_metadata: authUser.user_metadata
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserAdmin(userId: string, isAdmin: boolean) {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId, 
          is_admin: !isAdmin 
        });

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !isAdmin }
          : user
      ));
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
      alert('Failed to update user admin status');
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      setSelectedUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  }

  async function deleteSelectedUsers() {
    const count = selectedUsers.size;
    if (!confirm(`Are you sure you want to delete ${count} selected user(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');

      const deletePromises = Array.from(selectedUsers).map(userId =>
        supabase.auth.admin.deleteUser(userId)
      );

      await Promise.all(deletePromises);
      setUsers(users.filter(user => !selectedUsers.has(user.id)));
      setSelectedUsers(new Set());
    } catch (error) {
      console.error('Failed to delete users:', error);
      alert('Failed to delete some users');
    }
  }

  const filteredUsers = users.filter(user => {
    // Apply filter
    if (filter === 'users' && user.is_bot) return false;
    if (filter === 'bots' && !user.is_bot) return false;
    if (filter === 'admins' && !user.is_admin) return false;

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      return user.email.toLowerCase().includes(searchLower) ||
             user.id.toLowerCase().includes(searchLower);
    }

    return true;
  });

  const stats = {
    total: users.length,
    users: users.filter(u => !u.is_bot).length,
    bots: users.filter(u => u.is_bot).length,
    admins: users.filter(u => u.is_admin).length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 User Management</h1>
          <p className="text-gray-600">Manage all platform users with enterprise-grade controls</p>
          <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full inline-block">
            ✅ Admin Authenticated - Full Access
          </div>
        </div>
        <button
          onClick={loadUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
          <div className="text-sm text-gray-600">Real Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">{stats.bots}</div>
          <div className="text-sm text-gray-600">Bot Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
          <div className="text-2xl font-bold text-green-600">{stats.admins}</div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex space-x-2">
            {(['all', 'users', 'bots', 'admins'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  filter === filterType
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterType === 'all' ? '📊 All' : 
                 filterType === 'users' ? '👤 Users' :
                 filterType === 'bots' ? '🤖 Bots' : '👑 Admins'}
                {filterType !== 'all' && (
                  <span className="ml-1 text-xs">
                    ({filterType === 'users' ? stats.users :
                      filterType === 'bots' ? stats.bots : stats.admins})
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search by email or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {selectedUsers.size > 0 && (
            <button
              onClick={deleteSelectedUsers}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-all duration-200"
            >
              🗑️ Delete Selected ({selectedUsers.size})
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={filteredUsers.length > 0 && filteredUsers.every(user => selectedUsers.has(user.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                    } else {
                      setSelectedUsers(new Set());
                    }
                  }}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                👤 User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                🏷️ Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                📅 Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                👁️ Last Seen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ⚡ Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={(e) => {
                      const next = new Set(selectedUsers);
                      if (e.target.checked) {
                        next.add(user.id);
                      } else {
                        next.delete(user.id);
                      }
                      setSelectedUsers(next);
                    }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {user.is_bot && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        🤖 Bot
                      </span>
                    )}
                    {user.is_admin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        👑 Admin
                      </span>
                    )}
                    {!user.is_bot && !user.is_admin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        👤 User
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_seen_at 
                    ? new Date(user.last_seen_at).toLocaleDateString()
                    : 'Never'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                      className={`${
                        user.is_admin
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                      } transition-colors duration-200`}
                    >
                      {user.is_admin ? '👑 Remove Admin' : '⬆️ Make Admin'}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">👥</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
            <p className="text-sm text-gray-400 mt-2">
              🧠 AI agents monitor user activity and engagement patterns
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400 text-2xl">💡</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              📊 Showing {filteredUsers.length} of {users.length} total users
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>🤖 <strong>Bot users</strong> are created by the testing system and marked with the 🤖 icon.</p>
              <p>👑 <strong>Admin users</strong> have access to this admin panel and all platform management features.</p>
              <p>🧠 <strong>AI agents</strong> continuously monitor user behavior and platform engagement metrics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 