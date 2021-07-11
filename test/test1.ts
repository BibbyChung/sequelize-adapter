import { v4 as uuid4 } from 'uuid';

import { IUserEntity } from './IUserEntity';
import { MyUnitOfWork } from './myUnitOfWork';
import { QueryTypes } from 'sequelize';
import { from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';



const fun = () => {

  const addDataSub = from(MyUnitOfWork.getInstance())
    .pipe(
      switchMap((mydb) => from(mydb.syncModels()).pipe(map(() => mydb))),
      // add data
      map((mydb) => {
        for (let i = 0; i < 5; i += 1) {
          mydb.reps.user.add({
            id: uuid4(),
            name: `Bibby_${i}`,
            age: 21 + i,
            birthday: new Date(),
          });
        }
        return mydb;
      }),
      switchMap((mydb) => from(mydb.saveChange())
        .pipe(
          map(() => mydb)
        )
      ),
      // select where
      switchMap((mydb) => {
        const criteria = { order: ['name'] };
        return from(mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>(criteria))
          .pipe(map((one) => ({
            one,
            mydb,
          })))
      }),
      map(a => {
        a.one.name = 'Bibby_999999999999999';
        const uOne: any = a.one;
        console.log(uOne._previousDataValues);
        console.log(uOne.dataValues);
        console.log(uOne.constructor.options.name.plural);
        return a.mydb;
      }),
      switchMap((mydb) => {
        const q = `
          select *
          from users u
          where u.age = :age
        `;
        return from(mydb.query(q, {
          replacements: {
            age: 22
          },
          type: QueryTypes.SELECT
        }));
      }),
      tap(console.log)
    ).subscribe(() => addDataSub.unsubscribe());

  // const criteria = { order: ['name'] };
  // const uOne: any = await mydb.reps.user.getFirstOrDefault<IUserEntity, IUserEntity>(criteria);
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
  // const data: IUserEntity = await mydb.query(q, {
  //   replacements: {
  //     age: 22
  //   },
  //   type: QueryTypes.SELECT
  // });
  // console.log(data);
  // console.log('-----');
};

fun();
