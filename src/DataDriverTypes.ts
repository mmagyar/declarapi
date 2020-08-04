export type Elastic = {
  type: 'elasticsearch';
  index: string;
}

export type KeyValue = {
  type: 'key-value';
  backend: 'memory' | 'worker' // | 'redis'
  index: string;
}
