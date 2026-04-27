import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../Utils/Api';
import { Spinner, EmptyState, Modal } from '../Components/UI';
import { Users, Plus, Search, Calendar, Pill, ChevronRight, Eye, EyeOff } from 'lucide-react';

export default function AdminPatients() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  function loadUsers() {
    setLoading(true);
    api.get('/admin/users').then(setUsers).finally(() => setLoading(false));
  }

  useEffect(loadUsers, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-surface-900">Patients</h1>
          <p className="text-surface-400 text-sm mt-1">{users.length} patients in the system</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> New Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          className="input-field pl-11"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No matches' : 'No patients yet'}
          description={search ? 'Try a different search term.' : 'Create your first patient to get started.'}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-50 text-xs uppercase text-surface-400 tracking-wider">
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold hidden sm:table-cell">Email</th>
                <th className="px-5 py-3 font-semibold text-center">Appointments</th>
                <th className="px-5 py-3 font-semibold text-center">Prescriptions</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-sm text-surface-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-surface-500 hidden sm:table-cell">{user.email}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-surface-600">
                      <Calendar size={14} className="text-surface-400" />
                      {user.appointment_count}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-surface-600">
                      <Pill size={14} className="text-surface-400" />
                      {user.prescription_count}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/admin/patients/${user.id}`}
                      className="btn-ghost text-brand-600 text-sm"
                    >
                      View <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New patient modal */}
      <NewPatientModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => { setShowForm(false); loadUsers(); }}
      />
    </div>
  );
}

function NewPatientModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/admin/users', form);
      setForm({ name: '', email: '', password: '' });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Patient">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input name="name" className="input-field" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" className="input-field" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPw ? 'text' : 'password'}
              className="input-field pr-12"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-surface-400 mt-1">This password will be used for patient portal login</p>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create Patient'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
