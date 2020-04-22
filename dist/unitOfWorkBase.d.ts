import { QueryOptionsWithType, QueryTypes, Sequelize } from 'sequelize';
import { IChangeObject } from './IChangeObject';
import { RepositoryBase } from './repositoryBase';
export declare abstract class UnitOfWorkBase {
    protected retryingOption: {
        count: number;
        watingMillisecond: number;
    };
    abstract get db(): Sequelize;
    abstract set db(value: Sequelize);
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
    query(sql: string | {
        query: string;
        values: unknown[];
    }, options: QueryOptionsWithType<QueryTypes.UPDATE | QueryTypes.BULKUPDATE | QueryTypes.INSERT | QueryTypes.UPSERT | QueryTypes.DELETE | QueryTypes.BULKDELETE | QueryTypes.SHOWTABLES | QueryTypes.DESCRIBE | QueryTypes.SELECT>): Promise<any>;
    private transactionExecute;
    private executeBeforeSaveChange;
    private executeAfterSaveChange;
    saveChange(): Promise<void>;
}
