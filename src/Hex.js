import _ from 'lodash';
import _N from '@wonderlandlabs/n';
import {
  IcosahedronGeometry, Vector3, Line3, Triangle,
} from 'three';

import {
  lonLatToVector3, vector3toLonLat, unifyLongitudes, cleanV3,
} from './utils';

/**
 * the voronoi region surrounding a point. Not always a hexagon - there are
 * 20 pentagons surrounding the original points.
 */
export default class Hex {
  constructor(world, index) {
    this.world = world;
    this.index = index;
  }

  get centerPoint() {
    if (!this._centerPoint) this._centerPoint = this.world.vertex(this.index);
    return this._centerPoint;
  }

  faces() {
    return this.world.faces.filter((f) => f.a === this.index || f.b === this.index || f.c === this.index);
  }

  orderedFaces() {
    let faces = this.faces();
    let last = faces.pop();
    const ordered = [last];

    while (faces.length) {
      const lastIndexes = [last.a, last.b, last.c];
      last = _.find(faces, (candidate) => {
        const canIndexes = [candidate.a, candidate.b, candidate.c];
        return _.intersection(canIndexes, lastIndexes).length === 2;
      });
      if (!last) break;
      ordered.push(last);
      faces = faces.filter((f) => f !== last);
    }
    return ordered;
  }

  faceCenter(face) {
    const indexes = [face.a, face.b, face.c];
    const t = new Triangle(...indexes.map((i) => this.world.vertex(i)));
    return t.getMidpoint(new Vector3());
  }

  corners() {
    return this.orderedFaces().map(this.faceCenter.bind(this));
  }

  toJSON() {
    const lonLat = vector3toLonLat(this.centerPoint);
    const [lon, lat] = lonLat;
    return {
      index: this.index,
      center: cleanV3(this.centerPoint),
      corners: this.corners().map(cleanV3),
      lat,
      lon,
    };
  }

  cornerLonLats() {
    return unifyLongitudes(this.corners().map(vector3toLonLat));
  }
}
