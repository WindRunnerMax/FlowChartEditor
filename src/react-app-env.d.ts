/// <reference types="react-scripts" />

declare module "*.gif" {
  const value: string;
  export default value;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}
