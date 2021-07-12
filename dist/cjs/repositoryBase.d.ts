import { CountOptions, FindOptions, ModelAttributes } from 'sequelize';
import { UnitOfWorkBase } from './unitOfWorkBase';
export declare abstract class RepositoryBase<T> {
    unitOfWork: UnitOfWorkBase;
    abstract get tableName(): string;
    abstract get schema(): ModelAttributes;
    get model(): import("sequelize").ModelCtor<import("sequelize").Model<any, any>>;
    private get tableOption();
    constructor(unitOfWork: UnitOfWorkBase);
    syncModel(): Promise<void>;
    add(entity: T): void;
    delete(entity: T): void;
    update(entity: T): void;
    getCount(options?: CountOptions): Promise<number>;
    getAll<TNew, TCustomAttributes>(options?: FindOptions): Promise<TCustomAttributes[]>;
    getFirstOrDefault<TNew, TCustomAttributes>(options?: FindOptions): Promise<TCustomAttributes>;
}
