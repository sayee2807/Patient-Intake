import React, { useState } from 'react';
import { registerPatient, suggestPatient } from '../api/patients';
import TopBar from '../components/TopBar';
import { RobotIcon, SparkIcon, HospitalIcon, DocumentIcon, CheckIcon, PencilIcon, SaveIcon, SuccessIcon } from '../components/Icons';
import './Register.css';

const DEPARTMENTS = ['General Medicine','Cardiology','Orthopedics','Neurology','Pediatrics','Emergency','ENT','Dermatology'];
const INIT = { name: '', age: '', gender: '', contact: '', symptoms: '' };

const URGENCY_STYLE = {
  Urgent:   { background: '#E24B4A', color: 'white' },
  Priority: { background: '#DD6B20', color: 'white' },
  Routine:  { background: '#0F6E56', color: 'white' },
};

const Register = () => {
  const [form, setForm] = useState(INIT);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [overrideMode, setOverrideMode] = useState(false);
  const [overrideUrgency, setOverrideUrgency] = useState('');
  const [overrideDept, setOverrideDept] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const setGender = g => setForm({ ...form, gender: g });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);
    setOverrideMode(false);
    try {
      const res = await suggestPatient({ ...form, age: parseInt(form.age) });
      setResult(res.data);
      setOverrideUrgency(res.data.ai_urgency);
      setOverrideDept(res.data.ai_department);
    } catch {
      setError('Failed to analyze symptoms. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setSaving(true);
    try {
      const res = await registerPatient({
        ...form,
        age: parseInt(form.age),
        ai_urgency: result.ai_urgency,
        ai_department: result.ai_department,
        ai_reasoning: result.ai_reasoning,
        final_urgency: result.ai_urgency,
        final_department: result.ai_department,
        was_overridden: false,
      });
      setResult(res.data);
      setSaved(true);
      setOverrideMode(false);
    } catch {
      setError('Failed to save patient. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOverride = async () => {
    setSaving(true);
    try {
      const res = await registerPatient({
        ...form,
        age: parseInt(form.age),
        ai_urgency: result.ai_urgency,
        ai_department: result.ai_department,
        ai_reasoning: result.ai_reasoning,
        final_urgency: overrideUrgency,
        final_department: overrideDept,
        was_overridden: true,
      });
      setResult(res.data);
      setSaved(true);
      setOverrideMode(false);
    } catch {
      setError('Failed to save overridden patient. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm(INIT);
    setResult(null);
    setSaved(false);
    setError('');
    setOverrideMode(false);
    setOverrideUrgency('');
    setOverrideDept('');
  };

  const handleClear = () => {
    setForm(INIT);
    setResult(null);
    setSaved(false);
    setError('');
    setOverrideMode(false);
  };

  const us = result ? (URGENCY_STYLE[result.ai_urgency] || URGENCY_STYLE.Routine) : null;

  return (
    <div className="register-page">
      <TopBar />
      <div className="register-body">
        <div className="register-header">
          <h1>Register patient</h1>
          <p>Capture patient details and let AI suggest a department and urgency.</p>
        </div>

        <div className="register-layout">
          {/* Left: Form */}
          <div className="form-card">
            <div className="form-card-header">
              <h3>Patient information</h3>
              <p>All fields are required.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label>FULL NAME</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" required />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>AGE</label>
                  <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="—" min="0" max="150" required />
                </div>
                <div className="field-group">
                  <label>CONTACT NUMBER</label>
                  <input name="contact" value={form.contact} onChange={handleChange} placeholder="9876543210" pattern="[0-9]{10}" maxLength={10} required />
                </div>
              </div>

              <div className="field-group">
                <label>GENDER</label>
                <div className="gender-toggle">
                  {['Male', 'Female', 'Other'].map(g => (
                    <button
                      key={g} type="button"
                      className={`gender-btn ${form.gender === g ? 'active' : ''}`}
                      onClick={() => setGender(g)}
                    >{g}</button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label>SYMPTOMS</label>
                <textarea name="symptoms" value={form.symptoms} onChange={handleChange}
                  placeholder='Try "chest pain", "high fever", or "sprained ankle"...'
                  rows={5} required />
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                    ? <><span className="spinner" /> Analyzing symptoms...</>
                    : 'Register patient'}
                </button>
                <button type="button" className="btn-clear" onClick={handleClear}>Clear form</button>
              </div>
            </form>
          </div>

          {/* Right: AI Triage Panel */}
          <div className={`triage-card ${result ? 'has-result' : ''}`}>
            <div className="triage-card-header">
              <div className="triage-header-left">
                <div className="triage-icon-wrap"><RobotIcon /></div>
                <div>
                  <h3>AI triage assessment</h3>
                </div>
              </div>
              <span className="triage-spark"><SparkIcon /></span>
            </div>

            {!result ? (
              <div className="triage-empty">
                <div className="triage-empty-rows">
                  <div className="triage-row-placeholder">
                    <span className="tph-label">SUGGESTED DEPARTMENT</span>
                    <span className="tph-val">—</span>
                  </div>
                  <div className="triage-row-placeholder">
                    <span className="tph-label">URGENCY LEVEL</span>
                    <span className="tph-pill gray">Awaiting input</span>
                  </div>
                  <div className="triage-row-placeholder">
                    <span className="tph-label">SYMPTOM SUMMARY</span>
                    <span className="tph-val muted">Enter symptoms to generate AI assessment.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="triage-result">
                <div className="triage-row">
                  <div className="triage-row-icon"><HospitalIcon /></div>
                  <div>
                    <div className="triage-row-label">SUGGESTED DEPARTMENT</div>
                    <div className="triage-row-value">{result.ai_department}</div>
                  </div>
                </div>

                <div className="triage-row">
                  <div>
                    <div className="triage-row-label">URGENCY LEVEL</div>
                    <span className="urgency-pill" style={us}>{result.ai_urgency}</span>
                  </div>
                </div>

                <div className="triage-row">
                  <div className="triage-row-icon"><DocumentIcon /></div>
                  <div>
                    <div className="triage-row-label">SYMPTOM SUMMARY</div>
                    <div className="triage-row-value symptom">{result.ai_reasoning}</div>
                  </div>
                </div>

                {overrideMode && (
                  <div className="override-section">
                    <div className="override-fields">
                      <div>
                        <label>Urgency</label>
                        <select value={overrideUrgency} onChange={e => setOverrideUrgency(e.target.value)}>
                          <option>Routine</option><option>Priority</option><option>Urgent</option>
                        </select>
                      </div>
                      <div>
                        <label>Department</label>
                        <select value={overrideDept} onChange={e => setOverrideDept(e.target.value)}>
                          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {saved ? (
                  <div className="saved-banner"><SuccessIcon /> Decision saved successfully</div>
                ) : (
                  <div className="triage-actions">
                    <button className="btn-accept" onClick={overrideMode ? handleSaveOverride : handleAccept} disabled={saving}>
                      {saving ? '...' : overrideMode ? <><SaveIcon /> Save override</> : <><CheckIcon /> Accept</>}
                    </button>
                    {!overrideMode && (
                      <button className="btn-override" onClick={() => setOverrideMode(true)}>
                        <PencilIcon /> Override
                      </button>
                    )}
                    {overrideMode && (
                      <button className="btn-cancel" onClick={() => setOverrideMode(false)}>Cancel</button>
                    )}
                    <button className="btn-discard" type="button" onClick={handleDiscard} disabled={saving}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 6h18M9 6V4h6v2m-4 4v7m-2-7v7m-4-7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                      Discard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;