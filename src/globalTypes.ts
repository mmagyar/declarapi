import { ObjectType, Validation } from 'yaschva'

export type HttpMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type SearchTypes = 'textSearch' | 'full' | 'idOnly' | ObjectType;

export type ContractType<T, K> = {
  name: string
  authentication: boolean | string[] |
  {
    get: boolean | string[]
    modify: boolean | string[]
    delete?: boolean | string[]
  } |
  {
    get: boolean | string[]
    post: boolean | string[]
    put: boolean | string[]
    patch: boolean | string[]
    delete: boolean | string[]
  }
  type: 'get' | 'post' | 'put' | 'patch' | 'delete'
  handle?: (input: T) => Promise<K>
  arguments: Validation
  returns: Validation
}
