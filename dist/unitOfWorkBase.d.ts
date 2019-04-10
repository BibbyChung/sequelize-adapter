import { Sequelize } from 'sequelize';
import { IChangeObject } from './IChangeObject';
import { RepositoryBase } from './repositoryBase';
export declare abstract class UnitOfWorkBase {
    abstract db: Sequelize;
    abstract beforeSaveChange(addedEntities: IChangeObject[], updatedEntities: IChangeObject[], deletedEntities: IChangeObject[]): void;
    abstract afterSaveChange(): void;
    private addedArr;
    private deletedArr;
    private updatedArr;
    __reps: {};
    __add<T>(rep: RepositoryBase<T>, entity: T): void;
    __delete<T>(rep: RepositoryBase<T>, entity: T): void;
    __update<T>(rep: RepositoryBase<T>, entity: T): void;
    connectDb(): Promise<void>;
    close(): Promise<void>;
    private transactionExecute;
    private executeBeforeSaveChange;
    private executeAfterSaveChange;
    saveChange(): Promise<void>;
}
