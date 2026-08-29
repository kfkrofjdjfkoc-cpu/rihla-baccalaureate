const ADMIN_PASS = '7384';
const TRACKS={
'الطب وعلوم الحياة':['اللغة العربية','اللغة الإنجليزية','التاريخ','الفيزياء','الرياضيات'],
'الهندسة وعلوم الحاسب':['اللغة العربية','اللغة الإنجليزية','التاريخ','الكيمياء','البرمجة'],
'الأعمال':['اللغة العربية','اللغة الإنجليزية','التاريخ','المحاسبة','إدارة الأعمال'],
'الآداب والفنون':['اللغة العربية','اللغة الإنجليزية','التاريخ','علم النفس','الفرنساوي']};
const ICONS={'اللغة العربية':'📖','اللغة الإنجليزية':'🇬🇧','التاريخ':'🏛️','الفيزياء':'⚡','الرياضيات':'📐','الكيمياء':'🧪','البرمجة':'💻','المحاسبة':'📊','إدارة الأعمال':'💼','علم النفس':'🧠','الفرنساوي':'🇫🇷'};
const defaultLessons={'اللغة العربية':['العلم بين القانون والضمير','الأسماء الخمسة'],'اللغة الإنجليزية':['Unit 1 - Section A','Unit 1 - Section B'],'التاريخ':['بناء الدولة المصرية'],'الفيزياء':['المتجهات والسرعة النسبية'],'الرياضيات':['نظرية ذات الحدين'],'الكيمياء':['تغيرات الحالة'],'البرمجة':['تطور تكنولوجيا المعلومات والتحول الرقمي'],'المحاسبة':['مقدمة في المحاسبة'],'إدارة الأعمال':['مقدمة في إدارة الأعمال'],'علم النفس':['مدخل إلى علم النفس'],'الفرنساوي':['Leçon 1']};
const defaultData={subjects:Object.entries(defaultLessons).map(([name,ls],i)=>({id:i+1,icon:ICONS[name]||'📚',name,lessons:ls.map(x=>({title:x,video:''}))})),exams:[
{id:1,title:'اختبار عربي — العلم بين القانون والضمير',info:'10 أسئلة • 15 دقيقة',tracks:Object.keys(TRACKS),questions:[{q:'الفكرة الأساسية للدرس هي...',opts:['أهمية العلم مع المسؤولية','أهمية الرياضة','تاريخ مصر القديم'],a:0}]},
{id:2,title:'اختبار فيزياء — المتجهات والسرعة النسبية',info:'15 سؤالًا • 20 دقيقة',tracks:['الطب وعلوم الحياة'],questions:[{q:'الكمية المتجهة تتميز بـ...',opts:['المقدار فقط','المقدار والاتجاه','الوحدة فقط'],a:1}]}
],
announcement:{title:'تابع المنصة يوميًا',text:'سيتم إضافة الدروس والامتحانات الجديدة تباعًا.'}};
let data=loadData(),currentExam=null,currentUser=null,isAdminLoggedIn=false;
function clone(x){return JSON.parse(JSON.stringify(x))}
function migrate(d){d=d||clone(defaultData);d.subjects=(d.subjects||[]).map(s=>({...s,lessons:(s.lessons||[]).map(l=>typeof l==='string'?{title:l,video:''}:l)}));return d}
function loadData(){try{return migrate(JSON.parse(localStorage.getItem('rb_data'))||clone(defaultData))}catch(e){return clone(defaultData)}}
function save(){localStorage.setItem('rb_data',JSON.stringify(data));render();adminRender();toast('تم الحفظ بنجاح ✅')}
function users(){try{return JSON.parse(localStorage.getItem('rb_users')||'[]')}catch(e){return[]}}
function saveUsers(u){localStorage.setItem('rb_users',JSON.stringify(u))}
function show(id){document.querySelectorAll('main>section').forEach(x=>x.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');scrollTo(0,0)}
function authMode(m){loginForm.classList.toggle('hidden',m!=='login');registerForm.classList.toggle('hidden',m!=='register');loginTab.className=m==='login'?'primary':'ghost';registerTab.className=m==='register'?'primary':'ghost';authError('')}
function authError(x){authErrorEl.textContent=x;authErrorEl.style.display=x?'block':'none'}
const authErrorEl=document.getElementById('authError');
function pickTrack(el){document.querySelectorAll('.track-option').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');regTrack.value=el.dataset.track}
function register(){
let name=regName.value.trim(),phone=normalizePhone(regPhone.value),p=regPassword.value,p2=regPassword2.value,track=regTrack.value;
if(!name||!phone||!p||!p2||!track)return authError('من فضلك أكمل الاسم والرقم وكلمة المرور والمسار.');
if(phone.length<8)return authError('رقم الهاتف غير صحيح.');
if(p.length<6)return authError('كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل.');
if(p!==p2)return authError('تأكيد كلمة المرور غير مطابق.');
let u=users();if(u.some(x=>x.phone===phone))return authError('هذا الرقم مسجل بالفعل. سجّل الدخول.');
let user={id:Date.now(),name,phone,password:p,track,scores:[],progress:0,isAdmin:false};u.push(user);saveUsers(u);localStorage.setItem('rb_session',JSON.stringify(user));enter(user)
}
function login(){let phone=normalizePhone(loginPhone.value),p=loginPassword.value,u=users().find(x=>x.phone===phone&&x.password===p);if(!u)return authError('رقم الهاتف أو كلمة المرور غير صحيحة.');localStorage.setItem('rb_session',JSON.stringify(u));enter(u)}
function normalizePhone(x){return String(x||'').replace(/[\s\-()]/g,'').replace(/^00/,'+')}
function enter(u){currentUser=u;authScreen.classList.add('hidden');render();adminRender()}
function logout(){currentUser=null;isAdminLoggedIn=false;localStorage.removeItem('rb_session');authScreen.classList.remove('hidden');authMode('login');document.getElementById('adminNavBtn').classList.add('hidden')}
function trackSubjects(){return TRACKS[currentUser?.track]||[]}
function render(){
let names=trackSubjects(),allowed=new Set(names);
subjectGrid.innerHTML=data.subjects.filter(s=>allowed.has(s.name)).map(s=>`<div class="card" onclick="openSubject(${s.id})" style="cursor:pointer"><div class="icon">${esc(s.icon)}</div><h3>${esc(s.name)}</h3><span class="muted">${s.lessons.length} درس</span></div>`).join('');
subjectsTrack.textContent=`المسار: ${currentUser?.track||''}`;
homeTrackText.textContent=`أنت الآن داخل مسار ${currentUser?.track||''}. الكورسات المتاحة لك تظهر تلقائيًا حسب مسارك.`;
examGrid.innerHTML=data.exams.filter(e=>!e.tracks||e.tracks.includes(currentUser?.track)).map(e=>`<div class="card"><h3>📝 ${esc(e.title)}</h3><p class="muted">${esc(e.info)}</p><button class="primary" onclick="openExam(${e.id})">ابدأ</button></div>`).join('')||'<p class="muted">لا توجد امتحانات لمسارك حاليًا.</p>';
announcementTitle.textContent=data.announcement.title;announcementText.textContent=data.announcement.text;
studentName.textContent=currentUser?.name||'';studentPhone.textContent=currentUser?.phone||'';studentTrack.textContent=currentUser?.track||'';
let scores=currentUser?.scores||[];examCount.textContent=scores.length;avgScore.textContent=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)+'/100':'—';
let progress=currentUser?.progress||0;progressText.textContent=progress+'%';progressBar.style.width=progress+'%';
if(isAdminLoggedIn||currentUser?.isAdmin) document.getElementById('adminNavBtn').classList.remove('hidden');
}
function openSubject(id){let s=data.subjects.find(x=>x.id===id);if(!s||!trackSubjects().includes(s.name))return;subjectTitle.textContent=s.icon+' '+s.name;lessonList.innerHTML=s.lessons.map((l,n)=>`<div class="card lesson-card"><b>${n+1}. ${esc(l.title)}</b><div class="muted" style="margin-top:8px">${l.video?'🎥 فيديو شرح متاح':'📘 درس'}</div>${l.video?youtubeEmbed(l.video):'<p class="muted">سيتم إضافة فيديو الشرح من الإدارة.</p>'}</div>`).join('');show('subject')}

function youtubeId(url){
if(!url) return '';
let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
let match = String(url).match(regExp);
return (match && match[2].length === 11) ? match[2] : '';
}
function youtubeEmbed(url){let id=youtubeId(url);return id?`<div class="video-wrap"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`:`<p class="muted">رابط يوتيوب غير صالح.</p>`}

function openExam(id){currentExam=data.exams.find(x=>x.id===id);if(!currentExam)return;examTitle.textContent=currentExam.title;examInfo.textContent=currentExam.info;examQuestions.innerHTML=currentExam.questions.length?currentExam.questions.map((q,i)=>`<div class="card" style="margin:12px 0"><b>${i+1}. ${esc(q.q)}</b><div style="margin-top:10px">${q.opts.map((o,j)=>`<label style="display:block;margin:8px 0"><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join('')}</div></div>`).join(''):'<p class="muted">لا توجد أسئلة مضافة بعد.</p>';show('exam')}
function finishExam(){if(!currentExam||!currentUser)return;let score=0;currentExam.questions.forEach((q,i)=>{let a=document.querySelector(`input[name=q${i}]:checked`);if(a&&Number(a.value)===q.a)score++});let pct=currentExam.questions.length?Math.round(score/currentExam.questions.length*100):0;currentUser.scores=currentUser.scores||[];currentUser.scores.push(pct);currentUser.progress=Math.min(100,Math.max(currentUser.progress||0,Math.round(((currentUser.scores.reduce((a,b)=>a+b,0)/currentUser.scores.length)/100)*100)));let u=users();let idx=u.findIndex(x=>x.id===currentUser.id);if(idx>=0)u[idx]=currentUser;saveUsers(u);localStorage.setItem('rb_session',JSON.stringify(currentUser));render();alert(`تم تسليم الاختبار 🎉\nدرجتك: ${pct}/100`);show('exams')}

function openAdminPrompt(){openAdmin()}
function openAdmin(){
if(isAdminLoggedIn || currentUser?.isAdmin){ show('admin'); adminTab('subjects'); return; }
const pass=prompt('🔐 كلمة مرور الأدمن:');
if(pass===ADMIN_PASS){
isAdminLoggedIn=true;
document.getElementById('adminNavBtn').classList.remove('hidden');
show('admin');
adminTab('subjects');
}else if(pass!==null){ alert('كلمة المرور غير صحيحة ❌'); }
}

function adminTab(tab){['subjects','videos','exams','users','settings'].forEach(x=>{let el=document.getElementById('admin'+x[0].toUpperCase()+x.slice(1));if(el)el.classList.toggle('hidden',x!==tab);let b=document.getElementById('tab'+x[0].toUpperCase()+x.slice(1));if(b)b.classList.toggle('active',x===tab)});adminRender()}
function adminRender(){
adminSubjects.innerHTML=`<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2>📚 المواد والدروس</h2></div><div class="grid">${data.subjects.map(s=>`<div class="card"><div class="row" style="justify-content:space-between"><div class="icon">${esc(s.icon)}</div><div><button class="small primary" onclick="addLessonPrompt(${s.id})">+ إضافة درس</button> <button class="small ghost" onclick="editSubject(${s.id})">تعديل المادة</button></div></div><h3>${esc(s.name)}</h3><p class="muted">${s.lessons.length} درس</p>${s.lessons.map((l,i)=>`<div class="row" style="justify-content:space-between;border-top:1px solid #edf0f5;padding:9px 0"><span>${esc(l.title)} ${l.video?'🎥':''}</span><button class="small ghost" onclick="editLesson(${s.id},${i})">✏️</button></div>`).join('')}</div>`).join('')}</div>`;
adminVideos.innerHTML=`<div class="card"><h2>🎥 إضافة فيديو شرح من YouTube</h2><p class="muted">اختر المسار والمادة والدرس ثم ضع رابط YouTube.</p><div class="form"><label>المسار<select id="vTrack" onchange="fillVideoSubjects()">${Object.keys(TRACKS).map(t=>`<option>${esc(t)}</option>`).join('')}</select></label><label>المادة<select id="vSubject" onchange="fillVideoLessons()"></select></label><label>الدرس<select id="vLesson"></select></label><input id="vTitle" placeholder="عنوان الدرس (اختياري)"><input id="vUrl" placeholder="رابط فيديو YouTube"><button class="primary" onclick="saveVideo()">💾 حفظ الفيديو</button></div><div id="videoPreview" style="margin-top:16px"></div></div><div class="card" style="margin-top:14px"><h3>الفيديوهات المضافة</h3><div id="videoList"></div></div>`;
adminExams.innerHTML=`<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2>📝 الامتحانات</h2><button class="primary" onclick="addExamBuilder()">+ إضافة امتحان جديد</button></div><div class="grid">${data.exams.map(x=>`<div class="card"><h3>${esc(x.title)}</h3><p class="muted">${esc(x.info)} • ${x.questions.length} سؤال</p><div class="row"><button class="small ghost" onclick="editExamBuilder(${x.id})">تعديل</button><button class="small danger" onclick="deleteExam(${x.id})">حذف</button></div></div>`).join('')}</div>`;

let allUsers = users();
adminUsers.innerHTML=`<div class="card"><h2>👥 تفاصيل حسابات الطلاب المسجلين (${allUsers.length})</h2>
<table class="user-table"><thead><tr><th>الاسم</th><th>الهاتف</th><th>المسار</th><th>الدرجات</th></tr></thead>
<tbody>${allUsers.map(u=>`<tr><td><b>${esc(u.name)}</b></td><td>${esc(u.phone)}</td><td>${esc(u.track)}</td><td>${u.scores&&u.scores.length?u.scores.join(', '):'لم يمتحن'}</td></tr>`).join('')}</tbody></table></div>`;

adminSettings.innerHTML=`<div class="card"><h2>⚙️ إعدادات المنصة</h2><div class="form"><label>عنوان الإعلان<input id="setAnnTitle" value="${attr(data.announcement.title)}"></label><label>نص الإعلان<textarea id="setAnnText">${esc(data.announcement.text)}</textarea></label><button class="primary" onclick="saveSettings()">حفظ الإعدادات</button><button class="danger" onclick="resetData()">إرجاع محتوى المنصة الافتراضي</button><p class="muted">كلمة مرور الأدمن: ${ADMIN_PASS}</p></div></div>
<div class="card" style="margin-top:14px"><h2>📥 تصدير واستيراد بيانات الدروس والامتحانات</h2><p class="muted">انسخ الكود بالأسفل لترفعه على النسخة العامة أو ألصق كود البيانات المحدثة هنا:</p><div class="form"><textarea id="exportData" readonly style="font-size:11px">${JSON.stringify(data)}</textarea><button class="ghost" onclick="navigator.clipboard.writeText(exportData.value);toast('تم نسخ كود البيانات!')">📋 نسخ بيانات المنصة</button><hr><textarea id="importData" placeholder="ألصق كود البيانات الجديد هنا لاستيراده..."></textarea><button class="primary" onclick="importPlatformData()">📥 استيراد وتحديث المنصة</button></div></div>`;
if(document.getElementById('vSubject')){fillVideoSubjects();renderVideoList()}
}

function addLessonPrompt(subjectId){
let s = data.subjects.find(x=>x.id===subjectId);
if(!s) return;
let title = prompt(`أدخل عنوان الدرس الجديد لـ (${s.name}):`);
if(title && title.trim()){
let url = prompt('رابط فيديو YouTube (اختياري - يمكنك تركه فارغاً):');
s.lessons.push({title: title.trim(), video: url ? url.trim() : ''});
save();
alert('تمت إضافة الدرس بنجاح! ✅');
}
}

function importPlatformData(){
try {
let parsed = JSON.parse(val('importData'));
if(parsed && parsed.subjects && parsed.exams){
data = migrate(parsed);
save();
alert('تم استيراد البيانات وتحديث المنصة بنجاح! 🎉');
} else { alert('الكود غير صالح ❌'); }
} catch(e){ alert('حدث خطأ أثناء استيراد البيانات! ❌'); }
}

let tempQuestions = [];
function addExamBuilder(){ tempQuestions = []; openExamModal(null); }
function editExamBuilder(id){ let e = data.exams.find(x=>x.id===id); tempQuestions = clone(e.questions||[]); openExamModal(e); }

function openExamModal(examObj){
let isEdit = !!examObj;
let ts = examObj ? examObj.tracks : Object.keys(TRACKS);
let html = `<div class="form">
<input id="builderTitle" placeholder="عنوان الامتحان" value="${attr(examObj?.title||'')}">
<input id="builderInfo" placeholder="معلومات (مثال: 10 أسئلة • 15 دقيقة)" value="${attr(examObj?.info||'10 أسئلة • 15 دقيقة')}">
<label>المسارات المتاح لها الامتحان: <select id="builderTracks" multiple size="4">
${Object.keys(TRACKS).map(t=>`<option value="${attr(t)}" ${ts.includes(t)?'selected':''}>${esc(t)}</option>`).join('')}
</select></label>
<div style="border-top:1px solid #ddd;padding-top:10px">
<h3>الأسئلة الحالية:</h3>
<div id="qList"></div>
<button class="ghost" onclick="addSingleQuestion()">+ إضافة سؤال جديد</button>
</div>
<button class="primary" onclick="saveExamFromBuilder(${isEdit?examObj.id:null})">💾 حفظ الامتحان بالكامل</button>
</div>`;
modal(isEdit?'تعديل الامتحان التفاعلي':'إضافة امتحان تفاعلي', html);
renderQuestionsList();
}

function renderQuestionsList(){
let qList = document.getElementById('qList');
if(!qList) return;
qList.innerHTML = tempQuestions.map((q, i)=>`<div class="card" style="margin:8px 0;background:#f9fbfd">
<b>س${i+1}: ${esc(q.q)}</b>
<div class="muted">الاختيارات: ${q.opts.map((o,idx)=>idx===q.a?`<u><b>${esc(o)} (صح)</b></u>`:esc(o)).join(' | ')}</div>
<button class="small danger" onclick="tempQuestions.splice(${i},1);renderQuestionsList()">حذف السؤال</button>
</div>`).join('') || '<p class="muted">لا توجد أسئلة مضافة بعد.</p>';
}

function addSingleQuestion(){
let qText = prompt('اكتب نص السؤال:');
if(!qText) return;
let o1 = prompt('الاختيار الأول:');
let o2 = prompt('الاختيار الثاني:');
let o3 = prompt('الاختيار ا��ثالث:');
let correct = prompt('رقم الإجابة الصحيحة (1 أو 2 أو 3):');
let cIdx = (parseInt(correct)-1) || 0;
if(qText && o1 && o2){
tempQuestions.push({q: qText, opts:[o1, o2, o3||''], a: cIdx});
renderQuestionsList();
}
}

function saveExamFromBuilder(id){
let title = val('builderTitle');
let info = val('builderInfo');
let ts = [...document.getElementById('builderTracks').selectedOptions].map(o=>o.value);
if(!title) return alert('أدخل عنوان الامتحان.');
if(!tempQuestions.length) return alert('أضف سؤالاً واحداً على الأقل.');

let obj = {
id: id === null ? Date.now() : id,
title: title,
info: info,
tracks: ts.length ? ts : Object.keys(TRACKS),
questions: tempQuestions
};

if(id === null) data.exams.push(obj);
else data.exams[data.exams.findIndex(x=>x.id===id)] = obj;
closeModal();
save();
}

function fillVideoSubjects(){let t=vTrack.value;vSubject.innerHTML=TRACKS[t].map(n=>`<option>${esc(n)}</option>`).join('');fillVideoLessons()}
function fillVideoLessons(){let s=data.subjects.find(x=>x.name===vSubject.value);vLesson.innerHTML=(s?.lessons||[]).map((l,i)=>`<option value="${i}">${i+1}. ${esc(l.title)}</option>`).join('')}
function saveVideo(){
let s=data.subjects.find(x=>x.name===vSubject.value),i=Number(vLesson.value),url=vUrl.value.trim();if(!s||!s.lessons[i])return toast('اختر مادة ودرسًا.');if(!youtubeId(url))return alert('ضع رابط YouTube صحيحًا.');if(vTitle.value.trim())s.lessons[i].title=vTitle.value.trim();s.lessons[i].video=url;save();renderVideoList();vUrl.value='';vTitle.value='';videoPreview.innerHTML=youtubeEmbed(url);alert('تمت إضافة الفيديو بنجاح 🎥')
}
function renderVideoList(){let box=document.getElementById('videoList');if(!box)return;let arr=[];data.subjects.forEach(s=>s.lessons.forEach((l,i)=>{if(l.video)arr.push(`<div class="card" style="margin:8px 0"><b>${esc(s.name)} — ${esc(l.title)}</b><div class="muted">${esc(l.video)}</div><button class="small danger" onclick="removeVideo(${s.id},${i})">حذف الفيديو</button></div>`)}));box.innerHTML=arr.join('')||'<p class="muted">لم تتم إضافة فيديوهات بعد.</p>'}
function removeVideo(id,i){if(confirm('حذف الفيديو من هذا الدرس؟')){let s=data.subjects.find(x=>x.id===id);if(s){s.lessons[i].video='';save();renderVideoList()}}}
function editSubject(id){let s=data.subjects.find(x=>x.id===id);modal('تعديل المادة',`<div class="form"><input id="fIcon" value="${attr(s.icon)}"><input id="fName" value="${attr(s.name)}"><button class="primary" onclick="saveSubject(${id})">حفظ</button></div>`)}
function saveSubject(id){let s=data.subjects.find(x=>x.id===id);s.icon=val('fIcon')||'📚';s.name=val('fName');closeModal();save()}
function editLesson(id,i){let s=data.subjects.find(x=>x.id===id),l=s.lessons[i];modal('تعديل الدرس والفيديو',`<div class="form"><input id="fLesson" value="${attr(l.title)}"><input id="fVideo" value="${attr(l.video||'')}" placeholder="رابط YouTube (اختياري)"><button class="primary" onclick="saveLesson(${id},${i})">حفظ</button><button class="danger" onclick="deleteLesson(${id},${i})">حذف الدرس</button></div>`)}
function saveLesson(id,i){let s=data.subjects.find(x=>x.id===id);let url=val('fVideo');if(url&&!youtubeId(url))return alert('رابط YouTube غير صالح.');s.lessons[i]={title:val('fLesson')||'درس جديد',video:url};closeModal();save()}
function deleteLesson(id,i){let s=data.subjects.find(x=>x.id===id);s.lessons.splice(i,1);closeModal();save()}
function deleteExam(id){if(confirm('حذف الامتحان؟')){data.exams=data.exams.filter(x=>x.id!==id);save()}}
function saveSettings(){data.announcement.title=val('setAnnTitle');data.announcement.text=val('setAnnText');save()}
function resetData(){if(confirm('إرجاع محتوى المنصة الافتراضي؟')){data=clone(defaultData);save()}}
function modal(title,body){modalEl.innerHTML=`<div class="modal-box"><div class="row" style="justify-content:space-between"><h2>${title}</h2><button class="ghost" onclick="closeModal()">✕</button></div>${body}</div>`;modalEl.classList.remove('hidden')}
function closeModal(){modalEl.classList.add('hidden')}
function val(id){return document.getElementById(id)?.value.trim()||''}
function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]||m))}
function attr(x){return esc(x)}
function toast(t){toastEl.textContent=t;toastEl.style.display='block';clearTimeout(window.tt);window.tt=setTimeout(()=>toastEl.style.display='none',1800)}
const modalEl=document.getElementById('modal'),toastEl=document.getElementById('toast');
let sess;try{sess=JSON.parse(localStorage.getItem('rb_session')||'null')}catch(e){}
if(sess){enter(sess)}else{authScreen.classList.remove('hidden');authMode('login')}
render();adminRender();