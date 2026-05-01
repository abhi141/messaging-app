"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
const logger_1 = require("../config/logger");
const createLogger = (context) => logger_1.rootLogger.child(context);
exports.createLogger = createLogger;
