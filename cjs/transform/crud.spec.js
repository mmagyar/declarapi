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
const crud_js_1 = require("./crud.js");
describe('transform crud', () => {
    const getArgs = (result, method) => {
        var _a, _b;
        const res = (_b = (_a = result.results) === null || _a === void 0 ? void 0 : _a.find(x => x.method === method)) === null || _b === void 0 ? void 0 : _b.arguments;
        if (!res)
            throw new Error(`Method not found ${method}`);
        return res;
    };
    const getReturns = (result, method) => {
        var _a, _b;
        const res = (_b = (_a = result.results) === null || _a === void 0 ? void 0 : _a.find(x => x.method === method)) === null || _b === void 0 ? void 0 : _b.returns;
        if (!res)
            throw new Error(`Method not found ${method}`);
        return res;
    };
    it('id must be present on input', () => __awaiter(void 0, void 0, void 0, function* () {
        const resultErr = yield crud_js_1.transform({ name: 'test', authentication: false, dataType: { notId: 'string' } });
        expect(resultErr).toStrictEqual({
            type: 'error',
            errors: 'id field does not exist in the data declaration'
        });
        const result = yield crud_js_1.transform({
            name: 'test',
            authentication: false,
            dataType: { id: 'string', notId: 'string' }
        });
        expect(result).toHaveProperty('type', 'result');
        expect(result).toHaveProperty('results');
        expect(result.results).toHaveLength(5);
    }));
    it('does not generate arguments for get is search is not set', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const input = {
            name: 'test',
            authentication: false,
            dataType: {
                id: 'string',
                myNumber: 'number',
                myString: 'string'
            }
        };
        const output = yield crud_js_1.transform(input);
        expect((_b = (_a = output.results) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.arguments).toStrictEqual({});
        expect((_d = (_c = output.results) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.method).toBe('GET');
        // expect(output).toMatchSnapshot()
    }));
    it.skip('generates full, parametric search option', () => __awaiter(void 0, void 0, void 0, function* () {
        const input = {
            name: 'test',
            authentication: false,
            dataType: {
                id: 'string',
                myNumber: 'number',
                myString: 'string'
            },
            search: 'full'
        };
        expect(yield crud_js_1.transform(input)).toMatchSnapshot();
    }));
    it('generates a full text search search option', () => __awaiter(void 0, void 0, void 0, function* () {
        var _e, _f, _g, _h;
        const input = {
            name: 'test',
            authentication: false,
            dataType: {
                id: 'string',
                myNumber: 'number',
                myString: 'string'
            },
            search: 'textSearch'
        };
        const output = yield crud_js_1.transform(input);
        expect((_f = (_e = output.results) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.arguments).toStrictEqual({
            id: ['string', { $array: 'string' }, '?'],
            search: ['string', '?']
        });
        expect((_h = (_g = output.results) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.method).toBe('GET');
        // expect(output).toMatchSnapshot()
    }));
    it.skip('generates an id only get', () => __awaiter(void 0, void 0, void 0, function* () {
        const input = {
            name: 'test',
            authentication: false,
            dataType: {
                id: 'string',
                myNumber: 'number',
                myString: 'string'
            },
            search: 'idOnly'
        };
        expect(yield crud_js_1.transform(input)).toMatchSnapshot();
    }));
    it('does not generate methods that are disabled ver 1', () => __awaiter(void 0, void 0, void 0, function* () {
        var _j, _k, _l, _m, _o;
        const input = {
            name: 'test',
            authentication: false,
            methods: {
                put: false,
                patch: false
            },
            dataType: {
                id: 'string',
                myNumber: 'number',
                myString: 'string'
            },
            search: 'idOnly'
        };
        const result = yield crud_js_1.transform(input);
        expect(result.results).toHaveLength(3);
        expect((_j = result.results) === null || _j === void 0 ? void 0 : _j.find(x => x.method === 'PUT')).toBeUndefined();
        expect((_k = result.results) === null || _k === void 0 ? void 0 : _k.find(x => x.method === 'PATCH')).toBeUndefined();
        expect((_l = result.results) === null || _l === void 0 ? void 0 : _l.find(x => x.method === 'GET')).toBeTruthy();
        expect((_m = result.results) === null || _m === void 0 ? void 0 : _m.find(x => x.method === 'POST')).toBeTruthy();
        expect((_o = result.results) === null || _o === void 0 ? void 0 : _o.find(x => x.method === 'DELETE')).toBeTruthy();
    }));
    it('does not generate methods that are disabled ver 2', () => __awaiter(void 0, void 0, void 0, function* () {
        var _p, _q, _r, _s, _t;
        const input = {
            name: 'test',
            authentication: false,
            methods: {
                get: false,
                post: false,
                delete: false
            },
            dataType: {
                id: 'string',
                myNumber: 'number',
                myString: 'string'
            },
            search: 'idOnly'
        };
        const result = yield crud_js_1.transform(input);
        expect(result.results).toHaveLength(2);
        expect((_p = result.results) === null || _p === void 0 ? void 0 : _p.find(x => x.method === 'PUT')).toBeTruthy();
        expect((_q = result.results) === null || _q === void 0 ? void 0 : _q.find(x => x.method === 'PATCH')).toBeTruthy();
        expect((_r = result.results) === null || _r === void 0 ? void 0 : _r.find(x => x.method === 'GET')).toBeUndefined();
        expect((_s = result.results) === null || _s === void 0 ? void 0 : _s.find(x => x.method === 'POST')).toBeUndefined();
        expect((_t = result.results) === null || _t === void 0 ? void 0 : _t.find(x => x.method === 'DELETE')).toBeUndefined();
    }));
    it('generates a custom arguments parameters for get ', () => __awaiter(void 0, void 0, void 0, function* () {
        var _u, _v, _w;
        const input = {
            name: 'test',
            authentication: false,
            dataType: {
                id: 'string',
                myNumber: 'number',
                myString: 'string'
            },
            search: { customSearchField: 'string' }
        };
        const result = yield crud_js_1.transform(input);
        expect((_w = (_v = (_u = result.results) === null || _u === void 0 ? void 0 : _u[0]) === null || _v === void 0 ? void 0 : _v.arguments) === null || _w === void 0 ? void 0 : _w.customSearchField).toEqual('string');
        // expect(result).toMatchSnapshot()
    }));
    it('accepts regex validated id', () => __awaiter(void 0, void 0, void 0, function* () {
        var _x, _y;
        const input = {
            name: 'test',
            authentication: false,
            dataType: {
                id: { $string: { regex: '[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}' } },
                notAnId: 'boolean'
            },
            search: 'idOnly'
        };
        const output = yield crud_js_1.transform(input);
        expect((_y = (_x = output.results) === null || _x === void 0 ? void 0 : _x[0]) === null || _y === void 0 ? void 0 : _y.arguments).toStrictEqual({
            id: [
                { $string: { regex: '[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}' } },
                { $array: { $string: { regex: '[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}' } } },
                '?'
            ]
        });
        expect(output.results).toHaveLength(5);
    }));
    it('returns an object with an error message on invalid id type', () => __awaiter(void 0, void 0, void 0, function* () {
        const input = {
            name: 'test',
            authentication: false,
            dataType: {
                id: 'number',
                notAnId: 'boolean'
            }
        };
        const result = yield crud_js_1.transform(input);
        expect(result.errors).toEqual('Type of id field must be string');
    }));
    it('returns an object with an error message on validation error', () => __awaiter(void 0, void 0, void 0, function* () {
        var _z;
        const input = {
            name: 'test',
            authenticationz: false,
            dataType: {
                id: 'string',
                notAnId: 'boolean'
            }
        };
        const result = yield crud_js_1.transform(input);
        expect(result.errors).toHaveLength(2);
        expect((_z = result.errors) === null || _z === void 0 ? void 0 : _z[0]).toStrictEqual({ dataPath: '', keyword: 'additionalProperties', message: 'should NOT have additional properties', params: { additionalProperty: 'authenticationz' }, schemaPath: '#/additionalProperties' });
    }));
    it('makes all parameters optional for patch', () => __awaiter(void 0, void 0, void 0, function* () {
        var _0, _1;
        const input = {
            name: 'test',
            authentication: false,
            dataType: {
                id: 'string',
                notAnId: ['boolean', '?'],
                singleElementArrayType: ['string'],
                obj: { a: 'string', b: 'number' },
                obj2: { a: ['string', '?'], b: ['number', '?'] },
                duoType: ['boolean', 'number']
            }
        };
        const result = yield crud_js_1.transform(input);
        expect((_1 = (_0 = result.results) === null || _0 === void 0 ? void 0 : _0.find(x => x.method === 'PATCH')) === null || _1 === void 0 ? void 0 : _1.arguments).toStrictEqual({
            id: 'string',
            notAnId: ['boolean', '?'],
            singleElementArrayType: ['string', '?'],
            obj: [{ a: 'string', b: 'number' }, '?'],
            obj2: [{ a: ['string', '?'], b: ['number', '?'] }, '?'],
            duoType: ['boolean', 'number', '?']
        });
    }));
    it('supports different auth protocols', () => __awaiter(void 0, void 0, void 0, function* () {
        var _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14;
        const withAuth = (auth = true) => ({
            name: 'test',
            authentication: auth,
            dataType: {
                id: 'string',
                notAnId: 'boolean'
            }
        });
        expect((_2 = (yield crud_js_1.transform(withAuth(false))).results) === null || _2 === void 0 ? void 0 : _2.every(x => x.authentication === false)).toBeTruthy();
        expect((_3 = (yield crud_js_1.transform(withAuth(true))).results) === null || _3 === void 0 ? void 0 : _3.every(x => x.authentication === true)).toBeTruthy();
        const stringAllRole = (yield crud_js_1.transform(withAuth(['aUserRole']))).results || [];
        expect(stringAllRole).toHaveLength(5);
        stringAllRole.forEach(x => expect(x.authentication).toStrictEqual(['aUserRole']));
        const resultAuthSome = yield crud_js_1.transform(withAuth({ get: false, modify: ['admin'] }));
        expect((_5 = (_4 = resultAuthSome.results) === null || _4 === void 0 ? void 0 : _4.find(x => x.method === 'GET')) === null || _5 === void 0 ? void 0 : _5.authentication).toStrictEqual(false);
        const authSomeOtherMethods = ((_6 = resultAuthSome.results) === null || _6 === void 0 ? void 0 : _6.filter(x => x.method !== 'GET')) || [];
        expect(authSomeOtherMethods).toHaveLength(4);
        authSomeOtherMethods.forEach(x => expect(x.authentication).toStrictEqual(['admin']));
        const resultAuth = yield crud_js_1.transform(withAuth({ get: false, post: true, put: ['owner'], delete: ['admin'] }));
        expect((_8 = (_7 = resultAuth.results) === null || _7 === void 0 ? void 0 : _7.find(x => x.method === 'GET')) === null || _8 === void 0 ? void 0 : _8.authentication).toStrictEqual(false);
        expect((_10 = (_9 = resultAuth.results) === null || _9 === void 0 ? void 0 : _9.find(x => x.method === 'POST')) === null || _10 === void 0 ? void 0 : _10.authentication).toStrictEqual(true);
        expect((_12 = (_11 = resultAuth.results) === null || _11 === void 0 ? void 0 : _11.find(x => x.method === 'PUT')) === null || _12 === void 0 ? void 0 : _12.authentication).toStrictEqual(['owner']);
        expect((_14 = (_13 = resultAuth.results) === null || _13 === void 0 ? void 0 : _13.find(x => x.method === 'DELETE')) === null || _14 === void 0 ? void 0 : _14.authentication).toStrictEqual(['admin']);
    }));
    it('does not required user to post when user auth is set globally', () => __awaiter(void 0, void 0, void 0, function* () {
        var _15, _16, _17, _18, _19, _20, _21, _22;
        const auth = ['admin', { createdBy: true }];
        const withAuth = (auth = true) => ({
            name: 'test',
            authentication: auth,
            dataType: {
                id: 'string',
                notAnId: 'boolean',
                createdBy: 'string'
            }
        });
        const stringAllRole = (yield crud_js_1.transform(withAuth(['aUserRole']))).results || [];
        expect(stringAllRole).toHaveLength(5);
        stringAllRole.forEach(x => expect(x.authentication).toStrictEqual(['aUserRole']));
        const boolAll = (yield crud_js_1.transform(withAuth(true))).results || [];
        expect(boolAll).toHaveLength(5);
        boolAll.forEach(x => expect(x.authentication).toStrictEqual(true));
        const resultAuth = yield crud_js_1.transform(withAuth(auth));
        expect((_16 = (_15 = resultAuth.results) === null || _15 === void 0 ? void 0 : _15.find(x => x.method === 'GET')) === null || _16 === void 0 ? void 0 : _16.authentication).toStrictEqual(auth);
        expect((_18 = (_17 = resultAuth.results) === null || _17 === void 0 ? void 0 : _17.find(x => x.method === 'POST')) === null || _18 === void 0 ? void 0 : _18.authentication).toStrictEqual(true);
        expect((_20 = (_19 = resultAuth.results) === null || _19 === void 0 ? void 0 : _19.find(x => x.method === 'PUT')) === null || _20 === void 0 ? void 0 : _20.authentication).toStrictEqual(auth);
        expect((_22 = (_21 = resultAuth.results) === null || _21 === void 0 ? void 0 : _21.find(x => x.method === 'DELETE')) === null || _22 === void 0 ? void 0 : _22.authentication).toStrictEqual(auth);
    }));
    describe('manageFields', () => {
        const schema = () => ({
            name: 'test',
            authentication: false,
            manageFields: { createdBy: true },
            dataType: {
                id: 'string',
                notAnId: 'boolean'
            }
        });
        it('returns error when manageFields createdBy is set to true, but the field is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield crud_js_1.transform(schema());
            expect(result).toHaveProperty('type', 'error');
            expect(result).toHaveProperty('errors', 'managed field "createdBy" is not present on data type');
        }));
        it('returns error when manageFields createdBy is set to true, but field is not declared as string', () => __awaiter(void 0, void 0, void 0, function* () {
            const input = schema();
            input.dataType.createdBy = 'number';
            const result = yield crud_js_1.transform(input);
            expect(result).toHaveProperty('type', 'error');
            expect(result).toHaveProperty('errors', 'managed field "createdBy" must be a string, current type :number');
        }));
        it('does not generate error when createdBy managedField is a string', () => __awaiter(void 0, void 0, void 0, function* () {
            const input = schema();
            input.dataType.createdBy = 'string';
            expect(yield crud_js_1.transform(input)).toHaveProperty('type', 'result');
            input.dataType.createdBy = { $string: {} };
            expect(yield crud_js_1.transform(input)).toHaveProperty('type', 'result');
        }));
        it('does not generate error when createdBy managedField is disabled', () => __awaiter(void 0, void 0, void 0, function* () {
            const input = schema();
            input.manageFields.createdBy = false;
            input.dataType.createdBy = 'number';
            expect(yield crud_js_1.transform(input)).toHaveProperty('type', 'result');
        }));
        it('removes managed field from post arguments', () => __awaiter(void 0, void 0, void 0, function* () {
            const input = schema();
            input.dataType.createdBy = 'string';
            const result = yield crud_js_1.transform(input);
            expect(result).toHaveProperty('type', 'result');
            expect(getReturns(result, 'GET').$array).toHaveProperty('createdBy', 'string');
            expect(getArgs(result, 'POST')).not.toHaveProperty('createdBy');
            expect(getReturns(result, 'POST')).toHaveProperty('createdBy', 'string');
            expect(getArgs(result, 'PUT')).not.toHaveProperty('createdBy');
            expect(getReturns(result, 'PUT')).toHaveProperty('createdBy', 'string');
            expect(getArgs(result, 'PATCH')).not.toHaveProperty('createdBy');
            expect(getReturns(result, 'PATCH')).toHaveProperty('createdBy', 'string');
            expect(getArgs(result, 'DELETE')).not.toHaveProperty('createdBy');
            expect(getReturns(result, 'DELETE').$array).toHaveProperty('createdBy', 'string');
        }));
    });
});
//# sourceMappingURL=crud.spec.js.map