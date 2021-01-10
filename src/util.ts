const sleep = (
  ms: number
) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });


export const retryFunc = async (
  count: number,
  waitingMillisecond: number,
  func: (currentCount: number) => boolean | Promise<boolean>,
  currentCount = 1
) => {
  const residue = count - currentCount;
  if (residue < 0) {
    return;
  }
  const bo = await func(currentCount);
  if (bo) {
    return;
  }
  await sleep(waitingMillisecond);
  await retryFunc(count, waitingMillisecond, func, currentCount + 1);
}
