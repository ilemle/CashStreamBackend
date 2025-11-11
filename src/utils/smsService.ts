// SMS сервис для отправки кодов подтверждения
// Поддерживает: Twilio, Vonage (Nexmo), Plivo, MessageBird, SMS.ru, SMSC.ru и мок-режим для разработки

type SMSProvider = 'twilio' | 'vonage' | 'plivo' | 'messagebird' | 'smsru' | 'smsc' | 'mock';

interface SMSConfig {
  provider?: SMSProvider;
  // Twilio
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  // Vonage (Nexmo)
  vonageApiKey?: string;
  vonageApiSecret?: string;
  vonageFromNumber?: string;
  // Plivo
  plivoAuthId?: string;
  plivoAuthToken?: string;
  plivoFromNumber?: string;
  // MessageBird
  messagebirdApiKey?: string;
  messagebirdFromNumber?: string;
  // SMS.ru
  smsruApiId?: string;
  // SMSC.ru
  smscLogin?: string;
  smscPassword?: string;
  mockMode?: boolean;
}

// Определяем провайдера из переменных окружения
const getProvider = (): SMSProvider => {
  if (process.env.SMS_PROVIDER) {
    return process.env.SMS_PROVIDER as SMSProvider;
  }
  // Автоопределение по наличию credentials
  if (process.env.TWILIO_ACCOUNT_SID) return 'twilio';
  if (process.env.VONAGE_API_KEY) return 'vonage';
  if (process.env.PLIVO_AUTH_ID) return 'plivo';
  if (process.env.MESSAGEBIRD_API_KEY) return 'messagebird';
  if (process.env.SMSRU_API_ID) return 'smsru';
  if (process.env.SMSC_LOGIN) return 'smsc';
  return 'mock';
};

let smsConfig: SMSConfig = {
  provider: getProvider(),
  // Twilio
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioFromNumber: process.env.TWILIO_PHONE_NUMBER,
  // Vonage
  vonageApiKey: process.env.VONAGE_API_KEY,
  vonageApiSecret: process.env.VONAGE_API_SECRET,
  vonageFromNumber: process.env.VONAGE_FROM_NUMBER,
  // Plivo
  plivoAuthId: process.env.PLIVO_AUTH_ID,
  plivoAuthToken: process.env.PLIVO_AUTH_TOKEN,
  plivoFromNumber: process.env.PLIVO_FROM_NUMBER,
  // MessageBird
  messagebirdApiKey: process.env.MESSAGEBIRD_API_KEY,
  messagebirdFromNumber: process.env.MESSAGEBIRD_FROM_NUMBER,
  // SMS.ru
  smsruApiId: process.env.SMSRU_API_ID,
  // SMSC.ru
  smscLogin: process.env.SMSC_LOGIN,
  smscPassword: process.env.SMSC_PASSWORD,
  mockMode: process.env.NODE_ENV === 'development' && getProvider() === 'mock',
};

// Нормализация номера телефона (убираем все кроме цифр и +)
export const normalizePhoneNumber = (phone: string): string => {
  // Убираем все кроме цифр и +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Если номер начинается не с +, добавляем +7 для России
  if (!normalized.startsWith('+')) {
    // Если начинается с 8, заменяем на +7
    if (normalized.startsWith('8')) {
      normalized = '+7' + normalized.substring(1);
    } else if (normalized.startsWith('7')) {
      normalized = '+' + normalized;
    } else {
      // Если номер без кода страны, добавляем +7
      normalized = '+7' + normalized;
    }
  }
  
  return normalized;
};

// Валидация номера телефона
export const validatePhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  // Проверяем формат: +7XXXXXXXXXX (11 цифр после +7)
  const phoneRegex = /^\+7\d{10}$/;
  return phoneRegex.test(normalized);
};

// Отправка SMS через Twilio
const sendSMSViaTwilio = async (to: string, message: string): Promise<void> => {
  if (!smsConfig.twilioAccountSid || !smsConfig.twilioAuthToken || !smsConfig.twilioFromNumber) {
    throw new Error('Twilio credentials not configured');
  }

  let twilio: any;
  try {
    twilio = require('twilio');
  } catch (error) {
    throw new Error('Twilio package not installed. Run: npm install twilio');
  }

  const client = twilio(smsConfig.twilioAccountSid, smsConfig.twilioAuthToken);
  await client.messages.create({
    body: message,
    to: to,
    from: smsConfig.twilioFromNumber,
  });
};

// Отправка SMS через Vonage (Nexmo)
const sendSMSViaVonage = async (to: string, message: string): Promise<void> => {
  if (!smsConfig.vonageApiKey || !smsConfig.vonageApiSecret) {
    throw new Error('Vonage credentials not configured');
  }

  const axios = require('axios');
  const response = await axios.post('https://rest.nexmo.com/sms/json', {
    api_key: smsConfig.vonageApiKey,
    api_secret: smsConfig.vonageApiSecret,
    to: to.replace('+', ''),
    from: smsConfig.vonageFromNumber || 'CashStream',
    text: message,
  });

  if (response.data.messages[0].status !== '0') {
    throw new Error(`Vonage error: ${response.data.messages[0]['error-text']}`);
  }
};

// Отправка SMS через Plivo
const sendSMSViaPlivo = async (to: string, message: string): Promise<void> => {
  if (!smsConfig.plivoAuthId || !smsConfig.plivoAuthToken || !smsConfig.plivoFromNumber) {
    throw new Error('Plivo credentials not configured');
  }

  let plivo: any;
  try {
    plivo = require('plivo');
  } catch (error) {
    throw new Error('Plivo package not installed. Run: npm install plivo');
  }

  const client = plivo.RestClient({
    authId: smsConfig.plivoAuthId,
    authToken: smsConfig.plivoAuthToken,
  });

  await client.messages.create({
    src: smsConfig.plivoFromNumber,
    dst: to,
    text: message,
  });
};

