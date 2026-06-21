import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { getStats, getAllPatients } from '../api/patients';
import TopBar from '../components/TopBar';
import { UserIcon, UsersIcon, WarningIcon, ChartIcon, HeartIcon, GearIcon, ArrowRightIcon, SuccessIcon } from '../components/Icons';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const URGENCY_ORDER = { Urgent: 0, Priority: 1, Routine: 2 };
const TREND_RANGES = ['Today', 'Last week', 'Last month'];
const DEPT_RANGES = ['Today', 'Last week', 'Last month'];
const DEPT_COLORS = ['#185FA5', '#0F6E56', '#DD6B20', '#E24B4A', '#805ad5', '#D69E2E'];

const formatHourLabel = hour => {
  if (hour === 0) return '12am';
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return '12pm';
  return `${hour - 12}pm`;
};

const getStartOfDay = date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, offset) => {
  const d = new Date(date);
  d.setDate(d.getDate() + offset);
  return d;
};

const getRangeWindow = range => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = getStartOfDay(now);
  if (range === 'Last week') {
    start.setDate(start.getDate() - 6);
  } else if (range === 'Last month') {
    start.setDate(start.getDate() - 29);
  }

  return { start, end };
};

const parseDate = value => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const filterPatientsByRange = (patients, range) => {
  const { start, end } = getRangeWindow(range);
  return patients.filter(p => {
    const created = parseDate(p.created_at);
    return created && created >= start && created <= end;
  });
};

