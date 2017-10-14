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
