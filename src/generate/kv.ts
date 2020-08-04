import { KeyValue } from '../DataDriverTypes'
import { SearchTypes, HttpMethods } from '../globalTypes'
export type ElasticInputGet = {
  method: 'get',
  search: SearchTypes
}
export type ElasticInputBase = { method: HttpMethods, search? :SearchTypes}
export type ElasticInputType = ElasticInputBase & (ElasticInputGet | {
  method: 'post' | 'put' | 'patch' | 'delete',
})
export const kvCodeGen = (driver: KeyValue, input: ElasticInputType):string => {
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
