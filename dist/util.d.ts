export declare class Utils {
    static retryFunc(count: number, waitingMillisecond: number, func: (currentCount: number) => boolean | Promise<boolean>, currentCount?: number): Promise<void>;
    static sleep(ms: number): Promise<void>;
}
