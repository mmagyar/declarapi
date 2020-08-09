import { Elastic } from '../DataDriverTypes.js'
import { SearchTypes, HttpMethods } from '../globalTypes.js'
export type ElasticInputGet = {
  method: 'get',
  search: SearchTypes
}
export type ElasticInputBase = { method: HttpMethods, search? :SearchTypes}
export type ElasticInputType = ElasticInputBase & (ElasticInputGet | {
  method: 'post' | 'put' | 'patch' | 'delete',
})
export const elasticCodeGen = (driver: Elastic, input: ElasticInputType):string => {
  const { index } = driver
  switch (input.method) {
    case 'get': {
      if (input.search === 'textSearch') {
        return `(input, auth, contract) => elastic.get("${index}", contract, auth, input && input.id, input && input.search)`
      } else if (input.search === 'idOnly') {
        return `(input, auth, contract) => elastic.get("${index}", contract, auth, input && input.id)`
      } else if (input.search === 'full') {
        throw new Error('Parametric get not implemented yet')
      }
      throw new Error(`Unsupported automatic elasticsearch methods: ${JSON.stringify(input.search)}`)
    }
    case 'post': return `(input, auth, contract) => elastic.post("${index}", contract, auth, input)`
    case 'patch': return `(input, auth, contract) => elastic.patch("${index}", contract, auth, input, input.id)`
    case 'put': return `(input, auth, contract) => elastic.put("${index}", contract, auth, input, input.id)`
    case 'delete': return `(input, auth, contract) => elastic.del("${index}", contract, auth, input.id)`
  }
}

export default elasticCodeGen
