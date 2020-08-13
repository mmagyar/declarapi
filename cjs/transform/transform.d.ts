import { Output, CrudContract, Contract } from './types.js';
export declare const transform: (contract: CrudContract | Contract | object) => Promise<Output>;
export default transform;
