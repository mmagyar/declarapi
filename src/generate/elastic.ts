import { Elastic } from '../DataDriverTypes'
import { SearchTypes, HttpMethods } from '../globalTypes'
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
        return `(input, auth, manageFields) => elastic.get("${index}", manageFields, auth, input && input.id, input && input.search)`
      } else if (input.search === 'idOnly') {
        return `(input, auth, manageFields) => elastic.get("${index}", manageFields, auth, input && input.id)`
      } else if (input.search === 'full') {
        throw new Error('Parametric get not implemented yet')
      }
      throw new Error(`Unsupported automatic elasticsearch methods: ${JSON.stringify(input.search)}`)
    }
    case 'post': return `(input, auth, manageFields) => elastic.post("${index}", manageFields, auth, input)`
    case 'patch': return `(input, auth, manageFields) => elastic.patch("${index}", manageFields, auth, input, input.id)`
    case 'put': return `(input, auth, manageFields) => elastic.put("${index}", manageFields, auth, input, input.id)`
    case 'delete': return `(input, auth, manageFields) => elastic.del("${index}", manageFields, auth, input.id)`
  }
}

export default elasticCodeGen
