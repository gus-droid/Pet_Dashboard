import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const API_KEY = import.meta.env.VITE_APP_ACCESS_KEY;
  const API_SECRET = ''; // You'll need to add your API secret here
  const BASE_URL = 'https://api.petfinder.com/v2';

  // Get access token
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const response = await fetch('https://api.petfinder.com/v2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `grant_type=client_credentials&client_id=${API_KEY}&client_secret=${API_SECRET}`,
        });
        
        if (!response.ok) throw new Error('Failed to get access token');
        
        const data = await response.json();
        setAccessToken(data.access_token);
      } catch (err) {
        setError('Failed to authenticate with Petfinder API');
        setLoading(false);
      }
    };

    getAccessToken();
  }, []);

  // Fetch pets when we have an access token
  useEffect(() => {
    const fetchPets = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch(`${BASE_URL}/animals?limit=100`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch pets');
        
        const data = await response.json();
        setPets(data.animals);
        setFilteredPets(data.animals);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPets();
  }, [accessToken]);

  // Filter pets based on search query and type filter
  useEffect(() => {
    let filtered = pets;
    
    if (searchQuery) {
      filtered = filtered.filter(pet => 
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breeds.primary?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(pet => pet.type.toLowerCase() === typeFilter.toLowerCase());
    }
    
    setFilteredPets(filtered);
  }, [searchQuery, typeFilter, pets]);

  // Calculate summary statistics
  const totalPets = pets.length;
  const averageAge = pets.reduce((acc, pet) => {
    const ageMap = { 'Baby': 1, 'Young': 2, 'Adult': 3, 'Senior': 4 };
    return acc + (ageMap[pet.age] || 0);
  }, 0) / totalPets;
  
  const petTypes = [...new Set(pets.map(pet => pet.type))];
  const typeCounts = petTypes.reduce((acc, type) => {
    acc[type] = pets.filter(pet => pet.type === type).length;
    return acc;
  }, {});

  if (loading) return <div className="loading">Loading pets...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <div className="summary-cards">
        <div className="card">
          <h3>Total Pets</h3>
          <p>{totalPets}</p>
        </div>
        <div className="card">
          <h3>Average Age Group</h3>
          <p>{['Baby', 'Young', 'Adult', 'Senior'][Math.round(averageAge - 1)]}</p>
        </div>
        <div className="card">
          <h3>Pet Types</h3>
          <p>{petTypes.length}</p>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search pets by name, breed, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="category-filter"
        >
          <option value="all">All Types</option>
          {petTypes.map(type => (
            <option key={type} value={type}>{type} ({typeCounts[type]})</option>
          ))}
        </select>
      </div>

      <div className="data-list">
        {filteredPets.map(pet => (
          <div key={pet.id} className="list-item">
            <div className="pet-info">
              <h3>{pet.name}</h3>
              <p className="breed">{pet.breeds.primary}</p>
              <p className="description">{pet.description}</p>
            </div>
            <div className="pet-details">
              <span className="type">{pet.type}</span>
              <span className="age">{pet.age}</span>
              <span className="gender">{pet.gender}</span>
            </div>
            {pet.photos?.[0] && (
              <img 
                src={pet.photos[0].medium} 
                alt={pet.name} 
                className="pet-photo"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 