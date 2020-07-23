import { assert } from 'chai';
import sinon from 'sinon';
import { v4 as uuid4 } from 'uuid';

import { QueryTypes } from 'sequelize';
import { MyUnitOfWork } from './myUnitOfWork';
import { IUserEntity } from './IUserEntity';

describe('prepare the database to test', () => {

  let mydb: MyUnitOfWork;
  let sandbox: sinon.SinonSandbox;

  before(() => {
    // runs before all tests in this block
  });

  after(() => {
    // runs after all tests in this block
  });

  beforeEach(async function () {
    // runs before each test in this block
    this.timeout(60 * 1000 * 10);

    mydb = new MyUnitOfWork();
    await mydb.connectDb();

    sandbox = sinon.sandbox.create();
  });

  afterEach(async () => {
    mydb.close();
    sandbox.restore();
  });

  it('test the hooks before writing to database', async () => {

    // add items
    for (let i = 0; i < 5; i += 1) {
      mydb.reps.user.add({
        id: uuid4(),
        name: `Bibby_${i}`,
        age: 21 + i,
        birthday: new Date(),
      });
    }
    await mydb.saveChange();

    // add
    mydb.reps.user.add({
      id: uuid4(),
      name: 'Bibby_',
      age: 21,
      birthday: new Date(),
    });

    // update
    const one = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>({ where: { age: 21 } });
    one.age = 99;
    one.name = 'xxxx';
    mydb.reps.user.update(one);

    // delete
    const two = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>({ where: { age: 22 } });
    mydb.reps.user.delete(two);

    mydb.beforeSaveChange = async (addedObjs, updatedObs, deletedObjs) => {
      // add
      for (const item of addedObjs) {
        assert.equal(item.tableName, 'users');
        assert.equal(item.before, null);
        const user = item.after as IUserEntity;
        assert.equal(user.name, 'Bibby_');
        assert.equal(user.age, 21);
      }
      // update
      for (const item of updatedObs) {
        const before = item.before as IUserEntity;
        const after = item.after as IUserEntity;
        assert.equal(item.tableName, 'users');
        assert.equal(before.age, 21);
        assert.equal(before.name, 'Bibby_0');
        assert.equal(after.age, 99);
        assert.equal(after.name, 'xxxx');
      }

      // delete
      for (const item of deletedObjs) {
        const user = item.before as IUserEntity;
        assert.equal(item.tableName, 'users');
        assert.equal(user.name, 'Bibby_1');
        assert.equal(user.age, 22);
        assert.equal(item.after, null);
      }
    };
    await mydb.saveChange();
  });

  it('test the hooks after writing to database', async () => {
    mydb.reps.user.add({
      id: uuid4(),
      name: 'Bibby_',
      age: 21,
      birthday: new Date(),
    });

    const stubBeforeSaveChange = sandbox.stub(mydb, 'beforeSaveChange');
    const stubAfterSaveChange = sandbox.stub(MyUnitOfWork.prototype, 'afterSaveChange');
    await mydb.saveChange();

    assert.equal(1, stubBeforeSaveChange.callCount);
    assert.equal(1, stubAfterSaveChange.callCount);
  });

  it('add items, update items and delete items in database', async () => {

    const criteria = { order: ['name'] };

    // add items
    for (let i = 0; i < 5; i += 1) {
      mydb.reps.user.add({
        id: uuid4(),
        name: `Bibby_${i}`,
        age: 21 + i,
        birthday: new Date(),
      });
    }
    await mydb.saveChange();

    const expectedR = await mydb.reps.user.getAll<IUserEntity, IUserEntity>(criteria);
    const expectedROne = expectedR[4];

    assert.equal(5, expectedR.length);
    assert.equal('Bibby_4', expectedROne.name);
    assert.equal(25, expectedROne.age);

    // update items
    const uOne = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>(criteria);
    uOne.name = 'BBB';
    uOne.age = 33;
    uOne.birthday = new Date('2011-10-10');
    mydb.reps.user.update(uOne);
    await mydb.saveChange();

    const expectedUone = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>(criteria);

    assert.equal('BBB', expectedUone.name);
    assert.equal(33, expectedUone.age);

    // delete items
    const data = await mydb.reps.user.getAll<IUserEntity, IUserEntity>();
    for (const item of data) {
      mydb.reps.user.delete(item);
    }
    await mydb.saveChange();

    const expectedD = await mydb.reps.user.getAll<IUserEntity, IUserEntity>();
    assert.equal(0, expectedD.length);

  });

  it('test query method', async () => {

    // add items
    for (let i = 0; i < 5; i += 1) {
      mydb.reps.user.add({
        id: uuid4(),
        name: `Bibby_${i}`,
        age: 21 + i,
        birthday: new Date(),
      });
    }
    await mydb.saveChange();

    // query by sql statement

    const q = `
      select *
      from users u
      where u.age = :age
    `;
    const data = await mydb.query(q, {
      replacements: {
        age: 22
      },
      type: QueryTypes.SELECT
    });

    const user: IUserEntity = data[0] as IUserEntity;

    assert.equal(1, data.length);
    assert.equal('Bibby_1', user.name);
    assert.equal(22, user.age);

  });

});
