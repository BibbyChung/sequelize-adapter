import { QueryOptionsWithType, QueryTypes, Sequelize } from 'sequelize';
import { IChangeObject } from './IChangeObject';
import { RepositoryBase } from './repositoryBase';

export abstract class UnitOfWorkBase {

  abstract get db(): Sequelize;
  abstract set db(value: Sequelize);

  abstract beforeSaveChange(
    addedEntities: IChangeObject[],
    updatedEntities: IChangeObject[],
    deletedEntities: IChangeObject[],
  ): void;
  abstract afterSaveChange(): void;

  private addedArr: { rep: RepositoryBase<any>, entity: any }[] = [];
  private deletedArr: any[] = [];
  private updatedArr: any[] = [];

  __reps = {};

  __add<T>(rep: RepositoryBase<T>, entity: T) {
    this.addedArr.push({ rep, entity });
  }

  __delete<T>(rep: RepositoryBase<T>, entity: T) {
    this.deletedArr.push(entity);
  }

  __update<T>(rep: RepositoryBase<T>, entity: T) {
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

  async query(
    sql: string | { query: string; values: unknown[] },
    options: QueryOptionsWithType<
      QueryTypes.UPDATE |
      QueryTypes.BULKUPDATE |
      QueryTypes.INSERT |
      QueryTypes.UPSERT |
      QueryTypes.DELETE |
      QueryTypes.BULKDELETE |
      QueryTypes.SHOWTABLES |
      QueryTypes.DESCRIBE |
      QueryTypes.SELECT
    >): Promise<any> {
    return await this.db.query(sql, options);
  }

  private transactionExecute() {
    return this.db.transaction({ autocommit: false }).then(t => {
      const pArr = [];

      for (const item of this.addedArr) {
        const opt: any = { transaction: t };
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

  private async executeBeforeSaveChange() {
    const addedEntities = this.addedArr.map(a => {
      const one: any = a.entity;
      return {
        tableName: a.rep.tableName,
        before: null,
        after: one,
      };
    });
    const updatedEntities = this.updatedArr.map(a => {
      const one: any = a;
      return {
        tableName: a._modelOptions.name.plural,
        before: one._previousDataValues,
        after: one.dataValues,
      };
    });
    const deletedEntities = this.deletedArr.map(a => {
      const one: any = a;
      return {
        tableName: a._modelOptions.name.plural,
        before: one,
        after: null,
      };
    });
    await this.beforeSaveChange(addedEntities, updatedEntities, deletedEntities);
  }

  private async executeAfterSaveChange() {
    await this.afterSaveChange();
  }

  async saveChange() {

    await this.executeBeforeSaveChange();
    await this.transactionExecute();
    await this.executeAfterSaveChange();

  }

}
