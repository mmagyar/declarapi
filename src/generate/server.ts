import { OutputSuccess } from '../transform/types'
import elastic, { ElasticInputType } from './elastic'
import { name, typeDef, capitalize } from './common'
const contractType = 'import { ContractType } from "declarapi"'

export const server = (contracts: OutputSuccess[]): string => {
  const valueDef = contracts.map(x => {
    let handle = 'undefined'
    if (x.preferredImplementation && x.preferredImplementation.type === 'elasticsearch') {
      const elin:ElasticInputType = x.method === 'get'
        ? { idField: x.idFieldName, method: x.method, search: x.search || 'idOnly' }
        : { idField: x.idFieldName, method: x.method }

      handle = elastic(x.preferredImplementation, elin)
    }

    return `${name(x)}: {
          name: "${x.name}",
          authentication: ${JSON.stringify(x.authentication, undefined, 2)},
          type: "${x.method}",
          handle: ${handle},
          arguments: ${JSON.stringify(x.arguments)} ,
          returns: ${JSON.stringify(x.returns)}}`
  }).join(',\n')

  const contractTypeList = contracts.map(x =>
    `${name(x)}: ContractType<${name(x)}Argument, ${name(x)}Returns>`).join('\n')

  const elasticMethods = [
    ...new Set(contracts.map(x => {
      if (x.preferredImplementation?.type !== 'elasticsearch') return undefined
      if (x.method === 'put') return 'elasticPatch'
      if (x.method === 'delete') return 'elasticDel'
      return `elastic${capitalize(x.method)}`
    }).filter(x => x))
  ].join(',')
  const elasticImport = `import { ${elasticMethods} } from "declarapi"`
  const result =
  `/**********************************************
   DO NOT EDIT THIS FILE, IT WILL BE OVERRIDDEN
***********************************************/
  ${contractType}
  ${elasticMethods ? elasticImport : ''}

  ${typeDef(contracts)}
  export type ContractListType = {\n${contractTypeList}\n}\n
  export const contracts: ContractListType = {\n${valueDef}\n}\n`

  return result
}

export default server
