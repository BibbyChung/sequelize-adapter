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
exports.retryFunc = void 0;
const sleep = (ms) => new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, ms);
});
const retryFunc = (count, waitingMillisecond, func, currentCount = 1) => __awaiter(void 0, void 0, void 0, function* () {
    const residue = count - currentCount;
    if (residue < 0) {
        return;
    }
    const bo = yield func(currentCount);
    if (bo) {
        return;
    }
    yield sleep(waitingMillisecond);
    yield exports.retryFunc(count, waitingMillisecond, func, currentCount + 1);
});
exports.retryFunc = retryFunc;
//# sourceMappingURL=util.js.map