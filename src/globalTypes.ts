import { ObjectType, Validation } from 'yaschva'

export type HttpMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type SearchTypes = 'textSearch' | 'full' | 'idOnly' | ObjectType;

export type Auth = {permissions? : string [], sub: string}
export type ContractType<T, K> = {
  name: string
  authentication: boolean | string[]
  type: 'get' | 'post' | 'put' | 'patch' | 'delete'
  handle?: (input: T, auth?: Auth) => Promise<K>
  arguments: Validation
  returns: Validation
}
