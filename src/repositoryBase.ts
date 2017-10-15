import * as Sequelize from 'sequelize';
import { UnitOfWorkBase } from './unitOfWorkBase';

export abstract class RepositoryBase<T> {

  abstract get tableName(): string;

  abstract get schema(): Sequelize.DefineAttributes;

  get model() {
    return this.unitOfWork.db.define(this.tableName, this.schema, this.tableOption);
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

  add<T>(entity: T) {
    this.unitOfWork.__add(this, entity);
  }

  remove<T>(entity: T) {
    this.unitOfWork.__remove(this, entity);
  }

  update<T>(entity: T) {
    this.unitOfWork.__update(this, entity);
  }

  getCount<TNew, TCustomAttributes>(options?: Sequelize.CountOptions) {
    return this.model.count(options) as any as Promise<number>;
  }

  getAll<TNew, TCustomAttributes>(options?: Sequelize.FindOptions<T & TCustomAttributes>) {
    return this.model.findAll(options) as any as Promise<TNew[]>;
  }

  async getFirstOrDefault<TNew, TCustomAttributes>(options?: Sequelize.FindOptions<T & TCustomAttributes>) {
    const data = await this.getAll<TNew, TCustomAttributes>(options);
    return data[0];
  }

}

