import { NextResponse } from 'next/server';
import { verifyPayment } from '@/app/services/vnpayService';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    console.log('Payment callback received:', {
      orderId: query.vnp_TxnRef,
      responseCode: query.vnp_ResponseCode
    });

    // Verify payment
    const isValid = verifyPayment(query);
    console.log('Payment verification result:', isValid);
    
    if (!isValid) {
      console.error('Payment verification failed');
      return NextResponse.redirect(new URL('/Payment/failed', request.url));
    }

    // Only update order if payment was successful (response code '00')
    if (query.vnp_ResponseCode === '00') {
      console.log('Payment successful, updating order:', query.vnp_TxnRef);
      
      const { data: order, error: updateError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', query.vnp_TxnRef)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating order status:', updateError);
        return NextResponse.redirect(new URL('/Payment/failed?error=database_error', request.url));
      }

      console.log('Order status updated successfully:', order);
      return NextResponse.redirect(new URL('/Payment/success', request.url));
    } else {
      // Payment was not successful
      console.log('Payment failed with response code:', query.vnp_ResponseCode);
      return NextResponse.redirect(new URL('/Payment/failed', request.url));
    }

  } catch (error) {
    console.error('Error processing payment result:', error);
    return NextResponse.redirect(new URL('/Payment/failed?error=system_error', request.url));
  }
} 