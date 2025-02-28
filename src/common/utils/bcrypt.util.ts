import * as bcrypt from 'bcrypt';

export class BcryptUtil {
  static async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt);
  }
  static async getSalt(): Promise<string> {
    return await bcrypt.genSalt();
  }
}

export default BcryptUtil;
