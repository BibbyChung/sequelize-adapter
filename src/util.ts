export class Utils {
  static async retryFunc(
    count: number,
    waitingMillisecond: number,
    func: (currentCount: number) => boolean | Promise<boolean>,
    currentCount = 1
  ) {
    const residue = count - currentCount;
    if (residue < 0) {
      return;
    }
    const bo = await func(currentCount);
    if (bo) {
      return;
    }
    await Utils.sleep(waitingMillisecond);
    await Utils.retryFunc(count, waitingMillisecond, func, currentCount + 1);
  }

  static async sleep(ms: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

}