import * as _ from 'lodash';
import * as Sequelize from 'sequelize';

import { IChangeObject } from './IChangeObject';
import { RepositoryBase } from './repositoryBase';

export abstract class UnitOfWorkBase {

  // constructor(public db: Sequelize.Sequelize) { }

  beforeSaveChange: (addedEntities: IChangeObject[], updatedEntities: IChangeObject[], removedEntities: IChangeObject[]) => void;
  afterSaveChange: () => void;

  private addedArr: { rep: RepositoryBase<any>, entity: any }[] = [];
  private removedArr: any[] = [];
  private updatedArr: any[] = [];

  abstract get db(): Sequelize.Sequelize;
  abstract set db(value: Sequelize.Sequelize);

  __reps = {};

  __add<T>(rep: RepositoryBase<any>, entity: T) {
    this.addedArr.push({ rep, entity });
  }

  __remove<T>(rep: RepositoryBase<any>, entity: T) {
    this.removedArr.push(entity);
  }

  __update<T>(rep: RepositoryBase<any>, entity: T) {
    this.updatedArr.push(entity);
  }

  async connectDb() {
    if (!this.db) {
      throw Error('please set up the connection information.');
    }

    try {
      await this.db.authenticate();
      for (const item in this.__reps) {
        const rep = this.__reps[item] as RepositoryBase<any>;
        await rep.syncModel();
      }
      console.log('connect db', 'Connection has been established successfully.');
    } catch (err) {
      throw err;
    }
  }

  async close() {
    this.db.close();
  }

  private transactionExecute() {
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

  private async executeBeforeSaveChange() {
    if (this.beforeSaveChange) {
      const addedEntities = _.chain(this.addedArr).map(a => {
        const one: any = a.entity;
        return {
          tableName: a.rep.tableName,
          before: null,
          after: one,
        };
      }).value();
      const updatedEntities = _.chain(this.updatedArr).map(a => {
        const one: any = a;
        return {
          tableName: a._modelOptions.name.plural,
          before: one._previousDataValues,
          after: one.dataValues,
        };
      }).value();
      const removedEntities = _.chain(this.removedArr).map(a => {
        const one: any = a;
        return {
          tableName: a._modelOptions.name.plural,
          before: one,
          after: null,
        };
      }).value();
      await this.beforeSaveChange(addedEntities, updatedEntities, removedEntities);
    }
  }

  private async executeAfterSaveChange() {
    if (this.afterSaveChange) {
      await this.afterSaveChange();
    }
  }

  async saveChange() {

    await this.executeBeforeSaveChange();
    await this.transactionExecute();
    await this.executeAfterSaveChange();

  }



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
