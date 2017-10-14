/// <reference types="sequelize" />
import { RepositoryBase } from './repositoryBase';
import * as Sequelize from 'Sequelize';
export declare abstract class UnitOfWorkBase {
    private addedArr;
    private removedArr;
    private updatedArr;
    abstract db: Sequelize.Sequelize;
    __reps: {};
    __add<T>(rep: RepositoryBase<any>, entity: T): void;
    __remove<T>(rep: RepositoryBase<any>, entity: T): void;
    __update<T>(rep: RepositoryBase<any>, entity: T): void;
    connectDb(): Promise<void>;
    close(): Promise<void>;
    saveChange(): Promise<void>;
}
