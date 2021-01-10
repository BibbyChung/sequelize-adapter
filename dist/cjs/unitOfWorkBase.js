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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitOfWorkBase = void 0;
const debug_1 = __importDefault(require("debug"));
const util_1 = require("./util");
const myDebug = debug_1.default('sequelize-adapter');
myDebug.enabled = false;
class UnitOfWorkBase {
    constructor() {
        this.retryingOption = {
            count: 3,
            watingMillisecond: 1000
        };
        this.addedArr = [];
        this.deletedArr = [];
        this.updatedArr = [];
        this.__reps = {};
    }
    __add(rep, entity) {
        this.addedArr.push({ rep, entity });
    }
    __delete(rep, entity) {
        this.deletedArr.push(entity);
    }
    __update(rep, entity) {
        this.updatedArr.push(entity);
    }
    syncModels() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const item in this.__reps) {
                    const rep = this.__reps[item];
                    yield rep.syncModel();
                }
                myDebug('sync models successfully.');
            }
            catch (err) {
                throw err;
            }
        });
    }
    query(sql, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.query(sql, options);
        });
    }
    transactionExecute() {
        return __awaiter(this, void 0, void 0, function* () {
            const t = yield this.db.transaction({ autocommit: false });
            try {
                yield Promise.all([
                    ...this.addedArr.map(item => item.rep.model.create(item.entity, { transaction: t })),
                    ...this.updatedArr.map(item => item.save({ transaction: t })),
                    ...this.deletedArr.map(item => item.destroy({ transaction: t }))
                ]);
                yield t.commit();
                this.addedArr = [];
                this.updatedArr = [];
                this.deletedArr = [];
            }
            catch (err) {
                yield t.rollback();
                throw err;
            }
        });
    }
    executeBeforeSaveChange() {
        return __awaiter(this, void 0, void 0, function* () {
            const addedEntities = this.addedArr.map(a => {
                const one = a.entity;
                return {
                    tableName: a.rep.tableName,
                    before: null,
                    after: one,
                };
            });
            const updatedEntities = this.updatedArr.map(a => {
                const one = a;
                return {
                    tableName: one.constructor.options.name.plural,
                    before: one._previousDataValues,
                    after: one.dataValues,
                };
            });
            const deletedEntities = this.deletedArr.map(a => {
                const one = a;
                return {
                    tableName: one.constructor.options.name.plural,
                    before: one,
                    after: null,
                };
            });
            yield this.beforeSaveChange(addedEntities, updatedEntities, deletedEntities);
        });
    }
    executeAfterSaveChange() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.afterSaveChange();
        });
    }
    saveChange() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.executeBeforeSaveChange();
            yield util_1.retryFunc(this.retryingOption.count, this.retryingOption.watingMillisecond, (currentCount) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.transactionExecute();
                    return true;
                }
                catch (err) {
                    if (currentCount >= this.retryingOption.count) {
                        throw err;
                    }
                    return false;
                }
            }));
            yield this.executeAfterSaveChange();
        });
    }
}
exports.UnitOfWorkBase = UnitOfWorkBase;
//# sourceMappingURL=unitOfWorkBase.js.map