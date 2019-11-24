import _ from 'lodash';
import _N from '@wonderlandlabs/n';
import { IcosahedronGeometry, Vector3 } from 'three';

import Hex from './Hex';
import Edge from './Edge';
import { lonLatToVector3, vector3toLonLat } from './utils';

export default class World {
  constructor(params) {
    this.detail = _.get(params, 'detail', 1);
    this.radius = _.get(params, 'radius', 1);
    this.iso = new IcosahedronGeometry(1, this.detail); // always platonic radius
  }

  latLon(i) {
    return vector3toLonLat(this.vertex(i));
  }

  vertex(i) {
    if (!this._cm) {
      this._cm = new Map();
    }
    if (this._cm.has(i)) return this._cm.get(i);
    const vert = this.iso.vertices[i];
    this._cm.set(i, vert);
    return vert;
  }

  get edges() {
    if (!this._edges) {
      this._edges = [];

      this.faces.forEach((face) => {
        const edge = new Edge(this, face.a, face.b);
        this.edges.push(edge);
        const edge2 = new Edge(this, face.a, face.c);
        this.edges.push(edge2);
        const edge3 = new Edge(this, face.b, face.c);
        this.edges.push(edge3);
      });
    }
    return this._edges;
  }

  get faces() {
    if (!this._faces) {
      this._faces = [...this.iso.faces];
    }
    return this._faces;
  }

  hexes(i) {
    if (!this._hx) {
      this._hx = new Map();
    }
    if (this._hx.has(i)) return this._hx.get(i);
    const hex = new Hex(this, i);
    this._hx.set(i, hex);
    return hex;
  }

  hexList() {
    return _.range(0, this.length - 1).map((index) => this.hexes(index));
  }

  get length() {
    return this.iso.vertices.length;
  }
}
