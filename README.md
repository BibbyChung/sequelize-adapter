# sequelize-adapter [![Build Status](https://travis-ci.org/BibbyChung/sequelize-adapter.svg?branch=master)](https://travis-ci.org/BibbyChung/sequelize-adapter) [![npm](https://img.shields.io/npm/v/sequelize-adapter.svg)](https://github.com/BibbyChung/sequelize-adapter)

Use Unit Of Wrok pattern to wrap sequelize up and make sequelize easy to use.

## Requirement

- sequelize-adapter@2.x.x. only support Node 10 or above.
- if your node environment is old, please choose sequelize-adapter@1.x.x..

## Install

Install the components

```shell

npm install sequelize-adapter sequelize --save

```

## Features

- use the singleton pattern to design
- use the unit of work pattern to wrap sequelize
- use trasation feature to create, update, delete by default
- support retrying feature
- support ES2015 module

## Quick Start

You can use TypeScirpt or JavaScript. Up to you.

### TypeScript

create your classes what you need.

```javascript

// myUnitOfWork.ts
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

// userRepository.ts
import { DataTypes, ModelAttributes } from 'sequelize';
import { RepositoryBase } from '../src/repositoryBase';
import { UnitOfWorkBase } from '../src/unitOfWorkBase';
import { IUserEntity } from './IUserEntity';

export class UserRepository extends RepositoryBase<IUserEntity> {

  get tableName(): string {
    return 'users';
  }

  constructor(unitOfWork: UnitOfWorkBase) {
    super(unitOfWork);
  }

  get schema(): ModelAttributes {
    return {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      birthday: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    };
  }

}

// IUserEntity.ts
export interface IUserEntity {
  id: string;
  name: string;
  age: number;
  birthday: Date;
}

```

CRUD Examples

```javascript

// ==== connect DB =====
const mydb = await MyUnitOfWork.getInstance();

// ==== create data =====
const mydb = new MyUnitOfWork();
mydb.reps.user.add({
  id: uuid4(),
  name: `Bibby`,
  age: 21,
  birthday: new Date(),
});
await mydb.saveChange();

// ==== update data ====
const myDb = new UnitOfWork();
const uOne = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>({ where: {id: 'xxxxx'} });
uOne.name = 'Bibby_0';
uOne.age = 28;
uOne.brithday = new Date('2011-10-10');
mydb.reps.user.update(uOne);
await mydb.saveChange();

// ==== delete data ====
const myDb = new UnitOfWork();
const data = await mydb.reps.user.getAll<IUserEntity, IUserEntity>({ where: {id: 'xxxxx'} });
for (const item of data) {
  mydb.reps.user.delete(item);
}
await mydb.saveChange();


// ==== get data ====
const myDb = new UnitOfWork();
const data = await mydb.reps.user.getAll<IUserEntity, IUserEntity>({ where: {id: 'xxxxx'} });
const data1 = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>({ where: {id: 'xxxxx'} });

// ==== get data by sql statement ====
const q = `
  select *
  from users u
  where u.age = :age
`;
const data: IUserEntity = await mydb.query(q, {
  replacements: {
    age: 22
  },
  type: QueryTypes.SELECT
});

```

### Project Up

```shell

docker run -it --rm -v $(PWD):/app -w /app node:12.18-alpine sh

```

or

```shell

make workspace-up

```

## References

- http://docs.sequelizejs.com/
