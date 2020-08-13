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
const generateRandomCall_js_1 = require("./generateRandomCall.js");
const yaschva_1 = require("yaschva");
describe('generateRandomCall', () => {
    const auth = {};
    const input = () => ({
        method: 'POST',
        route: '/',
        handle: jest.fn(),
        handler: jest.fn(),
        contract: {
            name: 'test',
            type: 'POST',
            authentication: false,
            manageFields: {},
            arguments: {
                myString: 'string',
                myNumber: 'number',
                myRegex: { $string: { regex: '\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b' } }
            },
            returns: {}
        }
    });
    it('will fail if handle is missing', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(1);
        const data = input();
        yield generateRandomCall_js_1.generateRandomCall(data.handle, data.contract, auth).catch(x => {
            expect(x).toHaveProperty('message', 'Random data generation returned with error: undefined, undefined');
        });
    }));
    it('calls handle with randomly generated, arguments that conform to the schema', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(7);
        const data = input();
        let handlerData;
        data.handle = jest.fn((input) => {
            expect(typeof input.myNumber).toBe('number');
            expect(typeof input.myString).toBe('string');
            expect(Object.keys(input)).toHaveLength(3);
            handlerData = input;
            return { response: 'done', code: 200 };
        });
        const result = yield generateRandomCall_js_1.generateRandomCall(data.handle, data.contract, auth);
        expect(result.output).toBe('done');
        expect(result.generatedInput).toStrictEqual(handlerData);
        expect(data.handle).toBeCalledTimes(1);
        expect(yaschva_1.validate(data.contract.arguments, result.generatedInput)).toHaveProperty('result', 'pass');
    }));
    it('handle can return falsy value', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(1);
        const data = input();
        data.handle = jest.fn(() => false);
        yield generateRandomCall_js_1.generateRandomCall(data.handle, data.contract, auth).catch(x => {
            expect(x).toHaveProperty('message', 'Random data generation returned with error: undefined, undefined');
        });
    }));
    it('handle can return error code', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(1);
        const data = input();
        data.handle = jest.fn(() => ({ code: 401 }));
        yield generateRandomCall_js_1.generateRandomCall(data.handle, data.contract, auth).catch(x => {
            expect(x).toHaveProperty('message', 'Random data generation returned with error: 401, undefined');
        });
    }));
});
//# sourceMappingURL=generateRandomCall.spec.js.map