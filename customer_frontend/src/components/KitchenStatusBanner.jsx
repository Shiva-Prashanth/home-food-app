import React, { useState, useEffect } from 'react';
import { getKitchenStatus } from '../services/api';

const KitchenStatusBanner = () => {
    const [statusData, setStatusData] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await getKitchenStatus();
                setStatusData(data);
            } catch (err) {
                console.error("Failed to fetch kitchen status", err);
                setStatusData({ status: "low", estimatedTime: "Estimated time unavailable" });
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    if (!statusData) return null;
    
    const { status, estimatedTime = "20–30 mins" } = statusData;

    let bgColor = '#20bf6b'; // low green
    let text = '🟢 Low Busy';
    if (status === 'medium') {
        bgColor = '#f7b731'; // med yellow
        text = '🟡 Medium Busy';
    } else if (status === 'high') {
        bgColor = '#eb3b5a'; // high red
        text = '🔴 High Busy';
    }

    return (
        <div style={{ 
            padding: '0.8rem 1.5rem', 
            background: bgColor, 
            color: '#fff', 
            fontWeight: 'bold', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '0.25rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <div>Kitchen Status: {text}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9em' }}>
               <span>⏱</span> <span>Estimated Delivery Time: {estimatedTime}</span>
            </div>
            {status === 'high' && <div style={{ marginTop: '0.2rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85em' }}>⚠️ High demand. Delivery may take longer.</div>}
        </div>
    );
};

export default KitchenStatusBanner;
