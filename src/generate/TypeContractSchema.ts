import { ObjectType } from 'yaschva'

export type HttpMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type Contract = {
  name: string;
  idFieldName?: string;
  type?: HttpMethods;
  authentication: string[] | boolean;
  arguments: ObjectType;
  returns: ObjectType;
  description?: string;
};

export type SearchTypes = 'textSearch' | 'full' | 'idOnly' | ObjectType;
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
