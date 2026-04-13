
let geoLayer;
let selectedLayer = null;
const GEO_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

const nameFixes = {
  "United States of America": "United States",
  "Russian Federation": "Russia",
  "Korea (Republic of)": "South Korea",
  "Korea (Democratic People's Republic of)": "North Korea",
  "Viet Nam": "Vietnam",
  "Iran (Islamic Republic of)": "Iran",
  "Syrian Arab Republic": "Syria",
  "United Republic of Tanzania": "Tanzania",
  "Ivory Coast": "Côte d'Ivoire",
  "Democratic Republic of the Congo": "Congo (Democratic Republic of the)",
  "eSwatini": "Eswatini",
  "Congo": "Republic of the Congo",
  "Democratic Republic of the Congo": "DR Congo", 
};

const updateVisitedCount = () => {
  const visited =
    JSON.parse(localStorage.getItem("visitedCountries")) || [];

  const countEl = document.getElementById("visitedCount");

  if (countEl) {
    countEl.textContent = `Visited: ${visited.length}`;
  }
};

const getRegionColor = (region) => {
  switch (region) {
    case "Africa": return "#FFBF00"; 
    case "Americas": return "#10B981"; 
    case "Asia": return "#F87171";   
    case "Europe": return "#3B82F6"; 
    case "Oceania": return "#8B5CF6";  
    default: return "#94A3B8";         
  }
};

const map = L.map('map', {
  center: [20, 0],
  zoom: 2,
  minZoom: 2,
  maxZoom: 5,
  dragging: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  boxZoom: true,
  keyboard: true
});

map.setMaxBounds([
  [-90, -180],
  [90, 180]
]);

map.options.maxBoundsViscosity = 1.0;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
      const rawName = feature.properties.name;
      const name = nameFixes[rawName] || rawName;
      const country = countryMap[name];

        if (!country) {
          console.log("Missing match:", rawName);
          return;
      }

        layer.countryData = country;

        layer.bindTooltip(feature.properties.name, {
      permanent: false,
      direction: "top",
      className: "country-label"
  });

        layer.on("click", () => {
          if (selectedLayer) {
            const previousCountry = selectedLayer.countryData;

            selectedLayer.setStyle({
              fillColor: getRegionColor(previousCountry.region),
              fillOpacity: 0.8,
              weight: 1,
              color: "#fff"
          });
}

layer.setStyle({
  fillColor: getRegionColor(country.region),
  fillOpacity: 1,
  weight: 2,
  color: "#243642"
});

selectedLayer = layer;

          layer.closeTooltip();
          document.body.classList.add("panel-open");

          const panel = document.getElementById("countryPanel");
          const overlay = document.getElementById("overlay");
          const details = document.getElementById("countryDetails");

          panel.hidden = false;
          panel.classList.add("active");
          overlay.style.display = "block";

          const visitedCountries =
            JSON.parse(localStorage.getItem("visitedCountries")) || [];

          const isVisited = visitedCountries.includes(country.name.common);  


          details.innerHTML = `
    
      <div class="country-text">
        <h2 id="countryName">${country.name.common}</h2>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>

        <button id="visitedBtn" class="visited-btn">
          ${isVisited ? "Visited ✓" : "Mark as Visited"}
       </button>
    </div>

    <div class="country-flag-wrap">
      <img src="${country.flags.svg}" alt="Flag of ${country.name.common}">
    </div>
  `;

      const visitedBtn = document.getElementById("visitedBtn");

      visitedBtn.addEventListener("click", () => {
       let visited =
        JSON.parse(localStorage.getItem("visitedCountries")) || [];

        if (visited.includes(country.name.common)) {
         visited = visited.filter(name => name !== country.name.common);
      } else {
      visited.push(country.name.common);
    }

    localStorage.setItem("visitedCountries", JSON.stringify(visited));

    visitedBtn.textContent = visited.includes(country.name.common)
      ? "Visited ✓"
      : "Mark as Visited";
      updateVisitedCount();
    });

   });

      }
    }).addTo(map);

  } catch (err) {
    console.error("Error loading data:", err);
  }
};

getCountries();

updateVisitedCount();

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

    const matched =
      selectedRegion === "" || country.region === selectedRegion;

    layer.setStyle({
      fillColor: getRegionColor(country.region), // 🔥 IMPORTANT
      fillOpacity: matched ? 0.8 : 0.1,
      weight: 1,
      color: "#fff"
    });
  });
});

const closeBtn = document.getElementById("closePanel");
const overlay = document.getElementById("overlay");
const panel = document.getElementById("countryPanel");

closeBtn.addEventListener("click", () => {
  panel.classList.remove("active");
  panel.hidden = true;
  overlay.style.display = "none";
  document.body.classList.remove("panel-open");
});

overlay.addEventListener("click", () => {
  panel.classList.remove("active");
  panel.hidden = true;
  overlay.style.display = "none";
  document.body.classList.remove("panel-open");
});

const legend = L.control({ position: "bottomleft" });

legend.onAdd = function () {
  const div = L.DomUtil.create("div", "legend");

  div.innerHTML = `
    <div><span style="background:#FFBF00"></span> Africa</div>
    <div><span style="background:#10B981"></span> Americas</div>
    <div><span style="background:#F87171"></span> Asia</div>
    <div><span style="background:#3B82F6"></span> Europe</div>
    <div><span style="background:#8B5CF6"></span> Oceania</div>
    <div><span style="background:#ccc"></span> No data</div>
  `;

  return div;
};

legend.addTo(map);