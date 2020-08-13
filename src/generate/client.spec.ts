import client from './client'
import { OutputSuccess } from '../transform/types'
describe('Generate typing and fetch function for client', () => {
  const singleExample = (): OutputSuccess[] => [
    {
      name: 'test',
      authentication: false,
      manageFields: {},
      method: 'GET',
      arguments: { myNumber: 'number' },
      returns: {}
    }
  ]

  const crudExample = (): OutputSuccess[] => [
    {
      method: 'GET',
      name: 'test',
      authentication: false,
      manageFields: {},
      arguments: { search: ['string', '?'], id: ['string', { $array: 'string' }, '?'] },
      returns: { $array: { id: 'string', myNumber: 'number' } }
    },
    {
      method: 'POST',
      name: 'test',
      authentication: false,
      manageFields: {},
      arguments: { id: ['string', '?'], myNumber: 'number' },
      returns: { id: 'string', myNumber: 'number' }
    },
    {
      method: 'PUT',
      name: 'test',
      authentication: false,
      manageFields: {},
      arguments: { id: 'string', myNumber: 'number' },
      returns: { id: 'string', myNumber: 'number' }
    },
    {
      method: 'PATCH',
      name: 'test',
      authentication: false,
      manageFields: {},
      arguments: { id: 'string', myNumber: ['number', '?'] },
      returns: { id: 'string', myNumber: 'number' }
    },
    {
      method: 'DELETE',
      name: 'test',
      authentication: false,
      manageFields: {},
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
