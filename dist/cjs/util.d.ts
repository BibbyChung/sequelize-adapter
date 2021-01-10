export declare const retryFunc: (count: number, waitingMillisecond: number, func: (currentCount: number) => boolean | Promise<boolean>, currentCount?: number) => Promise<void>;
