import { useState, useEffect } from 'react';
import { api } from '../Utils/Api';
import { getUpcomingOccurrences } from '../Utils/Dates';
import { Spinner, EmptyState } from '../Components/UI';
import { Calendar, Clock, RefreshCw, MapPin } from 'lucide-react';
import { addMonths, format, startOfDay, isToday, isTomorrow, isThisWeek } from 'date-fns';

export default function PortalAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/portal/appointments').then(setAppointments).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const now = new Date();
  const threeMonthsOut = addMonths(now, 3);

  // Generate all occurrences for the next 3 months
  const allOccurrences = appointments.flatMap(appt => {
    const occurrences = getUpcomingOccurrences(appt, startOfDay(now), threeMonthsOut);
    return occurrences.map(date => ({ ...appt, occurrenceDate: date }));
  }).sort((a, b) => a.occurrenceDate - b.occurrenceDate);

  // Group by month
  const groupedByMonth = {};
  allOccurrences.forEach(item => {
    const key = format(item.occurrenceDate, 'MMMM yyyy');
    if (!groupedByMonth[key]) groupedByMonth[key] = [];
    groupedByMonth[key].push(item);
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-surface-900 mb-1">Appointments</h1>
        <p className="text-surface-400 text-sm">Your schedule for the next 3 months</p>
      </div>

      {allOccurrences.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No upcoming appointments"
          description="You don't have any appointments scheduled."
        />
      ) : (
        Object.entries(groupedByMonth).map(([month, items]) => (
          <section key={month}>
            <h2 className="font-display text-lg text-surface-700 mb-3 sticky top-32 bg-surface-50 py-1 z-10">
              {month}
            </h2>
            <div className="space-y-3">
              {items.map((item, i) => {
                const dateLabel = isToday(item.occurrenceDate)
                  ? 'Today'
                  : isTomorrow(item.occurrenceDate)
                  ? 'Tomorrow'
                  : format(item.occurrenceDate, 'EEEE, MMM d');

                return (
                  <div key={`${item.id}-${i}`} className="card px-5 py-4 flex items-start gap-4">
                    <div className="text-center shrink-0 w-14">
                      <p className="text-xs font-semibold text-brand-500 uppercase">
                        {format(item.occurrenceDate, 'EEE')}
                      </p>
                      <p className="text-2xl font-bold text-surface-800 leading-tight">
                        {format(item.occurrenceDate, 'd')}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-800">{item.provider}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {format(item.occurrenceDate, 'h:mm a')}
                        </span>
                        <span className="flex items-center gap-1">
                          <RefreshCw size={12} />
                          {item.repeat}
                        </span>
                      </div>
                    </div>
                    {isToday(item.occurrenceDate) && (
                      <span className="badge-blue">Today</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
