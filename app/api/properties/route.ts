import { getChatGPTUser } from '@/app/chatgpt-auth';
import { propertyDb } from '@/db/properties';
export const dynamic = 'force-dynamic';
const reply = (body: unknown, status=200) => Response.json(body,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
export async function GET() {
 const user = await getChatGPTUser();
 if (!user) return reply({user:null,properties:[]},401);
 try {
 const rows = await propertyDb().prepare('SELECT id, title, kind, payload, updated_at FROM properties WHERE owner_id = ? ORDER BY updated_at DESC').bind(user.userId).all();
 return reply({user:{name:user.displayName},properties:rows.results.map(r=>({...r,payload:JSON.parse(String(r.payload))}))});
 } catch(e) { console.error('Load properties failed',e);return reply({error:'Could not load saved properties. Please try again.'},503); }
}
export async function POST(request: Request) {
 const user = await getChatGPTUser();
 if (!user) return reply({error:'Sign in to save properties.'},401);
 if (request.headers.get('origin') !== new URL(request.url).origin) return reply({error:'Invalid request origin.'},403);
 try {
 const raw = await request.text();
 if (raw.length>30000) return reply({error:'Property is too large.'},400);
 const b = JSON.parse(raw);
 if (!b || typeof b.title!=='string' || !b.title.trim() || b.title.length>300 || typeof b.kind!=='string' || b.kind.length>80 || !b.payload || typeof b.payload!=='object' || Array.isArray(b.payload) || (b.id!==undefined && (typeof b.id!=='string'||b.id.length>80))) return reply({error:'Invalid property data.'},400);
 // Only plain finite input values are stored. Ownership is always taken from server identity.
 const vals=Object.values(b.payload);
 if(vals.some(v=>!(typeof v==='string' && v.length<=1000) && !(typeof v==='number' && Number.isFinite(v)))) return reply({error:'Invalid input values.'},400);
 const id=b.id||crypto.randomUUID(), updated=new Date().toISOString(), db=propertyDb();
 if(b.id) {
 const result=await db.prepare('UPDATE properties SET title=?, kind=?, payload=?, updated_at=? WHERE id=? AND owner_id=?').bind(b.title.trim(),b.kind,JSON.stringify(b.payload),updated,id,user.userId).run();
 if(!result.meta.changes) return reply({error:'Property not found in your account.'},404);
 } else {
 await db.prepare('INSERT INTO properties (id, owner_id, title, kind, payload, updated_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id,user.userId,b.title.trim(),b.kind,JSON.stringify(b.payload),updated).run();
 }
 return reply({id,updated_at:updated});
 } catch(e) { if(e instanceof SyntaxError) return reply({error:'Invalid property data.'},400);console.error('Save property failed',e);return reply({error:'Could not save. Your current inputs are still here; please try again.'},503); }
}
