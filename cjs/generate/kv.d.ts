import { KeyValue } from '../DataDriverTypes.js';
import { SearchTypes, HttpMethods } from 'declarapi-runtime';
export declare type KVInputGet = {
    method: 'GET';
    search: SearchTypes;
};
export declare type KVInputBase = {
    method: HttpMethods;
    search?: SearchTypes;
};
export declare type KVInputType = KVInputBase & (KVInputGet | {
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
});
export declare const kvCodeGen: (driver: KeyValue, input: KVInputType) => string;
export default kvCodeGen;
