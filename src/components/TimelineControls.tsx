import React from 'react';
import { RotateCcw, Calendar, List, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

type TimeRange = '1day' | '3days' | '1week' | '2weeks' | '1month';

interface TimelineControlsProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  view: 'timeline' | 'calendar' | 'list';
  onViewChange: (view: 'timeline' | 'calendar' | 'list') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function TimelineControls({
  timeRange,
  onTimeRangeChange,
  view,
  onViewChange,
  onNavigate,
}: TimelineControlsProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2 bg-white rounded-lg shadow px-2 py-1">
        <button
          onClick={() => onNavigate('prev')}
          className="p-1 hover:bg-gray-100 rounded"
          title="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
          className="text-sm border-none focus:ring-0"
        >
          <option value="1day">1 Day</option>
          <option value="3days">3 Days</option>
          <option value="1week">1 Week</option>
          <option value="2weeks">2 Weeks</option>
          <option value="1month">1 Month</option>
        </select>
        <button
          onClick={() => onNavigate('next')}
          className="p-1 hover:bg-gray-100 rounded"
          title="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => onTimeRangeChange('3days')}
          className="p-1 hover:bg-gray-100 rounded"
          title="Reset to 3 Days"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-lg shadow px-2 py-1">
        <button
          onClick={() => onViewChange('timeline')}
          className={`p-1 rounded ${view === 'timeline' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="Timeline View"
        >
          <Clock className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewChange('calendar')}
          className={`p-1 rounded ${view === 'calendar' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="Calendar View"
        >
          <Calendar className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewChange('list')}
          className={`p-1 rounded ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          title="List View"
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}