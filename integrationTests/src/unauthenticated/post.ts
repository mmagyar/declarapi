import { Expressable } from '../../../src/runtime/registerRestMethods'
import { AuthInput } from 'declarapi'
import { checkedGenerate } from '../common'

export const postRecords = async (post:Expressable, authInput:AuthInput, howMany:number = 20) => {
  const posted = (await Promise.all(
    [...Array(howMany).keys()].map(() => checkedGenerate(post, authInput))
  )).map(x => x.output)
  expect(posted).toHaveLength(howMany)
  return posted
}
