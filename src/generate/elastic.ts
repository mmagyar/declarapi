import { Elastic } from '../DataDriverTypes'
import { SearchTypes, HttpMethods } from '../globalTypes'
export type ElasticInputGet = {
  method: 'get',
  search: SearchTypes
}
export type ElasticInputBase = {idField:string, method: HttpMethods, search? :SearchTypes}
export type ElasticInputType = ElasticInputBase & (ElasticInputGet | {
  method: 'post' | 'put' | 'patch' | 'delete',
})
export const elastic = (driver: Elastic, input: ElasticInputType):string => {
  const { index } = driver
  const idField = input.idField
  switch (input.method) {
    case 'get': {
      if (input.search === 'textSearch') {
        return `input => get("${index}", input && input.${idField}, input && input.search)`
      } else if (input.search === 'idOnly') {
        return `input => get("${index}", input && input.${idField})`
      } else if (input.search === 'full') {
        throw new Error('Parametric get not implemented yet')
      }
      throw new Error(`unsupported automatic elasticsearch methods: ${input.search}`)
    }
    case 'post': return `input => post("${index}", input, "${idField}")`
    case 'patch': return `input => patch("${index}", input, input.${idField})`
    case 'put': return `input => patch("${index}", input, input.${idField})`
    case 'delete': return `input => del("${index}", input.${idField})`
    default: throw new Error(`unsupported method: ${input}`)
  }
}

export default elastic
