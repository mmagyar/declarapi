import { OutputSuccess } from '../transform/types'

export const generateTs = (input: OutputSuccess):string => {
  return input.idFieldName
}
