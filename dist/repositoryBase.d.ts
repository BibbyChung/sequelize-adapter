import { BuildOptions, CountOptions, FindOptions, Model, ModelAttributes } from 'sequelize';
import { UnitOfWorkBase } from './unitOfWorkBase';
export declare abstract class RepositoryBase<T> {
    unitOfWork: UnitOfWorkBase;
    abstract readonly tableName: string;
    abstract readonly schema: ModelAttributes;
    readonly model: typeof Model & (new (values?: object, options?: BuildOptions) => T);
    private readonly tableOption;
    constructor(unitOfWork: UnitOfWorkBase);
    syncModel(): Promise<void>;
    add(entity: T): void;
    remove(entity: T): void;
    update(entity: T): void;
    getCount(options?: CountOptions): Promise<number>;
    getAll<TNew, TCustomAttributes>(options?: FindOptions): Promise<TCustomAttributes[]>;
    getFirstOrDefault<TNew, TCustomAttributes>(options?: FindOptions): Promise<TCustomAttributes>;
}
