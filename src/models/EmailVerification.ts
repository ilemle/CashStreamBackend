import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface IEmailVerification {
  id?: string;
  email: string;
  code: string;
  expiresAt: Date;
  verified?: boolean;
  createdAt?: Date;
}

class EmailVerificationModel {
  static async create(verificationData: Omit<IEmailVerification, 'id' | 'createdAt'>): Promise<IEmailVerification> {
    const id = uuidv4();
    
    await pool.execute(
      'INSERT INTO email_verifications (id, email, code, expiresAt, verified) VALUES (?, ?, ?, ?, ?)',
      [
        id,
        verificationData.email,
        verificationData.code,
        verificationData.expiresAt,
        verificationData.verified || false
      ]
    );

    return { ...verificationData, id, verified: verificationData.verified || false };
  }

  static async findOne(filter: { email: string; code?: string }): Promise<IEmailVerification | null> {
    let query = 'SELECT * FROM email_verifications WHERE email = ?';
    const params: any[] = [filter.email];
    
    if (filter.code) {
      query += ' AND code = ?';
      params.push(filter.code);
    }
    
    query += ' ORDER BY createdAt DESC LIMIT 1';
    
    const [rows] = await pool.execute(query, params);
    const verifications = rows as IEmailVerification[];
    return verifications[0] || null;
  }

  static async markAsVerified(email: string, code: string): Promise<boolean> {
    const [result] = await pool.execute(
      'UPDATE email_verifications SET verified = true WHERE email = ? AND code = ?',
      [email, code]
    );
    
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  }

  static async deleteExpired(): Promise<void> {
    await pool.execute(
      'DELETE FROM email_verifications WHERE expiresAt < NOW() OR verified = true'
    );
  }
}

export default EmailVerificationModel;

