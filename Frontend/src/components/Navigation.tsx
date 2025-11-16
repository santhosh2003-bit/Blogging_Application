import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Edit, BarChart3, LogOut, User } from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to={user?.role === 'admin' ? '/admin' : '/blogs'}
              className="flex items-center gap-2 text-xl font-bold text-gray-900"
            >
              <FileText className="w-6 h-6" />
              Blog Platform
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user?.role === 'admin' ? (
              <>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/editor"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  New Blog
                </Link>
              </>
            ) : (
              <Link
                to="/blogs"
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Blogs
              </Link>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              {user?.name}
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}