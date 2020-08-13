import { Elastic } from '../DataDriverTypes.js';
import { SearchTypes, HttpMethods } from 'declarapi-runtime';
export declare type ElasticInputGet = {
    method: 'GET';
    search: SearchTypes;
};
export declare type ElasticInputBase = {
    method: HttpMethods;
    search?: SearchTypes;
};
export declare type ElasticInputType = ElasticInputBase & (ElasticInputGet | {
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
});
export declare const elasticCodeGen: (driver: Elastic, input: ElasticInputType) => string;
export default elasticCodeGen;
