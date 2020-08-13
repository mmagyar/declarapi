"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kvCodeGen = void 0;
exports.kvCodeGen = (driver, input) => {
    const { index, backend } = driver;
    switch (input.method) {
        case 'GET': {
            if (input.search === 'textSearch') {
                return `(input, auth, contract) => kv.get("${backend}", "${index}", contract, auth, input && input.id, input && input.search)`;
            }
            else if (input.search === 'idOnly') {
                return `(input, auth, contract) => kv.get("${backend}", "${index}", contract, auth, input && input.id)`;
            }
            else if (input.search === 'full') {
                throw new Error('Parametric get not implemented yet');
            }
            throw new Error(`Unsupported automatic key-value methods: ${JSON.stringify(input.search)}`);
        }
        case 'POST': return `(input, auth, contract) => kv.post("${backend}", "${index}", contract, auth, input)`;
        case 'PATCH': return `(input, auth, contract) => kv.patch("${backend}", "${index}", contract, auth, input, input.id)`;
        case 'PUT': return `(input, auth, contract) => kv.put("${backend}", "${index}", contract, auth, input, input.id)`;
        case 'DELETE': return `(input, auth, contract) => kv.del("${backend}", "${index}", contract, auth, input.id)`;
    }
};
exports.default = exports.kvCodeGen;
//# sourceMappingURL=kv.js.map