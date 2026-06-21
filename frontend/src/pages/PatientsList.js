import React, { useState, useEffect, useCallback } from 'react';
import { getAllPatients, searchPatients } from '../api/patients';
import TopBar from '../components/TopBar';
import './PatientsList.css';

const CRIT = {
  Urgent:   { background: '#E24B4A', color: 'white' },
  Priority: { background: '#DD6B20', color: 'white' },
  Routine:  { background: '#0F6E56', color: 'white' },
};

const fmtDate = iso => new Date(iso).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
const fmtTime = iso => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [urgency, setUrgency] = useState('All urgencies');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await getAllPatients();
      setPatients(res.data);
    } catch {
      setError('Failed to load patients.');
    }
    setLoading(false);
  };

  const applyFilters = useCallback(() => {
    let list = [...patients];
    if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (date) list = list.filter(p => p.created_at?.startsWith(date));
    if (urgency !== 'All urgencies') list = list.filter(p => p.final_urgency === urgency);
    setFiltered(list);
  }, [patients, search, date, urgency]);

  useEffect(() => { load(); }, []);
  useEffect(() => { applyFilters(); }, [applyFilters]);

  const handleSearch = async e => {
    const q = e.target.value;
    setSearch(q);
    if (q.length > 1) {
      try { const res = await searchPatients(q); setPatients(res.data); } catch {}
    } else if (!q) { load(); }
  };

  return (
    <div className="plist-page">
      <TopBar />
      <div className="plist-body">
        <div className="plist-header">
          <h1>Patients list</h1>
          <p>Search, filter, and review every patient registered through intake.</p>
        </div>

        <div className="plist-controls">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              value={search}
              onChange={handleSearch}
              placeholder="Search patient by name..."
            />
          </div>
          <input className="date-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <div className="filter-wrap">
            <span className="filter-icon">▼</span>
            <select className="urgency-select" value={urgency} onChange={e => setUrgency(e.target.value)}>
              <option>All urgencies</option>
              <option>Urgent</option>
              <option>Priority</option>
              <option>Routine</option>
            </select>
          </div>
        </div>

        {error && <div className="plist-error">{error}</div>}

        {loading ? (
          <div className="plist-loading">Loading patients...</div>
        ) : (
          <div className="plist-table-wrap">
            <table className="plist-table">
              <thead>
                <tr>
                  <th>PATIENT NAME</th>
                  <th>AGE</th>
                  <th>SYMPTOMS</th>
                  <th>DEPARTMENT</th>
                  <th>CRITICALITY</th>
                  <th>DATE</th>
                  <th>TIME</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="plist-empty">No patients found</td></tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id} className="plist-row">
                      <td className="pname">{p.name}</td>
                      <td>{p.age}</td>
                      <td className="psym" title={p.symptoms}>
                        {p.symptoms?.length > 55 ? p.symptoms.slice(0, 55) + '…' : p.symptoms}
                      </td>
                      <td>{p.final_department}</td>
                      <td>
                        <span className="crit-pill" style={CRIT[p.final_urgency] || CRIT.Routine}>
                          {p.final_urgency}
                        </span>
                      </td>
                      <td className="pdate">{fmtDate(p.created_at)}</td>
                      <td className="ptime">{fmtTime(p.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsList;