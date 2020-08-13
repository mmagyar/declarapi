import { Elastic } from '../DataDriverTypes'
import { SearchTypes, HttpMethods } from 'declarapi-runtime'
export type ElasticInputGet = {
  method: 'GET',
  search: SearchTypes
}
export type ElasticInputBase = { method: HttpMethods, search? :SearchTypes}
export type ElasticInputType = ElasticInputBase & (ElasticInputGet | {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
})
export const elasticCodeGen = (driver: Elastic, input: ElasticInputType):string => {
  const { index } = driver
  switch (input.method) {
    case 'GET': {
      if (input.search === 'textSearch') {
        return `(input, auth, contract) => elastic.get("${index}", contract, auth, input && input.id, input && input.search)`
      } else if (input.search === 'idOnly') {
        return `(input, auth, contract) => elastic.get("${index}", contract, auth, input && input.id)`
      } else if (input.search === 'full') {
        throw new Error('Parametric get not implemented yet')
      }
      throw new Error(`Unsupported automatic elasticsearch methods: ${JSON.stringify(input.search)}`)
    }
    case 'POST': return `(input, auth, contract) => elastic.post("${index}", contract, auth, input)`
    case 'PATCH': return `(input, auth, contract) => elastic.patch("${index}", contract, auth, input, input.id)`
    case 'PUT': return `(input, auth, contract) => elastic.put("${index}", contract, auth, input, input.id)`
    case 'DELETE': return `(input, auth, contract) => elastic.del("${index}", contract, auth, input.id)`
  }
}

export default elasticCodeGen
