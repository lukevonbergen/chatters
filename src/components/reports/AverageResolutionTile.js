import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const AverageResolutionTimeTile = ({ venueId }) => {
  const [averageTime, setAverageTime] = useState(0);
  const [totalResolved, setTotalResolved] = useState(0);
  const [timeFilter, setTimeFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const getDateRange = (filter) => {
    const now = new Date();
    let startDate, endDate;

    switch (filter) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date();
        break;
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : new Date(0);
        endDate = customEndDate ? new Date(customEndDate + 'T23:59:59') : new Date();
        break;
      default:
        startDate = new Date(0);
        endDate = new Date();
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  useEffect(() => {
    if (!venueId) return;

    const fetchResolutionTimes = async () => {
      const { startDate, endDate } = getDateRange(timeFilter);

      const { data, error } = await supabase
        .from('feedback')
        .select('created_at, resolved_at')
        .eq('venue_id', venueId)
        .not('resolved_at', 'is', null)
        .gte('resolved_at', startDate)
        .lte('resolved_at', endDate);

      if (error) {
        console.error('Error fetching resolution times:', error);
        return;
      }

      if (!data || data.length === 0) {
        setAverageTime(0);
        setTotalResolved(0);
        return;
      }

      const resolutionTimes = data.map(item => {
        const created = new Date(item.created_at);
        const resolved = new Date(item.resolved_at);
        return (resolved - created) / (1000 * 60); // Convert to minutes
      });

      const avgTime = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;
      
      setAverageTime(avgTime);
      setTotalResolved(data.length);
    };

    fetchResolutionTimes();
  }, [venueId, timeFilter, customStartDate, customEndDate]);

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else { // 24 hours or more
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  };

  const getProgressPercentage = () => {
    // Assuming target resolution time of 2 hours (120 minutes)
    // Invert the percentage so faster resolution = higher percentage
    const targetMinutes = 120;
    if (averageTime === 0) return 100;
    const percentage = Math.max(0, ((targetMinutes - averageTime) / targetMinutes) * 100);
    return Math.min(100, percentage);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 80) return '#10B981'; // Green
    if (percentage >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
    setIsCustom(filter === 'custom');
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minHeight: '300px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
          Average Resolution Time
        </h3>
        
        {/* Time Filter Buttons */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          marginBottom: '15px' 
        }}>
          {['today', 'week', 'month', 'ytd', 'custom'].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              style={{
                padding: '6px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                backgroundColor: timeFilter === filter ? '#3B82F6' : 'white',
                color: timeFilter === filter ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              {filter === 'ytd' ? 'YTD' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs */}
        {isCustom && (
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '15px',
            alignItems: 'center'
          }}>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <span style={{ fontSize: '12px', color: '#6B7280' }}>to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
          </div>
        )}
      </div>

      {/* Progress Circle */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ width: '120px', height: '120px' }}>
          <CircularProgressbar
            value={getProgressPercentage()}
            text={formatTime(averageTime)}
            styles={buildStyles({
              textSize: '14px',
              pathColor: getProgressColor(),
              textColor: '#374151',
              trailColor: '#E5E7EB',
              strokeLinecap: 'round'
            })}
          />
        </div>
      </div>

      {/* Summary Text */}
      <div style={{ 
        textAlign: 'center', 
        color: '#6B7280', 
        fontSize: '14px' 
      }}>
        {totalResolved} feedback items resolved
        {timeFilter === 'today' && ' today'}
        {timeFilter === 'week' && ' this week'}
        {timeFilter === 'month' && ' this month'}
        {timeFilter === 'ytd' && ' year to date'}
        {timeFilter === 'custom' && customStartDate && customEndDate && 
          ` from ${customStartDate} to ${customEndDate}`}
      </div>

      {/* Performance Indicator */}
      {totalResolved > 0 && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '10px',
          fontSize: '12px',
          color: getProgressColor(),
          fontWeight: '500'
        }}>
          {getProgressPercentage() >= 80 && '🎯 Excellent response time'}
          {getProgressPercentage() >= 60 && getProgressPercentage() < 80 && '⚡ Good response time'}
          {getProgressPercentage() < 60 && '⏰ Room for improvement'}
        </div>
      )}
    </div>
  );
};

export default AverageResolutionTimeTile;