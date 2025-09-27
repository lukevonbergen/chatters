import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, BarChart3, Users, Settings, MessageSquare, Bell, MapPin, FileText } from 'lucide-react';

const ActionButton = ({ icon: Icon, title, description, onClick, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700',
    primary: 'bg-black text-white hover:bg-gray-800 border-black',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left hover:shadow-md ${variants[variant]} ${className}`}
    >
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs opacity-75 mt-0.5">{description}</div>
      </div>
    </button>
  );
};

const QuickActions = ({ venueId, userRole }) => {
  const navigate = useNavigate();

  const goToKioskMode = () => {
    const kioskWindow = window.open('/kiosk', '_blank', 'fullscreen=yes,scrollbars=yes,resizable=yes');
    if (kioskWindow) {
      kioskWindow.moveTo(0, 0);
      kioskWindow.resizeTo(window.screen.width, window.screen.height);
    }
  };

  const actions = [
    {
      icon: Monitor,
      title: 'Launch Kiosk Mode',
      description: 'Full-screen staff interface',
      onClick: goToKioskMode,
      variant: 'primary'
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Detailed performance data',
      onClick: () => navigate('/reports'),
      variant: 'secondary'
    },
    {
      icon: Users,
      title: 'Floor Plan',
      description: 'Table layout & status',
      onClick: () => navigate('/floorplan')
    },
    {
      icon: MessageSquare,
      title: 'Live Feedback',
      description: 'Real-time customer input',
      onClick: () => navigate('/feedback')
    },
    {
      icon: Bell,
      title: 'Assistance Queue',
      description: 'Manage help requests',
      onClick: () => navigate('/assistance')
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Configure venue options',
      onClick: () => navigate('/settings')
    }
  ];

  // Add master-only actions
  if (userRole === 'master') {
    actions.push(
      {
        icon: MapPin,
        title: 'Manage Venues',
        description: 'Add or edit locations',
        onClick: () => navigate('/settings?tab=Venue')
      },
      {
        icon: FileText,
        title: 'Account Reports',
        description: 'Cross-venue analytics',
        onClick: () => navigate('/account-reports')
      }
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Actions</h3>
        <p className="text-sm text-gray-600">Common tasks and navigation</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            icon={action.icon}
            title={action.title}
            description={action.description}
            onClick={action.onClick}
            variant={action.variant}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;