const _N = require('@wonderlandlabs/n');
const hexes = require('./hexes_level_3.json');
const { vector3toLonLat } = require('./src/utils');

hexes.forEach((hex) => {
  if (_N(hex.lat).abs().value < 10) {
    console.log('------- latitude: ', hex.lat, 'longitude: ', hex.lon);
    hex.corners.forEach((c) => console.log('corner: ', c, 'toLonLat', vector3toLonLat(c)));
  }
});
