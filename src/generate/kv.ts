import { KeyValue } from '../DataDriverTypes.js'
import { SearchTypes, HttpMethods } from 'declarapi-runtime'
export type KVInputGet = {
  method: 'GET',
  search: SearchTypes
}
export type KVInputBase = { method: HttpMethods, search? :SearchTypes}
export type KVInputType = KVInputBase & (KVInputGet | {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
})
export const kvCodeGen = (driver: KeyValue, input: KVInputType):string => {
  const { index, backend } = driver
  switch (input.method) {
    case 'GET': {
      if (input.search === 'textSearch') {
        return `(input, auth, contract) => kv.get("${backend}", "${index}", contract, auth, input && input.id, input && input.search)`
      } else if (input.search === 'idOnly') {
        return `(input, auth, contract) => kv.get("${backend}", "${index}", contract, auth, input && input.id)`
      } else if (input.search === 'full') {
        throw new Error('Parametric get not implemented yet')
      }
      throw new Error(`Unsupported automatic key-value methods: ${JSON.stringify(input.search)}`)
    }
    case 'POST': return `(input, auth, contract) => kv.post("${backend}", "${index}", contract, auth, input)`
    case 'PATCH': return `(input, auth, contract) => kv.patch("${backend}", "${index}", contract, auth, input, input.id)`
    case 'PUT': return `(input, auth, contract) => kv.put("${backend}", "${index}", contract, auth, input, input.id)`
    case 'DELETE': return `(input, auth, contract) => kv.del("${backend}", "${index}", contract, auth, input.id)`
  }
}

export default kvCodeGen
