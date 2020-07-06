import client from './client'
import { OutputSuccess } from '../transform/types'
describe('Generate typing and fetch function for client', () => {
  const singleExample = (): OutputSuccess[] => [
    {
      name: 'test',
      authentication: false,
      method: 'get',
      arguments: { myNumber: 'number' },
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
    const result = client(singleExample())
    expect(result).toMatchSnapshot()
  })

  it('Generates crud example without an error that matches snapshot', () => {
    const result = client(crudExample())
    expect(result).toMatchSnapshot()
  })

  it('Can set the import path for getToken function', () => {
    const result = client(singleExample(), '../myCustomTokenPath')
    expect(result).toMatchSnapshot()
  })
})
