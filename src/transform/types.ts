import Ajv from 'ajv'
import { ObjectType } from 'yaschva'
import { Elastic } from '../DataDriverTypes'
import { HttpMethods, SearchTypes } from '../globalTypes'

export type AuthType = (string | {userId:string})[] | boolean

export type Contract = {
  name: string;
  idFieldName?: string;
  type?: HttpMethods;
  authentication: AuthType;
  arguments: ObjectType;
  returns: ObjectType;
  description?: string;
};
export type CrudAuthAll = {
  get: AuthType;
  put: AuthType;
  post: string[] | boolean;
  delete: AuthType;
};

export type CrudAuthSome = {
  get: AuthType;
  modify: AuthType;
  delete?: AuthType;
};
export type CrudContract = {
  name: string;
  methods?: { get?:boolean, post?:boolean, put?: boolean, patch?:boolean, delete?:boolean},
  authentication: AuthType | CrudAuthAll | CrudAuthSome;
  idFieldName?: string;
  dataType: ObjectType;
  search?: SearchTypes;
  description?: string;
  preferredImplementation?: {type: 'elasticsearch'; index: string};
};

export type OutputSuccess = {
  name: string;
  authentication: AuthType;
  idFieldName: string;
  method: HttpMethods;
  arguments: ObjectType;
  returns: ObjectType;
  preferredImplementation?: Elastic;
  search?: SearchTypes;
};

export type Output =
  | {type: 'result'; key: string; results: OutputSuccess[]; errors?: undefined;}
  | {type: 'error'; key?: undefined; errors: (Ajv.ErrorObject | string)[] | string; results?: undefined;};

export const baseSchemaLocation = `${__dirname}/../../schema/`
