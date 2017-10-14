import * as Sequelize from 'Sequelize';

import { UnitOfWorkBase } from '../src/unitOfWorkBase';
import { RepositoryBase } from '../src/repositoryBase';
import { UserRepository } from './userRepository';
import { IUserEntity } from './IUserEntity';

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

  constructor() {
    super();
    this.init();
  }

  reps = {
    user: new UserRepository(this),
  };

  private init() {
    const setting = {
      host: 'localhost',
      dbName: 'todolistDb',
      username: 'root',
      password: '1234',
      type: 'mysql',
    };

    const mysqlOptions = {
      host: setting.host,
      dialect: setting.type,
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
    };

    this.db = new Sequelize(setting.dbName, setting.username, setting.password, mysqlOptions);
    this.__reps = this.reps;
  }

}
