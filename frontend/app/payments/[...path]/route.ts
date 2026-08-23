import { NextRequest, NextResponse } from 'next/server';

const paymentMethods = [
  { id: 'mvola', name: 'MVola (Telma)', prefix: '034', icon: '🟢', description: 'Paiement instantané Telma Madagascar' },
  { id: 'orange', name: 'Orange Money Madagascar', prefix: '032', icon: '🟠', description: 'Paiement direct Orange Madagascar' },
  { id: 'airtel', name: 'Airtel Money Madagascar', prefix: '033', icon: '🔴', description: 'Paiement sécurisé Airtel Madagascar' },
  { id: 'card', name: 'Carte Bancaire (Visa / Mastercard)', prefix: '+261', icon: '💳', description: 'Paiement carte bancaire internationale' },
];

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (params.path || []).join('/');
  if (path === 'methods') {
    return NextResponse.json({ data: paymentMethods });
  }
  return NextResponse.json({ data: paymentMethods });
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (params.path || []).join('/');
  let body: any = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {}

  if (path === 'pay') {
    const trxId = `MGA-TRX-${Date.now().toString().slice(-6)}`;
    const refNum = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceNum = `FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      status: 'success',
      success: true,
      message: 'Paiement en Ariary validé avec succès par Mobile Money.',
      transaction_id: trxId,
      reference: refNum,
      invoice_number: invoiceNum,
      amount: body.amount || 150000,
      currency: 'Ar',
      method: body.method || 'mvola',
      phone: body.phone || '034 00 000 00',
      created_at: new Date().toISOString()
    });
  }

  return NextResponse.json({ status: 'success' });
}
