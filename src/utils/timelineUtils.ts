import {
  eachDayOfInterval,
  eachHourOfInterval,
  startOfDay,
  endOfDay,
  addHours,
  getHours,
  differenceInDays,
  format,
  setHours,
  isFirstDayOfMonth,
  getDate
} from 'date-fns';

interface TimeLabel {
  date: Date;
  format: string;
  showDate: boolean;
}

export function generateTimeLabels(start: Date, end: Date, timeRange: string): TimeLabel[] {
  const daysDiff = differenceInDays(end, start);
  let labels: TimeLabel[] = [];

  if (daysDiff <= 1) {
    // Show hourly labels for 1-day view
    const hours = eachHourOfInterval({ start, end });
    labels = hours.map(hour => ({
      date: hour,
      format: 'HH:mm',
      showDate: getHours(hour) === 0
    }));
  } else if (daysDiff <= 3) {
    // Show labels every 6 hours for 3-day view
    const days = eachDayOfInterval({ start, end });
    days.forEach(day => {
      [0, 6, 12, 18].forEach(hour => {
        const date = setHours(day, hour);
        if (date >= start && date <= end) {
          labels.push({
            date,
            format: 'HH:mm',
            showDate: hour === 0
          });
        }
      });
    });
  } else if (daysDiff <= 7) {
    // Show labels every 12 hours for 1-week view
    const days = eachDayOfInterval({ start, end });
    days.forEach(day => {
      [0, 12].forEach(hour => {
        const date = setHours(day, hour);
        if (date >= start && date <= end) {
          labels.push({
            date,
            format: 'HH:mm',
            showDate: hour === 0
          });
        }
      });
    });
  } else if (daysDiff <= 14) {
    // Show labels every other day for 2-week view
    const days = eachDayOfInterval({ start, end });
    labels = days
      .filter((_, index) => index % 2 === 0)
      .map(day => ({
        date: startOfDay(day),
        format: 'MMM d',
        showDate: true
      }));
  } else {
    // Show labels every 3 days for 1-month view, with first day of month always shown
    const days = eachDayOfInterval({ start, end });
    labels = days
      .filter(day => isFirstDayOfMonth(day) || getDate(day) % 3 === 1)
      .map(day => ({
        date: startOfDay(day),
        format: 'MMM d',
        showDate: true
      }));
  }

  return labels;
}