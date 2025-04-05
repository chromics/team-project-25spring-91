// pages/api-test.tsx or any component
"use client";
import { useState, useEffect } from 'react';

export default function ApiTest() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(err => setError('Failed to connect to backend: ' + err.message));
  }, []);

  return (
    <div className="p-4">
      {message && <p className="text-green-600">Message from backend: {message}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}