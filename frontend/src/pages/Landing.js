import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StethoscopeIcon, ClipboardIcon, RobotIcon, DoctorIcon, ArrowRightIcon } from '../components/Icons';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-logo"><StethoscopeIcon /></div>
          <span>Intake</span>
        </div>
        <div className="landing-nav-links">
          <a href="#how">How it works</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-icon"><StethoscopeIcon /></div>
        <div className="hero-tag">● BUILT FOR CLINICS</div>
        <h1>Patient Intake</h1>
        <p>Streamline patient registration, AI-assisted triage, and clinic workflow management.</p>
        <div className="hero-btns">
          <button className="btn-signin" onClick={() => navigate('/login')}>
            Sign In →
          </button>
          <button className="btn-create-acc" onClick={() => navigate('/register-user')}>
            Create Account
          </button>
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="how-tag">HOW IT WORKS</div>
        <div className="steps-grid">
          {[
            { icon: <ClipboardIcon />, num: '01', title: 'Patient Registration', desc: 'Receptionists capture patient information and presenting symptoms in a single guided form.' },
            { icon: <RobotIcon />, num: '02', title: 'AI Triage Assessment', desc: 'Our model analyzes symptoms and assigns an urgency level with department routing.' },
            { icon: <DoctorIcon />, num: '03', title: 'Clinical Review', desc: 'Staff review the triage, manage the waiting queue, and prioritize the right patient first.' },
          ].map((s, i) => (
            <div className="step-card" key={i}>
              <div className="step-top">
                <div className="step-icon-wrap">{s.icon}</div>
                <div className="step-num">{s.num}</div>
              </div>
              {i < 2 && <div className="step-arrow"><ArrowRightIcon /></div>}
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <span>© 2026 Intake Health Systems</span>
      </footer>
    </div>
  );
};

export default Landing;