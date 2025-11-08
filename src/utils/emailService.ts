import nodemailer from 'nodemailer';

// Кешируем транспортер, чтобы не создавать новый при каждом вызове
let cachedTransporter: nodemailer.Transporter | null = null;
let transporterPromise: Promise<nodemailer.Transporter> | null = null;

// Создаем транспортер для отправки email
const createTransporter = async (): Promise<nodemailer.Transporter> => {
  // Если транспортер уже создан, возвращаем его
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // Если уже идет создание транспортера, ждем его
  if (transporterPromise) {
    return transporterPromise;
  }

  // Создаем новый транспортер
  transporterPromise = (async () => {
    // Используем реальный SMTP, если настроен (работает и в dev, и в production)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const port = parseInt(process.env.SMTP_PORT || '587');
      const secure = process.env.SMTP_SECURE === 'true';
      
      console.log('📧 Using real SMTP server:', process.env.SMTP_HOST, `(port: ${port}, secure: ${secure})`);
      
      // Специальная конфигурация для Yandex
      const isYandex = process.env.SMTP_HOST?.includes('yandex');
      
      cachedTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: secure, // true для 465, false для других портов
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          // Не проверяем сертификат (для разработки)
          rejectUnauthorized: false
        },
        // Для порта 587 используем requireTLS (STARTTLS)
        requireTLS: !secure,
        connectionTimeout: 60000, // 60 секунд для VPN соединений
        greetingTimeout: 60000,
        socketTimeout: 60000,
        debug: process.env.NODE_ENV === 'development', // Включаем debug в режиме разработки
      });
      
      // Детальное логирование для отладки
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 SMTP Config:', {
          host: process.env.SMTP_HOST,
          port: port,
          secure: secure,
          requireTLS: !secure && port === 587,
          user: process.env.SMTP_USER,
          passLength: process.env.SMTP_PASS?.length || 0,
          isYandex: isYandex
        });
      }
      
      // Проверяем подключение
      try {
        await cachedTransporter.verify();
        console.log('✅ SMTP connection verified successfully');
      } catch (verifyError: any) {
        console.error('❌ SMTP verification failed:', verifyError.message);
        // Не бросаем ошибку, продолжаем - возможно, письмо все равно отправится
      }
      
      return cachedTransporter;
    }

    // Для разработки создаем тестовый аккаунт Ethereal Email автоматически
    // Это создаст временный аккаунт для тестирования
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('📧 Ethereal Email test account created:', testAccount.user);
      
      cachedTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        connectionTimeout: 30000, // 30 секунд на подключение
        greetingTimeout: 30000, // 30 секунд на приветствие
        socketTimeout: 30000, // 30 секунд на операции
      });
      return cachedTransporter;
    } catch (error: any) {
      console.error('❌ Failed to create Ethereal test account:', error);
      transporterPromise = null; // Сбрасываем промис, чтобы можно было попробовать снова
      throw new Error('Failed to initialize email service');
    }
  })();

  return transporterPromise;
};

export const sendPasswordResetEmail = async (
  email: string,
  code: string,
  name: string
): Promise<void> => {
  const transporter = await createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?code=${code}&email=${encodeURIComponent(email)}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@cashstream.com',
    to: email,
    subject: 'Восстановление пароля в CashStream',
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
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Восстановление пароля</h1>
            </div>
            <div class="content">
              <p>Привет, ${name}!</p>
              <p>Вы запросили восстановление пароля для вашего аккаунта в CashStream.</p>
              
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #666;">Ваш код восстановления:</p>
                <div class="code">${code}</div>
              </div>
              
              <p>Или перейдите по ссылке:</p>
              <a href="${resetUrl}" class="button">Восстановить пароль</a>
              
              <div class="warning">
                <strong>⚠️ Важно:</strong> Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо. Ваш пароль останется без изменений.
              </div>
              
              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                Этот код действителен в течение 10 минут.
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
      Восстановление пароля в CashStream
      
      Привет, ${name}!
      
      Вы запрашивали восстановление пароля для вашего аккаунта в CashStream.
      
      Ваш код восстановления: ${code}
      
      Или перейдите по ссылке: ${resetUrl}
      
      ⚠️ Важно: Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо. Ваш пароль останется без изменений.
      
      Этот код действителен в течение 10 минут.
      
      © ${new Date().getFullYear()} CashStream. Все права защищены.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    
    if (process.env.NODE_ENV !== 'production' && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📧 Preview URL:', previewUrl);
      }
      console.log('📧 Password reset code (for testing):', code);
    }
  } catch (error: any) {
    console.error('❌ Error sending password reset email:', error.message);
    
    // В режиме разработки не бросаем ошибку, а просто логируем код
    if (process.env.NODE_ENV !== 'production') {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📧 EMAIL SERVICE UNAVAILABLE (Development Mode)');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📧 Password reset code for', email, ':', code);
      console.log('📧 Reset URL:', resetUrl);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      // Не бросаем ошибку в режиме разработки
      return;
    }
    
    // В продакшене бросаем ошибку
    throw new Error(`Failed to send password reset email: ${error.message || 'Unknown error'}`);
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
    console.error('❌ Error sending verification email:', error.message);
    
    // В режиме разработки не бросаем ошибку, а просто логируем код
    if (process.env.NODE_ENV !== 'production') {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📧 EMAIL SERVICE UNAVAILABLE (Development Mode)');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📧 Verification code for', email, ':', code);
      console.log('📧 Verification URL:', verificationUrl);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      // Не бросаем ошибку в режиме разработки
      return;
    }
    
    // В продакшене бросаем ошибку
    throw new Error(`Failed to send verification email: ${error.message || 'Unknown error'}`);
  }
};

