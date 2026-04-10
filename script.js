const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const getCountries = async () => {
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,latlng,region,capital,population,flags"
    );
    const data = await res.json();

    data.forEach(country => {
      if (!country.latlng) return;

      const [lat, lng] = country.latlng;

      const marker = L.marker([lat, lng]).addTo(map);

      marker.bindPopup(`<strong>${country.name.common}</strong>`);
    });
    