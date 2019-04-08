import { Sequelize } from 'sequelize';
import { IChangeObject } from '../src/IChangeObject';
import { UnitOfWorkBase } from '../src/unitOfWorkBase';
import { UserRepository } from './userRepository';

export class MyUnitOfWork extends UnitOfWorkBase {

  private static _db: Sequelize;
  get db(): Sequelize {
    if (!MyUnitOfWork._db) {
      this.connectDb();
    }
    return MyUnitOfWork._db;
  }
  set db(value: Sequelize) {
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

    this.db = new Sequelize(setting.dbName, setting.username, setting.password, {
      dialect: 'sqlite',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
    this.__reps = this.reps;
  }

}