// Отправка SMS через MessageBird
const sendSMSViaMessageBird = async (to: string, message: string): Promise<void> => {
  if (!smsConfig.messagebirdApiKey || !smsConfig.messagebirdFromNumber) {
    throw new Error('MessageBird credentials not configured');
  }

  let messagebird: any;
  try {
    messagebird = require('messagebird');
  } catch (error) {
    throw new Error('MessageBird package not installed. Run: npm install messagebird');
  }

  const client = messagebird(smsConfig.messagebirdApiKey);
  await new Promise((resolve, reject) => {
    client.messages.create({
      originator: smsConfig.messagebirdFromNumber,
      recipients: [to],
      body: message,
    }, (err: any, response: any) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
};

// Отправка SMS через SMS.ru (Россия)
const sendSMSViaSMSru = async (to: string, message: string): Promise<void> => {
  if (!smsConfig.smsruApiId) {
    throw new Error('SMS.ru API ID not configured');
  }

  const axios = require('axios');
  // Убираем + и форматируем номер для SMS.ru (формат: 79991234567)
  const phone = to.replace('+', '');
  
  try {
    const response = await axios.post('https://sms.ru/sms/send', null, {
      params: {
        api_id: smsConfig.smsruApiId,
        to: phone,
        msg: message,
        json: 1,
      },
    });

    // Проверяем статус ответа
    if (response.data.status === 'OK') {
      // Проверяем статус отправки для каждого номера
      const smsStatus = response.data.sms?.[phone];
      if (smsStatus && smsStatus.status === 'OK') {
        console.log(`✅ SMS.ru: SMS sent successfully to ${to}, SMS ID: ${smsStatus.sms_id}`);
        return;
      } else {
        const errorText = smsStatus?.status_text || 'Unknown error';
        throw new Error(`SMS.ru error: ${errorText}`);
      }
    } else {
      const errorText = response.data.status_text || 'Unknown error';
      throw new Error(`SMS.ru error: ${errorText}`);
    }
  } catch (error: any) {
    if (error.response) {
      // Ошибка от API
      const errorText = error.response.data?.status_text || error.response.data?.message || error.message;
      throw new Error(`SMS.ru API error: ${errorText}`);
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      throw new Error('SMS.ru: No response from server');
    } else {
      // Ошибка при настройке запроса
      throw new Error(`SMS.ru error: ${error.message}`);
    }
  }
};

// Отправка SMS через SMSC.ru (Россия)
const sendSMSViaSMSC = async (to: string, message: string): Promise<void> => {
  if (!smsConfig.smscLogin || !smsConfig.smscPassword) {
    throw new Error('SMSC.ru credentials not configured');
  }

  const axios = require('axios');
  const phone = to.replace('+', '');
  const response = await axios.get('https://smsc.ru/sys/send.php', {
    params: {
      login: smsConfig.smscLogin,
      psw: smsConfig.smscPassword,
      phones: phone,
      mes: message,
      fmt: 3, // JSON формат
    },
  });

  if (response.data.error) {
    throw new Error(`SMSC.ru error: ${response.data.error}`);
  }
};

// Мок-режим: просто логируем SMS
const sendSMSMock = async (to: string, message: string): Promise<void> => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 [MOCK SMS] SMS отправка (режим разработки)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📞 Получатель: ${to}`);
  console.log(`💬 Сообщение: ${message}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  // В мок-режиме не отправляем реальное SMS
};

// Основная функция отправки SMS
export const sendVerificationSMS = async (phone: string, code: string, _name: string): Promise<void> => {
  const normalizedPhone = normalizePhoneNumber(phone);
  
  if (!validatePhoneNumber(normalizedPhone)) {
    throw new Error('Invalid phone number format');
  }

  const message = `Ваш код подтверждения для CashStream: ${code}. Код действителен 10 минут.`;

  const provider = smsConfig.provider || 'mock';

  try {
    if (smsConfig.mockMode || provider === 'mock') {
      await sendSMSMock(normalizedPhone, message);
    } else {
      switch (provider) {
        case 'twilio':
          await sendSMSViaTwilio(normalizedPhone, message);
          break;
        case 'vonage':
          await sendSMSViaVonage(normalizedPhone, message);
          break;
        case 'plivo':
          await sendSMSViaPlivo(normalizedPhone, message);
          break;
        case 'messagebird':
          await sendSMSViaMessageBird(normalizedPhone, message);
          break;
        case 'smsru':
          await sendSMSViaSMSru(normalizedPhone, message);
          break;
        case 'smsc':
          await sendSMSViaSMSC(normalizedPhone, message);
          break;
        default:
          throw new Error(`Unknown SMS provider: ${provider}`);
      }
      console.log(`✅ SMS sent via ${provider} to ${normalizedPhone}`);
    }
  } catch (error: any) {
    console.error(`❌ SMS sending error (${provider}):`, error.message || error);
    // В режиме разработки не блокируем, если сервис не настроен
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ SMS service unavailable, but code is saved and logged above');
      await sendSMSMock(normalizedPhone, message);
    } else {
      throw new Error('SMS_SERVICE_UNAVAILABLE');
    }
  }
};

// Обновление конфигурации SMS
export const updateSMSConfig = (config: Partial<SMSConfig>): void => {
  smsConfig = { ...smsConfig, ...config };
};

