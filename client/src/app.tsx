// src/App.tsx
import { LocationProvider, Router, Route } from 'preact-iso';
import { FunctionComponent } from 'preact';
import { Home } from './pages/Home/index.js';
import { NotFound } from './pages/_404.js';
import Login from './pages/Auth/Login';
import ProtectedRoute from './routes/ProtectedRoute.js';
import { PopupProvider } from './components/popup/provider.js';
import { Sidebar } from './components/sidebar';
import Land from './pages/Land/index.js';
import User from './pages/User/index.js';
import Logout from './pages/Auth/Logout/index.js';
import ResetPassword from './pages/Auth/Reset/index.js';
import RequestPasswordReset from './pages/Auth/Reset/Request/index.js';
import LandOwner from './pages/Land/Owner/index.js';
import Employee from './pages/Employee/index.js';
import Feedback from './pages/Feedback/index.js';
import Announcement from './pages/Announcement/index.js';
import Appointment from './pages/Appointment/index.js';
import LandDetails from './pages/Land/Detail/index.js';
import UserReport from './pages/UserReport/index.js';
import { UserRole } from './types/UserRole.js';

export const App: FunctionComponent = () => {
  const noSidebarRoutes: string[] = [
    '/auth/login',
    '/auth/reset',
    '/auth/reset/request',
    '404',
    '/'
  ];

  const hasSidebar = !noSidebarRoutes.includes(window.location.pathname);

  return (
    <LocationProvider>
      <main className="flex">
        <PopupProvider>
          {hasSidebar && <Sidebar bgColor='main-black' />}

          <div className={`flex-grow bg-main-white text-main-black ${hasSidebar ? 'p-4' : ''}`}>
            <Router>
              {/* Public Routes */}
              <Route path="/auth/login" component={Login} />
              <Route path='/auth/reset' component={ResetPassword} />
              <Route path='/auth/reset/request' component={RequestPasswordReset} />
              <Route path="/" component={Home} />


              {/* // Role-Based Protected Routes */}
              <ProtectedRoute
                path='/land'
                component={Land}
                allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.LAND_BANK, UserRole.HEAD, UserRole.OFFICER]}
              />
              <ProtectedRoute
                path="/land/:landId"
                component={LandDetails}
                allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.LAND_BANK, UserRole.HEAD, UserRole.OFFICER]}
              />
              <ProtectedRoute
                path='/users'
                component={User}
                allowedRoles={[UserRole.DATABASE_ADMIN, UserRole.HEAD]}
              />
              <ProtectedRoute
                path='/user-report'
                component={UserReport}
                allowedRoles={[
                  UserRole.DATABASE_ADMIN,
                  UserRole.SYSTEM_ADMIN,
                  UserRole.RECEPTION,
                  UserRole.LAND_BANK,
                  UserRole.OFFICER,
                  UserRole.HR,
                  UserRole.FINANCE,
                  UserRole.OTHER,
                  UserRole.HEAD
                ]}
              />
              <ProtectedRoute
                path='/owner'
                component={LandOwner}
                allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.HEAD, UserRole.OFFICER]}
              />
              <ProtectedRoute
                path='/employee'
                component={Employee}
                allowedRoles={[UserRole.HR, UserRole.HEAD, UserRole.SYSTEM_ADMIN]}
              />
              <ProtectedRoute
                path='/feedback'
                component={Feedback}
                allowedRoles={[UserRole.HEAD]}
              />
              <ProtectedRoute
                path='/announcement'
                component={Announcement}
                allowedRoles={[UserRole.HEAD, UserRole.OFFICER, UserRole.SYSTEM_ADMIN]}
              />
              <ProtectedRoute
                path='/appointment'
                component={Appointment}
                allowedRoles={[UserRole.RECEPTION, UserRole.SYSTEM_ADMIN, UserRole.HEAD, UserRole.OFFICER]}
              />
              <ProtectedRoute
                path='/logout'
                component={Logout}
                allowedRoles={Object.values(UserRole)}
              />

              {/* Fallback route */}
              <Route default component={NotFound} />
            </Router>
          </div>
        </PopupProvider>
      </main>
    </LocationProvider>
  );
};

export default App;
