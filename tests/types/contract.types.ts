/**
 * Compile-time guarantees of route contracts. `tsc --noEmit` on this file
 * must pass; every @ts-expect-error marks something that must NOT compile.
 */
import { z } from 'zod';
import { defineRoute, createClient } from '../../dist/index.js';

// A route with no auth decision does not compile.
// @ts-expect-error auth is required
defineRoute({ method: 'GET', path: '/api/reports' });

// The path must be under /api.
// @ts-expect-error path must start with /api
defineRoute({ method: 'GET', path: '/reports', auth: 'public' });

// Roles need at least one entry.
// @ts-expect-error an empty roles list is not a decision
defineRoute({ method: 'GET', path: '/api/reports', auth: { roles: [] } });

const getInvoice = defineRoute({
  method: 'GET',
  path: '/api/invoices/:id',
  params: z.object({ id: z.string() }),
  response: z.object({ id: z.string(), total: z.number() }),
  auth: 'user',
});
const listPlans = defineRoute({ method: 'GET', path: '/api/plans', auth: 'public', response: z.array(z.string()) });

const api = createClient();

async function usage() {
  const invoice = await api.call(getInvoice, { params: { id: '1' } });
  const total: number = invoice.total;
  // @ts-expect-error the response has no `amount`
  invoice.amount;

  // @ts-expect-error params are required when the contract declares them
  await api.call(getInvoice);
  // @ts-expect-error `id` must be a string
  await api.call(getInvoice, { params: { id: 1 } });
  // @ts-expect-error this contract declares no body
  await api.call(getInvoice, { params: { id: '1' }, body: { x: 1 } });

  // A contract with no inputs takes no second argument.
  const plans: string[] = await api.call(listPlans);
  return [total, plans];
}
void usage;
