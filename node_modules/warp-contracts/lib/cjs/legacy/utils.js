"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayToHex = exports.getTag = void 0;
function getTag(tx, name) {
    const tags = tx.get('tags');
    for (const tag of tags) {
        // decoding tags can throw on invalid utf8 data.
        try {
            if (tag.get('name', { decode: true, string: true }) === name) {
                return tag.get('value', { decode: true, string: true });
            }
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    }
    return false;
}
exports.getTag = getTag;
function arrayToHex(arr) {
    let str = '';
    for (const a of arr) {
        str += ('0' + a.toString(16)).slice(-2);
    }
    return str;
}
exports.arrayToHex = arrayToHex;
//# sourceMappingURL=utils.js.map