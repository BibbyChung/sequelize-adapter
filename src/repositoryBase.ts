import { CountOptions, FindOptions, ModelAttributes } from 'sequelize';
import { UnitOfWorkBase } from './unitOfWorkBase';

export abstract class RepositoryBase<T> {

  abstract get tableName(): string;

  abstract get schema(): ModelAttributes;

  get model() {
    const obj = this.unitOfWork.db.define(this.tableName, this.schema, this.tableOption);
    return obj;
  }

  private get tableOption() {
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

  constructor(public unitOfWork: UnitOfWorkBase) { }

  async syncModel() {
    await this.model.sync();
  }

  add(entity: T) {
    this.unitOfWork.__add<T>(this, entity);
  }

  delete(entity: T) {
    this.unitOfWork.__delete<T>(this, entity);
  }

  update(entity: T) {
    this.unitOfWork.__update<T>(this, entity);
  }

  async getCount(options?: CountOptions) {
    const nu = await this.model.count(options);
    return nu;
  }

  async getAll<TNew, TCustomAttributes>(options?: FindOptions) {
    const data: any = await this.model.findAll(options);
    return data as TCustomAttributes[];
  }

  async getFirstOrDefault<TNew, TCustomAttributes>(options?: FindOptions) {
    const one: any = await this.model.findOne(options);
    return one as TCustomAttributes;
  }

}
