# Explore The World (REST Countries API)

## Overview
Explore The World is an interactive web application that allows users to explore countries around the world using a dynamic map interface. The application intergrates REST countries API and Leaflet.js to display country data. Users can search for countries, filter by region, and track visited countries using persistent local storage.

## Features
- Interactive world map using Leaflet.js
- Search by country name functionality
- Region filtering (Africa, Americas, Asia, Europe, Oceania)
- Country information panel including region, capital, population, and flags
- Visited feature with localStorage

## Technologies Used
-HTML5
-CSS3 (flexbox, responsive design)
-JavaScript
-REST Countries API
-Leaflet.js (map rendering)
-LocalStorage

## How to Run
1. Clone or download this repository
2. Open the project folder
3. Open `index.html` in your browser

## Live Demo
https://cerra1024.github.io/REST-Countries-API/


## Reflection

For this project, I built an interactive world map application using the REST Countries API and Leaflet.js. The goal was to create a clean and engaging interface that allowed users to explore countries, filter by region, and track visited locations.

One of the key challenges I encountered was transitioning from a basic marker-based map to a more advanced GeoJSON polygon map. Initially, I displayed countries using markers, but this approach did not provide the level of interactivity or visual clarity I wanted. I shifted to using GeoJSON data to render full country shapes. This change significantly improved the interface, making it look less cluttered and allowed for me to incorporate features like region-based coloring for clear visuals.

Designing the layout was another challenge, as I experimented with different panel placements including overlays and side panels. I ultimately chose a bottom sliding panel to create a more seamless and user-friendly experience without obstructing the map completely or not looking seamless with the interface. I used a bottom sheet overlay that is updated through Javascript when a user clicks on a country. The panel is hidden by default, and I added an .active class to trigger the transition.

A key part of this project was working with external APIs and dynamic data. I learned how to fetch, organize, and display data, as well as how to connect that data to interactive elements.


## Future Improvements
-Dark mode toggle
-Search suggestions dropdown
-Highlight visited countries through filter or the map