"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const transform_js_1 = require("./transform.js");
describe('Generator', () => {
    it('generates basic example without error', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield transform_js_1.transform(require('../../example/single_example.json'));
        expect(result.errors).toBeUndefined();
        expect(result).toHaveProperty('type', 'result');
    }));
    it('generates for object single contract input', () => __awaiter(void 0, void 0, void 0, function* () {
        const input = {
            $schema: '../../schema/singleContractSchema.json',
            name: 'test',
            authentication: false,
            arguments: { myNumber: 'number' },
            returns: {}
        };
        const result = yield transform_js_1.transform(input);
        expect(result.errors).toBeUndefined();
        expect(result).toStrictEqual({
            type: 'result',
            key: 'test',
            results: [
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
            ]
        });
    }));
    it('generates for object crud contract input', () => __awaiter(void 0, void 0, void 0, function* () {
        const input = {
            $schema: './schema/crudContractSchema.json',
            name: 'test',
            authentication: false,
            dataType: { id: 'string', myNumber: 'number' }
        };
        const result = yield transform_js_1.transform(input);
        expect(result.errors).toBeUndefined();
        expect(result).toHaveProperty('type', 'result');
        expect(result.results).toHaveLength(5);
    }));
    it('rejects unknown $schema', () => __awaiter(void 0, void 0, void 0, function* () {
        const input = {
            $schema: './random.json',
            name: 'test',
            authentication: false,
            arguments: { myNumber: 'number' },
            returns: {}
        };
        const result = yield transform_js_1.transform(input);
        expect(result.errors).toEqual('Unsupported schema for declaration: ./random.json');
    }));
    it('rejects missing $schema', () => __awaiter(void 0, void 0, void 0, function* () {
        const input = {
            name: 'test',
            authentication: false,
            arguments: { myNumber: 'number' },
            returns: {}
        };
        const result = yield transform_js_1.transform(input);
        expect(result.errors).toEqual("Schema files must contain $schema that point to it's type");
    }));
    it('rejects invalid type', () => __awaiter(void 0, void 0, void 0, function* () {
        const input = {
            $schema: './schema/singleContractSchema.json',
            name: 'test',
            authentication: false,
            arguments: { myNumber: 'number', invalidProp: 'imaginaryType' },
            returns: {}
        };
        const result = yield transform_js_1.transform(input);
        expect(result.errors).toHaveLength(14);
        expect(result.errors[0]).toEqual({
            dataPath: ".arguments['invalidProp']",
            keyword: 'type',
            message: 'should be object',
            params: { type: 'object' },
            schemaPath: '#/type'
        });
    }));
});
//# sourceMappingURL=transform.spec.js.map