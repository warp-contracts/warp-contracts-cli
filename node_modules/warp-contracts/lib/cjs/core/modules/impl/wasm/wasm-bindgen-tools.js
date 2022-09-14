"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchMutClosureDtor = void 0;
function matchMutClosureDtor(source) {
    const regexp = /var ret = makeMutClosure\(arg0, arg1, (\d+?), __wbg_adapter/;
    const match = source.match(regexp);
    return match[1];
}
exports.matchMutClosureDtor = matchMutClosureDtor;
//# sourceMappingURL=wasm-bindgen-tools.js.map