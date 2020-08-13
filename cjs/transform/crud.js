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
exports.transform = void 0;
const microtil_1 = require("microtil");
const jsonSchema_js_1 = require("./jsonSchema.js");
const util_js_1 = require("../util.js");
const contractOptions = (input) => {
    if (Array.isArray(input)) {
        if (input.some(x => x === '?')) {
            return input;
        }
        return input.concat(['?']);
    }
    return [input, '?'];
};
const searchToType = (idType, dataType, search) => {
    if (search === 'idOnly') {
        return { id: [idType, { $array: idType }, '?'] };
    }
    else if (search === 'textSearch') {
        return { search: ['string', '?'], id: [idType, { $array: idType }, '?'] };
    }
    else if (search === 'full') {
        return microtil_1.map(dataType, value => contractOptions(value));
    }
    else if (!search) {
        return {};
    }
    return search;
};
const checkIdField = (contract) => {
    if (contract.dataType.id === undefined) {
        return {
            type: 'error',
            errors: 'id field does not exist in the data declaration'
        };
    }
    const idType = contract.dataType.id;
    if (!(idType === 'string' || idType.$string)) {
        return {
            type: 'error',
            errors: 'Type of id field must be string'
        };
    }
    return false;
};
const checkManageFields = (contract) => {
    for (const [key, value] of Object.entries(contract.manageFields || {})) {
        if (value) {
            const fieldType = contract.dataType[key];
            if (fieldType === undefined) {
                return {
                    type: 'error',
                    errors: `managed field "${key}" is not present on data type`
                };
            }
            if (!(fieldType === 'string' || fieldType.$string)) {
                return {
                    type: 'error',
                    errors: `managed field "${key}" must be a string, current type :${fieldType}`
                };
            }
        }
    }
    return false;
};
const removeManaged = (args, manageFields) => {
    const result = Object.assign({}, args);
    for (const [key, value] of Object.entries(manageFields || {})) {
        if (value) {
            delete result[key];
        }
    }
    return result;
};
const isCrudAuth = (tbd) => tbd.post !== undefined;
const isCrudAuthSome = (tbd) => tbd.modify !== undefined;
const transformForPost = (tbd) => Array.isArray(tbd) && tbd.find(x => x.createdBy) ? true : tbd;
exports.transform = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const valid = yield jsonSchema_js_1.validate(yield util_js_1.loadJSON(`${util_js_1.baseSchemaLocation}crudContractSchema.json`), data);
    if (jsonSchema_js_1.isValidationError(valid))
        return valid;
    const contractData = data;
    const au = contractData.authentication;
    const auth = {
        GET: isCrudAuth(au) ? au.get : (isCrudAuthSome(au) ? au.get : au),
        POST: isCrudAuth(au) ? au.post : transformForPost((isCrudAuthSome(au) ? au.modify : au)),
        PUT: isCrudAuth(au) ? au.put : (isCrudAuthSome(au) ? au.modify : au),
        PATCH: isCrudAuth(au) ? au.put : (isCrudAuthSome(au) ? au.modify : au),
        DELETE: isCrudAuth(au) ? au.delete : (isCrudAuthSome(au) ? au.delete || au.modify : au)
    };
    const createOutput = (method, args, returns = contractData.dataType) => ({
        method,
        name: contractData.name,
        authentication: auth[method],
        manageFields: contractData.manageFields || {},
        search: contractData.search,
        preferredImplementation: contractData.preferredImplementation,
        arguments: args,
        returns
    });
    const returnArray = { $array: contractData.dataType };
    const output = [];
    const errorWithId = checkIdField(contractData);
    if (errorWithId)
        return errorWithId;
    const errorWithManageFields = checkManageFields(contractData);
    if (errorWithManageFields)
        return errorWithManageFields;
    const idType = contractData.dataType.id;
    if (((_a = contractData.methods) === null || _a === void 0 ? void 0 : _a.get) !== false) {
        const search = contractData.search;
        output.push(createOutput('GET', searchToType(idType, contractData.dataType, search), returnArray));
    }
    if (((_b = contractData.methods) === null || _b === void 0 ? void 0 : _b.post) !== false) {
        const post = Object.assign(Object.assign({}, contractData.dataType), { id: [idType, '?'] });
        output.push(createOutput('POST', removeManaged(post, contractData.manageFields)));
    }
    if (((_c = contractData.methods) === null || _c === void 0 ? void 0 : _c.put) !== false) {
        output.push(createOutput('PUT', removeManaged(contractData.dataType, contractData.manageFields)));
    }
    if (((_d = contractData.methods) === null || _d === void 0 ? void 0 : _d.patch) !== false) {
        const patch = Object.assign(Object.assign({}, microtil_1.map(contractData.dataType, contractOptions)), { id: idType });
        output.push(createOutput('PATCH', removeManaged(patch, contractData.manageFields)));
    }
    if (((_e = contractData.methods) === null || _e === void 0 ? void 0 : _e.delete) !== false) {
        const deleteIds = { id: [idType, { $array: idType }] };
        output.push(createOutput('DELETE', deleteIds, returnArray));
    }
    return { type: 'result', key: contractData.name, results: output };
});
exports.default = exports.transform;
//# sourceMappingURL=crud.js.map