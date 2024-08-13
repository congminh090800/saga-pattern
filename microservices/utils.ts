export function getRandomString(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function mockAsyncCall<
  T extends boolean,
  V extends T extends true ? undefined | null : any,
  E extends T extends true ? Error : undefined | null
>(
  willFail: T,
  payload: V,
  error: E,
  waitingMs: number = 0
): Promise<T extends true ? E : V> {
  return new Promise((resolve, reject) => {
    if (willFail) reject(error);
    setTimeout(() => resolve(payload), waitingMs);
  });
}
