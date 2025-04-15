import { VNPay } from "vnpay";
const config =require("/confgig.json")
import { VNPay,ignoreLogger } from "vnpay";
const vnpay = new VNPay({
    tmnCode: config.vnp_Tmn_Code,
    secretKey: config.vnp_HashSecret,
    returnUrl: config.vnp_ReturnUrl,
    vnp_Url: config.vnp_Url,
    enableLog:true,
    hashAlgorithm: 'SHA512'
});