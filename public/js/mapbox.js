export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoicm9jazA0IiwiYSI6ImNrdmdoajMzODQwMzIyb2x1bDA1d3EycWUifQ.E1lHT8OdEYh2738K_5Hk5Q';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rock04/ckvgic1dp0ugq15mrtcxv1duz',
    //   center: [-118, 34],
    //   zoom: 4,
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // add marker
    new mapboxgl.Marker({
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // extends map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 80,
      bottom: 40,
      left: 100,
      right: 100,
    },
  });
};
