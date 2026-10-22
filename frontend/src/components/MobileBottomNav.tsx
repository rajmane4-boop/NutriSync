import { useLocation, Link } from 'react-router-dom';

export default function MobileBottomNav() {
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  // Do not render on public auth pages or the initial onboarding wizard
  const isAuthPage = ['/login', '/register', '/onboarding'].some(path =>
    location.pathname.startsWith(path)
  );

  if (!token || isAuthPage) {
    return null;
  }

  const currentPath = location.pathname;

  const navItems = [
    {
      label: 'Overview',
      path: '/dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: 'Workout',
      path: '/workouts/active',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 6.5h11M12 3v3M4 12h2m12 0h2M6.5 17.5h11M12 18v3M7 12a5 5 0 0110 0" />
        </svg>
      ),
    },
    {
      label: 'Diet',
      path: '/diet',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A7.002 7.002 0 0 1 5.07 11H5a1 1 0 0 1 0-2h.07A7.002 7.002 0 0 1 11 5.07V5a1 1 0 0 1 2 0v.07A7.002 7.002 0 0 1 18.93 11H19a1 1 0 0 1 0 2h-.07A7.002 7.002 0 0 1 13 16.93z" />
        </svg>
      ),
    },
    {
      label: 'Cheat',
      path: '/cheat-meals',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      ),
    },
    {
      label: 'History',
      path: '/workouts/history',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {navItems.map(item => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-tab ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon-wrap">
                {item.icon}
                {isActive && <span className="mobile-nav-active-dot" />}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}