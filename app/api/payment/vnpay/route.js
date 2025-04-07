import { NextResponse } from 'next/server';
import { createPaymentUrl } from '@/app/services/vnpayService';

export async function POST(request) {
  try {
    const { orderId, amount, orderInfo } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Create payment URL
    const paymentUrl = createPaymentUrl(orderInfo, amount, orderId);

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    console.error('VNPAY payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment URL' },
      { status: 500 }
    );
  }
}