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
exports.RepositoryBase = void 0;
class RepositoryBase {
    constructor(unitOfWork) {
        this.unitOfWork = unitOfWork;
    }
    get model() {
        const obj = this.unitOfWork.db.define(this.tableName, this.schema, this.tableOption);
        return obj;
    }
    get tableOption() {
        return {
            timestamps: false,
            paranoid: true,
            underscored: false,
            freezeTableName: true,
        };
    }
    syncModel() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.sync();
        });
    }
    add(entity) {
        this.unitOfWork.__add(this, entity);
    }
    delete(entity) {
        this.unitOfWork.__delete(this, entity);
    }
    update(entity) {
        this.unitOfWork.__update(this, entity);
    }
    getCount(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const nu = yield this.model.count(options);
            return nu;
        });
    }
    getAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.model.findAll(options);
            return data;
        });
    }
    getFirstOrDefault(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const one = yield this.model.findOne(options);
            return one;
        });
    }
}
exports.RepositoryBase = RepositoryBase;
//# sourceMappingURL=repositoryBase.js.map