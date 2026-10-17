import { PDFDocument } from 'pdf-lib';
import { profileSchema } from '@/lib/kaam/contracts';
import { ApiError, analyzeDocument, fail, noStore, originGuard } from '@/lib/kaam/server';
export async function POST(req:Request) {try {
  originGuard(req); if(Number(req.headers.get('content-length')||0)>11*1024*1024)throw new ApiError('TOO_LARGE',413);
  const form=await req.formData(); const file=form.get('file');if(!(file instanceof File)||!file.size)throw new ApiError('INVALID_FILE',400);
  if(file.size>10*1024*1024)throw new ApiError('TOO_LARGE',413);
  if(!['image/jpeg','image/png','application/pdf'].includes(file.type))throw new ApiError('INVALID_FILE',400);
  let profile;try{profile=profileSchema.parse(JSON.parse(String(form.get('profile'))));}catch{throw new ApiError('INVALID_INPUT',400);}
  const bytes=new Uint8Array(await file.arrayBuffer());
  const valid=file.type==='application/pdf'?new TextDecoder().decode(bytes.slice(0,5))==='%PDF-':file.type==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71:bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  if(!valid)throw new ApiError('INVALID_FILE',400);
  if(file.type==='application/pdf'){let pdf;try{pdf=await PDFDocument.load(bytes);}catch{throw new ApiError('UNREADABLE_PDF',400);}if(pdf.getPageCount()>20)throw new ApiError('TOO_MANY_PAGES',400);}
  return Response.json(await analyzeDocument(profile,file,req.signal),{headers:noStore});
}catch(e){return fail(e);} }
