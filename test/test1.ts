import { v4 as uuid4 } from 'uuid';

import { IUserEntity } from './IUserEntity';
import { MyUnitOfWork } from './myUnitOfWork';
import { QueryTypes } from 'sequelize';
import { from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';



const fun = () => {

  const addDataSub = from(MyUnitOfWork.getInstance())
    .pipe(
      // add data
      map((dbClient) => {
        for (let i = 0; i < 5; i += 1) {
          dbClient.reps.user.add({
            id: uuid4(),
            name: `Bibby_${i}`,
            age: 21 + i,
            birthday: new Date(),
          });
        }
        return dbClient;
      }),
      switchMap((dbClient) => from(dbClient.saveChange())
        .pipe(
          map(() => dbClient)
        )
      ),
      // select where
      switchMap((dbClient) => {
        const criteria = { order: ['name'] };
        return from(dbClient.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>(criteria))
          .pipe(map((one) => ({
            one,
            dbClient,
          })))
      }),
      map(a => {
        a.one.name = 'Bibby_999999999999999';
        const uOne: any = a.one;
        console.log(uOne._previousDataValues);
        console.log(uOne.dataValues);
        console.log(uOne.constructor.options.name.plural);
        return a.dbClient;
      }),
      switchMap((dbClient) => {
        const q = `
          select *
          from users u
          where u.age = :age
        `;
        return from(dbClient.query(q, {
          replacements: {
            age: 22
          },
          type: QueryTypes.SELECT
        }));
      }),
      tap(console.log)
    ).subscribe(() => addDataSub.unsubscribe());

  // const criteria = { order: ['name'] };
  // const uOne: any = await dbClient.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>(criteria);
  // uOne.name = 'Bibby_999999999999999';
  // console.log(uOne._previousDataValues);
  // console.log(uOne.dataValues);
  // console.log(uOne.constructor.options.name.plural);
  // console.log('-----');

  // const q = `
  //   select *
  //   from users u
  //   where u.age = :age
  // `;
  // const data: IUserEntity = await dbClient.query(q, {
  //   replacements: {
  //     age: 22
  //   },
  //   type: QueryTypes.SELECT
  // });
  // console.log(data);
  // console.log('-----');
};

fun();
