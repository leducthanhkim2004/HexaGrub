import crypto from 'crypto';
import PaymentButton from '../components/PaymentButton';

const VNPAY_CONFIG = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || '',
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || '',
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/result',
};

// Current USD to VND exchange rate (you should update this regularly or fetch from an API)
const USD_TO_VND_RATE = 25000; // 1 USD = 25,000 VND

// Validate configuration
const validateConfig = () => {
  if (!VNPAY_CONFIG.vnp_TmnCode || !VNPAY_CONFIG.vnp_HashSecret) {
    throw new Error('VNPAY configuration is missing. Please check your environment variables.');
  }
};

// Convert USD to VND
const convertUsdToVnd = (usdAmount) => {
  return Math.round(usdAmount * USD_TO_VND_RATE * 100); // Convert to smallest currency unit
};

// Format date to yyyyMMddHHmmss
const formatDate = (date) => {
  const pad = (num) => (num < 10 ? '0' + num : num);
  
  return '' + date.getFullYear() +
         pad(date.getMonth() + 1) +
         pad(date.getDate()) +
         pad(date.getHours()) +
         pad(date.getMinutes()) +
         pad(date.getSeconds());
};

// Sort object by key
const sortObject = (obj) => {
  const sorted = {};
  const str = [];
  let key;
  
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  
  str.sort();
  
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  
  return sorted;
};

export const createPaymentUrl = (orderInfo, amount, orderId) => {
  try {
    validateConfig();

    const tmnCode = VNPAY_CONFIG.vnp_TmnCode;
    const secretKey = VNPAY_CONFIG.vnp_HashSecret;
    const returnUrl = VNPAY_CONFIG.vnp_ReturnUrl;

    const date = new Date();
    const createDate = formatDate(date);
    
    // Convert USD to VND (smallest currency unit)
    const vndAmount = convertUsdToVnd(amount);

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId.toString(),
      vnp_OrderInfo: 'Thanh toan don hang: ' + orderId,
      vnp_OrderType: '250000',
      vnp_Amount: vndAmount.toString(),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_BankCode: 'NCB'
    };

    // Sort and encode params
    const sortedParams = sortObject(vnp_Params);
    
    // Create query string
    const signData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Create secure hash
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(signData).digest('hex');

    // Add secure hash to params
    const paymentUrl = `${VNPAY_CONFIG.vnp_Url}?${signData}&vnp_SecureHash=${signed}`;

    console.log('VNPAY Payment URL:', paymentUrl);

    return paymentUrl;
  } catch (error) {
    console.error('Error creating payment URL:', error);
    throw new Error('Failed to create payment URL. Please check your VNPAY configuration.');
  }
};

export const verifyPayment = (query) => {
  try {
    validateConfig();

    const vnp_SecureHash = query.vnp_SecureHash;
    const secretKey = VNPAY_CONFIG.vnp_HashSecret;
    
    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    // Sort and encode params
    const sortedParams = sortObject(query);
    
    // Create query string
    const signData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Create secure hash
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(signData).digest('hex');

    return vnp_SecureHash === signed;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}; 