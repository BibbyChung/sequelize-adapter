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
exports.Utils = void 0;
class Utils {
    static retryFunc(count, waitingMillisecond, func, currentCount = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const residue = count - currentCount;
            if (residue < 0) {
                return;
            }
            const bo = yield func(currentCount);
            if (bo) {
                return;
            }
            yield Utils.sleep(waitingMillisecond);
            yield Utils.retryFunc(count, waitingMillisecond, func, currentCount + 1);
        });
    }
    static sleep(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, ms);
            });
        });
    }
}
exports.Utils = Utils;
//# sourceMappingURL=util.js.map