import type { TZSAmount, Currency } from './core';

/** Supported mobile money networks for disbursement. */
export type MobileNetwork =
  | 'MPESA'
  | 'TIGOPESA'
  | 'AIRTELMONEY'
  | 'HALOPESA'
  | 'AZAMPESA';

/** Payload for sending a disbursement (B2C / wallet-out). */
export interface DisbursePayload {
  amount:    TZSAmount;
  currency:  Currency;
  recipient: {
    phone:   string;              // MSISDN: 255XXXXXXXXX
    name?:   string;
    network?: MobileNetwork;
  };
  reference: string;              // your internal reference — must be unique
  remarks?:  string;
}

/** Result returned after initiating a disbursement. */
export interface DisburseResult {
  disbursementId: string;
  reference:      string;
  status:         'QUEUED' | 'SUCCESS' | 'FAILED';
  raw?:           unknown;
}
