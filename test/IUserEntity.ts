import { IEntityBase } from './../src/IEntityBase';

export interface IUserEntity extends IEntityBase {
  name: string;
  age: number;
  brithday: Date;
}
