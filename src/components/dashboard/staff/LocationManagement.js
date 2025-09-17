import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../utils/supabase';

const LocationManagement = ({ venueId, onLocationUpdate }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({ name: '', color: '#3B82F6' });
  const [draggedItem, setDraggedItem] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const defaultColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#6B7280', // Gray
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#84CC16', // Lime
    '#EC4899'  // Pink
  ];

  useEffect(() => {
    fetchLocations();
  }, [venueId]);

  const fetchLocations = async () => {
    if (!venueId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_locations')
        .select('*')
        .eq('venue_id', venueId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.name.trim()) return;

    try {
      const maxOrder = Math.max(...locations.map(l => l.display_order), 0);
      const { data, error } = await supabase
        .from('staff_locations')
        .insert({
          venue_id: venueId,
          name: newLocation.name.trim(),
          color: newLocation.color,
          display_order: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;

      setLocations(prev => [...prev, data]);
      setNewLocation({ name: '', color: '#3B82F6' });
      setShowAddForm(false);
      onLocationUpdate?.();
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  const handleUpdateLocation = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('staff_locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLocations(prev => prev.map(l => l.id === id ? data : l));
      setEditingLocation(null);
      onLocationUpdate?.();
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleDeleteLocation = (location) => {
    setDeleteConfirmation({
      location,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('staff_locations')
            .delete()
            .eq('id', location.id);

          if (error) throw error;

          setLocations(prev => prev.filter(l => l.id !== location.id));
          onLocationUpdate?.();
          setDeleteConfirmation(null);
        } catch (error) {
          console.error('Error deleting location:', error);
        }
      },
      onCancel: () => setDeleteConfirmation(null)
    });
  };

  const handleToggleActive = async (id, isActive) => {
    await handleUpdateLocation(id, { is_active: !isActive });
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) return;

    const reorderedLocations = [...locations];
    const draggedLocation = reorderedLocations[draggedItem];
    
    // Remove dragged item
    reorderedLocations.splice(draggedItem, 1);
    // Insert at new position
    reorderedLocations.splice(dropIndex, 0, draggedLocation);

    // Update display_order for all items
    const updatedLocations = reorderedLocations.map((location, index) => ({
      ...location,
      display_order: index + 1
    }));

    setLocations(updatedLocations);
    setDraggedItem(null);

    // Update in database
    try {
      const updates = updatedLocations.map(location => ({
        id: location.id,
        display_order: location.display_order
      }));

      for (const update of updates) {
        await supabase
          .from('staff_locations')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error updating location order:', error);
      // Revert on error
      fetchLocations();
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading locations...</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Staff Locations</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Location
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Customize staff location categories for your venue. Drag to reorder.
      </p>

      {/* Add Location Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Location name (e.g., Front of House)"
                value={newLocation.name}
                onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={newLocation.color}
                onChange={(e) => setNewLocation(prev => ({ ...prev, color: e.target.value }))}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <div className="flex space-x-1">
                {defaultColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewLocation(prev => ({ ...prev, color }))}
                    className="w-6 h-6 rounded border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleAddLocation}
              disabled={!newLocation.name.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewLocation({ name: '', color: '#3B82F6' });
              }}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Locations List */}
      <div className="space-y-2">
        {locations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No locations configured yet.</p>
            <p className="text-sm">Add your first location to get started.</p>
          </div>
        ) : (
          locations.map((location, index) => (
            <div
              key={location.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-move ${
                !location.is_active ? 'opacity-60' : ''
              }`}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
              
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: location.color }}
              />
              
              <div className="flex-1">
                {editingLocation === location.id ? (
                  <input
                    type="text"
                    value={location.name}
                    onChange={(e) => {
                      setLocations(prev => prev.map(l => 
                        l.id === location.id ? { ...l, name: e.target.value } : l
                      ));
                    }}
                    onBlur={() => handleUpdateLocation(location.id, { name: location.name })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateLocation(location.id, { name: location.name });
                      }
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">
                    {location.name}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleActive(location.id, location.is_active)}
                  className={`p-1 rounded transition-colors ${
                    location.is_active 
                      ? 'text-green-600 hover:bg-green-100' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={location.is_active ? 'Hide location' : 'Show location'}
                >
                  {location.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => setEditingLocation(location.id)}
                  className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Edit location"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteLocation(location)}
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Delete location"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Location</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>"{deleteConfirmation.location.name}"</strong>? 
                Employees assigned to this location will have their location cleared. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={deleteConfirmation.onCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteConfirmation.onConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;