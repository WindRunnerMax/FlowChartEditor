const opt = Object.prototype.toString;
export const isString = (value: unknown): value is string => {
  return opt.call(value) === "[object String]";
};
