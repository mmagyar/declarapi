
import { generateRandomCall } from 'declarapi'
import { generate, writeFile } from '../src/bin/generate'
import path from 'path'
import { promises as fs } from 'fs'
import { CrudContract } from '../src/transform/types'

import { ContractType } from '../src/globalTypes'

export type InputType = { [key: string]: ContractType<any, any>}

export const generateContract = async (schemaFilePath:string, outputName:string, decorator : (input: CrudContract) => CrudContract = x => x) => {
  const json = await fs.readFile(schemaFilePath, { encoding: 'utf8' })
  const parsed = decorator(JSON.parse(json))
  const generated = await generate('server', parsed)
  await writeFile(generated, outputName, path.join(__dirname, '/../test'))
}

const getPostAndGet = (contracts:InputType): ({post:ContractType<any, any>, get:ContractType<any, any>}) => {
  const conts = Object.values(contracts)

  const post = conts.find(x => x.type === 'post')
  const get = conts.find(x => x.type === 'get')

  expect(post).toBeTruthy()
  expect(get).toBeTruthy()

  if (!post || !get) throw new Error('Post or get was not found')

  return { post, get }
}
export const canSaveAndLoad = async (contracts:InputType) => {
  const { post, get } = getPostAndGet(contracts)
  await generateRandomCall(post)
  await generateRandomCall(post)
  const result = await generateRandomCall(post)
  const id = result.output.id
  expect(id).toBeTruthy()

  const getResult = await get.handle?.({})
  expect(getResult).toHaveLength(3)
  expect(getResult?.find((x:any) => x.id === id)).toBeTruthy()
}

export const canTextSearchObjects = async (contracts:InputType) => {
  const { post, get } = getPostAndGet(contracts)

  await post.handle?.({
    name: 'DONKYKONG',
    cats: [],
    dogs: [{ name: 'donky', breed: 'Bulldog', color: 'red', age: 4 }],
    rain: 'cats'
  })
  await post.handle?.({ name: 'KINGKONG', cats: [{ name: 'dingy', breed: 'Bengal', color: 'red', age: 4 }], dogs: [], rain: 'dogs' })
  await post.handle?.({ name: 'GODZILLA', cats: [], dogs: [], rain: 'dogs' })
  await post.handle?.({ name: 'ZILLANILLA', cats: [], dogs: [], rain: 'dogs' })
  await post.handle?.({ name: 'MOTHS', cats: [], dogs: [], rain: 'cats' })

  const dogResult = await get.handle?.({ search: 'dogs' })
  expect(dogResult).toHaveLength(3)

  const catResult = await get.handle?.({ search: 'cats' })

  expect(catResult).toHaveLength(2)

  expect(await get.handle?.({ search: 'red' })).toHaveLength(2)
}

describe('This is just a placeholder for these test function', () => {
  it('holds space', () => {
    expect('OK').toBeTruthy()
  })
})
