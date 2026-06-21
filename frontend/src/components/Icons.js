import React from 'react';
import './Icons.css';

const SvgIcon = ({ viewBox = '0 0 24 24', children, ...props }) => (
  <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {children}
  </svg>
);

export const RobotIcon = () => (
  <SvgIcon>
    <rect x="4" y="6" width="16" height="12" rx="3" />
    <path d="M8 6V4" />
    <path d="M16 6V4" />
    <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
    <path d="M8 17h8" />
  </SvgIcon>
);

export const HospitalIcon = () => (
  <SvgIcon>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M12 8v5" />
    <path d="M9 11h6" />
  </SvgIcon>
);

export const DocumentIcon = () => (
  <SvgIcon>
    <path d="M6 4h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <path d="M14 4v5h5" />
    <path d="M9 14h6" />
    <path d="M9 18h6" />
  </SvgIcon>
);

export const CheckIcon = () => (
  <SvgIcon>
    <path d="M5 13l4 4L19 7" />
  </SvgIcon>
);

export const PencilIcon = () => (
  <SvgIcon>
    <path d="M12 19h7" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
  </SvgIcon>
);

export const SparkIcon = () => (
  <SvgIcon>
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M5 5l3 3" />
    <path d="M16 16l3 3" />
    <path d="M5 19l3-3" />
    <path d="M16 8l3-3" />
  </SvgIcon>
);

export const UserIcon = () => (
  <SvgIcon>
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
    <path d="M6 20c0-3.333 2.667-6 6-6s6 2.667 6 6" />
  </SvgIcon>
);

export const UsersIcon = () => (
  <SvgIcon>
    <path d="M9 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
    <path d="M21 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
    <path d="M3 20c0-3.333 2.667-6 6-6" />
    <path d="M15 20c0-3.333 2.667-6 6-6" />
  </SvgIcon>
);

export const StethoscopeIcon = () => (
  <SvgIcon>
    <path d="M16 21a4 4 0 0 1-8 0V14" />
    <path d="M8 14V7a4 4 0 0 1 8 0v7" />
    <path d="M9 20a3 3 0 0 0 6 0" />
    <path d="M12 4v3" />
  </SvgIcon>
);

export const ClipboardIcon = () => (
  <SvgIcon>
    <path d="M8 4h8" />
    <path d="M9 4V2h6v2" />
    <rect x="6" y="6" width="12" height="14" rx="2" />
  </SvgIcon>
);

export const DoctorIcon = () => (
  <SvgIcon>
    <circle cx="12" cy="7" r="3" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M12 11v4" />
    <path d="M10 13h4" />
  </SvgIcon>
);

export const SaveIcon = () => (
  <SvgIcon>
    <path d="M6 4h12v16H6z" />
    <path d="M6 8h12" />
    <path d="M9 4v4" />
    <path d="M15 4v4" />
  </SvgIcon>
);

export const SuccessIcon = () => (
  <SvgIcon>
    <circle cx="12" cy="12" r="8" />
    <path d="M9 12l2 2 4-4" />
  </SvgIcon>
);

export const WarningIcon = () => (
  <SvgIcon>
    <path d="M12 3l8.66 15H3.34L12 3z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </SvgIcon>
);

export const ChartIcon = () => (
  <SvgIcon>
    <path d="M4 20h16" />
    <path d="M8 16v4" />
    <path d="M12 12v8" />
    <path d="M16 8v12" />
  </SvgIcon>
);

export const HeartIcon = () => (
  <SvgIcon>
    <path d="M12 20s-6-4.35-9-8.5C1 7.5 3.5 4 7 4c1.8 0 3.4 1 4 2.5C12.6 5 14.2 4 16 4c3.5 0 6 3.5 5 7.5-3 4.15-9 8.5-9 8.5z" />
  </SvgIcon>
);

export const GearIcon = () => (
  <SvgIcon>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 8.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 9.6a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 15z" />
  </SvgIcon>
);

export const ArrowRightIcon = () => (
  <SvgIcon viewBox="0 0 24 24">
    <path d="M5 12h14" />
    <path d="M15 6l6 6-6 6" />
  </SvgIcon>
);
