const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const _ = require('lodash');
const { Vector2 } = require('three');
const _N = require('@wonderlandlabs/n');

registerFont('Helvetica.ttf', { family: 'Helvetica' });

module.exports = (world, config = {}, fileName = 'worldMap') => {
  const pixelsPerHex = _.get(config, 'pixelsPerHex', 5);
  const padding = _.get(config, 'padding', 5);
  const rightOverlap = _.get(config, 'rightOverlap', 30);
  const mapHeight = (180 * pixelsPerHex) + (2 * padding);
  const mapWidth = ((rightOverlap + 360) * pixelsPerHex) + (2 * padding);
  const degreeInc = _.get(config, 'degreeInc', 10);
  const fn = _.get(config, 'fn', () => {});

  const can = createCanvas(mapWidth, mapHeight);
  const ctx = can.getContext('2d');

  const loopLonLatSeries = (points) => {
    points.push(points[0]);

    const longitudes = _.map(points, 0);
    const longRange = (_.max(longitudes) - _.min(longitudes));
    if (longRange > 180) {
      points.forEach((coord) => { if (coord[0] < 180) coord[0] += 360; });
    }
  };

  const latLonToV2 = (lat, lon) => {
    if (Array.isArray(lat)) return latLonToV2(...lat.reverse());
    const heightScale = _N(lat)
      .abs()
      .div(90)
      .pow(2)
      .div(2);

    const xMult = _N(1).sub(heightScale);

    const y = padding + (90 - lat) * pixelsPerHex;
    const x = _N(lon).times(pixelsPerHex).plus(padding).times(xMult)
      .plus(_N(180).times(pixelsPerHex).times(heightScale));


    return new Vector2(x.value, y);
  };

  const lonLatToV2 = (lon, lat) => latLonToV2(lat, lon);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.rect(-1, -1, mapWidth + 2, mapHeight + 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#75adda';
  ctx.beginPath();
  _.range(-90, 91, degreeInc).forEach((lat) => {
    const startPoint = latLonToV2(lat, 0);
    const eqPoint = latLonToV2(lat, 180);
    const endPoint = latLonToV2(lat, 360);
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(eqPoint.x, eqPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
  });

  _.range(0, 361, degreeInc).forEach((lon) => {
    const points = [];
    _.range(-90, 91, degreeInc).forEach((lat) => {
      points.push(latLonToV2(lat, lon));
    });
    const startPoint = points.shift();
    ctx.moveTo(startPoint.x, startPoint.y);
    points.forEach((iter) => { ctx.lineTo(iter.x, iter.y); });
  });
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = '#da015c';
  ctx.beginPath();
  const vA = latLonToV2(0, 0);
  const vB = latLonToV2(0, 360);
  ctx.moveTo(vA.x, vA.y);
  ctx.lineTo(vB.x, vB.y);

  const vC = latLonToV2(-90, 180);
  const vD = latLonToV2(90, 180);
  ctx.moveTo(vC.x, vC.y);
  ctx.lineTo(vD.x, vD.y);

  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = '#08310e';
  ctx.beginPath();
  world.iso.faces.forEach((face) => {
    const { a, b, c } = face;
    const points = [a, b, c].map((i) => world.lonLat(i));
    // console.log('points:', points);
    loopLonLatSeries(points);

    points.forEach(([longitude, latitude], i) => {
      const v = lonLatToV2(longitude, latitude);
      if (i) {
        ctx.lineTo(v.x, v.y);
      } else {
        ctx.moveTo(v.x, v.y);
      }
    });
  });
  ctx.closePath();
  ctx.stroke();


  ctx.strokeStyle = '#b116da';
  world.hexList().forEach((hex, i) => {
    const lonLats = hex.cornerLonLats();
    const points = lonLats.map(([longitude, latitude]) => latLonToV2(latitude, longitude));
    loopLonLatSeries(points);

    ctx.beginPath();
    ctx.fillStyle = `rgba(${_.random(0, 255)},${_.random(128, 255)},255,0.25)`;
    points.forEach((v, i) => {
      if (i) {
        ctx.lineTo(v.x, v.y);
      } else {
        ctx.moveTo(v.x, v.y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });


  fn({ ctx, can }, lonLatToV2);

  can.createPNGStream().pipe(fs.createWriteStream(`${fileName}.png`));
};
