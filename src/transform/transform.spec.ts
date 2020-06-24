import { transform } from './transform'

describe('Generator', () => {
  it('generates basic example without error', async () => {
    const result = await transform(require('./single_example.json'))
    expect(result.errors).toBeUndefined()
    expect(result).toHaveProperty('type', 'result')
  })

  it('generates for object single contract input', async () => {
    const input = {
      $schema: './schema/singleContractSchema.json',
      name: 'test',
      authentication: false,
      arguments: { myNumber: 'number' },
      returns: {}
    }

    const result: any = await transform(input)
    expect(result.errors).toBeUndefined()
    expect(result).toStrictEqual({
      type: 'result',
      key: 'test',
      results: [
        {
          name: 'test',
          idFieldName: 'id',
          authentication: false,
          method: 'get',
          arguments: {
            myNumber: 'number'
          },
          returns: {}
        }
      ]
    })
  })

  it('generates for object crud contract input', async () => {
    const input = {
      $schema: './schema/crudContractSchema.json',
      idFieldName: 'id',
      name: 'test',
      authentication: false,
      dataType: { id: 'string', myNumber: 'number' }
    }

    const result: any = await transform(input)

    expect(result.errors).toBeUndefined()
    expect(result).toHaveProperty('type', 'result')
    expect(result.results).toHaveLength(5)
  })

  it('rejects unknown $schema', async () => {
    const input = {
      $schema: './random.json',
      name: 'test',
      authentication: false,
      arguments: { myNumber: 'number' },
      returns: {}
    }

    const result: any = await transform(input)
    expect(result.errors).toEqual('Unsupported schema for declaration: ./random.json')
  })

  it('rejects missing $schema', async () => {
    const input = {
      name: 'test',
      authentication: false,
      arguments: { myNumber: 'number' },
      returns: {}
    }

    const result: any = await transform(input)
    expect(result.errors).toEqual("Schema files must contain $schema that point to it's type")
  })

  it('rejects invalid type', async () => {
    const input = {
      $schema: './schema/singleContractSchema.json',
      name: 'test',
      authentication: false,
      arguments: { myNumber: 'number', invalidProp: 'imaginaryType' },
      returns: {}
    }

    const result: any = await transform(input)
    expect(result.errors).toHaveLength(12)
    expect(result.errors[0]).toEqual({
      dataPath: ".arguments['invalidProp']",
      keyword: 'type',
      message: 'should be object',
      params: { type: 'object' },
      schemaPath: '#/type'
    })
  })
})
