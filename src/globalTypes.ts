import { ObjectType, Validation } from 'yaschva'

export type HttpMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type SearchTypes = 'textSearch' | 'full' | 'idOnly' | ObjectType;

export type AuthInput = {permissions? : string [], sub?: string}
export type ContractAuth = { authentication: boolean | (string | {userId: string})[]}
export type HandlerAuth = AuthInput & ContractAuth

export type ContractType<T, K> = {
  name: string
  type: 'get' | 'post' | 'put' | 'patch' | 'delete'
  handle?: (input: T, auth: HandlerAuth) => Promise<K>
  arguments: Validation
  returns: Validation
} & ContractAuth
