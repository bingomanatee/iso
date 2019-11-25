/* eslint-disable camelcase */
const tap = require('tap');
const _ = require('lodash');
const { Vector3 } = require('three');
const p = require('./../package.json');

const { World } = require('./../lib/index');
const draw = require('../drawWorld');
const { cleanV3, vector3toLonLat } = require('../src/utils');


tap.test(p.name, (suite) => {
  suite.test('World', (testWorld) => {
    testWorld.test('draw', (d) => {
      const w = new World({ detail: 2, radius: 1 });

      draw(w, {}, 'worldDetail2');

      const w2 = new World({ detail: 3, radius: 2 });

      //  console.log('w2.hexes:', JSON.stringify(_.invokeMap(w2.hexList(), 'toJSON')));

      draw(w2, {}, 'worldDetail3');

      const w3 = new World({ detail: 5, radius: 2 });
      draw(w3, { pixelsPerHex: 15 }, 'worldDetail5');

      d.end();
    });

    testWorld.test('diagram', (d) => {
      const w = new World({ detail: 2, radius: 1 });

      draw(w, {
        pixelsPerHex: 10,
        fn: ({ ctx }, lonLatToV2) => {
          console.log('diagramming map');
          ctx.fillStyle = '#2f1400';
          ctx.font = '20px Helvetica';

          _.range(0, w.length).forEach((index) => {
            const v = w.vertex(index);
            const [lon, lat] = w.lonLat(index);

            const point2d = lonLatToV2(lon, lat);
            ctx.fillText(JSON.stringify(cleanV3(v)), point2d.x, point2d.y);
          });

          ctx.textAlign = 'left';

          // ---- Z POS

          ctx.fillStyle = '#772100';
          ctx.font = '100px Helvetica';

          const zPos = new Vector3(0, 0, 1);
          const zPosLonLat = vector3toLonLat(zPos);
          const zPosPoint2d = lonLatToV2(...zPosLonLat);
          console.log('zPosLonLat', zPosLonLat, 'point:', zPosPoint2d);

          ctx.fillText('(+Z)', zPosPoint2d.x, zPosPoint2d.y);

          ctx.fillStyle = '#004412';
          ctx.font = '50px Helvetica';
          ctx.fillText(`lat:${zPosLonLat[1]} lon: ${zPosLonLat[0]}`, zPosPoint2d.x, zPosPoint2d.y + 90);


          // ---- Z NEG

          ctx.fillStyle = '#772100';
          ctx.font = '100px Helvetica';

          const zNeg = new Vector3(0, 0, -1);
          const zNegLonLat = vector3toLonLat(zNeg);
          const zNegPoint2d = lonLatToV2(...zNegLonLat);
          console.log('zNegLonLat', zNegLonLat, 'point:', zNegPoint2d);

          ctx.fillText('(-Z)', zNegPoint2d.x, zNegPoint2d.y);

          ctx.fillStyle = '#004412';
          ctx.font = '50px Helvetica';
          ctx.fillText(`lat:${zNegLonLat[1]} lon: ${zNegLonLat[0]}`, zNegPoint2d.x, zNegPoint2d.y + 90);

          // ---- X POS

          ctx.fillStyle = '#772100';
          ctx.font = '100px Helvetica';

          const xPos = new Vector3(1, 0, 0);
          const xPosLonLat = vector3toLonLat(xPos);
          const xPosPoint2d = lonLatToV2(...xPosLonLat);
          console.log('xPosLonLat', xPosLonLat, 'point:', xPosPoint2d);

          ctx.fillText('(+X)', xPosPoint2d.x, xPosPoint2d.y);

          ctx.fillStyle = '#004412';
          ctx.font = '50px Helvetica';
          ctx.fillText(`lat:${xPosLonLat[1]} lon: ${xPosLonLat[0]}`, xPosPoint2d.x, xPosPoint2d.y + 90);

          // ---- X NEG

          ctx.fillStyle = '#772100';
          ctx.font = '100px Helvetica';
          const xNeg = new Vector3(-1, 0, 0);
          const xNegLonLat = vector3toLonLat(xNeg);
          const xNegPoint2d = lonLatToV2(...xNegLonLat);

          ctx.fillText('(-X)', xNegPoint2d.x, xNegPoint2d.y);
          ctx.fillStyle = '#004412';
          ctx.font = '50px Helvetica';
          ctx.fillText(`lat:${xNegLonLat[1]} lon: ${xNegLonLat[0]}`, xNegPoint2d.x, xNegPoint2d.y + 90);


          ctx.textAlign = 'left';

          _.range(-90, 90, 10).forEach((lat) => {
            const pt = lonLatToV2(0, lat);
            ctx.fillText(`lat ${lat}`, pt.x, pt.y);
          });
        },

      }, 'map');

      d.end();
    });

    testWorld.test('normalized', (d) => {
      const w = new World({ detail: 2, radius: 1 });

      draw(w, {
        pixelsPerHex: 10,
        fn: ({ ctx }, lonLatToV2) => {
          console.log('diagramming map');
          ctx.strokeStyle = '#2f1400';
          ctx.lineWidth = 4;

          const center = lonLatToV2(180, 0);
          console.log('center:', ...center.toArray());

          w.hexList().slice(0, 20).forEach((hex, i) => {
            const corners = hex.zAxisCorners();

            console.log(`hex ${i} corners:`, corners.map(cleanV3));

            corners.push(corners[0]);

            ctx.beginPath();
            corners.forEach(({ x, y }, pi) => {
              const pt = center.clone();
              pt.x += (x * 1000);
              pt.y += (y * 1000);
              pt.round();
              console.log('corner point ', i, '...', ...pt.toArray());

              if (pi === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();
            ctx.stroke();
          });
        },

      }, 'normalized hexes');

      d.end();
    });

    testWorld.end();
  });


  suite.end();
});
