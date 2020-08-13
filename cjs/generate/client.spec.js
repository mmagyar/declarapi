"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_js_1 = __importDefault(require("./client.js"));
describe('Generate typing and fetch function for client', () => {
    const singleExample = () => [
        {
            name: 'test',
            authentication: false,
            manageFields: {},
            method: 'GET',
            arguments: { myNumber: 'number' },
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
        const result = client_js_1.default(singleExample());
        expect(result).toMatchSnapshot();
    });
    it.skip('Generates crud example without an error that matches snapshot', () => {
        const result = client_js_1.default(crudExample());
        expect(result).toMatchSnapshot();
    });
    it.skip('Can set the import path for getToken function', () => {
        const result = client_js_1.default(singleExample(), '../myCustomTokenPath');
        expect(result).toMatchSnapshot();
    });
});
//# sourceMappingURL=client.spec.js.map