import type { Profile, Earning, Draft } from './contracts';
import { earningSchema, profileSchema } from './contracts';
export type LocalData = { profile: Profile | null; earnings: Earning[]; drafts: Draft[] };
export const emptyData: LocalData = { profile: null, earnings: [], drafts: [] };
function open(): Promise<IDBDatabase> { return new Promise((resolve,reject) => {
  const req=indexedDB.open('kaam-saathi',1);
  req.onupgradeneeded=()=>req.result.createObjectStore('data');
  req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(new Error('storage'));
}); }
export async function readData(): Promise<LocalData> {
  const db=await open();
  return new Promise((resolve,reject)=>{ const tx=db.transaction('data','readonly'); const req=tx.objectStore('data').get('worker');
    req.onsuccess=()=>{const data=req.result; if(!data) return resolve({...emptyData});
      resolve({profile:profileSchema.safeParse(data.profile).success?data.profile:null,earnings:(data.earnings||[]).filter((e:Earning)=>typeof e.id==='string'&&earningSchema.safeParse(e).success),drafts:(data.drafts||[]).filter((d:Draft)=>typeof d.id==='string'&&typeof d.title==='string'&&typeof d.body==='string')});};
    req.onerror=()=>reject(new Error('storage')); tx.oncomplete=()=>db.close();
  });
}
export async function writeData(data: LocalData) { const db=await open(); return new Promise<void>((resolve,reject)=>{const tx=db.transaction('data','readwrite'); tx.objectStore('data').put(data,'worker'); tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(new Error('storage'));};}); }
export async function clearData() { const db=await open(); return new Promise<void>((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').clear();tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(new Error('storage'));};}); }
