import nodemailer from 'nodemailer';

// Создаем транспортер для отправки email
const createTransporter = async () => {
  // Для продакшена используем реальный SMTP
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Для разработки создаем тестовый аккаунт Ethereal Email автоматически
  // Это создаст временный аккаунт для тестирования
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal Email test account created:', testAccount.user);
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to create Ethereal test account:', error);
    throw new Error('Failed to initialize email service');
  }
};

export const sendVerificationEmail = async (
  email: string,
  code: string,
  name: string
): Promise<void> => {
  const transporter = await createTransporter();
  
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?code=${code}&email=${encodeURIComponent(email)}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@cashstream.com',
    to: email,
    subject: 'Подтверждение регистрации в CashStream',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .code-box {
              background: white;
              border: 2px dashed #667eea;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 5px;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Добро пожаловать в CashStream!</h1>
            </div>
            <div class="content">
              <p>Привет, ${name}!</p>
              <p>Спасибо за регистрацию в CashStream. Для завершения регистрации подтвердите ваш email адрес.</p>
              
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #666;">Ваш код подтверждения:</p>
                <div class="code">${code}</div>
              </div>
              
              <p>Или перейдите по ссылке:</p>
              <a href="${verificationUrl}" class="button">Подтвердить email</a>
              
              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                Этот код действителен в течение 10 минут. Если вы не регистрировались в CashStream, просто проигнорируйте это письмо.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} CashStream. Все права защищены.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Добро пожаловать в CashStream!
      
      Привет, ${name}!
      
      Спасибо за регистрацию в CashStream. Для завершения регистрации подтвердите ваш email адрес.
      
      Ваш код подтверждения: ${code}
      
      Или перейдите по ссылке: ${verificationUrl}
      
      Этот код действителен в течение 10 минут. Если вы не регистрировались в CashStream, просто проигнорируйте это письмо.
      
      © ${new Date().getFullYear()} CashStream. Все права защищены.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    
    // В режиме разработки с Ethereal Email выводим ссылку для просмотра и код
    if (process.env.NODE_ENV !== 'production' && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📧 Preview URL:', previewUrl);
      }
      console.log('📧 Verification code (for testing):', code);
    }
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to send verification email: ${error.message || 'Unknown error'}`);
  }
};

