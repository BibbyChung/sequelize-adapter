"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class UnitOfWorkBase {
    constructor() {
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
    connectDb() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db) {
                throw Error('please set up the connection information.');
            }
            try {
                yield this.db.authenticate();
                for (const item in this.__reps) {
                    const rep = this.__reps[item];
                    yield rep.syncModel();
                }
                console.log('connect db', 'Connection has been established successfully.');
            }
            catch (err) {
                throw err;
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db.close();
        });
    }
    transactionExecute() {
        return this.db.transaction({ autocommit: false }).then(t => {
            const pArr = [];
            for (const item of this.addedArr) {
                const opt = { transaction: t };
                pArr.push(item.rep.model.create(item.entity, opt));
            }
            this.addedArr = [];
            for (const item of this.updatedArr) {
                pArr.push(item.save({ transaction: t }));
            }
            this.updatedArr = [];
            for (const item of this.deletedArr) {
                pArr.push(item.destroy({ transaction: t }));
            }
            this.deletedArr = [];
            return Promise.all(pArr)
                .then(() => t.commit())
                .catch(err => {
                t.rollback();
                throw err;
            });
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
                    tableName: a._modelOptions.name.plural,
                    before: one._previousDataValues,
                    after: one.dataValues,
                };
            });
            const deletedEntities = this.deletedArr.map(a => {
                const one = a;
                return {
                    tableName: a._modelOptions.name.plural,
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
            yield this.transactionExecute();
            yield this.executeAfterSaveChange();
        });
    }
}
exports.UnitOfWorkBase = UnitOfWorkBase;

//# sourceMappingURL=unitOfWorkBase.js.map
