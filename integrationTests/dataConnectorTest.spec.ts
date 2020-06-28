
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

const getAllMethods = (contracts:InputType): ({
  post:ContractType<any, any>,
  get:ContractType<any, any>,
  patch:ContractType<any, any>,
  put:ContractType<any, any>,
  del:ContractType<any, any>}) => {
  const conts = Object.values(contracts)

  const post = conts.find(x => x.type === 'post')
  const get = conts.find(x => x.type === 'get')
  const put = conts.find(x => x.type === 'put')
  const patch = conts.find(x => x.type === 'patch')
  const del = conts.find(x => x.type === 'delete')

  expect(post).toBeTruthy()
  expect(get).toBeTruthy()
  expect(del).toBeTruthy()
  expect(put).toBeTruthy()
  expect(patch).toBeTruthy()

  if (!post || !get || !del || !patch || !put) throw new Error('All methods must exist')

  return { post, get, del, patch, put }
}

const checkMatchingGenerated = (generatorOut:any) => {
  expect(generatorOut.output.id).toBeTruthy()
  if (generatorOut.generatedInput.id) expect(generatorOut.output.id).toBe(generatorOut.generatedInput.id)

  const newOut = { ...generatorOut.output, id: undefined }
  const newIn = { ...generatorOut.output, id: undefined }
  expect(newOut).toStrictEqual(newIn)
  return generatorOut
}

const checkedGenerate = async <Input, Output>(postContract: ContractType<Input, Output>):
  Promise<{ output: Output; generatedInput: Input;}> => {
  return checkMatchingGenerated(await generateRandomCall(postContract))
}
export const canPostAndGetAll = async (contracts:InputType, howMany :number = 20) => {
  const { post, get } = getPostAndGet(contracts)

  const posting = []
  for (let i = 0; i < howMany; i++) {
    posting.push(checkedGenerate(post))
  }

  const posted = (await Promise.all(posting)).map(x => x.output)

  const getResult = await get.handle?.({})
  expect(getResult).toHaveLength(howMany)
  expect(new Set(getResult)).toStrictEqual(new Set(posted))
}

export const canPostAndGetSome = async (contracts:InputType, howMany:number = 20) => {
  const { post, get } = getPostAndGet(contracts)

  const halfLength = Math.floor(howMany / 2)
  const posting = []
  for (let i = 0; i < howMany; i++) {
    posting.push(checkedGenerate(post))
  }

  const posted = (await Promise.all(posting)).map(x => x.output)
  const toGet = posted.slice(0, halfLength)
  const toGetIds = toGet.map(x => x.id)
  const getResult = await get.handle?.({})
  expect(getResult).toHaveLength(howMany)
  expect(new Set(getResult)).toStrictEqual(new Set(posted))

  const getSome = await get.handle?.({ id: toGetIds })
  expect(getSome).toHaveLength(halfLength)
  expect(new Set(getSome)).toStrictEqual(new Set(toGet))
}

export const seedStandardDataset = async (post: ContractType<any, any>) => {
  const dataSets:any[] = [{
    name: 'DONKYKONG',
    cats: [],
    dogs: [{ name: 'donky', breed: 'Bulldog', color: 'red', age: 4 }],
    rain: 'cats'
  },
  { name: 'KINGKONG', cats: [{ name: 'dingy', breed: 'Bengal', color: 'red', age: 4 }], dogs: [], rain: 'dogs' },
  { name: 'GODZILLA', cats: [], dogs: [], rain: 'dogs' },
  { name: 'ZILLANILLA', cats: [], dogs: [], rain: 'dogs' },
  { name: 'MOTHS', cats: [], dogs: [], rain: 'cats' }
  ]
  return Promise.all(dataSets.map(x => post.handle?.(x)))
}
export const canTextSearchObjects = async (contracts:InputType) => {
  const { post, get } = getPostAndGet(contracts)
  await seedStandardDataset(post)
  const dogResult = await get.handle?.({ search: 'dogs' })
  expect(dogResult).toHaveLength(3)

  const catResult = await get.handle?.({ search: 'cats' })

  expect(catResult).toHaveLength(2)

  expect(await get.handle?.({ search: 'red' })).toHaveLength(2)
}

export const canPatchItems = async (contracts:InputType) => {
  const { post, get, patch } = getAllMethods(contracts)

  const dataSet = await seedStandardDataset(post)

  const id = dataSet[0].id
  const byIdResult = await get.handle?.({ id })
  expect(byIdResult).toHaveLength(1)
  expect(byIdResult[0].cats).toHaveLength(0)
  const patchCat = { name: 'Cirmi', breed: 'Maine Coon', color: 'grey', age: 3 }
  await patch.handle?.({ id, cats: [patchCat] })

  const byIdResultAfterPatch = await get.handle?.({ id })
  expect(byIdResultAfterPatch).toHaveLength(1)

  expect(byIdResultAfterPatch[0].cats).toHaveLength(1)
  expect(byIdResultAfterPatch[0].cats[0]).toStrictEqual(patchCat)
}

export const canPutItems = async (contracts:InputType) => {
  const { post, get, put } = getAllMethods(contracts)

  const dataSet = await seedStandardDataset(post)

  const id = dataSet[0].id
  const secondId = dataSet[1].id
  const byIdResult = await get.handle?.({ id })
  expect(byIdResult).toHaveLength(1)
  expect(byIdResult[0].cats).toHaveLength(0)
  const putData:any = { ...dataSet[1], id }
  await put.handle?.(putData)

  const byIdResultAfterPut = await get.handle?.({ id })
  expect(byIdResultAfterPut).toHaveLength(1)

  expect(byIdResultAfterPut[0]).toStrictEqual(putData)
  expect(byIdResultAfterPut[0]).not.toStrictEqual(dataSet[0])

  const copiedObject = await get.handle?.({ id: secondId })
  expect(copiedObject).toHaveLength(1)
  expect(copiedObject[0]).toStrictEqual(dataSet[1])
}

export const canDeleteSingleItem = async (contracts:InputType) => {
  const { post, get, del } = getAllMethods(contracts)
  const dataSet = await seedStandardDataset(post)
  const fullResult = await get.handle?.({})
  // Compare sets, we don't care about order
  expect(new Set(fullResult)).toStrictEqual(new Set(dataSet))
  // Sets remove duplicats so check lenghth as well
  expect(fullResult).toHaveLength(5)

  const removeFirst = [...dataSet]
  const first = removeFirst.shift()
  await del.handle?.({ id: first.id })

  const minusOne = await get.handle?.({})

  expect(minusOne).toHaveLength(4)
  expect(new Set(minusOne)).toStrictEqual(new Set(removeFirst))
}

export const canDeleteItems = async (contracts:InputType) => {
  const { post, get, del } = getAllMethods(contracts)
  const dataSet = await seedStandardDataset(post)
  const fullResult = await get.handle?.({})
  expect(fullResult).toHaveLength(5)
  expect(new Set(fullResult)).toStrictEqual(new Set(dataSet))

  const remove123 = [...dataSet]
  const first = remove123.shift()
  const second = remove123.shift()
  const third = remove123.shift()
  await del.handle?.({ id: [first.id, second.id, third.id] })

  const minus3 = await get.handle?.({})
  expect(minus3).toHaveLength(2)
  expect(new Set(minus3)).toStrictEqual(new Set(remove123))
}

describe('This is just a placeholder for these test function', () => {
  it('holds space', () => {
    expect('OK').toBeTruthy()
  })
})
