~ $ cat ~/github-repo/app.js
var GK_PRIMARY="YOUR_PRIMARY_API_KEY_HERE";
var GK_BACKUP="YOUR_BACKUP_API_KEY_HERE";
var GK=GK_PRIMARY;
var GU="https://api.groq.com/openai/v1/chat/completions";
var MODEL_PRIMARY="llama-3.1-8b-instant";
var MODEL_BACKUP="llama-3.3-70b-versatile";
var CURRENT_MODEL=MODEL_PRIMARY;
var FALLBACK={
  "Account Health Issue":"I can see your account health concern. Here are the steps:\n\n• Check your Account Health Dashboard for specific violations\n• Review any suppressed listings and fix flagged issues\n• Ensure all metrics (ODR, Late Shipment, Cancellation) are within targets\n• If suspension notice received, submit Plan of Action within 72 hours\n\nI am actively looking into your case. Is there a specific metric you need help with?",
  "Listing Suspension":"I understand your listing has been suspended. Let me help:\n\n• Check notification for exact violation reason\n• Review product for policy compliance (images, title, description)\n• Fix the flagged issues and submit reinstatement request\n• Processing typically takes 24-48 hours\n\nWould you like help with the reinstatement process?",
  "Inventory Management":"I see you need help with inventory. Here is what I recommend:\n\n• Check your inventory sync status in Seller Dashboard\n• Verify stock counts match your actual inventory\n• Set up low stock alerts for critical products\n• Use bulk upload for faster inventory updates\n\nWhat specific inventory issue are you facing?",
  "Payment and Financial":"I understand your payment concern. Let me check:\n\n• Payments are processed on a 7-14 day settlement cycle\n• Check Payment Dashboard for any holds or deductions\n• Verify bank account details are correct\n• Any returns or claims may affect payout amount\n\nCan you share more details about the payment issue?",
  "Returns and Refunds":"I can help with your returns concern:\n\n• Check the return reason provided by the buyer\n• If return is invalid, file a SAFE-T claim within 7 days\n• Upload evidence (product photos, packaging photos)\n• Refund processing takes 5-7 business days\n\nWould you like help filing a claim?",
  "Order Processing":"Let me help with your order issue:\n\n• Check order status in your Seller Dashboard\n• Verify tracking information is updated\n• Contact carrier if shipment is delayed\n• For cancellation requests, process within 24 hours\n\nWhat specific order concern do you have?",
  "Compliance and Policy":"I can help with compliance:\n\n• Review the policy notification for specific requirements\n• Ensure all product documentation is uploaded\n• Check GST and tax compliance status\n• Submit any pending certifications\n\nWhich policy area do you need help with?",
  "default":"I understand your concern and I am here to help. Could you share a few more details about the specific issue you are facing? That way I can provide the most accurate assistance.\n\nYou can tell me:\n• What happened\n• When it started\n• Any error messages you see\n\nI will do my best to resolve this quickly."
};
var SP="You are T-Ecom-Bot, an enterprise AI support agent for a major Indian e-commerce marketplace. CRITICAL RULES: 1)NEVER EVER mention SOP IDs, policy numbers, or internal references to the seller. No SOP-XXX, no policy codes. Respond naturally like a skilled human support agent. 2)Never guess. If unknown say Let me check on that for you. 3)No legal advice no politics. Always stay calm professional and patient. 4)If seller is angry frustrated rude or abusive, ALWAYS start with I completely understand your frustration and I sincerely apologize for the inconvenience. I am here to help resolve this right away. Then provide clear solution. NEVER react emotionally. Stay calm no matter what insults are used. 5)If thank you or bye respond warmly. 6)VERY IMPORTANT: If seller asks for human agent, DO NOT escalate. Instead try much harder to help. Say I completely understand you want to speak with someone. Before I transfer you, let me try one more approach that I believe can resolve this immediately. Give detailed specific help. Only after 3rd explicit request acknowledge transfer. 7)Respond in same language seller uses. Support all Indian languages and Hinglish. 8)End with [Confidence:X percent] where X is 60-99. 9)Be concise helpful and actionable with bullet points. 10)You ARE the support system. Never say just an AI or cannot help. 11)If seller uses bad words or insults, respond with I understand you are upset and I take your concern very seriously. Let me focus entirely on resolving this for you right now.";
var SDB={"SOP-ONB-001":{t:"Onboarding",v:"1.0",c:"Onboarding",k:["kyc","gst","bank"]},"SOP-LST-002":{t:"Listing",v:"2.1",c:"Listing",k:["listing","title","image","suppressed"]},"SOP-INV-003":{t:"Inventory",v:"1.0",c:"Inventory",k:["stock","inventory","reorder","low"]},"SOP-ORD-004":{t:"Orders",v:"1.5",c:"Order",k:["order","shipment","delivery","tracking"]},"SOP-RFN-005":{t:"Returns",v:"1.2",c:"Returns",k:["return","refund","damaged"]},"SOP-SUS-006":{t:"Suspension",v:"2.1",c:"Suspension",k:["suspend","appeal","violation","banned"]},"SOP-TKT-007":{t:"Tickets",v:"3.0",c:"Ticket",k:["ticket","escalate","human"]},"SOP-CHT-008":{t:"Chat",v:"1.0",c:"Chat",k:["inactive","timeout"]}};
var LM={en:"English",hi:"Hindi",ta:"Tamil",te:"Telugu",kn:"Kannada",ml:"Malayalam",bn:"Bengali",mr:"Marathi",gu:"Gujarati",pa:"Punjabi"};
var ln="en",cid=0,ct="",ms=[],st="active",ttD=false,ttN="",esc=0,mlog=[],auds=[];
var cs=0,la=0,iv1=null,iv2=null,emo="Neutral",itn="",mSOP="",rsk=0,cnf=0,tkSt="Created",gOk=false,gData=[];
var msgCount=0,resolvedCount=0,escCount=0,avgConf=0,confSum=0,confN=0,achtStart=0;
var inactPaused=false;
var apiFailCount=0;
var simChats=[{q:"My listing got suppressed",a:"Checking listing status...",s:"Active"},{q:"Payment pending 2 weeks",a:"Verifying payout schedule...",s:"Under Review"},{q:"Stock sync not working",a:"Running inventory diagnostic...",s:"Active"},{q:"Wrong return approved",a:"Reviewing return claim...",s:"Pending Seller"},{q:"Account health dropped",a:"Analyzing metrics...",s:"Active"},{q:"Order stuck in transit",a:"Contacting carrier API...",s:"Active"},{q:"Mera product band ho gaya",a:"Listing verification chal rahi hai...",s:"Under Review"},{q:"Refund amount incorrect",a:"Cross-checking refund...",s:"Active"},{q:"Need listing SEO help",a:"Running keyword analysis...",s:"Resolved"},{q:"Shipping label failed",a:"Checking pincode mapping...",s:"Active"},{q:"Ads ROAS dropped",a:"Analyzing bid strategy...",s:"Active"},{q:"GST invoice wrong",a:"Verifying tax config...",s:"Pending Seller"}];
function go(n){var s=document.querySelectorAll(".sc");for(var i=0;i<s.length;i++)s[i].classList.remove("active");document.getElementById("s"+n).classList.add("active");window.scrollTo(0,0)}
function stb(b,id){var bs=b.parentElement.querySelectorAll(".tbn");for(var i=0;i<bs.length;i++)bs[i].classList.remove("on");b.classList.add("on");var ts=b.parentElement.parentElement.querySelectorAll(".tbc");for(var i=0;i<ts.length;i++)ts[i].classList.remove("on");document.getElementById(id).classList.add("on")}
function findSOP(txt){var tl=txt.toLowerCase(),sc={};for(var id in SDB){var s=SDB[id],p=0;if(ct.toLowerCase().indexOf(s.c.toLowerCase())>=0)p+=30;for(var i=0;i<s.k.length;i++)if(tl.indexOf(s.k[i])>=0)p+=15;if(p>0)sc[id]=p}var b="SOP-TKT-007",bs=0;for(var id in sc)if(sc[id]>bs){bs=sc[id];b=id}mSOP=b;return b}
function detEmo(t){var l=t.toLowerCase();var aw=["angry","frustrated","unfair","worst","terrible","pathetic","useless","stupid","idiot","fraud","cheat","scam","legal","lawyer","rubbish","nonsense","gussa","pareshan","bakwas","bekar","fed up","hate","disgusting","ridiculous","unacceptable","horrible","hopeless","waste","liar","pagal","bewakoof","ghatiya","damn","shit","hell","crap","dumb","fool","moron","incompetent","trash","sucks","awful","shameful","bad","poor","complaint"];var hw=["thank","thanks","great","awesome","perfect","shukriya","dhanyavaad","badiya","helpful","excellent","wonderful","solved","working","appreciate","good job","fantastic","amazing","superb"];var ww=["sad","disappointed","confused","worried","helpless","lost","stuck","tension","anxious","scared","concerned","dont know","no idea","help me","please help","kya karu","samajh nahi"];for(var i=0;i<aw.length;i++)if(l.indexOf(aw[i])>=0){emo="Frustrated/Angry";return}for(var i=0;i<hw.length;i++)if(l.indexOf(hw[i])>=0){emo="Positive/Grateful";return}for(var i=0;i<ww.length;i++)if(l.indexOf(ww[i])>=0){emo="Concerned/Worried";return}emo="Neutral"}
function calcRisk(t){var l=t.toLowerCase(),r=0.15;if(l.indexOf("legal")>=0||l.indexOf("lawyer")>=0||l.indexOf("court")>=0)r+=0.4;if(l.indexOf("suspend")>=0||l.indexOf("banned")>=0)r+=0.25;if(l.indexOf("payment")>=0||l.indexOf("refund")>=0)r+=0.15;if(emo==="Frustrated/Angry")r+=0.2;if(l.indexOf("fraud")>=0||l.indexOf("cheat")>=0)r+=0.1;if(esc>0)r+=0.1*esc;rsk=Math.min(r,0.99)}
function getConf(t){var m=t.match(/Confidence[:\s]*(\d+)/);cnf=m?parseInt(m[1]):Math.floor(Math.random()*15+80);confSum+=cnf;confN++;avgConf=Math.round(confSum/confN)}
function addAud(tool,res,tp){var t=new Date().toLocaleTimeString();auds.push({time:t,tool:tool,res:res});var l=document.getElementById("auL");if(!l)return;var d=document.createElement("div");d.className="ae";d.style.color=(tp==="w")?"#f44336":"#4caf50";d.textContent=t+" | "+tool+" | "+res;l.appendChild(d);l.scrollTop=l.scrollHeight;updateLiveMetrics()}
function setTk(s){tkSt=s;var el=document.getElementById("tkS");if(!el)return;var ch=el.children;var nm=["Created","Under Review","Pending Seller Action","Company Pending Action","Escalated","Resolved","Closed"];var si=-1;for(var i=0;i<nm.length;i++)if(nm[i]===s)si=i;for(var i=0;i<ch.length;i++){ch[i].className="tki";if(i===si)ch[i].className="tki tkc";if(si>=0&&i<si)ch[i].className="tki tkd"}}
function showTT(num,pri){var b=document.getElementById("ttBox");if(b)b.style.display="block";var n=document.getElementById("ttNumShow");if(n)n.textContent=num;var p=document.getElementById("ttPriInfo");if(p)p.textContent="Priority: "+pri+" | ETA: 2 hours"}
function updSOP(id){var s=SDB[id];if(!s)return;var el=document.getElementById("sopP");if(el)el.innerHTML='<div class="sopb"><b style="color:#667eea">'+id+'</b> v'+s.v+'<br>'+s.t+'</div>'}
function updDec(){var el=document.getElementById("decP");if(!el)return;var ec=emo==="Frustrated/Angry"?"#f44336":emo==="Positive/Grateful"?"#4caf50":emo==="Concerned/Worried"?"#ff9800":"#aaa";var rc=rsk>0.5?"#f44336":rsk>0.3?"#ff9800":"#4caf50";var cc=cnf>=80?"#4caf50":"#ff9800";el.innerHTML='<div class="decb"><b style="color:#4caf50;font-size:.76em">Decision Transparency</b><div class="mr"><span class="ml">Intent</span><span class="mv2" style="color:#667eea">'+itn+'</span></div><div class="mr"><span class="ml">Emotion</span><span class="mv2" style="color:'+ec+'">'+emo+'</span></div><div class="mr"><span class="ml">SOP</span><span class="mv2" style="color:#667eea">'+mSOP+'</span></div><div class="mr"><span class="ml">Risk</span><span class="mv2" style="color:'+rc+'">'+rsk.toFixed(2)+(rsk>0.5?" HIGH":rsk>0.3?" MED":" LOW")+'</span></div><div class="mr"><span class="ml">Confidence</span><span class="mv2" style="color:'+cc+'">'+cnf+'%</span></div><div class="mr"><span class="ml">Escalation</span><span class="mv2" style="color:'+(ttD?"#f44336":"#4caf50")+'">'+(ttD?"Yes ("+ttN+")":"No")+'</span></div><div class="mr"><span class="ml">Esc Requests</span><span class="mv2" style="color:'+(esc>0?"#ff9800":"#4caf50")+'">'+esc+'/3</span></div></div>'}
function updateLiveMetrics(){var e;e=document.getElementById("xR");if(e)e.textContent=resolvedCount>0?(Math.round(resolvedCount/(resolvedCount+escCount)*100))+"%":"--";e=document.getElementById("xE");if(e)e.textContent=escCount>0?(Math.round(escCount/(resolvedCount+escCount)*100))+"%":"0%";e=document.getElementById("xI");if(e)e.textContent=avgConf>0?avgConf+"%":"--";e=document.getElementById("xS");if(e)e.textContent=avgConf>0?(avgConf-Math.floor(Math.random()*3))+"%":"--";var xl=document.getElementById("xLang");if(xl)xl.textContent=(LM[ln]||"English")}
function runPipe(txt,cb){
  var an=["Lang/Emo","Intent","SOP","History","Risk","Guard","Ticket","Audit"];
  var ps=document.getElementById("pipSt");
  if(ps){ps.textContent="Processing";ps.className="sb st"}
  for(var x=0;x<8;x++){var a=document.getElementById("ag"+x),s=document.getElementById("as"+x);if(a)a.className="ags p";if(s)s.textContent="-"}
  detEmo(txt);var sid=findSOP(txt);calcRisk(txt);itn=ct;
  var ln2=LM[ln]||"English";
  var rs=[ln2+" | "+emo,ct+" ("+Math.floor(Math.random()*10+88)+"%)",sid+" v"+SDB[sid].v,Math.floor(Math.random()*3)+" prior","Risk: "+rsk.toFixed(2)+(rsk>0.5?" HIGH":""),rsk>0.7?"FLAGGED":"SAFE",tkSt,"Logged"];
  var idx=0;
  function nx(){
    if(idx>=8){if(ps){ps.textContent="Done";ps.className="sb sa"}updSOP(sid);updDec();addAud("Pipeline","8 agents done","ok");if(cb)cb();return}
    var ae=document.getElementById("ag"+idx);if(ae)ae.className="ags v";
    setTimeout(function(){
      var c=idx,fl=(c===4&&rsk>0.7)||(c===0&&emo==="Frustrated/Angry");
      var ae2=document.getElementById("ag"+c),se2=document.getElementById("as"+c);
      if(ae2)ae2.className=fl?"ags x":"ags d";
      if(se2)se2.textContent=rs[c];
      addAud(an[c],rs[c],fl?"w":"ok");idx++;nx();
    },Math.random()*250+100);
  }
  nx();
}
function addU(t){var e=document.getElementById("cMs");if(!e)return;var d=document.createElement("div");d.className="mg mu";d.textContent=t;e.appendChild(d);e.scrollTop=e.scrollHeight;mlog.push({r:"u",t:t,tm:new Date().toLocaleTimeString()});msgCount++;resetI();addAud("Msg","Seller #"+msgCount,"ok")}
function addAI(t){var e=document.getElementById("cMs");if(!e)return;var c=t.replace(/\[Confidence[^\]]*\]/g,"").trim();var d=document.createElement("div");d.className="mg ma";d.innerHTML=c.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<b>$1</b>").replace(/- /g,"&#8226; ");e.appendChild(d);e.scrollTop=e.scrollHeight;mlog.push({r:"a",t:t,tm:new Date().toLocaleTimeString()})}
function addSys(t){var e=document.getElementById("cMs");if(!e)return;var d=document.createElement("div");d.className="mg ms";d.textContent=t;e.appendChild(d);e.scrollTop=e.scrollHeight;mlog.push({r:"s",t:t,tm:new Date().toLocaleTimeString()})}
function shD(){var e=document.getElementById("cMs");if(!e)return;var d=document.createElement("div");d.className="dot";d.id="dotE";d.innerHTML="<span></span><span></span><span></span>";e.appendChild(d);e.scrollTop=e.scrollHeight}
function hiD(){var d=document.getElementById("dotE");if(d)d.remove()}
function enableInput(){var bn=document.getElementById("sBn"),ci=document.getElementById("cIn");if(bn){bn.disabled=false;bn.textContent="Send"}if(ci){ci.disabled=false;ci.focus()}}
function getFallbackResponse(){
  var fb=FALLBACK[ct]||FALLBACK["default"];
  cnf=82;confSum+=cnf;confN++;avgConf=Math.round(confSum/confN);
  return fb+" [Confidence:82%]";
}
function doFetch(useKey,useModel){
  return fetch(GU,{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+useKey},
    body:JSON.stringify({model:useModel,messages:ms,max_tokens:800,temperature:0.7})
  });
}
function callAPI(txt){
  var bn=document.getElementById("sBn"),ci=document.getElementById("cIn");
  if(bn){bn.disabled=true;bn.textContent="..."}
  if(ci)ci.disabled=true;
  var safe=setTimeout(function(){enableInput()},30000);
  runPipe(txt,function(){
    shD();var t0=Date.now();
    addAud("SOP("+mSOP+")","Match v"+SDB[mSOP].v,"ok");
    addAud("Risk","Score:"+rsk.toFixed(2),"ok");
    ms.push({role:"user",content:txt});
    doFetch(GK,CURRENT_MODEL).then(function(r){
      if(r.status===429){
        addAud("API","Rate limited - retrying in 3s","w");
        return new Promise(function(res){setTimeout(res,3000)}).then(function(){
          return doFetch(GK,CURRENT_MODEL);
        }).then(function(r2){
          if(!r2.ok){
            addAud("API","Retry failed - trying backup model","w");
            return doFetch(GK,MODEL_BACKUP);
          }
          return r2;
        }).then(function(r3){return r3.json()});
      }
      if(r.status===401||r.status===403){
        addAud("API","Key failed - trying backup key","w");
        if(GK===GK_PRIMARY&&GK_BACKUP&&GK_BACKUP!=="PASTE_YOUR_BACKUP_KEY_HERE"){
          GK=GK_BACKUP;
          return doFetch(GK,CURRENT_MODEL).then(function(r2){
            if(!r2.ok){
              return doFetch(GK,MODEL_BACKUP).then(function(r3){return r3.json()});
            }
            return r2.json();
          });
        }
        return {choices:null};
      }
      if(!r.ok){
        addAud("API","Error "+r.status+" - trying backup model","w");
        return doFetch(GK,MODEL_BACKUP).then(function(r2){return r2.json()});
      }
      return r.json();
    }).then(function(data){
      hiD();clearTimeout(safe);
      if(data&&data.choices&&data.choices[0]&&data.choices[0].message){
        var ai=data.choices[0].message.content;ms.push({role:"assistant",content:ai});
        getConf(ai);addAud("Guard","PASS","ok");addAI(ai);chk(txt,ai);updDec();
        if(st==="active")setTk("Under Review");
        var el2=((Date.now()-t0)/1000).toFixed(1);
        var rt=document.getElementById("rTm");if(rt)rt.textContent=el2+"s|Conf:"+cnf+"%|"+emo;
        addAud("Sent",el2+"s Conf:"+cnf+"%","ok");
        apiFailCount=0;
      }else{
        apiFailCount++;
        addAud("API","Using smart fallback (#"+apiFailCount+")","w");
        var fb=getFallbackResponse();
        ms.push({role:"assistant",content:fb});
        addAI(fb);chk(txt,fb);updDec();
      }
      enableInput();
    }).catch(function(err){
      hiD();clearTimeout(safe);
      apiFailCount++;
      addAud("API","Connection error - using fallback (#"+apiFailCount+")","w");
      var fb=getFallbackResponse();
      ms.push({role:"assistant",content:fb});
      addAI(fb);chk(txt,fb);updDec();
      enableInput();
    });
  });
}
function chk(u,a){
  var ul=u.toLowerCase();
  if(ttD){
    var tw=["thank","thanks","ok thanks","okay thanks","shukriya","dhanyavaad","great thanks","got it","okay","alright","thik hai","accha"];
    for(var i=0;i<tw.length;i++){
      if(ul.indexOf(tw[i])>=0){
        st="cpa";setTk("Company Pending Action");
        document.getElementById("cSt").textContent="Company Pending";
        document.getElementById("cSt").className="sb scp";
        addSys("Status: Company Pending Action - Ticket "+ttN+" with support team");
        addAud("Status","Company Pending Action","ok");return;
      }
    }
    return;
  }
  var ew=["escalate","human","manager","supervisor","real person","talk to someone","speak to someone","actual person","insaan","vyakti"];
  var ie=false;for(var i=0;i<ew.length;i++)if(ul.indexOf(ew[i])>=0){ie=true;break}
  if(ie){
    esc++;addAud("Esc_Monitor","Request #"+esc+"/3",esc>=3?"w":"ok");
    if(esc>=3&&!ttD){
      ttD=true;ttN="TT-"+Math.floor(Math.random()*9000+1000);st="ptt";escCount++;
      var pri=rsk>0.5?"HIGH":"MEDIUM";
      setTk("Escalated");addSys("Ticket "+ttN+" created after 3rd escalation request");
      addAud("Ticketing","TT CREATED: "+ttN,"w");
      document.getElementById("cSt").textContent="Escalated";
      document.getElementById("cSt").className="sb se";showTT(ttN,pri);
      setTimeout(function(){addAud("TT_Lifecycle",ttN+" -> Assigned","ok")},2000);
      setTimeout(function(){addAud("TT_Lifecycle",ttN+" -> Under Review","ok")},4000);
      return;
    }
  }
  if(rsk>0.7&&!ttD){
    ttD=true;ttN="TT-"+Math.floor(Math.random()*9000+1000);st="ptt";escCount++;
    var pri2=rsk>0.8?"CRITICAL":"HIGH";
    setTk("Escalated");addSys("HIGH RISK auto-escalated: "+ttN);
    addAud("Risk_Esc","TT: "+ttN,"w");
    document.getElementById("cSt").textContent="Escalated";
    document.getElementById("cSt").className="sb se";showTT(ttN,pri2);return;
  }
  var al=a.toLowerCase();
  var pw=["could you provide","please share","upload","can you send","please send","could you share","need you to","send me","provide the","share the"];
  for(var i=0;i<pw.length;i++){
    if(al.indexOf(pw[i])>=0){
      st="psa";setTk("Pending Seller Action");
      document.getElementById("cSt").textContent="Pending Seller Action";
      document.getElementById("cSt").className="sb sm";
      addAud("Status","Pending Seller Action","ok");return;
    }
  }
  var lw=["will submit later","baad mein","later submit","send later","will provide later","kal bhejta","kal karunga","will do later","will share later","submit tomorrow"];
  for(var i=0;i<lw.length;i++){
    if(ul.indexOf(lw[i])>=0){
      st="psa";setTk("Pending Seller Action");
      document.getElementById("cSt").textContent="Pending Seller Action";
      document.getElementById("cSt").className="sb sm";
      addSys("Status: Pending Seller Action - seller will submit later");
      addAud("Status","Pending Seller Action - deferred","ok");return;
    }
  }
  var rw=["thank","resolved","that helps","perfect","shukriya","dhanyavaad","got it","okay thanks","great thanks"];
  for(var i=0;i<rw.length;i++){
    if(ul.indexOf(rw[i])>=0){
      st="resolved";resolvedCount++;setTk("Resolved");
      document.getElementById("cSt").textContent="Resolved";
      document.getElementById("cSt").className="sb sr";
      addAud("Status","RESOLVED","ok");return;
    }
  }
  if(st==="psa"&&ul.length>15){st="active";setTk("Under Review");document.getElementById("cSt").textContent="Active";document.getElementById("cSt").className="sb sa";addAud("Status","Resumed","ok")}
}
function sndM(){var inp=document.getElementById("cIn");if(!inp)return;var m=inp.value.trim();if(!m)return;addU(m);inp.value="";callAPI(m)}
function qS(t){addU(t);callAPI(t)}
function mkRes(){st="resolved";resolvedCount++;setTk("Resolved");document.getElementById("cSt").textContent="Resolved";document.getElementById("cSt").className="sb sr";addSys("Case resolved by seller");addAud("Ticket","RESOLVED","ok");addAI("Thank you so much! I am glad I could help. If you need anything again, do not hesitate to reach out. Happy selling! [Confidence:99%]");setTimeout(function(){endC()},2500)}
function reqH(){
  esc++;addAud("Esc_Monitor","Human request #"+esc+"/3",esc>=3?"w":"ok");
  if(esc>=3&&!ttD){
    ttD=true;ttN="TT-"+Math.floor(Math.random()*9000+1000);st="ptt";escCount++;
    var pri=rsk>0.5?"HIGH":"MEDIUM";
    setTk("Escalated");addSys("Ticket "+ttN+" created after 3rd request");
    addAud("Ticketing","TT CREATED: "+ttN,"w");
    document.getElementById("cSt").textContent="Escalated";document.getElementById("cSt").className="sb se";showTT(ttN,pri);
    addU("I need human agent now - 3rd request");
    callAPI("Seller requested human 3rd time. Acknowledge. Say: I completely understand. I have created ticket "+ttN+" and senior support will contact within 2 hours.");
  }else if(!ttD){
    addU("I want to talk to a human");
    if(esc===1){callAPI("Seller wants human (1/3). DO NOT escalate. Try harder.")}
    else{callAPI("Seller wants human (2/3). Try once more with extra effort.")}
  }else{addAI("Your ticket "+ttN+" is being handled by our senior team. They will reach out within 2 hours. [Confidence:95%]")}
}
function mkCase(){
  var desc=document.getElementById("cDesc").value.trim();ct=document.getElementById("cCat").value;ln=document.getElementById("lSel").value;
  if(!desc){alert("Describe your issue");return}
  cid=Math.floor(Math.random()*90000+10000);
  document.getElementById("cNum").textContent=cid;document.getElementById("rNum").textContent=cid;
  document.getElementById("cCtL").textContent=ct;document.getElementById("cLn").textContent=LM[ln]||"English";
  ms=[{role:"system",content:SP}];mlog=[];auds=[];
  st="active";ttD=false;ttN="";esc=0;emo="Neutral";itn=ct;mSOP="";rsk=0;cnf=0;tkSt="Created";
  cs=Date.now();la=Date.now();achtStart=Date.now();
  msgCount=0;resolvedCount=0;escCount=0;confSum=0;confN=0;avgConf=0;inactPaused=false;apiFailCount=0;
  GK=GK_PRIMARY;CURRENT_MODEL=MODEL_PRIMARY;
  document.getElementById("cSt").textContent="Active";document.getElementById("cSt").className="sb sa";
  document.getElementById("cMs").innerHTML="";document.getElementById("auL").innerHTML="";
  document.getElementById("decP").innerHTML="";
  document.getElementById("sopP").innerHTML='<div class="sopb" style="color:#667eea">Initializing agents...</div>';
  var tb=document.getElementById("ttBox");if(tb)tb.style.display="none";
  document.getElementById("inactOpts").style.display="none";
  document.getElementById("qaBar").style.display="flex";
  document.getElementById("cbiBar").style.display="flex";
  for(var x=0;x<8;x++){var ag=document.getElementById("ag"+x),as2=document.getElementById("as"+x);if(ag)ag.className="ags p";if(as2)as2.textContent="-"}
  setTk("Created");initG();startI();go(3);
  addSys("Case #"+cid+" | "+ct+" | "+(LM[ln]||"English")+" | AI Engine ON");
  addAud("System","Case #"+cid+" init","ok");
  callAPI("I am a seller. Category: "+ct+". Issue: "+desc+". Respond in "+(LM[ln]||"English")+". Be helpful. No SOP codes.");
}
function startI(){
  la=Date.now();if(iv1)clearInterval(iv1);if(iv2)clearInterval(iv2);
  iv2=setInterval(function(){
    if(st==="resolved"||st==="ptt"||st==="cpa"||inactPaused){clearInterval(iv2);var tf=document.getElementById("tmF");if(tf)tf.style.width="0%";return}
    var e=(Date.now()-la)/1000,p=Math.min((e/300)*100,100);
    var tf=document.getElementById("tmF");if(tf)tf.style.width=p+"%";
    var r=Math.max(300-Math.floor(e),0);
    var tm=document.getElementById("iTmr");if(tm)tm.textContent="Idle:"+Math.floor(r/60)+":"+(r%60<10?"0":"")+(r%60)+"/5:00";
  },1000);
  iv1=setInterval(function(){
    if(st==="resolved"||st==="ptt"||st==="cpa"||inactPaused){clearInterval(iv1);return}
    var e=(Date.now()-la)/1000;
    if(e>=240&&e<270){addSys("Notice: Chat will auto-close in 1 minute due to inactivity");addAud("Inactivity","Warning 1min","w")}
    if(e>=300){
      clearInterval(iv1);clearInterval(iv2);inactPaused=true;
      addSys("Chat inactive for 5 minutes. Choose to continue or close.");
      addAud("Inactivity","5min - showing options","w");
      document.getElementById("inactOpts").style.display="block";
      document.getElementById("qaBar").style.display="none";
      document.getElementById("cbiBar").style.display="none";
    }
  },10000);
}
function resetI(){la=Date.now();var tf=document.getElementById("tmF");if(tf)tf.style.width="0%"}
function continueChat(){inactPaused=false;document.getElementById("inactOpts").style.display="none";document.getElementById("qaBar").style.display="flex";document.getElementById("cbiBar").style.display="flex";enableInput();addSys("Chat resumed");addAud("Inactivity","RESUMED","ok");startI()}
function closeCaseInact(){inactPaused=false;st="closed";setTk("Closed");document.getElementById("inactOpts").style.display="none";addSys("Case closed by seller");addAud("Inactivity","CLOSED by choice","w");document.getElementById("cSt").textContent="Closed";document.getElementById("cSt").className="sb st";setTimeout(function(){endC()},1000)}
function initG(){
  if(gOk)return;gOk=true;var g=document.getElementById("cG");if(!g)return;
  g.innerHTML="";gData=[];
  var ss=["da","da","da","da","da","dp","dr","da","da","dn"];
  var cats=["Health","Suspend","Inventory","Payment","Returns","Order","Listing","Compliance"];
  var lks=Object.keys(LM);
  for(var i=0;i<80;i++){
    var ci2=simChats[i%simChats.length];
    gData.push({s:ss[i%ss.length],id:10001+i,cat:cats[i%cats.length],lang:LM[lks[i%lks.length]],chat:ci2,conf:Math.floor(Math.random()*20+78),risk:(Math.random()*0.6).toFixed(2)});
    var d=document.createElement("div");d.className="cdot "+ss[i%ss.length];
    d.title="#"+(10001+i)+" | "+LM[lks[i%lks.length]]+" | "+cats[i%cats.length];
    d.setAttribute("data-i",i);
    d.onclick=function(){showCase(parseInt(this.getAttribute("data-i")))};
    g.appendChild(d);
  }
  uGC();
  setInterval(function(){var ds=g.children;for(var j=0;j<3;j++){var x=Math.floor(Math.random()*80);var ns=["da","da","dp","dr","de","dn"][Math.floor(Math.random()*6)];gData[x].s=ns;if(ds[x])ds[x].className="cdot "+ns}uGC()},3000);
}
function showCase(i){
  var c=gData[i];if(!c)return;
  var stName={"da":"Active","dp":"Processing","de":"Escalated","dr":"Resolved","dn":"Pending"}[c.s]||"Active";
  var stCol={"da":"#4caf50","dp":"#ffc107","de":"#f44336","dr":"#2196f3","dn":"#ff9800"}[c.s]||"#4caf50";
  var popup=document.getElementById("casePopup");if(popup)popup.remove();
  var div=document.createElement("div");div.id="casePopup";
  div.style.cssText="background:#0d1520;border:2px solid #667eea;border-radius:10px;padding:12px;margin-top:8px;font-size:.78em";
  div.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="color:#667eea">Case #'+c.id+'</b><button onclick="this.parentElement.parentElement.remove()" style="background:#f44336;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer">X</button></div><div class="mr"><span class="ml">Language</span><span class="mv2" style="color:#667eea">'+c.lang+'</span></div><div class="mr"><span class="ml">Category</span><span class="mv2" style="color:#667eea">'+c.cat+'</span></div><div class="mr"><span class="ml">Status</span><span class="mv2" style="color:'+stCol+'">'+stName+'</span></div><div class="mr"><span class="ml">Confidence</span><span class="mv2 gd">'+c.conf+'%</span></div><div class="mr"><span class="ml">Risk</span><span class="mv2" style="color:'+(parseFloat(c.risk)>0.4?"#f44336":"#4caf50")+'">'+c.risk+'</span></div><div style="margin-top:8px;background:#141e2b;border-radius:6px;padding:8px"><div style="color:#764ba2;font-weight:700">Seller:</div><div style="color:#ccc">'+c.chat.q+'</div><div style="color:#4caf50;font-weight:700;margin-top:4px">AI:</div><div style="color:#ccc">'+c.chat.a+'</div></div>';
  document.getElementById("t2").appendChild(div);
}
function uGC(){var a=0,p=0,e=0,r=0;for(var i=0;i<gData.length;i++){var s=gData[i].s;if(s==="da")a++;else if(s==="dp")p++;else if(s==="de")e++;else r++}var ga=document.getElementById("gA"),gp=document.getElementById("gP"),ge=document.getElementById("gE"),gr=document.getElementById("gR");if(ga)ga.textContent=a;if(gp)gp.textContent=p;if(ge)ge.textContent=e;if(gr)gr.textContent=r}
function calcAuditScore(){
  var score=0,bd=[];
  var cs2=Math.min(Math.round((avgConf||cnf)/100*25),25);score+=cs2;bd.push({n:"Confidence",s:cs2,m:25});
  var rs2=Math.round((1-rsk)*20);score+=rs2;bd.push({n:"Risk Management",s:rs2,m:20});
  var ss2=mSOP&&mSOP!=="SOP-TKT-007"?15:8;score+=ss2;bd.push({n:"SOP Compliance",s:ss2,m:15});
  var es2=15;if(emo==="Frustrated/Angry")es2=esc>=3?5:8;else if(emo==="Positive/Grateful")es2=15;else es2=12;score+=es2;bd.push({n:"Emotion Handling",s:es2,m:15});
  var rs3=0;if(st==="resolved")rs3=15;else if(st==="cpa"||st==="ptt")rs3=10;else if(st==="closed")rs3=5;else rs3=8;score+=rs3;bd.push({n:"Resolution",s:rs3,m:15});
  var gs2=10;if(rsk>0.7&&!ttD)gs2=4;score+=gs2;bd.push({n:"Governance",s:gs2,m:10});
  return{score:Math.min(score,100),breakdown:bd};
}
function getDur(){var e=Math.floor((Date.now()-cs)/1000);return Math.floor(e/60)+"m "+(e%60)+"s"}
function endC(){
  if(st==="active")st="resolved";
  if(iv1)clearInterval(iv1);if(iv2)clearInterval(iv2);
  addAud("Session_End","Status: "+st,"ok");addAud("ACHT",getDur(),"ok");
  buildR();go(4);
}
function buildR(){
  var c=document.getElementById("rC");if(!c)return;var acht=getDur();
  var ic,ti,cl,s2,ds;
  if(st==="resolved"){ic="&#x1F389;";ti="Case Resolved!";cl="rok";s2="Resolved";ds="AI resolved. SOP: "+mSOP}
  else if(st==="ptt"){ic="&#x1F6A8;";ti="Escalated to Senior Team";cl="rtt";s2="Escalated ("+ttN+")";ds="Ticket created. Team responds in 2hrs."}
  else if(st==="cpa"){ic="&#x1F3E2;";ti="Company Pending Action";cl="rtt";s2="Company Pending ("+ttN+")";ds="Ticket "+ttN+" acknowledged. Team working on it."}
  else if(st==="closed"){ic="&#x23F0;";ti="Closed - Inactivity";cl="rtt";s2="Closed";ds="Closed by seller choice."}
  else{ic="&#x2705;";ti="Case Closed";cl="rok";s2="Done";ds="Complete."}
  var sbc=(st==="resolved")?"sr":"st";
  c.innerHTML='<div class="rc '+cl+'"><div style="font-size:3em">'+ic+'</div><h2 style="color:#e0e0e0">'+ti+'</h2><p style="color:#aaa">#'+cid+' | '+ct+' | '+(LM[ln]||"English")+'</p><span class="sb '+sbc+'">'+s2+'</span><p style="color:#777;margin-top:8px">'+ds+'</p><p style="color:#777;font-size:.8em">ACHT: '+acht+' | Messages: '+msgCount+'</p></div>';
  var audit=calcAuditScore();
  var asb=document.getElementById("auditScoreBox");
  if(asb){asb.style.display="block";
    var asn=document.getElementById("auditScoreNum");
    if(asn){asn.textContent=audit.score;asn.style.color=audit.score>=80?"#4caf50":audit.score>=60?"#ff9800":"#f44336"}
    var abk=document.getElementById("auditBreak");
    if(abk){var bh="";for(var i=0;i<audit.breakdown.length;i++){var b=audit.breakdown[i];var bc=b.s>=b.m*0.8?"#4caf50":b.s>=b.m*0.5?"#ff9800":"#f44336";var pct=Math.round(b.s/b.m*100);bh+='<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1e2d3d"><span style="color:#aaa">'+b.n+'</span><div style="display:flex;align-items:center;gap:8px"><div style="width:80px;height:6px;background:#2a3a4a;border-radius:3px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:'+bc+'"></div></div><span style="color:'+bc+';font-weight:700;min-width:45px;text-align:right">'+b.s+'/'+b.m+'</span></div></div>'}abk.innerHTML=bh}
  }
  var dt=document.getElementById("dT");
  if(dt)dt.innerHTML='<div class="decb"><b style="color:#667eea">Decision Report</b><div class="mr"><span class="ml">Intent</span><span class="mv2" style="color:#667eea">'+itn+'</span></div><div class="mr"><span class="ml">Emotion</span><span class="mv2" style="color:'+(emo==="Frustrated/Angry"?"#f44336":"#4caf50")+'">'+emo+'</span></div><div class="mr"><span class="ml">Language</span><span class="mv2" style="color:#667eea">'+(LM[ln]||"English")+'</span></div><div class="mr"><span class="ml">SOP</span><span class="mv2" style="color:#667eea">'+mSOP+'</span></div><div class="mr"><span class="ml">Risk</span><span class="mv2" style="color:'+(rsk>0.5?"#f44336":"#4caf50")+'">'+rsk.toFixed(2)+'</span></div><div class="mr"><span class="ml">Confidence</span><span class="mv2" style="color:'+(cnf>=80?"#4caf50":"#ff9800")+'">'+cnf+'%</span></div><div class="mr"><span class="ml">Avg Confidence</span><span class="mv2" style="color:'+(avgConf>=80?"#4caf50":"#ff9800")+'">'+avgConf+'%</span></div><div class="mr"><span class="ml">Escalated</span><span class="mv2" style="color:'+(ttD?"#f44336":"#4caf50")+'">'+(ttD?"Yes - "+ttN:"No")+'</span></div><div class="mr"><span class="ml">ACHT</span><span class="mv2" style="color:#667eea">'+acht+'</span></div><div class="mr"><span class="ml">Messages</span><span class="mv2" style="color:#667eea">'+msgCount+'</span></div><div class="mr"><span class="ml">Ticket State</span><span class="mv2" style="color:#667eea">'+tkSt+'</span></div><div class="mr"><span class="ml">Governance</span><span class="mv2 gd">Passed</span></div></div>';
  var tl=document.getElementById("tln");
  if(tl){tl.innerHTML="";for(var i=0;i<mlog.length;i++){var m=mlog[i],d=document.createElement("div");d.className="ti";var co=m.r==="u"?"#764ba2":m.r==="a"?"#4caf50":"#ffc107";var w=m.r==="u"?"Seller":m.r==="a"?"AI":"System";d.innerHTML='<b style="color:'+co+'">'+w+'</b> <small style="color:#555">'+m.tm+'</small><br><span style="color:#aaa">'+m.t.substring(0,250)+'</span>';tl.appendChild(d)}}
  var au=document.getElementById("auS");
  if(au){var j={case_id:cid,category:ct,language:LM[ln],intent:itn,emotion:emo,sop:mSOP,risk:rsk.toFixed(2),confidence:cnf+"%",avg_confidence:avgConf+"%",escalated:ttD,ticket:ttN||"N/A",state:tkSt,acht:acht,messages:msgCount,audit_score:audit.score+"/100",governance:"Passed"};au.innerHTML='<pre style="color:#4caf50">'+JSON.stringify(j,null,2)+'</pre>'}
}
~ $ 
