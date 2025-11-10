import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface IPhoneVerification {
  id?: string;
  phone: string;
  code: string;
  expiresAt: Date;
  verified?: boolean;
  createdAt?: Date;
}

class PhoneVerificationModel {
  static async create(verificationData: Omit<IPhoneVerification, 'id' | 'createdAt'>): Promise<IPhoneVerification> {
    const id = uuidv4();
    
    await pool.execute(
      'INSERT INTO phone_verifications (id, phone, code, expiresAt, verified) VALUES (?, ?, ?, ?, ?)',
      [
        id,
        verificationData.phone,
        verificationData.code,
        verificationData.expiresAt,
        verificationData.verified || false
      ]
    );

    return { ...verificationData, id, verified: verificationData.verified || false };
  }

  static async findOne(filter: { phone: string; code?: string }): Promise<IPhoneVerification | null> {
    let query = 'SELECT * FROM phone_verifications WHERE phone = ?';
    const params: any[] = [filter.phone];
    
    if (filter.code) {
      query += ' AND code = ?';
      params.push(filter.code);
    }
    
    query += ' ORDER BY createdAt DESC LIMIT 1';
    
    const [rows] = await pool.execute(query, params);
    const verifications = rows as IPhoneVerification[];
    return verifications[0] || null;
  }

  static async markAsVerified(phone: string, code: string): Promise<boolean> {
    const [result] = await pool.execute(
      'UPDATE phone_verifications SET verified = true WHERE phone = ? AND code = ?',
      [phone, code]
    );
    
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  }

  static async deleteExpired(): Promise<void> {
    await pool.execute(
      'DELETE FROM phone_verifications WHERE expiresAt < NOW() OR verified = true'
    );
  }
}

export default PhoneVerificationModel;

