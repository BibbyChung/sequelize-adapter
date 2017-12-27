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
const _ = require("lodash");
class UnitOfWorkBase {
    constructor() {
        // constructor(public db: Sequelize.Sequelize) { }
        this.addedArr = [];
        this.removedArr = [];
        this.updatedArr = [];
        this.__reps = {};
        // async close() {
        //   if (this.isInMemory)
        //     await mockgoose.helper.reset();
        //   await new Promise<void>((resolve, reject) => {
        //     mongoose.disconnect((err) => {
        //       if (err) {
        //         reject(err);
        //         return;
        //       }
        //       resolve();
        //     });
        //   });
        // }
        // async reset() {
        //   if (!this.isInMemory)
        //     throw new Error('please set the property "isInMemory" to true');
        //   await mockgoose.helper.reset();
        // }
    }
    __add(rep, entity) {
        this.addedArr.push({ rep, entity });
    }
    __remove(rep, entity) {
        this.removedArr.push(entity);
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
        return this.db.transaction().then((t) => {
            const pArr = [];
            for (const item of this.addedArr) {
                pArr.push(item.rep.model.create(item.entity, { transaction: t }));
            }
            this.addedArr = [];
            for (const item of this.updatedArr) {
                pArr.push(item.save({ transaction: t }));
            }
            this.updatedArr = [];
            for (const item of this.removedArr) {
                pArr.push(item.destroy({ transaction: t }));
            }
            this.removedArr = [];
            return Promise.all(pArr)
                .then(() => t.commit())
                .catch(err => {
                t.rollback();
                throw err;
            });
        });
    }
    saveChange() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.beforeSaveChange) {
                const addedEntities = _.chain(this.addedArr).map(a => {
                    const one = a.entity;
                    return {
                        tableName: a.rep.tableName,
                        before: null,
                        after: one,
                    };
                }).value();
                const updatedEntities = _.chain(this.updatedArr).map(a => {
                    const one = a;
                    return {
                        tableName: a._modelOptions.name.plural,
                        before: one._previousDataValues,
                        after: one.dataValues,
                    };
                }).value();
                const removedEntities = _.chain(this.removedArr).map(a => {
                    const one = a;
                    return {
                        tableName: a._modelOptions.name.plural,
                        before: one,
                        after: null,
                    };
                }).value();
                yield this.beforeSaveChange(addedEntities, updatedEntities, removedEntities);
            }
            yield this.transactionExecute();
            if (this.afterSaveChange) {
                yield this.afterSaveChange();
            }
        });
    }
}
exports.UnitOfWorkBase = UnitOfWorkBase;

//# sourceMappingURL=unitOfWorkBase.js.map
