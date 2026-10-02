import React, { useState, useEffect } from 'react';
import { User, Package, Clock, CheckCircle, Save } from 'lucide-react';

const Profile = ({ setView }) => {
  const [profileData, setProfileData] = useState({
    name: '', phone: '', house: '', street: '', city: '', state: ''
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('userProfile') || '{}');
    setProfileData({
      name: saved.name || '',
      phone: saved.phone || '',
      house: saved.house || '',
      street: saved.street || '',
      city: saved.city || '',
      state: saved.state || ''
    });
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '0.35rem' };
  const labelStyle = { fontWeight: 600, fontSize: '0.875rem' };
  const rowStyle = { display: 'flex', gap: '1rem' };

  return (
    <div className="profile-container animate-fade-in content-padding">
      {/* Header */}
      <div className="profile-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="profile-avatar" style={{
          width: '80px', height: '80px', background: 'var(--primary-light)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <User size={40} color="var(--primary)" />
        </div>
        <h2 className="page-title">{profileData.name || 'Your Profile'}</h2>
        <p className="page-subtitle">
          {profileData.phone || 'Add phone'} &nbsp;|&nbsp;
          {profileData.city ? `${profileData.city}, ${profileData.state}` : 'Add delivery address'}
        </p>
      </div>

      <div style={{ maxWidth: '450px', margin: '0 auto' }}>
        <div className="card-elevated">
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            Personal Details
          </h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div style={fieldStyle}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="form-control" placeholder="John Doe" />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Phone Number</label>
              <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} className="form-control" placeholder="+91 98765 43210" />
            </div>

            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '0.5rem' }}>
              Delivery Address
            </h3>

            <div style={fieldStyle}>
              <label style={labelStyle}>House / Flat / Building</label>
              <input type="text" name="house" value={profileData.house} onChange={handleProfileChange} className="form-control" placeholder="Flat 4B, Emerald Heights" />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Street / Area</label>
              <input type="text" name="street" value={profileData.street} onChange={handleProfileChange} className="form-control" placeholder="MG Road, Begumpet" />
            </div>

            <div style={rowStyle}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>City</label>
                <input type="text" name="city" value={profileData.city} onChange={handleProfileChange} className="form-control" placeholder="Hyderabad" />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>State</label>
                <input type="text" name="state" value={profileData.state} onChange={handleProfileChange} className="form-control" placeholder="Telangana" />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
              {isSaved ? <CheckCircle size={18} /> : <Save size={18} />}
              &nbsp;{isSaved ? 'Saved Successfully!' : 'Save Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
