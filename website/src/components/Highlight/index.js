import React from 'react';

export default function Highlight({ children, color }) {
  return (
    <span
      style={{
        backgroundColor: color || '#ffffff0d',
        borderRadius: '1.5rem',
        color: '#25c19f',
        padding: '0.2rem 0.5rem',
      }}
    >
      {children}
    </span>
  );
}
