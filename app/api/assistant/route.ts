import { assistantSchema } from '@/lib/kaam/contracts';
import { assistant, fail, jsonBody, noStore } from '@/lib/kaam/server';
export async function POST(req:Request) { try {const input=assistantSchema.parse(await jsonBody(req));return Response.json(await assistant(input,req.signal),{headers:noStore});}catch(e){return fail(e);} }
