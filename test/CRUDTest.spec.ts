import { assert } from 'chai';
import * as sinon from 'sinon';
import * as uuid4 from 'uuid/v4';

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

  it('add items and update items and delete items in database', async () => {

    const criteria = { order: ['name'] }
    
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

    //update items
    const uOne = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>(criteria);
    uOne.name = 'BBB';
    uOne.age = 33;
    uOne.brithday = new Date('2011-10-10');
    mydb.reps.user.update(uOne);
    await mydb.saveChange();

    const expectedUone = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>(criteria);

    assert.equal('BBB', expectedUone.name);
    assert.equal(33, expectedUone.age);

    //delete items
    const data = await mydb.reps.user.getAll<IUserEntity, IUserEntity>();
    for (const item of data) {
      mydb.reps.user.remove(item);
    }
    await mydb.saveChange();

    const expectedD = await mydb.reps.user.getAll<IUserEntity, IUserEntity>();
    assert.equal(0, expectedD.length);

  });

});

