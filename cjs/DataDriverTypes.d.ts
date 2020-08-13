export declare type Elastic = {
    type: 'elasticsearch';
    index: string;
};
export declare type KeyValue = {
    type: 'key-value';
    backend: 'memory' | 'worker';
    index: string;
};
