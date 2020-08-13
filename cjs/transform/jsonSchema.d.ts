import Ajv, { ErrorObject } from 'ajv';
export declare const jsonValidatorInit: () => Ajv.Ajv;
export declare type jsonValidationSuccess = {
    type: 'success';
    errors?: (ErrorObject | string)[];
};
export declare type jsonValidationError = {
    type: 'error';
    errors: (ErrorObject | string)[];
};
export declare type validateResult = jsonValidationSuccess | jsonValidationError;
export declare const isValidationError: (input: validateResult) => input is jsonValidationError;
export declare const validate: (json: Object, data: any) => Promise<validateResult>;
