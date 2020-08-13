"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_js_1 = __importDefault(require("./server.js"));
describe('Generate typing and fetch function for server', () => {
    const singleExample = () => [
        {
            name: 'test',
            authentication: false,
            manageFields: {},
            method: 'GET',
            arguments: {
                myNumber: 'number'
            },
            returns: {}
        }
    ];
    const crudExample = () => [
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
    ];
    it.skip('Generates single example without an error that matches snapshot', () => {
        const result = server_js_1.default(singleExample());
        expect(result).toMatchSnapshot();
    });
    it.skip('Generates crud example without an error that matches snapshot', () => {
        const result = server_js_1.default(crudExample());
        expect(result).toMatchSnapshot();
    });
    const crudElasticExample = () => [
        {
            method: 'GET',
            name: 'test',
            authentication: false,
            manageFields: {},
            search: 'textSearch',
            preferredImplementation: { type: 'elasticsearch', index: 'test' },
            arguments: {
                search: ['string', '?'],
                id: ['string', { $array: 'string' }, '?']
            },
            returns: { $array: { id: 'string', myNumber: 'number' } }
        },
        {
            method: 'POST',
            name: 'test',
            authentication: false,
            manageFields: {},
            search: 'textSearch',
            preferredImplementation: { type: 'elasticsearch', index: 'test' },
            arguments: { id: ['string', '?'], myNumber: 'number' },
            returns: { id: 'string', myNumber: 'number' }
        },
        {
            method: 'PUT',
            name: 'test',
            authentication: false,
            manageFields: {},
            search: 'textSearch',
            preferredImplementation: { type: 'elasticsearch', index: 'test' },
            arguments: { id: 'string', myNumber: 'number' },
            returns: { id: 'string', myNumber: 'number' }
        },
        {
            method: 'PATCH',
            name: 'test',
            authentication: false,
            manageFields: {},
            search: 'textSearch',
            preferredImplementation: { type: 'elasticsearch', index: 'test' },
            arguments: { id: 'string', myNumber: ['number', '?'] },
            returns: { id: 'string', myNumber: 'number' }
        },
        {
            method: 'DELETE',
            name: 'test',
            authentication: false,
            manageFields: {},
            search: 'textSearch',
            preferredImplementation: { type: 'elasticsearch', index: 'test' },
            arguments: { id: ['string', { $array: 'string' }] },
            returns: { $array: { id: 'string', myNumber: 'number' } }
        }
    ];
    it.skip('generates elasticsearch implementation', () => {
        const result = server_js_1.default(crudElasticExample());
        expect(result).toMatchSnapshot();
    });
    const singleElasticExample = () => [
        {
            name: 'test',
            authentication: false,
            manageFields: {},
            method: 'GET',
            preferredImplementation: { type: 'elasticsearch', index: 'test' },
            arguments: {
                myNumber: 'number'
            },
            returns: {}
        }
    ];
    it.skip('generates simple elasticsearch implementation, search defaults to idOnly get', () => {
        const result = server_js_1.default(singleElasticExample());
        expect(result).toMatchSnapshot();
    });
    it('full search is not implemented', () => {
        const data = singleElasticExample();
        data[0].search = 'full';
        expect(() => server_js_1.default(data)).toThrow('Parametric get not implemented yet');
    });
    it('custom search is not implemented', () => {
        const data = singleElasticExample();
        data[0].search = { littleKitty: 'string' };
        expect(() => server_js_1.default(data)).toThrow('Unsupported automatic elasticsearch methods: {"littleKitty":"string"}');
    });
});
//# sourceMappingURL=server.spec.js.map