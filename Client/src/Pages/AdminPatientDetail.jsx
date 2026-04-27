import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../Utils/api';
import { formatDateTime, formatDate } from '../Utils/dates';
import { Spinner, Modal, ConfirmDialog, EmptyState } from '../Components/UI';
import {
  ArrowLeft, Calendar, Pill, Plus, Pencil, Trash2, User,
  Save, RefreshCw, Eye, EyeOff, Ban, Clock
} from 'lucide-react';

export default function AdminPatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meds, setMeds] = useState([]);
  const [dosages, setDosages] = useState([]);

  // Modal states
  const [editPatient, setEditPatient] = useState(false);
  const [apptModal, setApptModal] = useState({ open: false, data: null });
  const [rxModal, setRxModal] = useState({ open: false, data: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, type: '', id: null });
  const [toast, setToast] = useState('');

  const loadPatient = useCallback(() => {
    api.get(`/admin/users/${id}`).then(setPatient).catch(() => navigate('/admin'));
  }, [id, navigate]);

  useEffect(() => {
    Promise.all([
      api.get(`/admin/users/${id}`),
      api.get('/admin/medications'),
      api.get('/admin/dosages'),
    ]).then(([p, m, d]) => {
      setPatient(p);
      setMeds(m);
      setDosages(d);
    }).catch(() => navigate('/admin'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleDeleteAppt() {
    await api.delete(`/admin/appointments/${confirmDelete.id}`);
    setConfirmDelete({ open: false, type: '', id: null });
    loadPatient();
    showToast('Appointment deleted');
  }

  async function handleDeleteRx() {
    await api.delete(`/admin/prescriptions/${confirmDelete.id}`);
    setConfirmDelete({ open: false, type: '', id: null });
    loadPatient();
    showToast('Prescription deleted');
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!patient) return null;

  const activeAppts = patient.appointments.filter(a => !a.cancelled);
  const cancelledAppts = patient.appointments.filter(a => a.cancelled);
  const activeRx = patient.prescriptions.filter(r => r.active);
  const inactiveRx = patient.prescriptions.filter(r => !r.active);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/admin')} className="btn-ghost mt-1">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-lg font-bold">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="font-display text-2xl text-surface-900">{patient.name}</h1>
              <p className="text-sm text-surface-400">{patient.email}</p>
            </div>
          </div>
        </div>
        <button onClick={() => setEditPatient(true)} className="btn-secondary">
          <Pencil size={14} /> Edit Patient
        </button>
      </div>

      {/* Appointments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-surface-900 flex items-center gap-2">
            <Calendar size={20} className="text-brand-500" /> Appointments
          </h2>
          <button onClick={() => setApptModal({ open: true, data: null })} className="btn-primary text-sm">
            <Plus size={14} /> New Appointment
          </button>
        </div>

        {activeAppts.length === 0 ? (
          <EmptyState icon={Calendar} title="No appointments" description="Schedule the patient's first appointment." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-50 text-xs uppercase text-surface-400 tracking-wider">
                  <th className="px-5 py-3 font-semibold">Provider</th>
                  <th className="px-5 py-3 font-semibold">Date & Time</th>
                  <th className="px-5 py-3 font-semibold">Repeat</th>
                  <th className="px-5 py-3 font-semibold">End Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {activeAppts.map(appt => (
                  <tr key={appt.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-surface-800">{appt.provider}</td>
                    <td className="px-5 py-3.5 text-sm text-surface-600">{formatDateTime(appt.datetime)}</td>
                    <td className="px-5 py-3.5">
                      <span className="badge-blue">{appt.repeat || 'none'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-surface-500">
                      {appt.end_date ? formatDate(appt.end_date) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setApptModal({ open: true, data: appt })}
                          className="btn-ghost p-1.5"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ open: true, type: 'appt', id: appt.id })}
                          className="btn-ghost p-1.5 text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Prescriptions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-surface-900 flex items-center gap-2">
            <Pill size={20} className="text-green-500" /> Prescriptions
          </h2>
          <button onClick={() => setRxModal({ open: true, data: null })} className="btn-primary text-sm">
            <Plus size={14} /> New Prescription
          </button>
        </div>

        {activeRx.length === 0 && inactiveRx.length === 0 ? (
          <EmptyState icon={Pill} title="No prescriptions" description="Add the patient's first prescription." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-50 text-xs uppercase text-surface-400 tracking-wider">
                  <th className="px-5 py-3 font-semibold">Medication</th>
                  <th className="px-5 py-3 font-semibold">Dosage</th>
                  <th className="px-5 py-3 font-semibold">Qty</th>
                  <th className="px-5 py-3 font-semibold">Next Refill</th>
                  <th className="px-5 py-3 font-semibold">Schedule</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {[...activeRx, ...inactiveRx].map(rx => (
                  <tr key={rx.id} className={`hover:bg-surface-50 transition-colors ${!rx.active ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3.5 text-sm font-medium text-surface-800">{rx.medication}</td>
                    <td className="px-5 py-3.5 text-sm text-surface-600">{rx.dosage}</td>
                    <td className="px-5 py-3.5 text-sm text-surface-600">{rx.quantity}</td>
                    <td className="px-5 py-3.5 text-sm text-surface-600">{formatDate(rx.refill_on)}</td>
                    <td className="px-5 py-3.5">
                      <span className="badge-green">{rx.refill_schedule}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {rx.active ? (
                        <span className="badge-green">Active</span>
                      ) : (
                        <span className="badge-red">Inactive</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setRxModal({ open: true, data: rx })}
                          className="btn-ghost p-1.5"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ open: true, type: 'rx', id: rx.id })}
                          className="btn-ghost p-1.5 text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modals */}
      <EditPatientModal
        open={editPatient}
        onClose={() => setEditPatient(false)}
        patient={patient}
        onSaved={() => { setEditPatient(false); loadPatient(); showToast('Patient updated'); }}
      />

      <AppointmentModal
        open={apptModal.open}
        onClose={() => setApptModal({ open: false, data: null })}
        data={apptModal.data}
        userId={patient.id}
        onSaved={() => { setApptModal({ open: false, data: null }); loadPatient(); showToast('Appointment saved'); }}
      />

      <PrescriptionModal
        open={rxModal.open}
        onClose={() => setRxModal({ open: false, data: null })}
        data={rxModal.data}
        userId={patient.id}
        medications={meds}
        dosages={dosages}
        onSaved={() => { setRxModal({ open: false, data: null }); loadPatient(); showToast('Prescription saved'); }}
      />

      <ConfirmDialog
        open={confirmDelete.open && confirmDelete.type === 'appt'}
        onClose={() => setConfirmDelete({ open: false, type: '', id: null })}
        onConfirm={handleDeleteAppt}
        title="Delete Appointment"
        message="This will permanently remove this appointment. This cannot be undone."
      />

      <ConfirmDialog
        open={confirmDelete.open && confirmDelete.type === 'rx'}
        onClose={() => setConfirmDelete({ open: false, type: '', id: null })}
        onConfirm={handleDeleteRx}
        title="Delete Prescription"
        message="This will permanently remove this prescription. This cannot be undone."
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-green-50 text-green-800 border border-green-200 shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}

// ============ Edit Patient Modal ============
function EditPatientModal({ open, onClose, patient, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patient && open) {
      setForm({ name: patient.name, email: patient.email, password: '' });
      setError('');
    }
  }, [patient, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = { name: form.name, email: form.email };
      if (form.password) body.password = form.password;
      await api.put(`/admin/users/${patient.id}`, body);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Patient">
      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input-field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div>
          <label className="label">New Password (leave blank to keep current)</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              className="input-field pr-12"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ============ Appointment Modal ============
function AppointmentModal({ open, onClose, data, userId, onSaved }) {
  const isEdit = !!data;
  const [form, setForm] = useState({ provider: '', datetime: '', repeat: 'none', end_date: '', cancelled: false });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (data) {
        setForm({
          provider: data.provider,
          datetime: data.datetime.slice(0, 16), // for datetime-local input
          repeat: data.repeat || 'none',
          end_date: data.end_date || '',
          cancelled: !!data.cancelled,
        });
      } else {
        setForm({ provider: '', datetime: '', repeat: 'none', end_date: '', cancelled: false });
      }
      setError('');
    }
  }, [open, data]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = {
        provider: form.provider,
        datetime: form.datetime,
        repeat: form.repeat,
        end_date: form.end_date || null,
        cancelled: form.cancelled,
      };

      if (isEdit) {
        await api.put(`/admin/appointments/${data.id}`, body);
      } else {
        await api.post(`/admin/users/${userId}/appointments`, body);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Appointment' : 'New Appointment'}>
      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Provider Name</label>
          <input className="input-field" placeholder="Dr Jane Doe" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Date & Time</label>
          <input type="datetime-local" className="input-field" value={form.datetime} onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Repeat Schedule</label>
          <select className="input-field" value={form.repeat} onChange={e => setForm(f => ({ ...f, repeat: e.target.value }))}>
            <option value="none">None (one-time)</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        {form.repeat !== 'none' && (
          <div>
            <label className="label">End Date (to stop recurring)</label>
            <input type="date" className="input-field" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            <p className="text-xs text-surface-400 mt-1">Leave blank for no end date</p>
          </div>
        )}
        {isEdit && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.cancelled}
              onChange={e => setForm(f => ({ ...f, cancelled: e.target.checked }))}
              className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-300"
            />
            <span className="text-sm text-surface-600">Cancel this appointment</span>
          </label>
        )}
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ============ Prescription Modal ============
function PrescriptionModal({ open, onClose, data, userId, medications, dosages, onSaved }) {
  const isEdit = !!data;
  const [form, setForm] = useState({
    medication: '', dosage: '', quantity: 1, refill_on: '', refill_schedule: 'monthly', active: true
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (data) {
        setForm({
          medication: data.medication,
          dosage: data.dosage,
          quantity: data.quantity,
          refill_on: data.refill_on,
          refill_schedule: data.refill_schedule,
          active: !!data.active,
        });
      } else {
        setForm({ medication: '', dosage: '', quantity: 1, refill_on: '', refill_schedule: 'monthly', active: true });
      }
      setError('');
    }
  }, [open, data]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/admin/prescriptions/${data.id}`, form);
      } else {
        await api.post(`/admin/users/${userId}/prescriptions`, form);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Prescription' : 'New Prescription'}>
      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Medication</label>
          <select className="input-field" value={form.medication} onChange={e => setForm(f => ({ ...f, medication: e.target.value }))} required>
            <option value="">Select medication…</option>
            {medications.map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Dosage</label>
            <select className="input-field" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} required>
              <option value="">Select dosage…</option>
              {dosages.map(d => (
                <option key={d.id} value={d.value}>{d.value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Quantity</label>
            <input type="number" min="1" className="input-field" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Next Refill Date</label>
            <input type="date" className="input-field" value={form.refill_on} onChange={e => setForm(f => ({ ...f, refill_on: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Refill Schedule</label>
            <select className="input-field" value={form.refill_schedule} onChange={e => setForm(f => ({ ...f, refill_schedule: e.target.value }))}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        {isEdit && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-300"
            />
            <span className="text-sm text-surface-600">Active prescription</span>
          </label>
        )}
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Prescription'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
