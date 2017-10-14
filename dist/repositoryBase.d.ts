/// <reference types="sequelize" />
import * as Sequelize from 'Sequelize';
import { UnitOfWorkBase } from './unitOfWorkBase';
export declare abstract class RepositoryBase<T> {
    unitOfWork: UnitOfWorkBase;
    readonly abstract tableName: string;
    readonly abstract schema: Sequelize.DefineAttributes;
    readonly model: Sequelize.Model<{}, {}>;
    private readonly tableOption;
    constructor(unitOfWork: UnitOfWorkBase);
    syncModel(): Promise<void>;
    add<T>(entity: T): void;
    remove<T>(entity: T): void;
    update<T>(entity: T): void;
    getCount<TNew, TCustomAttributes>(options?: Sequelize.CountOptions): Promise<number>;
    getAll<TNew, TCustomAttributes>(options?: Sequelize.FindOptions<T & TCustomAttributes>): Promise<TNew[]>;
    getFirstOrDefault<TNew, TCustomAttributes>(options?: Sequelize.FindOptions<T & TCustomAttributes>): Promise<TNew>;
}
