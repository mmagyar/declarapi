import Ajv from 'ajv'
import { ObjectType } from 'yaschva'
import { Elastic, KeyValue } from '../DataDriverTypes.js'
import { HttpMethods, SearchTypes } from '../globalTypes.js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

export type AuthType = (string | {createdBy: boolean})[] | boolean
export type ManageableFields ={ createdBy?: boolean }

export type Contract = {
  name: string;
  type?: HttpMethods;
  authentication: AuthType;
  manageFields: ManageableFields;
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
  manageFields?:ManageableFields;
  dataType: ObjectType;
  search?: SearchTypes;
  description?: string;
  preferredImplementation?: {type: 'elasticsearch'; index: string};
};

export type OutputSuccess = {
  name: string;
  authentication: AuthType;
  manageFields: ManageableFields;
  method: HttpMethods;
  arguments: ObjectType;
  returns: ObjectType;
  preferredImplementation?: Elastic | KeyValue;
  search?: SearchTypes;
};

export type Output =
  | {type: 'result'; key: string; results: OutputSuccess[]; errors?: undefined;}
  | {type: 'error'; key?: undefined; errors: (Ajv.ErrorObject | string)[] | string; results?: undefined;};

export const baseSchemaLocation = `${dirname(fileURLToPath(import.meta.url))}/../../schema/`
