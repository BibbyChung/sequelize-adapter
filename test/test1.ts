import * as uuid4 from 'uuid/v4';

import { IUserEntity } from './IUserEntity';
import { MyUnitOfWork } from './myUnitOfWork';

const fun = async () => {
  const mydb = new MyUnitOfWork();
  await mydb.connectDb();

  for (let i = 0; i < 5; i += 1) {
    mydb.reps.user.add({
      id: uuid4(),
      name: `Bibby_${i}`,
      age: 21 + i,
      birthday: new Date(),
    });
  }
  await mydb.saveChange();

  const criteria = { order: ['name'] };
  const uOne: any = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>(criteria);
  uOne.name = 'Bibby_999999999999999';
  console.log(uOne._previousDataValues);
  console.log(uOne.dataValues);
  console.log(uOne._modelOptions.name.plural);
  console.log('-----');
};

fun();
