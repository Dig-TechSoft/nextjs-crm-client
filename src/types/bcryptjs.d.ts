declare module "bcryptjs" {
  const bcrypt: {
    hash(data: string | Buffer, salt: string | number): Promise<string>;
    compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  };
  export default bcrypt;
}
