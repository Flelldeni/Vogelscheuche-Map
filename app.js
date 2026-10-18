import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
const $=id=>document.getElementById(id), configured=SUPABASE_URL.startsWith('https://') && !SUPABASE_ANON_KEY.startsWith('DEIN_');
const db=configured?createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;
const imageWidth=4866,imageHeight=3250;
const map=L.map('map',{crs:L.CRS.Simple,minZoom:-3,maxZoom:5,zoomSnap:0.25,zoomDelta:0.5,attributionControl:false});
const bounds=[[0,0],[imageHeight,imageWidth]];
L.imageOverlay('./gesamtkarte.webp',bounds).addTo(map);
map.fitBounds(bounds);map.setMaxBounds([[-300,-300],[imageHeight+300,imageWidth+300]]);
function pointPosition(p){return {x:p.x,y:p.y}}
const markerColors = {
  red: '#e53935',
  blue: '#2988ef',
  green: '#28a75a',
  yellow: '#e8b52b',
  purple: '#a35bd8',
  orange: '#ef8530'
};

function coloredIcon(color) {
  const fill = markerColors[color] || markerColors.red;
  return L.divIcon({
    className: 'colored-marker',
    html: `<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 2C7 2 2 8 2 16c0 11 13 24 13 24s13-13 13-24C28 8 23 2 15 2Z"
        fill="${fill}" stroke="#29251f" stroke-width="2"/>
      <circle cx="15" cy="16" r="5" fill="#fff"/>
    </svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 40],
    popupAnchor: [0, -35]
  });
}
let points=[],markers=[],isAdmin=false,placing=false,editing=null,location=null;
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function status(s){$('status').textContent=s}
function render(){markers.forEach(m=>map.removeLayer(m));markers=[];const q=$('search').value.trim().toLocaleLowerCase();for(const p of points){if(q && !(p.name+' '+(p.beschreibung||'')).toLocaleLowerCase().includes(q))continue;const pos=pointPosition(p);const marker=L.marker([pos.y,pos.x],{icon:coloredIcon(p.farbe)}).addTo(map);const content=document.createElement('div');content.innerHTML=`<h3>${escapeHtml(p.name)}</h3><p style="white-space:pre-wrap">${escapeHtml(p.beschreibung||'')}</p>`;if(isAdmin){const b=document.createElement('button');b.textContent='Bearbeiten';b.onclick=()=>openEdit(p);content.append(b)}marker.bindPopup(content);markers.push(marker)}}
async function load(){if(!db){status('Demo · Datenbank noch nicht verbunden');return}const {data,error}=await db.from('fundorte').select('id,name,beschreibung,x,y,farbe').order('erstellt_am',{ascending:true});if(error){status('Laden fehlgeschlagen');console.error(error);return}points=data||[];render();status(`${points.length} Fundorte`)}
async function auth(){if(!db)return;const {data:{user}}=await db.auth.getUser();let allowed=false;if(user){const {data,error}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();allowed=!error&&!!data}isAdmin=allowed;$('loginBtn').hidden=allowed;$('logoutBtn').hidden=!user;$('addBtn').hidden=!allowed;if(user&&!allowed)status('Angemeldet, aber kein Admin-Zugriff');else status(`${points.length} Fundorte${allowed?' · Admin':''}`);render()}
$('loginBtn').onclick=()=>{if(!db){alert('Bitte zuerst config.js und Supabase einrichten. Siehe README.');return}$('loginError').textContent='';$('loginDialog').showModal()};
$('loginForm').onsubmit=async e=>{e.preventDefault();const {error}=await db.auth.signInWithPassword({email:$('email').value,password:$('password').value});if(error){$('loginError').textContent=error.message;return}$('loginDialog').close();$('password').value='';await auth()};
$('logoutBtn').onclick=async()=>{await db.auth.signOut();placing=false;await auth()};
$('addBtn').onclick=()=>{placing=!placing;$('addBtn').textContent=placing?'Abbrechen':'＋ Fundort setzen';$('hint').textContent=placing?'Jetzt auf die gewünschte Stelle der Karte klicken':'Karte mit Mausrad oder + / − zoomen · Marker anklicken'};
map.on('click',e=>{if(!placing||!isAdmin)return;placing=false;$('addBtn').textContent='＋ Fundort setzen';location={x:Math.max(0,Math.min(imageWidth,e.latlng.lng)),y:Math.max(0,Math.min(imageHeight,e.latlng.lat))};openEdit(null)});
function openEdit(p){if(!isAdmin)return;editing=p;location=p?pointPosition(p):location;$('editTitle').textContent=p?'Fundort bearbeiten':'Fundort hinzufügen';$('pointTitle').value=p?.name||'';$('pointDesc').value=p?.beschreibung||'';$('pointColor').value=p?.farbe||'red';$('coords').textContent=`${Math.round(location.x)}, ${Math.round(location.y)}`;$('deleteBtn').hidden=!p;$('editError').textContent='';$('editDialog').showModal()}
$('editForm').onsubmit=async e=>{e.preventDefault();if(!isAdmin)return;const payload={name:$('pointTitle').value.trim(),beschreibung:$('pointDesc').value.trim(),x:location.x,y:location.y,
farbe:$('pointColor').value};if(!payload.name)return;const res=editing?await db.from('fundorte').update(payload).eq('id',editing.id):await db.from('fundorte').insert(payload);if(res.error){$('editError').textContent=res.error.message;return}$('editDialog').close();await load();await auth()};
$('deleteBtn').onclick=async()=>{if(!editing||!isAdmin||!confirm('Diesen Fundort wirklich löschen?'))return;const {error}=await db.from('fundorte').delete().eq('id',editing.id);if(error){$('editError').textContent=error.message;return}$('editDialog').close();await load();await auth()};
$('search').oninput=render;document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
if(db){await load();await auth();db.auth.onAuthStateChange(()=>{setTimeout(auth,0)})}else status('Demo · Supabase einrichten');
