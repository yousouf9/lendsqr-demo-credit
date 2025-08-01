export const pickAllowedFields = <T extends object, K extends keyof T>(
  obj: T,
  allowedFields: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;

  for (const key of allowedFields) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
};
