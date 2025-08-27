import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  FileText as DocumentTextIcon, 
  Upload as UploadIcon,
  History,
  BarChart3 as ChartBarIcon, 
  Settings as CogIcon,
  Menu as MenuIcon,
  X as XIcon,
  LogOut as LogoutIcon,
  User as UserIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const Layout = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('navigation.analyses'), href: '/analyses', icon: DocumentTextIcon },
    { name: t('navigation.batchUpload'), href: '/batch-analysis', icon: UploadIcon },
    { name: t('navigation.patientHistory'), href: '/patient-history', icon: History },
    { name: t('navigation.analytics'), href: '/analytics', icon: ChartBarIcon },
    { name: t('navigation.settings'), href: '/settings', icon: CogIcon },
  ];

  const NavItem = ({ item, mobile = false }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `${
          isActive
            ? 'bg-primary-100 border-primary-500 text-primary-700'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        } ${
          mobile
            ? 'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
            : 'group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4'
        }`
      }
      onClick={() => mobile && setSidebarOpen(false)}
    >
      <item.icon
        className={`${
          mobile ? 'mr-3 h-6 w-6' : 'mr-3 h-5 w-5'
        } flex-shrink-0`}
        aria-hidden="true"
      />
      {item.name}
    </NavLink>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-primary-600">{t('app.name')}</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} mobile />
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <LanguageSelector variant="compact" />
              <button
                onClick={handleLogout}
                className="ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-primary-600">{t('app.name')}</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <LanguageSelector variant="compact" />
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                  title={t('navigation.logout')}
                >
                  <LogoutIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header mobile */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Zone de contenu */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;