export type ValueType = string
export type SuperMetaData = {
  'name': string,
  expiration?: number,
  metadata: object;
};

export type ResponseMeta = {
  'success': boolean,
  'errors': any[],
  'messages': any[]
}
export type KVList = ResponseMeta & {
  'result': SuperMetaData[],
  'result_info': {
    'count': number,
    'cursor': string;
  };
};

export type KV = {
  list: (limit?: number, cursor?: string, prefix?: string) => Promise<KVList>
  get: (key:string) => Promise<ValueType | undefined>
  put: (key:string, value:ValueType | {value:ValueType, metadata: any}, expiration?: number, expirationType?: 'time'| 'ttl') => Promise<ResponseMeta>
  destroy: (key:string | string[]) => Promise<ResponseMeta>
};
