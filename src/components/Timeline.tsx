import React, { useState, useEffect } from 'react';
import { useEventStore } from '../store/eventStore';
import { 
  format, 
  addDays,
  addHours,
  subDays,
  differenceInDays,
  startOfDay,
  endOfDay,
  isSameDay,
  getHours
} from 'date-fns';
import { TimelineControls } from './TimelineControls';
import { EventTable } from './EventTable';
import { Event } from '../types/Event';
import { CalendarView } from './CalendarView';
import { generateTimeLabels } from '../utils/timelineUtils';

type TimeRange = '1day' | '3days' | '1week' | '2weeks' | '1month';

export function Timeline() {
  const events = useEventStore((state) => state.events);
  const [timeRange, setTimeRange] = useState<TimeRange>('3days');
  const [view, setView] = useState<'timeline' | 'calendar' | 'list'>('timeline');
  const [focusDate, setFocusDate] = useState(() => {
    if (events.length > 0) {
      const latestEvent = events.reduce((latest, event) => 
        event.endDate > latest.endDate ? event : latest
      );
      return latestEvent.endDate;
    }
    return new Date();
  });

  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events.reduce((latest, event) => 
        event.endDate > latest.endDate ? event : latest
      );
      setFocusDate(latestEvent.endDate);
    }
  }, [events]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const days = {
      '1day': 1,
      '3days': 3,
      '1week': 7,
      '2weeks': 14,
      '1month': 30,
    }[timeRange];

    setFocusDate(current => 
      direction === 'next' ? addDays(current, days) : subDays(current, days)
    );
  };

  if (events.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">No events to display. Add some events to see them on the timeline.</p>
      </div>
    );
  }

  const getTimeWindow = () => {
    const end = focusDate;
    let start;
    switch (timeRange) {
      case '1day':
        start = subDays(end, 1);
        break;
      case '3days':
        start = subDays(end, 3);
        break;
      case '1week':
        start = subDays(end, 7);
        break;
      case '2weeks':
        start = subDays(end, 14);
        break;
      case '1month':
        start = subDays(end, 30);
        break;
      default:
        start = subDays(end, 3);
    }
    return { start, end };
  };

  const { start: timelineStart, end: timelineEnd } = getTimeWindow();
  const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
  const lanes = [...new Set(events.map((event) => event.lane))];
  const timeLabels = generateTimeLabels(timelineStart, timelineEnd, timeRange);

  const getEventStyle = (event: Event) => {
    const left = ((event.startDate.getTime() - timelineStart.getTime()) / totalDuration) * 100;
    const width = ((event.endDate.getTime() - event.startDate.getTime()) / totalDuration) * 100;
    
    let backgroundColor;
    switch (event.sentiment) {
      case 'positive':
        backgroundColor = '#22c55e';
        break;
      case 'negative':
        backgroundColor = '#ef4444';
        break;
      default:
        backgroundColor = '#3b82f6';
    }

    return {
      left: `${Math.max(0, Math.min(100, left))}%`,
      width: `${Math.max(0.5, Math.min(100, width))}%`,
      backgroundColor,
      display: left > 100 || left + width < 0 ? 'none' : 'flex',
    };
  };

  const getLabelStyle = (date: Date) => {
    const left = ((date.getTime() - timelineStart.getTime()) / totalDuration) * 100;
    return {
      left: `${left}%`,
    };
  };

  if (view === 'list') {
    return (
      <div className="space-y-4">
        <TimelineControls
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          view={view}
          onViewChange={setView}
          onNavigate={handleNavigate}
        />
        <EventTable />
      </div>
    );
  }

  if (view === 'calendar') {
    return (
      <div className="space-y-4">
        <TimelineControls
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          view={view}
          onViewChange={setView}
          onNavigate={handleNavigate}
        />
        <CalendarView events={events} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TimelineControls
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
      />
      
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="grid grid-cols-[200px_1fr] gap-4 mb-4">
            <div className="font-medium text-gray-700">Lanes</div>
            <div className="relative h-14 border-b border-gray-200">
              {/* Time labels */}
              {timeLabels.map((label, index) => (
                <div
                  key={label.date.getTime()}
                  className={`absolute -bottom-1 transform ${
                    getHours(label.date) === 0 ? '-translate-x-2' : '-translate-x-1/2'
                  } flex flex-col items-${getHours(label.date) === 0 ? 'start' : 'center'}`}
                  style={getLabelStyle(label.date)}
                >
                  <div className="h-2 w-px bg-gray-300" />
                  <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                    {label.showDate && (
                      <>
                        {format(label.date, 'MMM d, yyyy')}<br />
                      </>
                    )}
                    {format(label.date, label.format)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lanes and Events */}
          {lanes.map((lane) => (
            <div key={lane} className="grid grid-cols-[200px_1fr] gap-4 mb-4">
              <div className="py-2 font-medium text-gray-700">{lane}</div>
              <div className="relative h-12 bg-gray-50 rounded">
                {/* Vertical gridlines */}
                {timeLabels.map((label) => (
                  <div
                    key={label.date.getTime()}
                    className="absolute top-0 bottom-0 w-px bg-gray-100"
                    style={getLabelStyle(label.date)}
                  />
                ))}
                
                {/* Events */}
                {events
                  .filter((event) => event.lane === lane)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="absolute top-1 bottom-1 rounded px-2 text-white text-sm flex items-center overflow-hidden whitespace-nowrap transition-colors cursor-pointer"
                      style={getEventStyle(event)}
                      title={`${event.title}\n${format(event.startDate, 'MMM d, yyyy HH:mm')} - ${format(
                        event.endDate,
                        'MMM d, yyyy HH:mm'
                      )}\n${event.description || ''}`}
                    >
                      {event.title}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}