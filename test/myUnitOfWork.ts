import { Sequelize } from 'sequelize';
import { IChangeObject } from '../src/IChangeObject';
import { UnitOfWorkBase } from '../src/unitOfWorkBase';
import { UserRepository } from './userRepository';

export class MyUnitOfWork extends UnitOfWorkBase {

  private static _instance: MyUnitOfWork;
  static async getInstance() {
    if (!MyUnitOfWork._instance) {
      // setup db => test in memory
      const setting = {
        host: 'localhost',
        dbName: 'test_db',
        username: 'root',
        password: '1234',
        type: 'sqlite', // 'mysql'
      };
      const s = new Sequelize(setting.dbName, setting.username, setting.password, {
        dialect: 'sqlite',
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        logging: false,
      });
      const u = new this(s);
      await u.connectDb();
      await u.syncModels();
      MyUnitOfWork._instance = u;
    }
    return MyUnitOfWork._instance;
  }

  private constructor(public db: Sequelize) {
    super();
    this.init();
  }

  reps = {
    user: new UserRepository(this),
  };

  beforeSaveChange(addedEntities: IChangeObject[], updatedEntities: IChangeObject[], deletedEntities: IChangeObject[]) {
    // do something...
  }
  afterSaveChange() {
    // do something...
  }

  async connectDb() {
    try {
      await this.db.authenticate();
      console.log('connect db successfully.');
    } catch (err) {
      throw err;
    }
  }

  async close() {
    MyUnitOfWork._instance = null;
    await this.db.close();
  }

  private init() {
    // setup retrying setting
    this.retryingOption = {
      count: 3,
      watingMillisecond: 1000
    };

    // setup repositories
    this.__reps = this.reps;
  }

}
