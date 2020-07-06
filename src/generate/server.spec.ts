import server from './server'
import { OutputSuccess } from '../transform/types'
describe('Generate typing and fetch function for server', () => {
  const singleExample = (): OutputSuccess[] => [
    {
      name: 'test',
      authentication: false,
      method: 'get',
      arguments: {
        myNumber: 'number'
      },
      returns: {}
    }
  ]

  const crudExample = (): OutputSuccess[] => [
    {
      method: 'get',
      name: 'test',
      authentication: false,
      arguments: { search: ['string', '?'], id: ['string', { $array: 'string' }, '?'] },
      returns: { $array: { id: 'string', myNumber: 'number' } }
    },
    {
      method: 'post',
      name: 'test',
      authentication: false,
      arguments: { id: ['string', '?'], myNumber: 'number' },
      returns: { id: 'string', myNumber: 'number' }
    },
    {
      method: 'put',
      name: 'test',
      authentication: false,
      arguments: { id: 'string', myNumber: 'number' },
      returns: { id: 'string', myNumber: 'number' }
    },
    {
      method: 'patch',
      name: 'test',
      authentication: false,
      arguments: { id: 'string', myNumber: ['number', '?'] },
      returns: { id: 'string', myNumber: 'number' }
    },
    {
      method: 'delete',
      name: 'test',
      authentication: false,
      arguments: { id: ['string', { $array: 'string' }] },
      returns: { $array: { id: 'string', myNumber: 'number' } }
    }
  ]
  it('Generates single example without an error that matches snapshot', () => {
    const result = server(singleExample())
    expect(result).toMatchSnapshot()
  })

  it('Generates crud example without an error that matches snapshot', () => {
    const result = server(crudExample())
    expect(result).toMatchSnapshot()
  })

  const crudElasticExample = (): OutputSuccess[] => [
    {
      method: 'get',
      name: 'test',
      authentication: false,
      search: 'textSearch',
      preferredImplementation: { type: 'elasticsearch', index: 'test' },
      arguments: {
        search: ['string', '?'],
        id: ['string', { $array: 'string' }, '?']
      },
      returns: { $array: { id: 'string', myNumber: 'number' } }
    },
    {
      method: 'post',
      name: 'test',
      authentication: false,
      search: 'textSearch',
      preferredImplementation: { type: 'elasticsearch', index: 'test' },
      arguments: { id: ['string', '?'], myNumber: 'number' },
      returns: { id: 'string', myNumber: 'number' }
    },
    {
      method: 'put',
      name: 'test',
      authentication: false,
      search: 'textSearch',
      preferredImplementation: { type: 'elasticsearch', index: 'test' },
      arguments: { id: 'string', myNumber: 'number' },
      returns: { id: 'string', myNumber: 'number' }
    },
    {
      method: 'patch',
      name: 'test',
      authentication: false,
      search: 'textSearch',
      preferredImplementation: { type: 'elasticsearch', index: 'test' },
      arguments: { id: 'string', myNumber: ['number', '?'] },
      returns: { id: 'string', myNumber: 'number' }
    },
    {
      method: 'delete',
      name: 'test',
      authentication: false,
      search: 'textSearch',
      preferredImplementation: { type: 'elasticsearch', index: 'test' },
      arguments: { id: ['string', { $array: 'string' }] },
      returns: { $array: { id: 'string', myNumber: 'number' } }
    }
  ]

  it('generates elasticsearch implementation', () => {
    const result = server(crudElasticExample())
    expect(result).toMatchSnapshot()
  })

  const singleElasticExample = (): OutputSuccess[] => [
    {
      name: 'test',
      authentication: false,
      method: 'get',
      preferredImplementation: { type: 'elasticsearch', index: 'test' },
      arguments: {
        myNumber: 'number'
      },
      returns: {}
    }
  ]
  it('generates simple elasticsearch implementation, search defaults to idOnly get', () => {
    const result = server(singleElasticExample())
    expect(result).toMatchSnapshot()
  })

  it('full search is not implemented', () => {
    const data = singleElasticExample()
    data[0].search = 'full'
    expect(() => server(data)).toThrow('Parametric get not implemented yet')
  })

  it('custom search is not implemented', () => {
    const data = singleElasticExample()
    data[0].search = { littleKitty: 'string' }
    expect(() => server(data)).toThrow('Unsupported automatic elasticsearch methods: {"littleKitty":"string"}')
  })
})
