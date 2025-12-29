// modules/payment/gateways/payu.gateway.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface PayUCreatePaymentParams {
  amount: number;
  productInfo: string;
  firstName: string;
  email: string;
  phone?: string;
  txnId?: string;
}

export interface PayUVerifyPaymentParams {
  txnId: string;
  amount: number;
}

@Injectable()
export class PayUGateway {
  private readonly logger = new Logger(PayUGateway.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get('payu.mode') === 'PRODUCTION'
        ? 'https://secure.payu.in'
        : 'https://test.payu.in';
  }

  private generateHash(params: string): string {
    const salt = this.configService.get('payu.merchantSalt');
    const hashString = params + '||||' + salt;
    return crypto.createHash('sha512').update(hashString).digest('hex');
  }

  createPayment(params: PayUCreatePaymentParams): Promise<{
    paymentUrl: string;
    txnId: string;
  }> {
    const merchantKey = this.configService.get('payu.merchantKey');
    const txnId = params.txnId || uuidv4();

    const paymentParams = new URLSearchParams({
      key: merchantKey,
      txnid: txnId,
      amount: params.amount.toString(),
      productinfo: params.productInfo,
      firstname: params.firstName,
      email: params.email,
      phone: params.phone || '',
      surl: this.configService.get('payu.successUrl'),
      furl: this.configService.get('payu.failureUrl'),
      service_provider: 'payu_paisa',
    });

    const hash = this.generateHash(
      `${merchantKey}|${txnId}|${params.amount}|${params.productInfo}|${params.firstName}|${params.email}`,
    );

    paymentParams.append('hash', hash);

    const paymentUrl = `${this.baseUrl}/_payment?${paymentParams.toString()}`;

    this.logger.log(`Payment created for txnId: ${txnId}`);

    return {
      paymentUrl,
      txnId,
    };
  }

  /**
 * Verify a payment with PayU
  async verifyPayment(params: PayUVerifyPaymentParams): Promise<{
    status: 'success' | 'failure' | 'pending';
    data: any;
  }> {
    // Implement verification logic
    // This would typically involve checking PayU's verify API
    return {
      status: 'pending',
      data: {},
    };
  }

  async handleWebhook(webhookData: any): Promise<boolean> {
    try {
      const hash = webhookData.hash;
      const calculatedHash = this.generateHash(
        `${webhookData.status}||||||||||${webhookData.udf5}|||||${webhookData.email}|${webhookData.firstname}|${webhookData.productinfo}|${webhookData.amount}|${webhookData.txnid}|${this.configService.get('payu.merchantKey')}`,
      );

      if (hash !== calculatedHash) {
        throw new Error('Invalid hash in webhook');
      }

      // Process payment status
      this.logger.log(`Payment webhook received: ${webhookData.status}`);

      // Update your database with payment status
      return true;
    } catch (error) {
      this.logger.error('Webhook processing failed:', error);
      return false;
    }
  }

 */
}
