import { ObjectType, Validation } from 'yaschva'

export type HttpMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type SearchTypes = 'textSearch' | 'full' | 'idOnly' | ObjectType;

export type ContractType<T, K> = {
  name: string
  authentication: boolean | string[]
  type: 'get' | 'post' | 'put' | 'patch' | 'delete'
  handle?: (input: T) => Promise<K>
  arguments: Validation
  returns: Validation
}
