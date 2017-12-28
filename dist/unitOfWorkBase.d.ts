/// <reference types="sequelize" />
import * as Sequelize from 'sequelize';
import { IChangeObject } from './IChangeObject';
import { RepositoryBase } from './repositoryBase';
export declare abstract class UnitOfWorkBase {
    beforeSaveChange: (addedEntities: IChangeObject[], updatedEntities: IChangeObject[], removedEntities: IChangeObject[]) => void;
    afterSaveChange: () => void;
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
    private transactionExecute();
    private executeBeforeSaveChange();
    private executeAfterSaveChange();
    saveChange(): Promise<void>;
}
