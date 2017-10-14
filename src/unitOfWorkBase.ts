import { RepositoryBase } from './repositoryBase';
import * as Sequelize from 'Sequelize';

export abstract class UnitOfWorkBase {

  // constructor(public db: Sequelize.Sequelize) { }

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
      console.log('connect db', `Unable to connect to the database: ${err}`);
    }
  }

  async saveChange() {
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
        .catch((err) => {
          console.log(err);
          t.rollback();
        });
    });
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
