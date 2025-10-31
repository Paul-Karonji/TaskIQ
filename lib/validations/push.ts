// Push Notification Validation Schemas

import { z } from 'zod';

// Push subscription schema (from browser Push API)
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh key is required'),
    auth: z.string().min(1, 'auth key is required'),
  }),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
