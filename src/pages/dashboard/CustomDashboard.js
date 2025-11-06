import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { DateRangeSelector, overviewPresetRanges } from '../../components/ui/date-range-selector';
import ConfigurableMultiVenueTile from '../../components/dashboard/reports/ConfigurableMultiVenueTile';
import NPSChartTile from '../../components/dashboard/reports/NPSChartTile';
import MetricSelectorModal from '../../components/dashboard/modals/MetricSelectorModal';
import NPSConfigModal from '../../components/dashboard/modals/NPSConfigModal';
import usePageTitle from '../../hooks/usePageTitle';
import { Plus, GripVertical, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomDashboard = () => {
  usePageTitle('Custom Dashboard');

  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNPSConfigOpen, setIsNPSConfigOpen] = useState(false);
  const [editingTilePosition, setEditingTilePosition] = useState(null);
  const [configuringTile, setConfiguringTile] = useState(null);
  const [draggedTile, setDraggedTile] = useState(null);
  const [dateRangePreset, setDateRangePreset] = useState('today');
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    return { from: today, to: endOfDay };
  });

  useEffect(() => {
    loadTiles();
  }, []);

  const loadTiles = async () => {
    try {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from('custom_dashboard_tiles')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error loading tiles:', error);
        return;
      }

      setTiles(data || []);
    } catch (error) {
      console.error('Error in loadTiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTile = () => {
    setEditingTilePosition(null);
    setIsModalOpen(true);
  };

  const handleChangeTileMetric = (position) => {
    setEditingTilePosition(position);
    setIsModalOpen(true);
  };

  const handleConfigureNPSTile = (tile) => {
    setConfiguringTile(tile);
    setIsNPSConfigOpen(true);
  };

  const handleSaveNPSConfig = async (config) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId || !configuringTile) return;

      const { error } = await supabase
        .from('custom_dashboard_tiles')
        .update({
          date_range_preset: config.date_range_preset,
          chart_type: config.chart_type
        })
        .eq('user_id', userId)
        .eq('id', configuringTile.id);

      if (error) {
        console.error('Error updating tile config:', error);
        toast.error('Failed to update tile configuration');
        return;
      }

      // Update tiles in-place without full reload
      setTiles(prevTiles =>
        prevTiles.map(tile =>
          tile.id === configuringTile.id
            ? { ...tile, date_range_preset: config.date_range_preset, chart_type: config.chart_type }
            : tile
        )
      );

      toast.success('Tile configuration updated');
    } catch (error) {
      console.error('Error in handleSaveNPSConfig:', error);
      toast.error('An error occurred');
    }
  };

  const handleMetricSelect = async (metricType) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      if (editingTilePosition !== null) {
        // Update existing tile
        const { error } = await supabase
          .from('custom_dashboard_tiles')
          .update({ metric_type: metricType })
          .eq('user_id', userId)
          .eq('position', editingTilePosition);

        if (error) {
          console.error('Error updating tile:', error);
          toast.error('Failed to update tile');
          return;
        }

        toast.success('Tile updated successfully');
      } else {
        // Add new tile
        const nextPosition = tiles.length;

        const { error } = await supabase
          .from('custom_dashboard_tiles')
          .insert({
            user_id: userId,
            metric_type: metricType,
            position: nextPosition
          });

        if (error) {
          console.error('Error adding tile:', error);
          toast.error('Failed to add tile');
          return;
        }

        toast.success('Tile added successfully');
      }

      loadTiles();
    } catch (error) {
      console.error('Error in handleMetricSelect:', error);
      toast.error('An error occurred');
    }
  };

  const handleRemoveTile = async (position) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      const { error } = await supabase
        .from('custom_dashboard_tiles')
        .delete()
        .eq('user_id', userId)
        .eq('position', position);

      if (error) {
        console.error('Error removing tile:', error);
        toast.error('Failed to remove tile');
        return;
      }

      toast.success('Tile removed successfully');

      // Reorder remaining tiles
      const remainingTiles = tiles.filter(t => t.position !== position);
      for (let i = 0; i < remainingTiles.length; i++) {
        if (remainingTiles[i].position !== i) {
          await supabase
            .from('custom_dashboard_tiles')
            .update({ position: i })
            .eq('user_id', userId)
            .eq('id', remainingTiles[i].id);
        }
      }

      loadTiles();
    } catch (error) {
      console.error('Error in handleRemoveTile:', error);
      toast.error('An error occurred');
    }
  };

  const handleDragStart = (e, tile) => {
    setDraggedTile(tile);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetTile) => {
    e.preventDefault();

    if (!draggedTile || draggedTile.id === targetTile.id) {
      setDraggedTile(null);
      return;
    }

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (!userId) return;

      // Create a copy of tiles array and reorder
      const newTiles = [...tiles];
      const draggedIndex = newTiles.findIndex(t => t.id === draggedTile.id);
      const targetIndex = newTiles.findIndex(t => t.id === targetTile.id);

      // Remove dragged tile and insert at target position
      const [removed] = newTiles.splice(draggedIndex, 1);
      newTiles.splice(targetIndex, 0, removed);

      // Update positions in database
      for (let i = 0; i < newTiles.length; i++) {
        if (newTiles[i].position !== i) {
          await supabase
            .from('custom_dashboard_tiles')
            .update({ position: i })
            .eq('user_id', userId)
            .eq('id', newTiles[i].id);
        }
      }

      toast.success('Tiles reordered successfully');
      loadTiles();
    } catch (error) {
      console.error('Error reordering tiles:', error);
      toast.error('Failed to reorder tiles');
    } finally {
      setDraggedTile(null);
    }
  };

  const handleDateRangeChange = ({ preset, range }) => {
    setDateRangePreset(preset);
    const endOfDay = new Date(range.to);
    endOfDay.setHours(23, 59, 59, 999);
    setDateRange({ from: range.from, to: endOfDay });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Custom Dashboard</h1>
            <p className="text-gray-600 mt-1">Build your personalized metrics view</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {tiles.length === 0
              ? 'Add tiles to create your personalized dashboard'
              : 'Drag and drop tiles to reorder, or add more metrics'}
          </p>
        </div>
        <DateRangeSelector
          value={dateRangePreset}
          onChange={handleDateRangeChange}
          presets={overviewPresetRanges}
        />
      </div>

      {/* Empty State */}
      {tiles.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-12 text-center border-2 border-dashed border-blue-200">
          <div className="max-w-md mx-auto">
            <Settings className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Custom Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Add metric tiles to build a personalized view of your most important data.
              Track what matters most to you across all your venues.
            </p>
            <button
              onClick={handleAddTile}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Your First Tile
            </button>
          </div>
        </div>
      )}

      {/* Tiles Grid */}
      {tiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              draggable
              onDragStart={(e) => handleDragStart(e, tile)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, tile)}
              className={`relative group transition-all ${
                draggedTile?.id === tile.id ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {/* Drag Handle */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <div className="bg-gray-700 text-white p-2 rounded-lg shadow-lg">
                  <GripVertical className="w-4 h-4" />
                </div>
              </div>

              {tile.metric_type === 'nps_chart' ? (
                <NPSChartTile
                  config={{
                    date_range_preset: tile.date_range_preset || 'all_time',
                    chart_type: tile.chart_type || 'donut'
                  }}
                  onRemove={() => handleRemoveTile(tile.position)}
                  onConfigure={() => handleConfigureNPSTile(tile)}
                />
              ) : (
                <ConfigurableMultiVenueTile
                  metricType={tile.metric_type}
                  position={tile.position}
                  dateRange={dateRange}
                  onRemove={() => handleRemoveTile(tile.position)}
                  onChangeMetric={() => handleChangeTileMetric(tile.position)}
                />
              )}
            </div>
          ))}

          {/* Add Tile Button */}
          <button
            onClick={handleAddTile}
            className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] group"
          >
            <div className="p-3 bg-gray-100 group-hover:bg-blue-100 rounded-full transition-colors">
              <Plus className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                Add Metric Tile
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Track more metrics
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Helper Text */}
      {tiles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Tip:</strong> Hover over a tile and use the grip icon to drag and reorder.
              Click the gear icon on any tile to change its metric or remove it.
            </div>
          </div>
        </div>
      )}

      {/* Metric Selector Modal */}
      <MetricSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleMetricSelect}
        currentMetric={
          editingTilePosition !== null
            ? tiles.find(t => t.position === editingTilePosition)?.metric_type
            : null
        }
        existingMetrics={tiles.map(t => t.metric_type)}
      />

      {/* NPS Configuration Modal */}
      <NPSConfigModal
        isOpen={isNPSConfigOpen}
        onClose={() => {
          setIsNPSConfigOpen(false);
          setConfiguringTile(null);
        }}
        onSave={handleSaveNPSConfig}
        currentConfig={configuringTile || {}}
      />
    </div>
  );
};

export default CustomDashboard;
