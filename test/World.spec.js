/* eslint-disable camelcase */
const tap = require('tap');
const _ = require('lodash');
const p = require('./../package.json');

const { World } = require('./../lib/index');
const draw = require('../drawWorld');

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

    testWorld.end();
  });

  suite.end();
});
