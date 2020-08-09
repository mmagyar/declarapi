import yaschva from 'yaschva/dist/type.js'
import { OutputSuccess } from '../transform/types.js'

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
export const name = (x: OutputSuccess): string => `${x.name}${capitalize(x.method)}`

export const typeDef = (contracts: OutputSuccess[]): string =>
  contracts.map(x =>
    `/** ${x.name} types for ${x.method} method **/
export type ${name(x)}Argument = ${yaschva.validationToType(x.arguments)}
export type ${name(x)}Returns = ${yaschva.validationToType(x.returns)}\n`).join('\n')
