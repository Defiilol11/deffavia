import{a as ge}from"./chunk-MQNFJAXE.js";import{b as K,c as x,d as X,e as Z,f as ee,g as te,h as ie,i as ae,j as ne,k as re,l as oe,n as se,o as le,p as de}from"./chunk-7Q6FKJSB.js";import{a as ce}from"./chunk-7XHAKTS5.js";import{h as G}from"./chunk-S3F4RVEX.js";import{a as me,b as pe,c as ue}from"./chunk-T3WYWSFN.js";import{a as Y,b as J}from"./chunk-J4XJSV5I.js";import{Ca as D,Ga as g,Hb as H,Ib as $,Jb as j,Lb as B,Mb as Q,N as P,Qa as d,Ra as a,Rb as U,S as f,Sa as t,Ta as E,Wa as w,X as b,Xa as h,Y as C,Ya as p,a as N,b as V,c as z,db as r,ea as _,eb as v,fb as S,gb as W,hb as M,ib as A,jb as O,kb as L,ob as q,qa as T,qb as F,rb as R,ta as o}from"./chunk-SNJBHCNB.js";var I=class n{http=f(U);buildQuoteHtml(i,e){let s=e.reduce((l,c)=>l+c.total,0);return`
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <style>
      :root {
        --bg: #ffffff;
        --panel: #ffffff;
        --border: #e5e7eb;
        --text: #111827;
        --text-weak: #4b5563;
        --muted: #6b7280;

        --accent-yellow: #ffd166;
        --accent-pink:   #ef476f;
        --accent-purple: #7c3aed;

        --focus-ring: rgba(124, 58, 237, .35);
        --table-head: #f9fafb;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #0b1020;
          --panel: #0f172a;
          --border: #1f2937;
          --text: #f8fafc;
          --text-weak: #cbd5e1;
          --muted: #94a3b8;
          --table-head: #0b1328;
        }
      }

      body {
        margin:0; padding:0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
        background: var(--bg);
        color: var(--text);
      }

      .wrap {
        max-width:700px;
        margin:24px auto;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 8px 24px rgba(0,0,0,.08);
        border:1px solid var(--border);
        background: var(--panel);
      }

      .head {
        background: linear-gradient(90deg, var(--accent-purple), var(--accent-pink));
        color: #fff;
        padding: 20px 24px;
        font-weight:800;
        font-size:1.4rem;
        text-align:center;
        position:relative;
      }

      .head::after {
        content: "\u2708\uFE0F";
        position:absolute;
        right:16px;
        top:50%;
        transform: translateY(-50%);
        font-size:1.6rem;
      }

      .body {
        padding:20px 24px;
      }

      p { margin:0 0 16px 0; line-height:1.5; }

      table {
        width:100%;
        border-collapse: collapse;
        margin-top:10px;
      }

      th, td {
        padding:12px 8px;
        border-bottom:1px solid var(--border);
        text-align:left;
        font-size:.95rem;
      }

      th {
        background: var(--table-head);
        font-weight:600;
        color: var(--text-weak);
      }

      tfoot td {
        font-weight:800;
      }

      .muted {
        color: var(--muted);
        font-size:.85rem;
        margin-top:20px;
      }

      .btn {
        display:inline-block;
        background: var(--accent-yellow);
        color:#111827;
        font-weight:700;
        padding: 10px 18px;
        border-radius: 10px;
        text-decoration:none;
        margin-top:20px;
      }
      .btn:hover { filter: brightness(0.95); }

    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="head">Deffavia \u2014 Cotizaci\xF3n de vuelo</div>
      <div class="body">
        <p>Hola <strong>${i}</strong>,</p>
        <p>\xA1Tu aventura a\xE9rea te espera! Aqu\xED est\xE1 el detalle de tu cotizaci\xF3n:</p>
        <table>
          <thead>
            <tr>
              <th>Asiento</th><th>Pasajero</th><th>CUI</th><th style="text-align:right">Total (Q)</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(l=>`
                  <tr>
                    <td>${l.seatCode}</td>
                    <td>${l.passengerName}</td>
                    <td>${l.cui}</td>
                    <td style="text-align:right">${l.total.toFixed(2)}</td>
                  </tr>
                `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align:right">Total</td>
              <td style="text-align:right">Q ${s.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <p class="muted">Este es un correo de prueba. Para env\xEDo real, usa el bot\xF3n \u201CEnviar correo\u201D.</p>
        <a class="btn" href="#">Ver mi reserva</a>
      </div>
    </div>
  </body>
  </html>
  `}sendQuoteViaApi(i,e,s="Deffavia \u2014 Cotizaci\xF3n de reserva"){return this.http.post(me.mailEndpoint,{toEmail:i,html:e,subject:s})}static \u0275fac=function(e){return new(e||n)};static \u0275prov=P({token:n,factory:n.\u0275fac,providedIn:"root"})};var xe=(n,i)=>({"bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300":n,"bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300":i});function be(n,i){n&1&&(a(0,"div",22),r(1," Ingrese una cantidad v\xE1lida (m\xEDnimo 1). "),t())}function Ce(n,i){if(n&1&&(a(0,"div",23)(1,"div",24),r(2),t()()),n&2){let e=p();o(),d("ngClass",q(4,xe,e.canProceed(),!e.canProceed())),o(),M(" Disponibles en ",e.cfgForm.value.seatClass,": ",e.availableCount()," \xB7 Requeridos: ",e.cfgForm.value.count," ")}}function _e(n,i){if(n&1&&(a(0,"div",22),r(1),t()),n&2){let e=p();o(),v(e.availError)}}function Ee(n,i){if(n&1){let e=w();a(0,"div",25)(1,"div",26),r(2),t(),a(3,"div",27)(4,"app-seat-map",28),L("selectedCodesChange",function(l){b(e);let c=p();return O(c.selectedCodes,l)||(c.selectedCodes=l),C(l)}),t()(),a(5,"div",29)(6,"button",30),h("click",function(){b(e);let l=p();return C(l.goToPassengersManual())}),r(7," Continuar "),t(),a(8,"button",31),h("click",function(){b(e);let l=p();return C(l.resetSelection())}),r(9,"Reiniciar"),t()()()}if(n&2){let e=p();o(2),W(" Selecciona ",e.requiredCount()," asiento(s) libres. Disponibles: ",e.availableCount()," "),o(2),d("pickMode",!0)("maxSelection",e.cfgForm.value.count||1)("seatClass",e.cfgForm.value.seatClass||"economy")("extraOccupiedCodes",e.localOccupied),A("selectedCodes",e.selectedCodes),d("showRecommendations",!0),o(2),d("disabled",e.selectedCodes.length!==(e.cfgForm.value.count||1))}}function Se(n,i){n&1&&(a(0,"div",22),r(1," Ingresa un nombre v\xE1lido (m\xEDnimo 3 caracteres). "),t())}function ye(n,i){if(n&1&&(a(0,"div",22),r(1),t()),n&2){let e=p(2);o(),v(e.cuiError)}}function we(n,i){if(n&1&&(a(0,"p",39),r(1),t()),n&2){let e=p(2);o(),v(e.lastMessage)}}function Ie(n,i){if(n&1){let e=w();a(0,"div",32)(1,"form",33),h("ngSubmit",function(){b(e);let l=p();return C(l.confirmOne())}),a(2,"div",5)(3,"div")(4,"label",6),r(5),t(),E(6,"input",34),g(7,Se,2,0,"div",8),t(),a(8,"div")(9,"label",6),r(10,"CUI"),t(),E(11,"input",35),g(12,ye,2,1,"div",8),t(),a(13,"div")(14,"label",6),r(15,"\xBFLlevar\xE1 maleta?"),t(),a(16,"select",36)(17,"option",37),r(18,"S\xED"),t(),a(19,"option",37),r(20,"No"),t()()()(),a(21,"div",29)(22,"button",18),r(23,"Confirmar"),t(),a(24,"button",19),h("click",function(){b(e);let l=p();return C(l.skipCurrent())}),r(25,"Saltar"),t()()(),g(26,we,2,1,"p",38),t()}if(n&2){let e=p();o(),d("formGroup",e.passengerForm),o(4),S(" ",e.cfgForm.value.mode==="manual"?"Pasajero \u2014 "+e.currentSeatCode():"Pasajero "+(e.randomIndex()+1)+"/"+(e.cfgForm.value.count||1)," "),o(2),d("ngIf",e.passengerForm.controls.name.invalid&&e.passengerForm.controls.name.touched),o(5),d("ngIf",e.cuiError),o(5),d("ngValue",!0),o(2),d("ngValue",!1),o(3),d("disabled",e.passengerForm.invalid),o(4),d("ngIf",e.lastMessage)}}function ke(n,i){if(n&1&&(a(0,"tr",47)(1,"td",57),r(2),t(),a(3,"td",57),r(4),t(),a(5,"td",57),r(6),t(),a(7,"td",58),r(8),F(9,"number"),t()()),n&2){let e=i.$implicit;o(2),v(e.seatCode),o(2),v(e.passengerName),o(2),v(e.cui),o(2),v(R(9,4,e.total,"1.2-2"))}}function ze(n,i){n&1&&(a(0,"span"),r(1,"Reenviar correo"),t())}function Fe(n,i){n&1&&(a(0,"span"),r(1,"Enviando\u2026"),t())}function Re(n,i){if(n&1&&(a(0,"span",59),r(1),t()),n&2){let e=p(2);o(),v(e.sendOk)}}function Ne(n,i){if(n&1&&(a(0,"span",22),r(1),t()),n&2){let e=p(2);o(),v(e.sendErr)}}function Ve(n,i){if(n&1&&(a(0,"div",60)(1,"h4",61),r(2),t(),E(3,"iframe",62),t()),n&2){let e=p(2);o(2),S("Vista previa del correo para ",e.userEmail),o(),d("srcdoc",e.emailHtml,T)}}function Pe(n,i){if(n&1){let e=w();a(0,"div",32)(1,"h3",40),r(2),t(),a(3,"div",41)(4,"table",42)(5,"thead",43)(6,"tr")(7,"th",44),r(8,"Asiento"),t(),a(9,"th",44),r(10,"Pasajero"),t(),a(11,"th",44),r(12,"CUI"),t(),a(13,"th",45),r(14,"Total (Q)"),t()()(),a(15,"tbody"),g(16,ke,10,7,"tr",46),t(),a(17,"tfoot")(18,"tr",47)(19,"td",48),r(20,"Total"),t(),a(21,"td",49),r(22),F(23,"number"),t()()()()(),a(24,"div",50),r(25," El correo de confirmaci\xF3n fue enviado autom\xE1ticamente por el servidor al crear la reserva. Puedes reenviarlo como prueba: "),t(),a(26,"div",51)(27,"button",52),h("click",function(){b(e);let l=p();return C(l.showEmailPreview())}),r(28,"Ver correo (preview)"),t(),a(29,"button",53),h("click",function(){b(e);let l=p();return C(l.sendEmail())}),g(30,ze,2,0,"span",54)(31,Fe,2,0,"span",54),t(),g(32,Re,2,1,"span",55)(33,Ne,2,1,"span",8),t(),g(34,Ve,4,2,"div",56),t()}if(n&2){let e=p();o(2),S("Resumen de la reserva #",e.orderId),o(14),d("ngForOf",e.reservedPersisted),o(6),S(" Q ",R(23,9,e.grandTotal,"1.2-2")," "),o(7),d("disabled",e.sending),o(),d("ngIf",!e.sending),o(),d("ngIf",e.sending),o(),d("ngIf",e.sendOk),o(),d("ngIf",e.sendErr),o(),d("ngIf",e.emailHtml)}}var ve=class n{fb=f(le);email=f(I);api=f(pe);users=f(J);reservationsApi=f(Y);router=f(G);notifications=f(ce);userEmail=this.users.currentUser()?.email||"";step=_(1);cfgForm=this.fb.group({count:[1,[x.required,x.min(1)]],seatClass:["economy",x.required],mode:["manual",x.required]});availableCount=_(0);availabilityChecked=_(!1);availError="";requiredCount=_(1);localOccupied=[];selectedCodes=[];passengerForm=this.fb.group({name:["",[x.required,x.minLength(3)]],cui:["",[x.required]],hasLuggage:[!1,[x.required]]});currentSeatCode=_("");randomIndex=_(0);lastMessage="";cuiError="";reservedDraft=[];randomPassengers=[];orderId=null;reservedPersisted=[];grandTotal=0;emailHtml="";sending=!1;sendOk="";sendErr="";canProceed(){let i=this.cfgForm.value.count||1;return this.availabilityChecked()&&this.availableCount()>=i}checkAvailability(){return z(this,null,function*(){this.availError="",this.availabilityChecked.set(!1);try{let i=yield this.api.get("/seats").toPromise(),{seatClass:e,count:s}=this.cfgForm.getRawValue(),l=new Set(i.filter(u=>u.seat_status==="active").map(u=>u.code));for(let u of this.localOccupied)l.add(u);let c=i.filter(u=>u.class===e&&!l.has(u.code)).map(u=>u.code);return this.availableCount.set(c.length),this.requiredCount.set(s||1),this.availabilityChecked.set(!0),(s||1)>c.length&&(this.availError=`No hay suficientes asientos. Libres: ${c.length}, requeridos: ${s}.`),{freeByClass:c}}catch{return this.availError="No se pudieron obtener asientos. Verifica la API.",this.availableCount.set(0),this.availabilityChecked.set(!0),{freeByClass:[]}}})}continueCfg(){return z(this,null,function*(){let{count:i,seatClass:e,mode:s}=this.cfgForm.getRawValue();if(!i||!e||!s)return;if(s==="group"){this.router.navigate(["/reservations/group"]);return}let{freeByClass:l}=yield this.checkAvailability();if(!(i>l.length)){if(s==="manual"){this.selectedCodes=[],this.step.set(2);return}this.randomPassengers=[],this.randomIndex.set(0),this.step.set(3)}})}resetSelection(){let{count:i}=this.cfgForm.getRawValue();this.selectedCodes=[],this.requiredCount.set(i||1)}goToPassengersManual(){if(this.selectedCodes.length!==(this.cfgForm.value.count||1)){alert("Selecciona todos los asientos requeridos.");return}this.reservedDraft=[],this.currentSeatCode.set(this.selectedCodes[0]),this.step.set(3)}skipCurrent(){if(this.cfgForm.value.mode==="manual"){let e=(this.selectedCodes.indexOf(this.currentSeatCode())+1)%this.selectedCodes.length;this.currentSeatCode.set(this.selectedCodes[e])}else{let i=this.randomIndex(),e=this.cfgForm.value.count||1;this.randomIndex.set((i+1)%e)}}confirmOne(){this.cuiError="";let i=this.passengerForm.getRawValue(),e=ge(i.cui||"");if(!e.valid){this.cuiError=e.reason??"";return}if(this.cfgForm.value.mode==="manual"){let s=this.currentSeatCode();this.reservedDraft.push({seatCode:s,passengerName:i.name,cui:i.cui,hasLuggage:!!i.hasLuggage}),this.localOccupied=Array.from(new Set([...this.localOccupied,s]));let l=this.selectedCodes.filter(u=>u!==s),c=new Date().toLocaleString();this.lastMessage=`Reservado (borrador) asiento ${s} el ${c}.`,l.length?(this.selectedCodes=l,this.currentSeatCode.set(l[0]),this.passengerForm.reset({name:"",cui:"",hasLuggage:!1})):this.persistAll()}else{this.randomPassengers.push({passengerName:i.name,cui:i.cui,hasLuggage:!!i.hasLuggage});let s=new Date().toLocaleString();this.lastMessage=`Pasajero ${this.randomPassengers.length} agregado el ${s}.`,this.randomPassengers.length<(this.cfgForm.value.count||1)?(this.randomIndex.set(this.randomPassengers.length),this.passengerForm.reset({name:"",cui:"",hasLuggage:!1})):this.persistAll()}}persistAll(){let i=this.cfgForm.value.mode||"manual",e=this.cfgForm.value.count||1,s=this.cfgForm.value.seatClass||"economy",l;i==="manual"?l={userEmail:this.userEmail,mode:"manual",selections:this.reservedDraft}:l={userEmail:this.userEmail,mode:"random",random:{seatClass:s,count:e,passengers:this.randomPassengers}},this.reservationsApi.createOrder(l).subscribe({next:c=>{this.orderId=c.orderId;let u=c.items??c.reservations??[];this.reservedPersisted=u.map(m=>{let y=i==="manual"?this.reservedDraft.find(k=>k.cui===m.cui):this.randomPassengers.find(k=>k.cui===m.cui);return{itemId:m.id,orderId:c.orderId,seatCode:m.seatCode,seatClass:m.seatClass,passengerName:y?.passengerName||m.passengerName||"",cui:y?.cui||m.cui||"",total:m.total}}),this.grandTotal=this.reservedPersisted.reduce((m,y)=>m+(y.total||0),0),this.emailHtml=this.email.buildQuoteHtml(this.userEmail,this.reservedPersisted.map(m=>({id:String(m.itemId),userEmail:this.userEmail,seatCode:m.seatCode,seatClass:m.seatClass,passengerName:m.passengerName,cui:m.cui,hasLuggage:!1,price:0,modifiers:0,discount:0,total:m.total,status:"active",reservedAt:new Date().toISOString(),modifiedCount:0,selectionMode:i}))),this.step.set(4);let fe=!!this.users.currentUser()?.isVip;if(c.isVip&&!fe){let m=this.users.currentUser();m&&this.users.currentUser.set(V(N({},m),{isVip:!0})),this.notifications.success("\xA1Felicidades, ahora eres VIP! \u{1F451}","Tienes 10% de descuento en todas tus reservas desde ahora.")}},error:c=>{alert(`Error al crear la reserva: ${c?.error?.error||c.message}`)}})}showEmailPreview(){!this.emailHtml&&this.reservedPersisted.length&&(this.emailHtml=this.email.buildQuoteHtml(this.userEmail,this.reservedPersisted.map(i=>({id:String(i.itemId),userEmail:this.userEmail,seatCode:i.seatCode,seatClass:i.seatClass,passengerName:i.passengerName,cui:i.cui,hasLuggage:!1,price:0,modifiers:0,discount:0,total:i.total,status:"active",reservedAt:new Date().toISOString(),modifiedCount:0,selectionMode:this.cfgForm.value.mode}))))}sendEmail(){this.sendOk="",this.sendErr="",this.sending=!0;let i=this.emailHtml;this.email.sendQuoteViaApi(this.userEmail,i).subscribe({next:()=>{this.sending=!1,this.sendOk="Correo enviado correctamente."},error:e=>{this.sending=!1,this.sendErr=`Error al enviar: ${e?.error?.error||e.message||"desconocido"}`}})}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=D({type:n,selectors:[["app-reservation-wizard"]],decls:44,vars:9,consts:[[1,"panel","grid","gap-4"],[1,"flex","items-end","justify-between","gap-3","flex-wrap"],[1,"m-0","text-2xl","font-bold","tracking-tight"],[1,"text-sm","text-zinc-600","dark:text-zinc-300"],[1,"panel",3,"ngSubmit","formGroup"],[1,"grid","gap-3","sm:grid-cols-3"],[1,"label"],["type","number","min","1","formControlName","count",1,"input"],["class","help text-red-600 dark:text-red-400",4,"ngIf"],["formControlName","seatClass",1,"input"],["value","business"],["value","economy"],["formControlName","mode",1,"input"],["value","manual"],["value","random"],["value","group"],["class","mt-2 text-sm",4,"ngIf"],[1,"mt-3","flex","flex-wrap","gap-2"],["type","submit",1,"btn",3,"disabled"],["type","button",1,"btn","ghost",3,"click"],["class","panel grid gap-3",4,"ngIf"],["class","panel",4,"ngIf"],[1,"help","text-red-600","dark:text-red-400"],[1,"mt-2","text-sm"],[1,"inline-flex","rounded-md","px-2","py-1","font-medium",3,"ngClass"],[1,"panel","grid","gap-3"],[1,"badge"],[1,"rounded-xl","border","border-zinc-200","p-3","dark:border-zinc-800"],[3,"selectedCodesChange","pickMode","maxSelection","seatClass","extraOccupiedCodes","selectedCodes","showRecommendations"],[1,"flex","flex-wrap","gap-2"],["type","button",1,"btn",3,"click","disabled"],["type","button",1,"btn","secondary",3,"click"],[1,"panel"],[1,"grid","gap-3",3,"ngSubmit","formGroup"],["formControlName","name","placeholder","Nombre Apellido",1,"input"],["formControlName","cui","placeholder","13 d\xEDgitos",1,"input"],["formControlName","hasLuggage",1,"input"],[3,"ngValue"],["class","help mt-2",4,"ngIf"],[1,"help","mt-2"],[1,"mt-0","text-lg","font-bold"],[1,"overflow-hidden","rounded-xl","border","border-zinc-200","dark:border-zinc-800"],[1,"min-w-full","border-separate","border-spacing-0"],[1,"bg-zinc-50","text-zinc-700","dark:bg-zinc-900/60","dark:text-zinc-300"],[1,"px-3","py-2","text-left","text-xs","font-semibold"],[1,"px-3","py-2","text-right","text-xs","font-semibold"],["class","border-t border-zinc-200 dark:border-zinc-800",4,"ngFor","ngForOf"],[1,"border-t","border-zinc-200","dark:border-zinc-800"],["colspan","3",1,"px-3","py-2","text-right","font-bold"],[1,"px-3","py-2","text-right","font-bold"],[1,"help","mt-3"],[1,"mt-2","flex","flex-wrap","items-center","gap-2"],[1,"btn","ghost",3,"click"],[1,"btn",3,"click","disabled"],[4,"ngIf"],["class","help text-emerald-600 dark:text-emerald-400",4,"ngIf"],["class","panel mt-4",4,"ngIf"],[1,"px-3","py-2"],[1,"px-3","py-2","text-right"],[1,"help","text-emerald-600","dark:text-emerald-400"],[1,"panel","mt-4"],[1,"text-base","font-semibold"],[1,"h-[360px]","w-full","rounded-lg","border","border-zinc-200","bg-white","dark:border-zinc-800",3,"srcdoc"]],template:function(e,s){e&1&&(a(0,"section",0)(1,"div",1)(2,"h2",2),r(3,"Reservar asientos"),t(),a(4,"div",3),r(5," Debes estar autenticado para crear reservas. Est\xE1s logueado como "),a(6,"strong"),r(7),t(),r(8,". "),t()(),a(9,"form",4),h("ngSubmit",function(){return s.continueCfg()}),a(10,"div",5)(11,"div")(12,"label",6),r(13,"Cantidad"),t(),E(14,"input",7),g(15,be,2,0,"div",8),t(),a(16,"div")(17,"label",6),r(18,"Clase"),t(),a(19,"select",9)(20,"option",10),r(21,"Negocios"),t(),a(22,"option",11),r(23,"Econ\xF3mica"),t()()(),a(24,"div")(25,"label",6),r(26,"Modo"),t(),a(27,"select",12)(28,"option",13),r(29,"Selecci\xF3n manual"),t(),a(30,"option",14),r(31,"Aleatoria (servidor)"),t(),a(32,"option",15),r(33,"Reserva grupal (asientos contiguos)"),t()()()(),g(34,Ce,3,7,"div",16)(35,_e,2,1,"div",8),a(36,"div",17)(37,"button",18),r(38," Continuar "),t(),a(39,"button",19),h("click",function(){return s.checkAvailability()}),r(40," Revisar disponibilidad "),t()()(),g(41,Ee,10,9,"div",20)(42,Ie,27,8,"div",21)(43,Pe,35,12,"div",21),t()),e&2&&(o(7),v(s.userEmail),o(2),d("formGroup",s.cfgForm),o(6),d("ngIf",s.cfgForm.controls.count.invalid&&s.cfgForm.controls.count.touched),o(19),d("ngIf",s.availabilityChecked()),o(),d("ngIf",s.availError),o(2),d("disabled",s.cfgForm.invalid||!s.canProceed()),o(4),d("ngIf",s.step()===2&&s.cfgForm.value.mode==="manual"),o(),d("ngIf",s.step()===3),o(),d("ngIf",s.step()===4))},dependencies:[Q,H,$,j,de,ee,re,oe,K,te,ne,X,Z,se,ie,ae,ue,B],encapsulation:2})};export{ve as ReservationWizardComponent};
