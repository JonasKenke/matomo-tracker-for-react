"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatomoContext = exports.useMatomo = exports.MatomoProvider = exports.MatomoNextRouterTracker = exports.useMatomoNextRouter = void 0;
// Next.js integration (requires next)
var useMatomoNextRouter_1 = require("./useMatomoNextRouter");
Object.defineProperty(exports, "useMatomoNextRouter", { enumerable: true, get: function () { return useMatomoNextRouter_1.useMatomoNextRouter; } });
Object.defineProperty(exports, "MatomoNextRouterTracker", { enumerable: true, get: function () { return useMatomoNextRouter_1.MatomoNextRouterTracker; } });
// Re-export core functionality for convenience
var MatomoProvider_1 = require("./MatomoProvider");
Object.defineProperty(exports, "MatomoProvider", { enumerable: true, get: function () { return __importDefault(MatomoProvider_1).default; } });
var useMatomo_1 = require("./useMatomo");
Object.defineProperty(exports, "useMatomo", { enumerable: true, get: function () { return __importDefault(useMatomo_1).default; } });
var MatomoContext_1 = require("./MatomoContext");
Object.defineProperty(exports, "MatomoContext", { enumerable: true, get: function () { return __importDefault(MatomoContext_1).default; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=nextjs.js.map