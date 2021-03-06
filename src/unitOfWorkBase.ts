import debug from 'debug';
import { QueryOptionsWithType, QueryTypes, Sequelize } from 'sequelize';
import { IChangeObject } from './IChangeObject';
import { RepositoryBase } from './repositoryBase';
import { retryFunc } from './util';

const myDebug = debug('sequelize-adapter');
myDebug.enabled = false;

export abstract class UnitOfWorkBase {

  protected retryingOption = {
    count: 3,
    watingMillisecond: 1000
  }

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

  async syncModels() {
    try {
      for (const item in this.__reps) {
        const rep = this.__reps[item] as RepositoryBase<any>;
        await rep.syncModel();
      }
      myDebug('sync models successfully.');
    } catch (err) {
      throw err;
    }
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

  private async transactionExecute() {
    const t = await this.db.transaction({ autocommit: false });
    try {
      await Promise.all([
        ...this.addedArr.map(item => item.rep.model.create(item.entity, { transaction: t })),
        ...this.updatedArr.map(item => item.save({ transaction: t })),
        ...this.deletedArr.map(item => item.destroy({ transaction: t }))
      ]);
      await t.commit();

      this.addedArr = [];
      this.updatedArr = [];
      this.deletedArr = [];
    } catch (err) {
      await t.rollback();
      throw err;
    }
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
        tableName: one.constructor.options.name.plural,
        before: one._previousDataValues,
        after: one.dataValues,
      };
    });
    const deletedEntities = this.deletedArr.map(a => {
      const one: any = a;
      return {
        tableName: one.constructor.options.name.plural,
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
    await retryFunc(
      this.retryingOption.count,
      this.retryingOption.watingMillisecond,
      async (currentCount) => {
        try {
          await this.transactionExecute();
          return true;
        } catch (err) {
          if (currentCount >= this.retryingOption.count) {
            throw err;
          }
          return false;
        }
      })
    await this.executeAfterSaveChange();
  }

}
