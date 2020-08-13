import { AuthInput, ContractType } from 'declarapi-runtime';
import { HandleType } from 'declarapi-runtime/registerRestMethods.js';
export declare const generateRandomCall: <Input, Output>(handle: HandleType, contract: ContractType<any, any>, auth: AuthInput) => Promise<{
    output: Output;
    generatedInput: Input;
}>;
