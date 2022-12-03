declare type Merge<T, R> = Omit<Omit<T, Extract<keyof T, keyof R>> & R, never>;
