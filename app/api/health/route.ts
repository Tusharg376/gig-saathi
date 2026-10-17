import { settings, noStore } from '@/lib/kaam/server';
export async function GET() {return Response.json({configured:!!settings().key},{headers:noStore});}
