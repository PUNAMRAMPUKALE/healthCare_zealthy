import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { getUpcomingOccurrences, getUpcomingRefills, formatDateTime, formatDate } from '../utils/dates';
import { Spinner, EmptyState } from '../components/UI';
import { Calendar, Pill, User, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { addDays, format } from 'date-fns';

export default function PortalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/portal/summary').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!data) return null;

  const now = new Date();
  const weekFromNow = addDays(now, 7);

  // Compute upcoming appointments in next 7 days
  const upcomingAppointments = data.appointments.flatMap(appt => {
    const occurrences = getUpcomingOccurrences(appt, now, weekFromNow);
    return occurrences.map(date => ({ ...appt, nextDate: date }));
  }).sort((a, b) => a.nextDate - b.nextDate);

  // Compute upcoming refills in next 7 days
  const upcomingRefills = data.prescriptions.flatMap(rx => {
    const refills = getUpcomingRefills(rx, now, weekFromNow);
    return refills.map(date => ({ ...rx, nextRefill: date }));
  }).sort((a, b) => a.nextRefill - b.nextRefill);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl text-surface-900 mb-1">
          Good {getTimeGreeting()}, {data.user.name.split(' ')[0]}
        </h1>
        <p className="text-surface-400">Here's what's coming up this week.</p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={User}
          label="Patient"
          value={data.user.name}
          sub={data.user.email}
          color="brand"
        />
        <SummaryCard
          icon={Calendar}
          label="Appointments this week"
          value={upcomingAppointments.length}
          sub={`${data.appointments.length} total active`}
          color="brand"
        />
        <SummaryCard
          icon={Pill}
          label="Refills this week"
          value={upcomingRefills.length}
          sub={`${data.prescriptions.length} active prescriptions`}
          color="brand"
        />
      </div>

      {/* Upcoming appointments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-surface-900">Upcoming Appointments</h2>
          <Link to="/portal/appointments" className="btn-ghost text-brand-600 text-sm">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {upcomingAppointments.length === 0 ? (
          <div className="card p-8 text-center text-surface-400 text-sm">
            No appointments in the next 7 days.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appt, i) => (
              <div key={`${appt.id}-${i}`} className="card px-5 py-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800">{appt.provider}</p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {format(appt.nextDate, 'EEEE, MMM d · h:mm a')}
                  </p>
                </div>
                <div className="badge-blue flex items-center gap-1">
                  <RefreshCw size={10} />
                  {appt.repeat}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming refills */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-surface-900">Upcoming Refills</h2>
          <Link to="/portal/prescriptions" className="btn-ghost text-brand-600 text-sm">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {upcomingRefills.length === 0 ? (
          <div className="card p-8 text-center text-surface-400 text-sm">
            No refills due in the next 7 days.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingRefills.map((rx, i) => (
              <div key={`${rx.id}-${i}`} className="card px-5 py-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Pill size={18} className="text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800">
                    {rx.medication} {rx.dosage}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    Qty: {rx.quantity} · Refill on {format(rx.nextRefill, 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="badge-green flex items-center gap-1">
                  <RefreshCw size={10} />
                  {rx.refill_schedule}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg bg-${color}-50 flex items-center justify-center`}>
          <Icon size={16} className={`text-${color}-500`} />
        </div>
        <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-surface-900">{value}</p>
      <p className="text-xs text-surface-400 mt-1">{sub}</p>
    </div>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
