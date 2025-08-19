const SettingsLayout = ({ children }) => {
  return (
    <div className="flex gap-8">
      <aside className="w-48 border rounded-xl bg-white p-4">
        <ul className="space-y-2 text-sm font-medium">
          <li><Link to="/settings/profile" className={isActive('/settings/profile')}>Profile</Link></li>
          <li><Link to="/settings/venue" className={isActive('/settings/venue')}>Venue</Link></li>
          <li><Link to="/settings/branding" className={isActive('/settings/branding')}>Branding</Link></li>
          <li><Link to="/settings/notifications" className={isActive('/settings/notifications')}>Notifications</Link></li>
          <li><Link to="/settings/staff" className={isActive('/settings/staff')}>Staff</Link></li>
        </ul>
      </aside>

      <section className="flex-1">
        {children}
      </section>
    </div>
  );
};

const isActive = (path) =>
  window.location.pathname === path
    ? 'text-black font-semibold'
    : 'text-gray-500 hover:text-black';
