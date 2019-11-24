import { Line3 } from 'three';
import _ from 'lodash';

export default class Edge extends Line3 {
  constructor(world, startIndex, endIndex) {
    const startPoint = world.vertex(startIndex);
    const endPoint = world.vertex(endIndex);
    super(startPoint, endPoint);
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.world = world;
    this.id = [startIndex, endIndex].sort().join(' to ');
  }

  get vertices() { return [this.start, this.end]; }

  has(index) {
    return this.startIndex === index || this.endIndex === index;
  }

  matches(pointIndexes) {
    return _.every(pointIndexes, (index) => this.has(index));
  }

  connectsTo(edge) {
    if (!(edge instanceof Edge)) throw new Error('bad connectedTo');
    if (this.matches(edge.indexes)) return false;
    return _.some(edge.indexes, (index) => this.has(index));
  }

  get indexes() {
    return [this.startIndex, this.endIndex].sort();
  }
}
