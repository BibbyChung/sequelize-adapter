import { v4 as uuid4 } from 'uuid';

import { IUserEntity } from './IUserEntity';
import { MyUnitOfWork } from './myUnitOfWork';
import { QueryTypes } from 'sequelize';

const fun = async () => {
  const mydb = await MyUnitOfWork.getInstance();

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
  console.log(uOne.constructor.options.name.plural);
  console.log('-----');

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
  console.log(data);
  console.log('-----');
};

fun();
