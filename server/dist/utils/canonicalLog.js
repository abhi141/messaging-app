"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCanonical = void 0;
const logCanonical = (log, fields) => {
    const level = fields.status === 'error' ? 'error' : 'info';
    log[level](fields.event, fields);
};
exports.logCanonical = logCanonical;