const buildTrendData = (patients, range) => {
  if (range === 'Today') {
    const hours = [8, 10, 12, 14, 16, 18];
    const buckets = hours.map(hour => ({ date: formatHourLabel(hour), Urgent: 0, Priority: 0, Routine: 0 }));

    patients.forEach(patient => {
      const created = parseDate(patient.created_at);
      if (!created) return;
      const bucketIndex = hours.findIndex(hour => created.getHours() >= hour && created.getHours() < hour + 2);
      if (bucketIndex !== -1) {
        const urgency = patient.final_urgency || 'Routine';
        buckets[bucketIndex][urgency] = (buckets[bucketIndex][urgency] || 0) + 1;
      }
    });

    return buckets;
  }

  if (range === 'Last week') {
    const now = new Date();
    const buckets = Array.from({ length: 7 }, (_, idx) => {
      const date = addDays(now, idx - 6);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        urgent: 0,
        priority: 0,
        routine: 0,
        start: getStartOfDay(date),
        end: addDays(getStartOfDay(date), 1),
      };
    });

    patients.forEach(patient => {
      const created = parseDate(patient.created_at);
      if (!created) return;
      const bucket = buckets.find(b => created >= b.start && created < b.end);
      if (bucket) {
        const urgency = patient.final_urgency || 'Routine';
        bucket[urgency.toLowerCase()] += 1;
      }
    });

    return buckets.map(({ date, urgent, priority, routine }) => ({ date, Urgent: urgent, Priority: priority, Routine: routine }));
  }

  const now = new Date();
  const weeks = Array.from({ length: 4 }, (_, idx) => {
    const end = addDays(getStartOfDay(now), -idx * 7 + 6);
    const start = addDays(end, -6);
    return {
      label: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      start: getStartOfDay(start),
      end: addDays(getStartOfDay(end), 1),
      Urgent: 0,
      Priority: 0,
      Routine: 0,
    };
  }).reverse();

  patients.forEach(patient => {
    const created = parseDate(patient.created_at);
    if (!created) return;
    const week = weeks.find(w => created >= w.start && created < w.end);
    if (week) {
      const urgency = patient.final_urgency || 'Routine';
      week[urgency] += 1;
    }
  });

  return weeks.map(w => ({ date: w.label, Urgent: w.Urgent, Priority: w.Priority, Routine: w.Routine }));
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const DeptTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{item.name}</p>
      <p>{item.value} patients</p>
      {item.payload && item.payload.percent != null && (
        <p>{item.payload.percent.toFixed(1)}%</p>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, urgent: 0, priority: 0, routine: 0, overridden: 0 });
  const [waiting, setWaiting] = useState([]);
  const [checked, setChecked] = useState({});
  const [trendRange, setTrendRange] = useState('Last week');
  const [deptRange, setDeptRange] = useState('Today');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [sRes, pRes] = await Promise.all([getStats(), getAllPatients()]);
      setStats(sRes.data);
      const sorted = [...pRes.data].sort((a, b) => {
        const urgencyDiff = (URGENCY_ORDER[a.final_urgency] ?? 2) - (URGENCY_ORDER[b.final_urgency] ?? 2);
        if (urgencyDiff !== 0) return urgencyDiff;

        const aTime = a.created_at ? new Date(a.created_at).getTime() : a.id;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : b.id;
        return aTime - bTime;
      });
      setWaiting(sorted);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCheck = id => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const visibleWaiting = waiting.filter(p => !checked[p.id]);

  const trendPatients = filterPatientsByRange(waiting, trendRange);
  const trendData = buildTrendData(trendPatients, trendRange);

  const deptPatients = filterPatientsByRange(waiting, deptRange);
  const deptMap = {};
  deptPatients.forEach(p => {
    const d = p.final_department || 'General Medicine';
    deptMap[d] = (deptMap[d] || 0) + 1;
  });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));
  const deptTotal = deptData.reduce((s, d) => s + d.value, 0);

  const URGENCY_BADGE = {
    Urgent:   { background: '#E24B4A', color: 'white' },
    Priority: { background: '#DD6B20', color: 'white' },
    Routine:  { background: '#0F6E56', color: 'white' },
  };

  const statCards = [
    { label: "Today's Patients", value: stats.total, icon: <UsersIcon />, dot: null },
    { label: 'Urgent', value: stats.urgent, icon: <WarningIcon />, dot: '#E24B4A' },
    { label: 'Priority', value: stats.priority, icon: <ChartIcon />, dot: '#DD6B20' },
    { label: 'Routine', value: stats.routine, icon: <HeartIcon />, dot: '#38A169' },
    { label: 'AI Overridden', value: stats.overridden, icon: <GearIcon />, dot: '#185FA5' },
  ];

  if (loading) return <div className="dash-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <TopBar action={
        <button className="btn-new-patient" onClick={() => navigate('/register')}>
          <UserIcon /> New patient
        </button>
      } />

      <div className="dashboard-body">
        <div className="dash-header">
          <h1>Dashboard</h1>
          <p>Live overview of clinic intake and triage today.</p>
        </div>

        {/* Stat Cards */}
        <div className="stat-cards">
          {statCards.map(c => (
            <div className="stat-card" key={c.label}>
              <div className="stat-card-top">
                <span className="stat-icon">{c.icon}</span>
                {c.dot && <span className="stat-dot" style={{ background: c.dot }} />}
              </div>
              <div className="stat-num">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Middle: Chart + Waiting */}
        <div className="mid-row">
          <div className="trend-card">
            <div className="chart-header">
              <h3>Total Trends</h3>
              <div className="range-select-wrap">
                <select value={trendRange} onChange={e => setTrendRange(e.target.value)} className="range-select">
                  {TREND_RANGES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#aaa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#aaa' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="Urgent" fill="#E24B4A" radius={[3,3,0,0]} maxBarSize={18} />
                <Bar dataKey="Priority" fill="#DD6B20" radius={[3,3,0,0]} maxBarSize={18} />
                <Bar dataKey="Routine" fill="#0F6E56" radius={[3,3,0,0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="waiting-card">
            <div className="waiting-header">
              <h3>Waiting patients ({visibleWaiting.length})</h3>
              <button className="all-link" onClick={() => navigate('/patients')}>
                All <ArrowRightIcon />
              </button>
            </div>
            <div className="waiting-list">
              {visibleWaiting.length === 0 ? (
                <div className="waiting-empty"><SuccessIcon /> No patients waiting</div>
              ) : (
                visibleWaiting.map(p => (
                  <div className="waiting-item" key={p.id}>
                    <input type="checkbox" className="wcheck" checked={!!checked[p.id]} onChange={() => handleCheck(p.id)} />
                    <div className="winfo">
                      <div className="wname">{p.name}</div>
                      <div className="wcontact">{p.contact}</div>
                    </div>
                    <span className="wbadge" style={URGENCY_BADGE[p.final_urgency] || URGENCY_BADGE.Routine}>
                      {p.final_urgency}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dept donut */}
        <div className="dept-card">
          <div className="chart-header">
            <h3>Patients by Department</h3>
            <div className="range-select-wrap">
              <select value={deptRange} onChange={e => setDeptRange(e.target.value)} className="range-select">
                {DEPT_RANGES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="dept-content">
            <PieChart width={280} height={240}>
              <Tooltip content={<DeptTooltip />} />
              <Pie data={deptData.length ? deptData : [{ name: 'No data', value: 1 }]}
                cx={140} cy={120} innerRadius={70} outerRadius={110}
                dataKey="value" nameKey="name" startAngle={90} endAngle={-270}>
                {(deptData.length ? deptData : [{ name: 'No data', value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={deptData.length ? DEPT_COLORS[i % DEPT_COLORS.length] : '#e2e8f0'} />
                ))}
              </Pie>
              <text x={140} y={115} textAnchor="middle" dominantBaseline="middle" fontSize={28} fontWeight={700} fill="#1A202C">
                {deptTotal || 0}
              </text>
              <text x={140} y={138} textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="#B4B2A9">
                Total
              </text>
            </PieChart>
            <div className="dept-legend">
              {(deptData.length ? deptData : []).map((d, i) => (
                <div className="dept-legend-item" key={d.name}>
                  <span className="dept-dot" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                  <span>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;