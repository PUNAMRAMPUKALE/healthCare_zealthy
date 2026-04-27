import { useState, useEffect } from 'react';
import { api } from '../Utils/Api';
import { getUpcomingRefills } from '../Utils/Dates';
import { Spinner, EmptyState } from '../Components/UI';
import { Pill, RefreshCw, Package, Hash } from 'lucide-react';
import { addMonths, format, startOfDay } from 'date-fns';

export default function PortalPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/portal/prescriptions').then(setPrescriptions).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const now = new Date();
  const threeMonthsOut = addMonths(now, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-surface-900 mb-1">Prescriptions</h1>
        <p className="text-surface-400 text-sm">Your medications and refill schedule</p>
      </div>

      {prescriptions.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No active prescriptions"
          description="You don't have any active prescriptions."
        />
      ) : (
        <div className="space-y-6">
          {prescriptions.map(rx => {
            const upcomingRefills = getUpcomingRefills(rx, startOfDay(now), threeMonthsOut);

            return (
              <div key={rx.id} className="card overflow-hidden">
                <div className="px-5 py-4 flex items-center gap-4 border-b border-surface-100">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Pill size={18} className="text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-surface-800">{rx.medication}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-surface-400">
                      <span className="flex items-center gap-1">
                        <Package size={12} />
                        {rx.dosage} × {rx.quantity}
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw size={12} />
                        {rx.refill_schedule}
                      </span>
                    </div>
                  </div>
                  <div className="badge-green">Active</div>
                </div>

                <div className="px-5 py-3">
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                    Upcoming refills (3 months)
                  </p>
                  {upcomingRefills.length === 0 ? (
                    <p className="text-sm text-surface-400 pb-2">No refills in range</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pb-1">
                      {upcomingRefills.map((date, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 rounded-lg bg-surface-50 text-sm text-surface-600 border border-surface-100"
                        >
                          {format(date, 'MMM d, yyyy')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
