import * as Sequelize from 'sequelize';

import { IChangeObject } from '../src/IChangeObject';
import { UnitOfWorkBase } from '../src/unitOfWorkBase';
import { UserRepository } from './userRepository';

export class MyUnitOfWork extends UnitOfWorkBase {

  private static _db: Sequelize.Sequelize;
  get db(): Sequelize.Sequelize {
    if (!MyUnitOfWork._db) {
      this.connectDb();
    }
    return MyUnitOfWork._db;
  }
  set db(value: Sequelize.Sequelize) {
    MyUnitOfWork._db = value;
  }

  beforeSaveChange(addedEntities: IChangeObject[], updatedEntities: IChangeObject[], removedEntities: IChangeObject[]) {
    // do something...
  }
  afterSaveChange() {
    // do something...
  }

  constructor() {
    super();
    this.init();
  }

  reps = {
    user: new UserRepository(this),
  };

  private init() {
    // test in memory
    const setting = {
      host: 'localhost',
      dbName: 'test_db',
      username: 'root',
      password: '1234',
      type: 'sqlite', // 'mysql'
    };

    const options = {
      host: setting.host,
      dialect: setting.type,
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
    };

    this.db = new Sequelize(setting.dbName, setting.username, setting.password, options);
    this.__reps = this.reps;
  }

}
