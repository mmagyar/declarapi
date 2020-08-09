import { KeyValue } from '../DataDriverTypes.js'
import { SearchTypes, HttpMethods } from '../globalTypes.js'
export type KVInputGet = {
  method: 'get',
  search: SearchTypes
}
export type KVInputBase = { method: HttpMethods, search? :SearchTypes}
export type KVInputType = KVInputBase & (KVInputGet | {
  method: 'post' | 'put' | 'patch' | 'delete',
})
export const kvCodeGen = (driver: KeyValue, input: KVInputType):string => {
  const { index, backend } = driver
  switch (input.method) {
    case 'get': {
      if (input.search === 'textSearch') {
        return `(input, auth, contract) => kv.get("${backend}", "${index}", contract, auth, input && input.id, input && input.search)`
      } else if (input.search === 'idOnly') {
        return `(input, auth, contract) => kv.get("${backend}", "${index}", contract, auth, input && input.id)`
      } else if (input.search === 'full') {
        throw new Error('Parametric get not implemented yet')
      }
      throw new Error(`Unsupported automatic key-value methods: ${JSON.stringify(input.search)}`)
    }
    case 'post': return `(input, auth, contract) => kv.post("${backend}", "${index}", contract, auth, input)`
    case 'patch': return `(input, auth, contract) => kv.patch("${backend}", "${index}", contract, auth, input, input.id)`
    case 'put': return `(input, auth, contract) => kv.put("${backend}", "${index}", contract, auth, input, input.id)`
    case 'delete': return `(input, auth, contract) => kv.del("${backend}", "${index}", contract, auth, input.id)`
  }
}

export default kvCodeGen
