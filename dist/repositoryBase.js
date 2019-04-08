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
            // don't add the timestamp attributes (updatedAt, createdAt)
            timestamps: false,
            // don't delete database entries but set the newly added attribute deletedAt
            // to the current date (when deletion was done). paranoid will only work if
            // timestamps are enabled
            paranoid: true,
            // don't use camelcase for automatically added attributes but underscore style
            // so updatedAt will be updated_at
            underscored: false,
            // disable the modification of tablenames; By default, sequelize will automatically
            // transform all passed model names (first parameter of define) into plural.
            // if you don't want that, set the following
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
    remove(entity) {
        this.unitOfWork.__remove(this, entity);
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
