import Ajv from 'ajv';
import { ObjectType } from 'yaschva';
import { Elastic, KeyValue } from '../DataDriverTypes.js';
import { HttpMethods, SearchTypes } from 'declarapi-runtime';
export declare type AuthType = (string | {
    createdBy: boolean;
})[] | boolean;
export declare type ManageableFields = {
    createdBy?: boolean;
};
export declare type Contract = {
    name: string;
    type?: HttpMethods;
    authentication: AuthType;
    manageFields: ManageableFields;
    arguments: ObjectType;
    returns: ObjectType;
    description?: string;
};
export declare type CrudAuthAll = {
    get: AuthType;
    put: AuthType;
    post: string[] | boolean;
    delete: AuthType;
};
export declare type CrudAuthSome = {
    get: AuthType;
    modify: AuthType;
    delete?: AuthType;
};
export declare type CrudContract = {
    name: string;
    methods?: {
        get?: boolean;
        post?: boolean;
        put?: boolean;
        patch?: boolean;
        delete?: boolean;
    };
    authentication: AuthType | CrudAuthAll | CrudAuthSome;
    manageFields?: ManageableFields;
    dataType: ObjectType;
    search?: SearchTypes;
    description?: string;
    preferredImplementation?: {
        type: 'elasticsearch';
        index: string;
    };
};
export declare type OutputSuccess = {
    name: string;
    authentication: AuthType;
    manageFields: ManageableFields;
    method: HttpMethods;
    arguments: ObjectType;
    returns: ObjectType;
    preferredImplementation?: Elastic | KeyValue;
    search?: SearchTypes;
};
export declare type Output = {
    type: 'result';
    key: string;
    results: OutputSuccess[];
    errors?: undefined;
} | {
    type: 'error';
    key?: undefined;
    errors: (Ajv.ErrorObject | string)[] | string;
    results?: undefined;
};
