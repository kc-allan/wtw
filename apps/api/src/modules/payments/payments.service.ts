import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider, Prisma } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface CreatePaymentIntent {
  accountId: string;
  eventId?: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  purpose: string;
  metadata?: Prisma.InputJsonObject;
}

/**
 * Scaffold. Payments are recorded so registry cash gifts and plan upgrades have
 * somewhere to land; no provider is wired up yet. M-Pesa STK push and a card
 * processor slot in behind this service without changing its callers.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: CreatePaymentIntent) {
    this.logger.log(`Recording ${input.provider} payment intent for ${input.purpose}`);
    return this.prisma.payment.create({
      data: {
        accountId: input.accountId,
        eventId: input.eventId,
        provider: input.provider,
        amount: input.amount,
        currency: input.currency,
        purpose: input.purpose,
        metadata: input.metadata ?? {},
      },
    });
  }

  async markSucceeded(paymentId: string, providerRef: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'succeeded', providerRef },
    });
  }

  async listForAccount(accountId: string) {
    return this.prisma.payment.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
