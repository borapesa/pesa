import type { TZSAmount } from './core';

/** Result returned after initiating a refund. */
export interface RefundResult {
  refundId:     string;
  orderId:      string;
  amount:       TZSAmount;
  status:       'QUEUED' | 'SUCCESS' | 'FAILED';
  message?:     string;
  raw?:         unknown;
}
