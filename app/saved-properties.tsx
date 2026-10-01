'use client';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {supabase} from './supabase-client';

type Values=Record<string,string|number>;
type Saved={id:string;title:string;kind:string;payload:Values;updated_at:string};
type Mode='signin'|'signup'|'reset'|'new-password';

export default function SavedProperties({kind,title,payload,onLoad}:{kind:string;title:string;payload:Values;onLoad:(v:Values)=>void}) {
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[mode,setMode]=useState<Mode>('signin');
 const [open,setOpen]=useState(false);
 const [navHost,setNavHost]=useState<HTMLElement|null>(null);
 const [user,setUser]=useState<{id:string;email?:string}|null>(null),[items,setItems]=useState<Saved[]>([]),[active,setActive]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{
  let mounted=true;
  const frame=window.requestAnimationFrame(()=>{if(mounted)setNavHost(document.getElementById('account-nav'));});
  supabase.auth.getUser().then(({data,error})=>{if(mounted){setUser(error?null:data.user);setReady(true);}}).catch(()=>{if(mounted){setMessage('Could not check your account. Retry by refreshing.');setReady(true);}});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(event==='PASSWORD_RECOVERY'){setMode('new-password');setOpen(true);}
   if(mounted){setUser(session?.user??null);if(event==='SIGNED_OUT'){setItems([]);setActive('');}}
  });
  return ()=>{mounted=false;window.cancelAnimationFrame(frame);subscription.unsubscribe();};
 },[]);
 const userId=user?.id;
 useEffect(()=>{let cancelled=false;
  async function load(){
   if(!userId){setItems([]);return;}
   const {data,error}=await supabase.from('properties').select('id,title,kind,payload,updated_at').order('updated_at',{ascending:false});
   if(cancelled)return;
   if(error)setMessage('Could not load saved properties. Please retry.');else setItems((data??[]) as Saved[]);
  }
  void load();return ()=>{cancelled=true;};
 },[userId]);
 async function submitAuth(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');
  try {
   if(mode==='signup'){
    const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin+'/'}});
    if(error)throw error;
    setMessage(data.session?'Account created. You are signed in.':'Check your email for the confirmation link, then come back to sign in.');
   }else if(mode==='reset'){
    const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/'});
    if(error)throw error;setMessage('If this email has an account, a reset link is on its way.');
   }else if(mode==='new-password'){
    const {error}=await supabase.auth.updateUser({password});if(error)throw error;
    setPassword('');setMode('signin');setMessage('Password updated.');
   }else{
    const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;
    setPassword('');setMessage('Signed in. Your properties are loading.');
   }
  }catch(err){setMessage(err instanceof Error?err.message:'Could not complete sign in.');}finally{setBusy(false);}
 }
 async function save(copy:boolean){if(!user)return;setBusy(true);setMessage('');
  try {
   const input={user_id:user.id,title:(title||'Untitled property').slice(0,300),kind,payload,updated_at:new Date().toISOString()};
   const query=active&&!copy?supabase.from('properties').update(input).eq('id',active).eq('user_id',user.id).select('id').single():supabase.from('properties').insert(input).select('id').single();
   const {data,error}=await query;if(error)throw error;if(!data)throw Error('Property was not saved.');
   const {data:all,error:loadError}=await supabase.from('properties').select('id,title,kind,payload,updated_at').order('updated_at',{ascending:false});
   if(loadError)throw loadError;setItems((all??[]) as Saved[]);setActive(data.id);setMessage('Saved to your account.');
  }catch(err){setMessage(err instanceof Error?err.message:'Save failed. Your inputs are still here.');}finally{setBusy(false);}
 }
 const matching=items.filter(p=>p.kind===kind);
 const account=<section className={`panel saved-properties${open?' account-open':''}`}><button className="account-toggle" type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><span className="eyebrow">YOUR ACCOUNT</span><span className="account-chevron" aria-hidden="true">{open?'−':'+'}</span></button>{open&&<div className="account-details"><h3>{user?'My saved properties':'Sign in to save properties'}</h3>{user&&<div className="account-signout"><Button variant="outline" onClick={async()=>{await supabase.auth.signOut();setMessage('Signed out.');}}>Sign out</Button></div>}
 {!ready?<p role="status">Checking your account…</p>:!user?<><p>Use your email and password to save properties privately and open them on another device.</p><form className="account-form" onSubmit={submitAuth}>
 {mode!=='new-password'&&<label>Email<Input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}
 {mode!=='reset'&&<label>{mode==='new-password'?'New password':'Password'}<Input type="password" autoComplete={mode==='signup'?'new-password':mode==='signin'?'current-password':'new-password'} minLength={6} required value={password} onChange={e=>setPassword(e.target.value)}/></label>}
 <Button disabled={busy} type="submit">{busy?'Please wait…':mode==='signup'?'Create account':mode==='reset'?'Email reset link':mode==='new-password'?'Save new password':'Sign in'}</Button></form>
 <div className="account-switch">{mode!=='signin'&&<button type="button" onClick={()=>{setMode('signin');setMessage('');}}>Sign in</button>}{mode!=='signup'&&mode!=='new-password'&&<button type="button" onClick={()=>{setMode('signup');setMessage('');}}>Create account</button>}{mode!=='reset'&&mode!=='new-password'&&<button type="button" onClick={()=>{setMode('reset');setMessage('');}}>Forgot password?</button>}</div></>:<><p>Signed in as {user.email}. Only you can access these saved properties.</p><div className="saved-actions"><label>Saved properties in this calculator<select aria-label="Saved properties" value={active} onChange={e=>{const p=matching.find(p=>p.id===e.target.value);setActive(e.target.value);if(p){onLoad(p.payload);setMessage('Property loaded.');}}}><option value="">Choose a saved property</option>{matching.map(p=><option key={p.id} value={p.id}>{p.title} · {new Date(p.updated_at).toLocaleDateString()}</option>)}</select></label><Button disabled={busy} onClick={()=>save(false)}>{busy?'Saving…':active?'Update saved property':'Save property'}</Button>{active&&<Button variant="outline" disabled={busy} onClick={()=>save(true)}>Save as new property</Button>}</div>{!matching.length&&<p>No saved properties yet. Edit the inputs below, then save your first property.</p>}</>}
 <p role="status" aria-live="polite">{message}</p></div>}</section>;
 return navHost?createPortal(account,navHost):null;
}
