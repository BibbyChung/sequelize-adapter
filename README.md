# sequelize-adapter [![Build Status](https://travis-ci.org/BibbyChung/sequelize-adapter.svg?branch=master)](https://travis-ci.org/BibbyChung/sequelize-adapter) [![npm](https://img.shields.io/npm/v/sequelize-adapter.svg?maxAge=2592000)]()

Use Unit Of Wrok pattern to wrap sequelize up and make sequelize easy to use.

## Install

Install the components

```shell
$ npm install sequelize-adapter sequelize --save
```

## Features
- implement the unit of work pattern

## Quick Start

You can use TypeScirpt or JavaScript. Up to you.

### TypeScript

create your unitofwork class

```javascript

// myUnitOfWork.ts
import * as Sequelize from 'Sequelize';
import { UnitOfWorkBase } from '../src/unitOfWorkBase';
import { RepositoryBase } from '../src/repositoryBase';
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


// userRepository.ts
import * as Sequelize from 'Sequelize';

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

  get schema(): Sequelize.DefineAttributes {
    return {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      birthday: {
        type: Sequelize.DATE,
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
  brithday: Date;
}

```
Examples for CRUD

```javascript

// ==== connect DB =====
const mydb = new MyUnitOfWork();
await mydb.connectDb();

// ==== create data =====
const mydb = new MyUnitOfWork();
mydb.reps.user.add({
  id: uuid4(),
  name: `Bibby`,
  age: 21,
  birthday: new Date(),
});
await mydb.saveChange();

//==== update data ====
const myDb = new UnitOfWork();
const uOne = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>({ where: {id: 'xxxxx'} });
uOne.name = 'Bibby_0';
uOne.age = 28;
uOne.brithday = new Date('2011-10-10');
mydb.reps.user.update(uOne);
await mydb.saveChange();

//==== delete data ====
const myDb = new UnitOfWork();
const data = await mydb.reps.user.getAll<IUserEntity, IUserEntity>({ where: {id: 'xxxxx'} });
for (const item of data) {
  mydb.reps.user.remove(item);
}
await mydb.saveChange();


//==== get data ====
const myDb = new UnitOfWork();
const data = await mydb.reps.user.getAll<IUserEntity, IUserEntity>({ where: {id: 'xxxxx'} });
const data1 = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>({ where: {id: 'xxxxx'} });

```

### JavaScript 
(later...)

## todo list
(thinking...)

## References
- http://docs.sequelizejs.com/



