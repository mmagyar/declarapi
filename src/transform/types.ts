import Ajv from 'ajv'
import { ObjectType } from 'yaschva'
import { Elastic } from '../DataDriverTypes'
import { HttpMethods, SearchTypes } from '../globalTypes'

export type Contract = {
  name: string;
  idFieldName?: string;
  type?: HttpMethods;
  authentication: string[] | boolean;
  arguments: ObjectType;
  returns: ObjectType;
  description?: string;
};

export type CrudAuthAll = {
  get: string[] | boolean;
  put: string[] | boolean;
  post: string[] | boolean;
  delete: string[] | boolean;
};

export type CrudAuthSome = {
  get: string[] | boolean;
  modify: string[] | boolean;
  delete?: string[] | boolean;
};
export type CrudContract = {
  name: string;
  authentication: string[] | boolean | CrudAuthAll | CrudAuthSome;
  idFieldName?: string;
  dataType: ObjectType;
  search?: SearchTypes;
  description?: string;
  preferredImplementation?: {type: 'elasticsearch'; index: string};
};

export type OutputSuccess = {
  name: string;
  authentication: boolean | string[];
  idFieldName: string;
  method: HttpMethods;
  arguments: ObjectType;
  returns: ObjectType;
  preferredImplementation?: Elastic;
  search?: SearchTypes;
};

export type Output =
  | {type: 'result'; key: string; results: OutputSuccess[]; errors?: undefined;}
  | {type: 'error'; key?: undefined; errors: Ajv.ErrorObject[] | string; results?: undefined;};

export const baseSchemaLocation = `${__dirname}/../../src/schema/`
