
let geoLayer;

const GEO_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

const nameFixes = {
  "United States of America": "United States",
  "Russian Federation": "Russia",
  "Korea (Republic of)": "South Korea",
  "Korea (Democratic People's Republic of)": "North Korea",
  "Viet Nam": "Vietnam",
  "Iran (Islamic Republic of)": "Iran",
  "Syrian Arab Republic": "Syria",
  "United Republic of Tanzania": "Tanzania"
};

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


const map = L.map('map', {
  center: [20, 0],
  zoom: 2,
  minZoom: 2,
  maxZoom: 4,
  dragging: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false
});

map.setMaxBounds([
  [-90, -180],
  [90, 180]
]);

map.options.maxBoundsViscosity = 1.0;

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap & CartoDB',
}).addTo(map);


const getCountries = async () => {
  try {
    const [countriesRes, geoRes] = await Promise.all([
      fetch("https://restcountries.com/v3.1/all?fields=name,region,capital,population,flags"),
      fetch(GEO_URL)
    ]);

    const countries = await countriesRes.json();
    const geoData = await geoRes.json();

    const countryMap = {};
    countries.forEach(c => {
      countryMap[c.name.common] = c;
    });

    geoLayer = L.geoJSON(geoData, {
      style: (feature) => {
        const rawName = feature.properties.name;
        const name = nameFixes[rawName] || rawName;
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

        layer.bindTooltip(feature.properties.name, {
      permanent: false, // change to true if you want always visible
      direction: "center",
      className: "country-label"
  });

        layer.on("click", () => {
          map.fitBounds(layer.getBounds(), {
            padding: [20, 20],
            maxZoom: 5
          });

          document.getElementById("countryPanel").hidden = false;
          document.getElementById("overlay").style.display = "block";

          document.getElementById("countryDetails").innerHTML = `
            <h2 id="countryName">${country.name.common}</h2>
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
    console.error("Error loading data:", err);
  }
};

getCountries();

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

const regionFilter = document.getElementById("regionFilter");

regionFilter.addEventListener("change", () => {
  const selectedRegion = regionFilter.value;

  geoLayer.eachLayer(layer => {
    const country = layer.countryData;

    if (!country) return;

    const matched = selectedRegion === "" ||
      country.region === selectedRegion;

    layer.setStyle({
      fillOpacity: matched ? 0.8 : 0.1
    });
  });
});

const closeBtn = document.getElementById("closePanel");
const overlay = document.getElementById("overlay");

closeBtn.addEventListener("click", () => {
  document.getElementById("countryPanel").hidden = true;
  overlay.style.display = "none";
});

overlay.addEventListener("click", () => {
  document.getElementById("countryPanel").hidden = true;
  overlay.style.display = "none";
});
