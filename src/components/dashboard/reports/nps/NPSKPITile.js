import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const NPSKPITile = ({ npsData, loading }) => {
  const getScoreColor = (score) => {
    if (score >= 50) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 50) return 'Excellent';
    if (score >= 30) return 'Great';
    if (score >= 0) return 'Good';
    if (score >= -30) return 'Needs Work';
    return 'Critical';
  };

  const getTrendColor = (direction) => {
    if (direction === 'up') return 'text-green-600 bg-green-50';
    if (direction === 'down') return 'text-red-600 bg-red-50';
    return 'text-gray-500 bg-gray-50';
  };

  const TrendIcon = npsData.trendDirection === 'up' ? TrendingUp :
                    npsData.trendDirection === 'down' ? TrendingDown : Minus;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading NPS data...</p>
        </div>
      </div>
    );
  }

  if (npsData.total === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 text-sm">No NPS data available</p>
          <p className="text-gray-400 text-xs mt-1">for this period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
      {/* Main Score Display */}
      <div className={`flex flex-col items-center justify-center w-48 h-48 border-4 rounded-full ${getScoreColor(npsData.score)}`}>
        <div className="text-6xl font-bold">
          {npsData.score}
        </div>
        <div className="text-sm font-medium mt-2">
          {getScoreLabel(npsData.score)}
        </div>
      </div>

      {/* Trend and Stats */}
      <div className="w-full space-y-3">
        {npsData.trend && (
          <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${getTrendColor(npsData.trendDirection)}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{npsData.trend} vs previous period</span>
          </div>
        )}

        {/* Category Breakdown */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-xs font-medium text-green-700 mb-1">Promoters</div>
            <div className="text-2xl font-bold text-green-900">{npsData.promoters}</div>
            <div className="text-xs text-green-600 mt-1">
              {npsData.total > 0 ? Math.round((npsData.promoters / npsData.total) * 100) : 0}%
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-xs font-medium text-yellow-700 mb-1">Passives</div>
            <div className="text-2xl font-bold text-yellow-900">{npsData.passives}</div>
            <div className="text-xs text-yellow-600 mt-1">
              {npsData.total > 0 ? Math.round((npsData.passives / npsData.total) * 100) : 0}%
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-xs font-medium text-red-700 mb-1">Detractors</div>
            <div className="text-2xl font-bold text-red-900">{npsData.detractors}</div>
            <div className="text-xs text-red-600 mt-1">
              {npsData.total > 0 ? Math.round((npsData.detractors / npsData.total) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Total Responses */}
        <div className="text-center py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-500">Total Responses: </span>
          <span className="text-sm font-semibold text-gray-700">{npsData.total}</span>
        </div>
      </div>
    </div>
  );
};

export default NPSKPITile;
