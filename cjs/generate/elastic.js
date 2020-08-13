"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elasticCodeGen = void 0;
exports.elasticCodeGen = (driver, input) => {
    const { index } = driver;
    switch (input.method) {
        case 'GET': {
            if (input.search === 'textSearch') {
                return `(input, auth, contract) => elastic.get("${index}", contract, auth, input && input.id, input && input.search)`;
            }
            else if (input.search === 'idOnly') {
                return `(input, auth, contract) => elastic.get("${index}", contract, auth, input && input.id)`;
            }
            else if (input.search === 'full') {
                throw new Error('Parametric get not implemented yet');
            }
            throw new Error(`Unsupported automatic elasticsearch methods: ${JSON.stringify(input.search)}`);
        }
        case 'POST': return `(input, auth, contract) => elastic.post("${index}", contract, auth, input)`;
        case 'PATCH': return `(input, auth, contract) => elastic.patch("${index}", contract, auth, input, input.id)`;
        case 'PUT': return `(input, auth, contract) => elastic.put("${index}", contract, auth, input, input.id)`;
        case 'DELETE': return `(input, auth, contract) => elastic.del("${index}", contract, auth, input.id)`;
    }
};
exports.default = exports.elasticCodeGen;
//# sourceMappingURL=elastic.js.map