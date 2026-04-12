import React, { useState, useEffect } from 'react';
import { getKitchenStatus } from '../services/api';
import { Clock } from 'lucide-react';

const STATUS_CONFIG = {
  low:    { label: 'Kitchen is Live – Fast Delivery',    className: 'low',    emoji: '🟢' },
  medium: { label: 'Slight Delay – We\'re a bit busy',   className: 'medium', emoji: '🟡' },
  high:   { label: 'High Demand – Expect Longer Wait',   className: 'high',   emoji: '🔴' },
};

const KitchenStatusBanner = () => {
  const [statusData, setStatusData] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getKitchenStatus();
        setStatusData(data);
      } catch (err) {
        console.error('Failed to fetch kitchen status', err);
        setStatusData({ status: 'low', estimatedTime: '20–30 mins' });
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!statusData) return null;

  const { status = 'low', estimatedTime = '20–30 mins' } = statusData;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.low;

  return (
    <div className={`kitchen-status-banner ${config.className}`}>
      <div className="kitchen-status-dot" />
      <span>{config.emoji} {config.label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85em', opacity: 0.8 }}>
        <Clock size={13} />
        {estimatedTime}
      </span>
    </div>
  );
};

export default KitchenStatusBanner;
