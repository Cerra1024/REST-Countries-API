const GEO_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const getCountries = async () => {
  try {
    const [countriesRes, geoRes] = await Promise.all([
      fetch("https://restcountries.com/v3.1/all?fields=name,region,capital,population,flags"),
      fetch(GEO_URL)
    ]);

    const countries = await countriesRes.json();
    const geoData = await geoRes.json();

    // match countries by name
    const countryMap = {};
    countries.forEach(c => {
      countryMap[c.name.common] = c;
    });

    let geoLayer;

    geoLayer = L.geoJSON(geoData, {
      style: (feature) => {
        const name = feature.properties.name;
        const country = countryMap[name];

        return {
          fillColor: country ? getRegionColor(country.region) : "#ccc",
          weight: 1,
          color: "#fff",
          fillOpacity: 0.8
        };
      },

      onEachFeature: (feature, layer) => {
        const name = feature.properties.name;
        const country = countryMap[name];

        if (!country) return;

        layer.countryData = country;

        layer.on("click", () => {
          document.getElementById("countryPanel").hidden = false;
          document.getElementById("overlay").style.display = "block";

          document.getElementById("countryDetails").innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Region:</strong> ${country.region}</p>
            <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <img src="${country.flags.svg}" alt="Flag of ${country.name.common}" width="100">
          `;
        });

       
        layer.on("mouseover", (e) => {
          e.target.setStyle({
            weight: 2,
            fillOpacity: 1
          });
        });

        layer.on("mouseout", (e) => {
          e.target.setStyle({
            weight: 1,
            fillOpacity: 0.8
          });
        });
      }
    }).addTo(map);

  } catch (err) {
    console.error(err);
  }
};

getCountries();

const getRegionColor = (region) => {
  switch (region) {
    case "Africa": return "#f4a261";
    case "Americas": return "#2a9d8f";
    case "Asia": return "#e76f51";
    case "Europe": return "#264653";
    case "Oceania": return "#e9c46a";
    default: return "#ccc";
  }
};

const searchInput = document.getElementById("search");

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();

  geoLayer.eachLayer(layer => {
    const rawName = layer.feature.properties.name;
    const name = nameFixes[rawName] || rawName;

    if (name.toLowerCase().includes(value)) {
      layer.setStyle({
        fillOpacity: 1,
        weight: 2
      });

      if (value.length > 0) {
        map.fitBounds(layer.getBounds(), { maxZoom: 5 });
      }
    } else {
      layer.setStyle({
        fillOpacity: value ? 0.1 : 0.8,
        weight: 1
      });
    }
  });
});