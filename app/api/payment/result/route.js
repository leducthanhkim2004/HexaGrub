import { NextResponse } from 'next/server';
import { verifyPayment } from '@/app/services/vnpayService';
import { supabase } from '@/app/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Verify payment
    const isValid = verifyPayment(query);
    
    if (!isValid) {
      return NextResponse.redirect(new URL('/Payment/failed', request.url));
    }

    const status = query.vnp_ResponseCode === '00' ? 'successful' : 'failed';

    // Update order status based on payment response
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', query.vnp_TxnRef)
      .select()
      

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }

    // Redirect based on payment status
    if (query.vnp_ResponseCode === '00') {
      return NextResponse.redirect(new URL('/Payment/success', request.url));
    } else {
      return NextResponse.redirect(new URL('/Payment/failed', request.url));
    }
  } catch (error) {
    console.error('Payment result error:', error);
    return NextResponse.redirect(new URL('/Payment/failed', request.url));
  }
} 