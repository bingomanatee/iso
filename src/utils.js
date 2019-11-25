const THREE = require('three');
const _N = require('@wonderlandlabs/n');
const _ = require('lodash');
const Decimal = require('decimal.js');

const { Vector3 } = THREE;
const r90 = Math.PI / 2;
const r360 = Math.PI * 2;

/**
 * converts a XYZ vector3 to longitude latitude (Direct Polar)
 * @param lng longitude
 * @param lat latitude
 * @param vector3 optional output vector3
 * @returns a unit vector of the 3d position
 */
function lonLatToVector3(lng, lat, out) {
  out = out || new Vector3();

  // flips the Y axis
  lat = r90 - lat;

  // distribute to sphere
  out.set(
    Math.sin(lat) * Math.sin(lng),
    Math.cos(lat),
    Math.sin(lat) * Math.cos(lng),
  );

  return out;
}

function unifyLongitudes(list) {
  let east = 0;
  let west = 0;

  list.forEach(([lon]) => {
    if (lon < 180) {
      west += 1;
    } else {
      east += 1;
    }
  });

  return list.map(([lon, lat]) => {
    if (west < east) {
      if (lon < 90) return [lon + 360, lat];
    } else if (lon > 270) return [lon - 360, lat];
    return [lon, lat];
  });
}

/**
 * converts a XYZ THREE.Vector3 to longitude latitude. beware, the vector3 will be normalized!
 * @param vector3
 * @returns an array containing the longitude [0] & the lattitude [1] of the Vector3
 */
function vector3toLonLat(v) {
  const vPoint = new Vector3(v.x, v.y, v.z);
  vPoint.normalize();

  // longitude = angle of the vector around the Y axis
  // -( ) : negate to flip the longitude (3d space specific )
  // - PI / 2 to face the Z axis
  let lng = -(Math.atan2(-vPoint.z, -vPoint.x)) - r90;

  // to bind between -PI / PI
  if (lng < -Math.PI) lng += r360;

  // latitude : angle between the vector & the vector projected on the XZ plane on a unit sphere

  // project on the XZ plane
  const p = new Vector3(vPoint.x, 0, vPoint.z);
  // project on the unit sphere
  p.normalize();

  // commpute the angle ( both vectors are normalized, no division by the sum of lengths )
  const dot = _.clamp(p.dot(vPoint), -1, 1);
  let lat = Math.acos(dot);

  // invert if Y is negative to ensure teh latitude is comprised between -PI/2 & PI / 2
  if (vPoint.y < 0) lat *= -1;

  if (lng < 0) lng += r360;

  if (!(_N(lng).isValid && _N(lat).isValid)) {
    console.log('vector3toLonLat: bad  lng:', lng, 'lat:', lat);
    // eslint-disable-next-line no-use-before-define
    console.log(' ... input:', v, 'point:', cleanV3(vPoint));
    console.log(' ... dot = ', dot);
  }
  return [_N(lng)
    .deg()
    .round().value,
  _N(lat)
    .deg()
    .round().value,
  ];
}

function cleanV3(v) {
  const p = v.clone()
    .multiplyScalar(100)
    .round();
  return _.pick(p, 'x,y,z'.split(','));
}

module.exports = {
  cleanV3,
  lonLatToVector3,
  unifyLongitudes,
  vector3toLonLat,
};
