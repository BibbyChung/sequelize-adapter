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
