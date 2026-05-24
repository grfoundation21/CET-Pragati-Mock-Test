import { useState, useEffect, useCallback, useMemo } from "react";

// ═══ THEME ═══
const C = {
  primary:"#2563eb", primaryDark:"#1d4ed8", blue50:"#eff6ff", blue100:"#dbeafe",
  green:"#16a34a", greenBg:"#f0fdf4", red:"#dc2626", redBg:"#fef2f2",
  orange:"#ea580c", orangeBg:"#fff7ed", purple:"#7c3aed", purpleBg:"#f5f3ff",
  gray50:"#f9fafb", gray100:"#f3f4f6", gray200:"#e5e7eb", gray300:"#d1d5db",
  gray400:"#9ca3af", gray500:"#6b7280", gray600:"#4b5563", gray700:"#374151",
  gray800:"#1f2937", gray900:"#111827", bg:"#f8f9fb", white:"#ffffff",
};

const LOGO_BASE64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTYwIDQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcng9IjgiIGZpbGw9IiMwRTFCMkUiLz48dGV4dCB4PSIxMiIgeT0iMjgiIGZpbGw9IiNmZmYiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSI4MDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5HUjwvdGV4dD48dGV4dCB4PSI0OCIgeT0iMTgiIGZpbGw9IiMxZjI5MzciIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSI4MDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBsZXR0ZXItc3BhY2luZz0iMSI+R1IgRURVQ0FUSU9OQUw8L3RleHQ+PHRleHQgeD0iNDgiIHk9IjMyIiBmaWxsPSIjMjU2M2ViIiBmb250LXNpemU9IjkiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXN0eWxlPSJpdGFsaWMiPldpdGggeW91IGF0IGV2ZXJ5IHN0ZXA8L3RleHQ+PC9zdmc+";

// ═══ QUESTIONS DATABASE (Unified Chapters) ═══
const QUESTIONS_DB = {
  Physics: [
    { id:1, q:"A ball is thrown vertically upward with velocity 20 m/s. Find the maximum height.", options:["10m","20m","30m","40m"], correct:1, chapter:"Kinematics", solution:"h=u²/2g=400/20=20m" },
    { id:2, q:"What is the SI unit of current?", options:["Volt","Ampere","Ohm","Watt"], correct:1, chapter:"Current Electricity", solution:"SI unit of current is Ampere (A)" },
    { id:3, q:"Which gas is evolved when zinc reacts with dilute HCl?", options:["Oxygen","Hydrogen","Nitrogen","Chlorine"], correct:1, chapter:"Optics", solution:"Zn+2HCl→ZnCl₂+H₂" },
    { id:4, q:"The focal length of a convex lens is 20 cm. What is its power?", options:["+2D","+5D","-5D","+10D"], correct:1, chapter:"Optics", solution:"P=1/f=1/0.2=+5D" },
    { id:5, q:"Newton's first law is also known as:", options:["Law of inertia","Law of acceleration","Law of reaction","Law of gravitation"], correct:0, chapter:"Laws of Motion", solution:"Newton's first law = Law of Inertia" },
  ],
  Chemistry: [
    { id:6, q:"Which gas is evolved when zinc reacts with dilute HCl?", options:["Oxygen","Hydrogen","Nitrogen","Chlorine"], correct:1, chapter:"Chemical Reactions", solution:"Zn+2HCl→ZnCl₂+H₂" },
    { id:7, q:"What is the atomic number of Carbon?", options:["4","6","8","12"], correct:1, chapter:"Chemical Bonding", solution:"Carbon has atomic number 6" },
    { id:8, q:"pH of pure water at 25°C is:", options:["0","7","14","1"], correct:1, chapter:"Ionic Equilibrium", solution:"Pure water has pH=7 (neutral)" },
    { id:9, q:"Benzene formula is:", options:["C₆H₆","C₆H₁₂","C₂H₂","CH₄"], correct:0, chapter:"Organic Chemistry", solution:"Benzene = C₆H₆" },
    { id:10, q:"Which element has highest electronegativity?", options:["Oxygen","Fluorine","Chlorine","Nitrogen"], correct:1, chapter:"Periodic Table", solution:"Fluorine is most electronegative" },
  ],
  Mathematics: [
    { id:11, q:"What is the derivative of x²?", options:["x","2x","x²","2x²"], correct:1, chapter:"Differentiation", solution:"d/dx(x²)=2x" },
    { id:12, q:"∫2x dx = ?", options:["x²+C","2x²+C","x+C","x²"], correct:0, chapter:"Integration", solution:"∫2x dx = x² + C" },
    { id:13, q:"If A is a 2×2 matrix with |A|=5, then |3A|=?", options:["15","45","9","25"], correct:1, chapter:"Matrices", solution:"|kA|=k^n|A|=9×5=45" },
    { id:14, q:"The lim(x→0) sin(x)/x = ?", options:["0","1","∞","−1"], correct:1, chapter:"Limits", solution:"Standard limit: lim sin(x)/x = 1" },
    { id:15, q:"If P(A)=0.3, P(B)=0.4, A,B independent, P(A∩B)=?", options:["0.12","0.7","0.1","0.3"], correct:0, chapter:"Probability", solution:"P(A∩B)=P(A)×P(B)=0.12" },
  ]
};

const ALL_QUESTIONS = [
  ...QUESTIONS_DB.Physics.map(q => ({...q, subject:"Physics"})),
  ...QUESTIONS_DB.Chemistry.map(q => ({...q, subject:"Chemistry"})),
  ...QUESTIONS_DB.Mathematics.map(q => ({...q, subject:"Mathematics"})),
];
const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];

// ═══ UI COMPONENTS ═══
const fmtTime = (s) => { const m=Math.floor(s/60); const sc=s%60; return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}:${String(sc).padStart(2,"0")}`; };

function useTimer(seconds, active) {
  const [time, setTime] = useState(seconds);
  useEffect(() => { setTime(seconds); }, [seconds]);
  useEffect(() => { if (!active) return; if (time <= 0) return; const t = setInterval(() => setTime(p => Math.max(0, p-1)), 1000); return () => clearInterval(t); }, [active, time]);
  return time;
}

const Icon = {
  arrow: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  file: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>,
  chart: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  book: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  download: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>,
};

function Card({ children, style={}, ...props }) {
  return <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.gray200}`, padding:"18px 22px", ...style }} {...props}>{children}</div>;
}

function Btn({ children, variant="primary", icon, style={}, ...props }) {
  const base = { display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", border:"none", transition:"all 0.15s", fontFamily:"inherit" };
  const vars = { primary:{background:C.primary,color:"#fff"}, success:{background:C.green,color:"#fff"}, danger:{background:C.red,color:"#fff"}, outline:{background:"transparent",border:`1.5px solid ${C.gray300}`,color:C.gray700}, ghost:{background:"transparent",color:C.gray500}, purple:{background:C.purple,color:"#fff"} };
  return <button style={{...base,...(vars[variant]||vars.primary),...style}} {...props}>{icon}{children}</button>;
}

function Field({ label, value, onChange, type="text", placeholder="", style={} }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.gray600, marginBottom:5 }}>{label}</label>}
      <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.gray200}`, fontSize:14, color:C.gray800, outline:"none", ...style }} />
    </div>
  );
}

function Select({ label, value, onChange, options=[] }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.gray600, marginBottom:5 }}>{label}</label>}
      <select value={value||""} onChange={e=>onChange(e.target.value)} style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.gray200}`, fontSize:14, color:C.gray800, background:C.white }}>
        <option value="">Select...</option>
        {options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function NavBar() {
  return (
    <div style={{ background:"#fff", borderBottom:`1px solid ${C.gray200}`, padding:"10px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <img src={LOGO_BASE64} alt="GR Educational" style={{ height:36 }} />
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:13, color:C.gray500 }}>student@demo.com</span>
        <div style={{ width:32, height:32, borderRadius:"50%", background:C.primary, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>S</div>
      </div>
    </div>
  );
}

// ═══ SIGN IN ═══
function SignIn({ onSignIn, onRegister }) {
  const [mode, setMode] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [email, setEmail] = useState("student@demo.com");
  const [pass, setPass] = useState("demo123");
  const [forgotMobile, setForgotMobile] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPassConfirm, setNewPassConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { if (otpTimer > 0) { const t = setTimeout(() => setOtpTimer(otpTimer-1), 1000); return () => clearTimeout(t); } }, [otpTimer]);

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, ${C.blue50} 0%, #f0f2f5 50%, ${C.blue50} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <Card style={{ width:"100%", maxWidth:420, padding:"40px 36px", boxShadow:"0 8px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg, #0E1B2E, #1E3A5F)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:20, marginBottom:14 }}>GR</div>
          <h1 style={{ fontSize:24, fontWeight:800, color:C.gray900, margin:0 }}>{mode === "forgot" ? "Reset Password" : "Welcome Back"}</h1>
          <p style={{ color:C.gray500, fontSize:14, marginTop:6 }}>{mode === "forgot" ? "Enter mobile to reset" : "GR Educational Consultancy"}</p>
        </div>
        {error && <div style={{ background:C.redBg, color:C.red, padding:"8px 14px", borderRadius:8, fontSize:13, marginBottom:14 }}>{error}</div>}
        {success && <div style={{ background:C.greenBg, color:C.green, padding:"8px 14px", borderRadius:8, fontSize:13, marginBottom:14 }}>{success}</div>}

        {mode === "forgot" && <>
          {forgotStep === 1 && <><Field label="Registered Mobile" value={forgotMobile} onChange={v=>setForgotMobile(v.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile" /><Btn onClick={()=>{if(forgotMobile.length!==10){setError("Enter valid mobile");return;}setError("");setForgotStep(2);setOtpTimer(30);}} style={{width:"100%",justifyContent:"center"}}>Send OTP</Btn></>}
          {forgotStep === 2 && <><div style={{background:C.gray50,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.gray600}}>OTP sent to +91 {forgotMobile} {otpTimer>0&&<span style={{color:C.orange}}>· {otpTimer}s</span>}</div><Field label="Enter OTP" value={forgotOtp} onChange={v=>setForgotOtp(v.replace(/\D/g,"").slice(0,6))} /><Btn onClick={()=>{if(forgotOtp.length<4){setError("Enter valid OTP");return;}setError("");setForgotStep(3);}} style={{width:"100%",justifyContent:"center"}}>Verify OTP</Btn></>}
          {forgotStep === 3 && <><Field label="New Password" value={newPass} onChange={setNewPass} type="password" placeholder="Min 6 characters" /><Field label="Confirm Password" value={newPassConfirm} onChange={setNewPassConfirm} type="password" /><Btn onClick={()=>{if(newPass.length<6){setError("Min 6 characters");return;}if(newPass!==newPassConfirm){setError("Passwords don't match");return;}setSuccess("Password reset! Please login.");setTimeout(()=>{setMode("mobile");setSuccess("");setForgotStep(1);},2000);}} variant="success" style={{width:"100%",justifyContent:"center"}}>Reset Password</Btn></>}
          <p style={{textAlign:"center",marginTop:16,fontSize:13}}><span onClick={()=>{setMode("mobile");setError("");setForgotStep(1);}} style={{color:C.primary,cursor:"pointer",fontWeight:600}}>← Back to Login</span></p>
        </>}

        {mode !== "forgot" && <>
          <div style={{ display:"flex", gap:2, background:C.gray100, borderRadius:8, padding:3, marginBottom:20 }}>
            {[{v:"mobile",l:"📱 Mobile OTP"},{v:"email",l:"📧 Email"}].map(t=>(
              <button key={t.v} onClick={()=>{setMode(t.v);setError("");}} style={{flex:1,padding:"8px",fontSize:13,fontWeight:600,borderRadius:6,border:"none",cursor:"pointer",background:mode===t.v?"#fff":"transparent",color:mode===t.v?C.gray800:C.gray500,boxShadow:mode===t.v?"0 1px 3px rgba(0,0,0,0.1)":"none"}}>{t.l}</button>
            ))}
          </div>
          {mode === "mobile" && <>
            <Field label="Mobile Number" value={mobile} onChange={v=>{setMobile(v.replace(/\D/g,"").slice(0,10));setOtpSent(false);}} type="tel" placeholder="10-digit mobile" />
            {!otpSent ? <Btn onClick={()=>{if(mobile.length!==10){setError("Enter valid mobile");return;}setError("");setOtpSent(true);setOtpTimer(30);}} style={{width:"100%",justifyContent:"center",background:"linear-gradient(135deg,#0E1B2E,#1E3A5F)"}}>Send OTP</Btn> : <>
              <div style={{background:"#f0fdf4",borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:13,color:C.green,display:"flex",justifyContent:"space-between"}}><span>OTP sent to +91 {mobile}</span>{otpTimer>0?<span style={{color:C.orange,fontWeight:600}}>{otpTimer}s</span>:<button onClick={()=>setOtpTimer(30)} style={{background:"none",border:"none",color:C.primary,fontWeight:600,cursor:"pointer",fontSize:13}}>Resend</button>}</div>
              <Field label="Enter OTP" value={otp} onChange={v=>setOtp(v.replace(/\D/g,"").slice(0,6))} placeholder="6-digit OTP" />
              <Btn onClick={()=>{if(otp.length<4){setError("Enter valid OTP");return;}onSignIn();}} variant="success" style={{width:"100%",justifyContent:"center"}}>Verify & Login</Btn>
            </>}
          </>}
          {mode === "email" && <>
            <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="Enter email" />
            <Field label="Password" value={pass} onChange={setPass} type="password" placeholder="Enter password" />
            <Btn onClick={()=>onSignIn()} style={{width:"100%",justifyContent:"center"}}>Sign In</Btn>
          </>}
          <div style={{textAlign:"right",marginTop:12}}><span onClick={()=>{setMode("forgot");setError("");}} style={{fontSize:13,color:C.primary,cursor:"pointer"}}>Forgot Password?</span></div>
          <div style={{borderTop:`1px solid ${C.gray200}`,marginTop:16,paddingTop:16}}><p style={{textAlign:"center",fontSize:13,color:C.gray500}}>New student? <span onClick={onRegister} style={{color:C.primary,cursor:"pointer",fontWeight:600}}>Register here</span></p></div>
        </>}
      </Card>
    </div>
  );
}

// ═══ REGISTRATION ═══
function Registration({ onDone }) {
  const [form, setForm] = useState({ first:"", last:"", mobile:"", email:"", stream:"", course:"", studentClass:"", pass:"", confirm:"" });
  const [step, setStep] = useState(1);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpCode, setOtpCode] = useState("");
  const [verifyMethod, setVerifyMethod] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { if (otpTimer > 0) { const t = setTimeout(() => setOtpTimer(otpTimer-1), 1000); return () => clearTimeout(t); } }, [otpTimer]);

  const STREAM_COURSES = {
    "Engineering":{icon:"⚙️",courses:["MHT CET PCM","JEE Main","JEE Advanced"]},
    "Medical":{icon:"🩺",courses:["MHT CET PCB","NEET UG","NEET PG"]},
    "Agriculture":{icon:"🌾",courses:["Agriculture CET"]},
    "Pharmacy":{icon:"💊",courses:["B.Pharma CET","D.Pharma CET"]},
    "Management":{icon:"💼",courses:["MBA CET","CAT","MAT"]},
    "Law":{icon:"⚖️",courses:["MH Law CET","CLAT","AILET"]},
    "Nursing":{icon:"🏥",courses:["B.Sc Nursing CET"]},
    "Education":{icon:"📚",courses:["B.Ed CET","D.Ed CET"]},
    "Design":{icon:"🎨",courses:["NID","NIFT","UCEED"]},
  };
  const CLASS_OPTIONS = [{value:"11",label:"11th"},{value:"12",label:"12th"},{value:"repeater",label:"Repeater"},{value:"dropper",label:"Dropper"},{value:"graduate",label:"Graduate"}];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <Card style={{ width:"100%", maxWidth:540, padding:"36px 32px" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"linear-gradient(135deg,#0E1B2E,#1E3A5F)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:18, marginBottom:12 }}>GR</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, margin:0 }}>New Registration</h1>
        </div>
        <div style={{ display:"flex", gap:4, marginBottom:24 }}>
          {["Personal Info","Stream & Exam","Verify","Password"].map((s,i) => (
            <div key={i} style={{ flex:1, textAlign:"center" }}>
              <div style={{ height:4, borderRadius:2, background:i<step?C.green:i===step-1?C.primary:C.gray200, marginBottom:6 }} />
              <span style={{ fontSize:10, color:i<step?C.green:C.gray500, fontWeight:600 }}>{s}</span>
            </div>
          ))}
        </div>
        {error && <div style={{ background:C.redBg, color:C.red, padding:"8px 14px", borderRadius:8, fontSize:13, marginBottom:14 }}>{error}</div>}

        {step === 1 && <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}><Field label="First Name *" value={form.first} onChange={v=>setForm({...form,first:v})} /><Field label="Last Name" value={form.last} onChange={v=>setForm({...form,last:v})} /></div>
          <Field label="Mobile *" value={form.mobile} onChange={v=>setForm({...form,mobile:v.replace(/\D/g,"").slice(0,10)})} type="tel" placeholder="10-digit mobile" />
          <Field label="Email (optional)" value={form.email} onChange={v=>setForm({...form,email:v})} type="email" />
          <Btn onClick={()=>{if(!form.first.trim()){setError("First name required");return;}if(form.mobile.length!==10){setError("Enter valid mobile");return;}setError("");setStep(2);}} style={{width:"100%",justifyContent:"center"}}>Continue →</Btn>
          <p style={{textAlign:"center",marginTop:16,fontSize:13,color:C.gray500}}>Already registered? <span onClick={onDone} style={{color:C.primary,cursor:"pointer",fontWeight:600}}>Sign In</span></p>
        </>}

        {step === 2 && <>
          <label style={{fontSize:13,fontWeight:600,color:C.gray700,display:"block",marginBottom:6}}>1. Select Stream *</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:14}}>
            {Object.entries(STREAM_COURSES).map(([stream,data])=>(
              <button key={stream} onClick={()=>setForm({...form,stream,course:""})} style={{padding:"10px 8px",borderRadius:10,border:`2px solid ${form.stream===stream?C.primary:C.gray200}`,background:form.stream===stream?C.blue50:"#fff",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:2}}>{data.icon}</div>
                <div style={{fontSize:11,fontWeight:form.stream===stream?700:500,color:form.stream===stream?C.primary:C.gray600}}>{stream}</div>
              </button>
            ))}
          </div>
          {form.stream && <><label style={{fontSize:13,fontWeight:600,color:C.gray700,display:"block",marginBottom:6}}>2. Select Entrance Exam *</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
              {(STREAM_COURSES[form.stream]?.courses||[]).map(course=>(
                <button key={course} onClick={()=>setForm({...form,course})} style={{padding:"10px 14px",borderRadius:10,border:`2px solid ${form.course===course?C.primary:C.gray200}`,background:form.course===course?C.blue50:"#fff",cursor:"pointer",textAlign:"left"}}>
                  <div style={{fontSize:13,fontWeight:form.course===course?700:500,color:form.course===course?C.primary:C.gray700}}>{course}</div>
                </button>
              ))}
            </div></>}
          {form.course && <><label style={{fontSize:13,fontWeight:600,color:C.gray700,display:"block",marginBottom:6}}>3. Select Class *</label>
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {CLASS_OPTIONS.map(c=>(<button key={c.value} onClick={()=>setForm({...form,studentClass:c.value})} style={{padding:"8px 16px",borderRadius:8,border:`2px solid ${form.studentClass===c.value?C.primary:C.gray200}`,background:form.studentClass===c.value?C.blue50:"#fff",cursor:"pointer",fontSize:13,fontWeight:form.studentClass===c.value?700:500,color:form.studentClass===c.value?C.primary:C.gray600}}>{c.label}</button>))}
            </div></>}
          {form.stream&&form.course&&form.studentClass&&<div style={{background:C.greenBg,borderRadius:8,padding:"8px 14px",marginBottom:12,fontSize:12,color:C.green,fontWeight:600}}>✓ {form.stream} → {form.course} → Class {form.studentClass}</div>}
          <div style={{display:"flex",gap:10}}><Btn variant="ghost" onClick={()=>{setStep(1);setError("");}}>← Back</Btn><Btn onClick={()=>{if(!form.stream){setError("Select stream");return;}if(!form.course){setError("Select exam");return;}if(!form.studentClass){setError("Select class");return;}setError("");setStep(3);}} style={{flex:1,justifyContent:"center"}}>Continue →</Btn></div>
        </>}

        {step === 3 && <>
          <Card style={{background:C.gray50,marginBottom:16,padding:"14px 18px"}}><div style={{fontSize:13,color:C.gray600,lineHeight:2}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Name:</span><strong>{form.first} {form.last}</strong></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Stream:</span><strong>{form.stream}</strong></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Exam:</span><strong style={{color:C.primary}}>{form.course}</strong></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>Class:</span><strong>{CLASS_OPTIONS.find(c=>c.value===form.studentClass)?.label}</strong></div>
          </div></Card>
          {!mobileVerified ? <>
            {!verifyMethod && <><label style={{fontSize:13,fontWeight:600,color:C.gray700,display:"block",marginBottom:8}}>Verify your identity (choose one)</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8}}>
                <button onClick={()=>setVerifyMethod("mobile")} style={{padding:"16px",borderRadius:10,border:`2px solid ${C.gray200}`,background:"#fff",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:28,marginBottom:6}}>📱</div><div style={{fontSize:14,fontWeight:700}}>Mobile OTP</div><div style={{fontSize:12,color:C.gray500}}>+91 {form.mobile}</div></button>
                <button onClick={()=>{if(!form.email){setError("No email entered");return;}setVerifyMethod("email");}} style={{padding:"16px",borderRadius:10,border:`2px solid ${C.gray200}`,background:form.email?"#fff":C.gray50,cursor:form.email?"pointer":"not-allowed",textAlign:"center",opacity:form.email?1:0.5}}><div style={{fontSize:28,marginBottom:6}}>📧</div><div style={{fontSize:14,fontWeight:700}}>Email OTP</div><div style={{fontSize:12,color:C.gray500}}>{form.email||"No email"}</div></button>
              </div></>}
            {verifyMethod && <Card style={{border:`1.5px solid ${C.gray200}`,padding:"16px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:22}}>{verifyMethod==="mobile"?"📱":"📧"}</span><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>Verify via {verifyMethod==="mobile"?"Mobile":"Email"}</div><div style={{fontSize:13,color:C.gray500}}>OTP sent to {verifyMethod==="mobile"?`+91 ${form.mobile}`:form.email}</div></div><button onClick={()=>{setVerifyMethod(null);setOtpSent(false);setOtpCode("");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.primary,fontWeight:600}}>Change</button></div>
              {!otpSent?<Btn onClick={()=>{setOtpSent(true);setOtpTimer(30);}} style={{width:"100%",justifyContent:"center"}}>Send OTP</Btn>:<>
                <div style={{background:"#f0fdf4",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:13,color:C.green,display:"flex",justifyContent:"space-between"}}><span>✓ OTP sent</span>{otpTimer>0?<span style={{color:C.orange,fontWeight:600}}>{otpTimer}s</span>:<button onClick={()=>setOtpTimer(30)} style={{background:"none",border:"none",color:C.primary,fontWeight:600,cursor:"pointer",fontSize:13}}>Resend</button>}</div>
                <Field label="Enter OTP" value={otpCode} onChange={v=>setOtpCode(v.replace(/\D/g,"").slice(0,6))} /><Btn onClick={()=>{if(otpCode.length<4){setError("Enter valid OTP");return;}setError("");setMobileVerified(true);}} variant="success" style={{width:"100%",justifyContent:"center"}}>Verify OTP</Btn></>}
            </Card>}
          </> : <Card style={{background:C.greenBg,border:`1px solid ${C.green}`,padding:"14px 18px",textAlign:"center"}}><span style={{fontSize:15,color:C.green,fontWeight:700}}>✓ {verifyMethod==="mobile"?`Mobile +91 ${form.mobile}`:`Email ${form.email}`} verified!</span></Card>}
          <div style={{display:"flex",gap:10,marginTop:14}}><Btn variant="ghost" onClick={()=>{setStep(2);setError("");}}>← Back</Btn><Btn onClick={()=>{if(!mobileVerified){setError("Please verify first");return;}setError("");setStep(4);}} disabled={!mobileVerified} style={{flex:1,justifyContent:"center"}}>Continue →</Btn></div>
        </>}

        {step === 4 && <>
          <Card style={{background:C.greenBg,border:`1px solid ${C.green}`,marginBottom:16,padding:"12px 16px",textAlign:"center"}}><span style={{fontSize:13,color:C.green,fontWeight:600}}>✓ Verified · {form.first} · {form.course} · Class {form.studentClass}</span></Card>
          <Field label="Create Password *" value={form.pass} onChange={v=>setForm({...form,pass:v})} type="password" placeholder="Min 6 characters" />
          <Field label="Confirm Password *" value={form.confirm} onChange={v=>setForm({...form,confirm:v})} type="password" />
          <div style={{display:"flex",gap:10}}><Btn variant="ghost" onClick={()=>setStep(3)}>← Back</Btn><Btn onClick={()=>{if(form.pass.length<6){setError("Min 6 characters");return;}if(form.pass!==form.confirm){setError("Passwords don't match");return;}onDone();}} variant="success" style={{flex:1,justifyContent:"center"}}>🎉 Complete Registration</Btn></div>
        </>}
      </Card>
    </div>
  );
}

// ═══ EDIT PROFILE ═══
function EditProfile({ onSave }) {
  const [profile, setProfile] = useState({ gender:"", dob:"", city:"", studentClass:"", courses:[] });
  const STUDENT_CLASSES = ["11th","12th","Repeater","Dropper","Graduate"];
  const STUDENT_COURSES = ["MHT CET PCM","MHT CET PCB","JEE","NEET","MBA CET","Law Entrance","B.Pharma","B.Sc Nursing"];
  return (
    <div style={{ minHeight:"100vh", background:C.bg }}><NavBar />
      <div style={{ maxWidth:480, margin:"0 auto", padding:"28px 20px" }}>
        <Card>
          <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 6px" }}>Complete Your Profile</h2>
          <p style={{ fontSize:13, color:C.gray500, marginBottom:24 }}>All fields are optional</p>
          <Select label="Gender" value={profile.gender} onChange={v=>setProfile(p=>({...p,gender:v}))} options={["Male","Female","Other"]} />
          <Select label="Class *" value={profile.studentClass} onChange={v=>setProfile(p=>({...p,studentClass:v}))} options={STUDENT_CLASSES} />
          <div style={{marginBottom:16}}>
            <label style={{fontSize:13,fontWeight:600,color:C.gray600,display:"block",marginBottom:8}}>Course / Exam <span style={{fontSize:11,color:C.gray400,fontWeight:400}}>(select one or more)</span></label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {STUDENT_COURSES.map(c=>{
                const sel = profile.courses.includes(c);
                return (
                  <button key={c} onClick={()=>setProfile(p=>({...p,courses:sel?p.courses.filter(x=>x!==c):[...p.courses,c]}))}
                    style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:8,fontSize:12,fontWeight:sel?700:500,cursor:"pointer",border:`1.5px solid ${sel?"#2563eb":"#d1d5db"}`,background:sel?"#eff6ff":"#fff",color:sel?"#2563eb":"#6b7280",transition:"all 0.15s"}}>
                    <span style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${sel?"#2563eb":"#d1d5db"}`,background:sel?"#2563eb":"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff"}}>{sel?"✓":""}</span>
                    {c}
                  </button>
                );
              })}
            </div>
            {profile.courses.length > 0 && <div style={{fontSize:11,color:"#2563eb",marginTop:6,fontWeight:600}}>✓ {profile.courses.length} course{profile.courses.length>1?"s":""} selected</div>}
          </div>
          <div style={{marginBottom:16}}><label style={{fontSize:13,fontWeight:600,color:C.gray600,display:"block",marginBottom:6}}>Date of Birth</label><input type="date" value={profile.dob} onChange={e=>setProfile(p=>({...p,dob:e.target.value}))} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.gray300}`,fontSize:14}} /><span style={{fontSize:11,color:C.gray400,display:"block",marginTop:4}}>Optional</span></div>
          <div style={{marginBottom:20}}><label style={{fontSize:13,fontWeight:600,color:C.gray600,display:"block",marginBottom:6}}>City</label><input type="text" value={profile.city} onChange={e=>setProfile(p=>({...p,city:e.target.value}))} placeholder="Enter your city" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.gray300}`,fontSize:14}} /><span style={{fontSize:11,color:C.gray400,display:"block",marginTop:4}}>Optional — type any city name</span></div>
          <Btn onClick={()=>onSave(profile)} style={{width:"100%",justifyContent:"center",padding:"12px"}}>Save & Proceed</Btn>
          <button onClick={()=>onSave(profile)} style={{display:"block",width:"100%",textAlign:"center",marginTop:12,background:"none",border:"none",color:C.gray400,fontSize:13,cursor:"pointer"}}>Skip for now →</button>
        </Card>
      </div>
    </div>
  );
}

// ═══ DASHBOARD ═══
function Dashboard({ onLaunchTest, pastTests=[], onViewResult, onPragati, studentPlan, setStudentPlan, onEditProfile }) {
  const [tab, setTab] = useState("available");
  const [showPlans, setShowPlans] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);

  // ═══ PAYMENT LINKS (set by admin in Settings) ═══
  const PAYMENT_LINKS = {
    premium: "https://rzp.io/l/gr-premium",  // ← Admin sets this in Settings
    crash: "https://rzp.io/l/gr-crash",
    topic: "https://rzp.io/l/gr-topic",
    pragati: "https://rzp.io/l/gr-pragati",
  };
  const UPI_ID = "greducational@upi";
  const UPI_NAME = "GR Educational Consultancy";
  const getUPILink = (plan) => `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${plan.price}&cu=INR&tn=${encodeURIComponent(plan.name + " - " + (student.name||"Student"))}`;
  const getQRUrl = (plan) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getUPILink(plan))}`;

  const handleBuyPlan = (plan) => {
    if (!plan.price || plan.price === 0) return;
    setPaymentModal(plan);
  };

  const submitPaymentRequest = (plan, method) => {
    // Save transaction for admin approval
    const txn = { id:"TXN"+Date.now(), studentName:student.name, studentMobile:student.mobile||"", planId:plan.id, planName:plan.name, amount:plan.price, method, date:new Date().toISOString(), status:"pending", courses:(student.courses||[student.course]).join(", ") };
    const existing = JSON.parse(localStorage.getItem("gr_transactions")||"[]");
    localStorage.setItem("gr_transactions", JSON.stringify([txn, ...existing]));
    
    setPaymentModal(null);
    setAutoSendToast(`⏳ Payment request submitted! Admin will verify and activate your ${plan.name} plan.`);
    setTimeout(()=>setAutoSendToast(""),5000);
  };
  const student = { name:"Rahul Sharma", class:"12", course:"CET PCM", plan:studentPlan||"free" };

  const allTests = [
    {id:"t1",course:"CET-PCM",name:"Mock Test 1 — Full Syllabus",qs:15,dur:"30 min",status:"active",date:"10 Feb 2026",free:true,classes:["11","12"],category:"free"},
    {id:"t2",course:"CET-PCM",name:"Mock Test 2 — Physics Focus",qs:50,dur:"60 min",status:"active",date:"12 Feb 2026",free:false,price:49,classes:["12"],category:"paid"},
    {id:"t3",course:"CET-PCM",name:"Grand Test — Full Syllabus",qs:150,dur:"180 min",status:"active",date:"20 Feb 2026",free:false,price:99,classes:["12","repeater"],category:"paid"},
    {id:"t5",course:"CET-PCM",name:"Crash — Physics Complete",qs:200,dur:"240 min",status:"active",date:"1 Mar 2026",free:false,price:299,classes:["12","repeater"],category:"crash"},
    {id:"t6",course:"CET-PCM",name:"Crash — Chemistry Complete",qs:200,dur:"240 min",status:"active",date:"5 Mar 2026",free:false,price:299,classes:["12"],category:"crash"},
    {id:"t7",course:"CET-PCM",name:"Practice — Kinematics",qs:30,dur:"45 min",status:"active",date:"8 Feb 2026",free:true,classes:["11","12"],category:"free"},
  ];
  const myTests = allTests.filter(t=>(t.classes||[]).includes(student.class));
  const freeTests = myTests.filter(t=>t.category==="free"), paidTests = myTests.filter(t=>t.category==="paid"), crashTests = myTests.filter(t=>t.category==="crash");
  const canAccess = (t)=>t.free||student.plan==="premium"||(student.plan==="crash"&&(t.category==="crash"||t.category==="paid"));

  const PLANS = [
    {id:"free",name:"Free",price:0,icon:"🆓",color:C.green,features:["Free mock tests for your class","Basic result analysis","Limited attempts"],current:student.plan==="free"},
    {id:"premium",name:"Premium",price:499,period:"/year",icon:"👑",color:"#D97706",features:["All free tests","All paid mock tests","✨ Pragati topic monitoring","Detailed analysis + PDF","Unlimited attempts","WhatsApp result sharing"],current:student.plan==="premium",popular:true},
    {id:"crash",name:"Crash Course",price:999,period:"/course",icon:"🚀",color:"#DC2626",features:["Everything in Premium","All crash course tests (200 Qs each)","Subject-wise intensive tests","Priority doubt support"],current:student.plan==="crash"},
    {id:"topic",name:"Per Topic",price:49,period:"/topic",icon:"📝",color:"#7c3aed",features:["Buy individual Pragati topics","₹49 per topic only","Arambh + Shikhar + Retake","90 days access"],current:false},
    {id:"pragati",name:"Pragati Monitor",price:299,period:"/year",icon:"✨",color:"#0e7490",features:["Full Pragati monitoring system","All subjects & topics access","Class vs Pragati comparison","Progress tracking dashboard","Parent report sharing"],current:student.plan==="pragati"},
  ];

  const handleBuyPlanById = (planId)=>{ const plan = PLANS.find(p=>p.id===planId); if(plan) handleBuyPlan(plan); };

  const TestCard = ({t})=>{const accessible=canAccess(t);return(
    <Card key={t.id} style={{padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:!accessible?0.7:1}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:4,textTransform:"uppercase",background:t.status==="active"?C.greenBg:C.purpleBg,color:t.status==="active"?C.green:C.purple}}>{t.status}</span>
          <span style={{fontSize:12,color:C.gray400}}>{t.course}</span>
          {t.category==="crash"&&<span style={{fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:4,background:"#FEE2E2",color:"#DC2626"}}>🚀 CRASH</span>}
          {t.category==="paid"&&!t.free&&<span style={{fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:4,background:"#FEF3C7",color:"#D97706"}}>👑 PREMIUM</span>}
        </div>
        <h3 style={{fontSize:15,fontWeight:600,color:C.gray800,margin:0}}>{t.name}</h3>
        <p style={{fontSize:13,color:C.gray400,marginTop:4}}>{t.qs} Questions · {t.dur} · {t.date}</p>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontSize:16,fontWeight:800,color:t.free?C.green:C.orange}}>{t.free?"FREE":`₹${t.price}`}</span>
        {!accessible?<Btn onClick={()=>{const plan=t.price>=500?PLANS.find(p=>p.id==="crash"):PLANS.find(p=>p.id==="premium");if(plan)handleBuyPlan(plan);}} variant="outline" style={{padding:"8px 18px",fontSize:12,borderColor:"#D97706",color:"#D97706",cursor:"pointer"}}>🔒 Buy ₹{t.price>=500?"999":"499"}</Btn>:
        t.status==="active"?<Btn onClick={()=>onLaunchTest(t)} variant="success" style={{padding:"8px 18px",fontSize:13}} icon={Icon.arrow(14)}>Launch</Btn>:
        <Btn variant="ghost" disabled style={{padding:"8px 18px",fontSize:13}}>Upcoming</Btn>}
      </div>
    </Card>
  );};

  return (
    <div style={{minHeight:"100vh",background:C.bg}}><NavBar />
      <div style={{maxWidth:880,margin:"0 auto",padding:"28px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div><h1 style={{fontSize:22,fontWeight:800,color:C.gray900,marginBottom:4}}>Student Dashboard</h1>
            <p style={{color:C.gray500,fontSize:14}}>{student.name} · Class {student.class} · {student.course}
              <button onClick={onEditProfile} style={{marginLeft:8,padding:"2px 10px",borderRadius:6,border:`1px solid ${C.gray300}`,background:"#fff",color:C.primary,fontSize:11,fontWeight:600,cursor:"pointer"}}>✏ Edit Profile</button>
              <span onClick={()=>setShowPlans(true)} style={{marginLeft:8,padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:700,cursor:"pointer",background:student.plan==="free"?C.gray100:student.plan==="premium"?"#FEF3C7":"#FEE2E2",color:student.plan==="free"?C.gray500:student.plan==="premium"?"#D97706":"#DC2626"}}>{student.plan==="free"?"🆓 Free":student.plan==="premium"?"👑 Premium":"🚀 Crash"}</span></p>
          </div>
          <div style={{display:"flex",gap:8}}>
          </div>
        </div>
        {student.plan==="free"&&<Card style={{padding:"12px 20px",marginBottom:16,background:"linear-gradient(135deg,#0E1B2E,#1E3A5F)",border:"none"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:14,fontWeight:600,color:"#fff"}}>✨ Pragati — 1 free topic per subject</div><p style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:2}}>Upgrade to Premium to unlock all topics</p></div><Btn onClick={()=>setShowPlans(true)} style={{background:"#D97706",padding:"8px 16px",borderRadius:8,fontSize:12,color:"#fff",flexShrink:0}}>Unlock All ₹499</Btn></div></Card>}

        <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:`2px solid ${C.gray200}`}}>
          {[{id:"available",label:"Free Tests",count:freeTests.length},{id:"paid",label:"👑 Premium",count:paidTests.length},{id:"crash",label:"🚀 Crash",count:crashTests.length},{id:"results",label:"My Results",count:pastTests.length}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"12px 16px",fontSize:13,fontWeight:600,cursor:"pointer",border:"none",background:"transparent",color:tab===t.id?C.primary:C.gray500,borderBottom:tab===t.id?`2.5px solid ${C.primary}`:"2.5px solid transparent",marginBottom:-2}}>{t.label}<span style={{background:tab===t.id?C.blue50:C.gray100,color:tab===t.id?C.primary:C.gray500,fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:10}}>{t.count}</span></button>
          ))}
        </div>

        {tab==="available"&&<div style={{display:"grid",gap:12}}>{freeTests.length===0?<Card style={{textAlign:"center",padding:40,color:C.gray400}}>No free tests for Class {student.class}</Card>:freeTests.map(t=><TestCard key={t.id} t={t}/>)}</div>}
        {tab==="paid"&&<div style={{display:"grid",gap:12}}>
          {studentPlan==="free"&&<Card style={{padding:"20px 24px",background:"linear-gradient(135deg,#FFFBEB,#FEF3C7)",border:"1.5px solid #FCD34D"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><h3 style={{fontSize:16,fontWeight:800,color:"#92400E",margin:0}}>👑 Unlock Premium Tests</h3><p style={{fontSize:13,color:"#A16207",margin:"4px 0 0"}}>Get access to all {paidTests.length} premium tests with detailed analysis</p></div>
              <button onClick={()=>{const plan=PLANS.find(p=>p.id==="premium");if(plan)handleBuyPlan(plan);}} style={{padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#D97706,#B45309)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Buy Premium — ₹499</button>
            </div>
          </Card>}
          {paidTests.map(t=><TestCard key={t.id} t={t}/>)}
        </div>}
        {tab==="crash"&&<div style={{display:"grid",gap:12}}>
          {studentPlan!=="crash"&&<Card style={{padding:"20px 24px",background:"linear-gradient(135deg,#FEF2F2,#FEE2E2)",border:"1.5px solid #FCA5A5"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><h3 style={{fontSize:16,fontWeight:800,color:"#991B1B",margin:0}}>🚀 Unlock Crash Course</h3><p style={{fontSize:13,color:"#B91C1C",margin:"4px 0 0"}}>200+ intensive questions with subject-wise tests & priority support</p></div>
              <button onClick={()=>{const plan=PLANS.find(p=>p.id==="crash");if(plan)handleBuyPlan(plan);}} style={{padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#DC2626,#991B1B)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>Buy Crash Course — ₹999</button>
            </div>
          </Card>}
          {crashTests.map(t=><TestCard key={t.id} t={t}/>)}
        </div>}
        {tab==="results"&&(pastTests.length===0?<Card style={{textAlign:"center",padding:"60px 24px"}}><div style={{fontSize:48,marginBottom:16}}>📝</div><h3 style={{fontSize:18,fontWeight:700,color:C.gray700}}>No tests taken yet</h3><Btn onClick={()=>setTab("available")} style={{marginTop:16}}>Browse Tests</Btn></Card>:
          <div style={{display:"grid",gap:12}}>{[...pastTests].reverse().map((pt,idx)=>{const pct=pt.total>0?Math.round((pt.correct/pt.total)*100):0;const r2=22;const c2=2*Math.PI*r2;const cA2=c2*(pt.correct/Math.max(pt.total,1));const wA2=c2*(pt.wrong/Math.max(pt.total,1));return(
            <Card key={idx} style={{padding:"16px 20px",cursor:"pointer"}} onClick={()=>onViewResult(pt)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  {/* Mini donut */}
                  <svg width={54} height={54} viewBox="0 0 54 54" style={{flexShrink:0}}>
                    <circle cx={27} cy={27} r={r2} fill="none" stroke="#e5e7eb" strokeWidth="6"/>
                    {pt.correct>0&&<circle cx={27} cy={27} r={r2} fill="none" stroke="#16a34a" strokeWidth="6" strokeDasharray={`${cA2} ${c2-cA2}`} transform="rotate(-90 27 27)"/>}
                    {pt.wrong>0&&<circle cx={27} cy={27} r={r2} fill="none" stroke="#dc2626" strokeWidth="6" strokeDasharray={`${wA2} ${c2-wA2}`} strokeDashoffset={`${-cA2}`} transform="rotate(-90 27 27)"/>}
                    <text x={27} y={29} textAnchor="middle" dominantBaseline="middle" style={{fontSize:11,fontWeight:800,fill:"#1f2937"}}>{pct}%</text>
                  </svg>
                  <div>
                    <h3 style={{fontSize:15,fontWeight:600,color:C.gray800,margin:0}}>{pt.testName}{pt.pragatiInfo?` · ${pt.pragatiInfo.level}`:""}</h3>
                    <p style={{fontSize:12,color:C.gray400,margin:"4px 0 0"}}>{pt.date} · {pt.time}</p>
                    <div style={{display:"flex",gap:12,marginTop:6}}>
                      <span style={{fontSize:11,color:C.green,fontWeight:600}}>✓ {pt.correct}</span>
                      <span style={{fontSize:11,color:C.red,fontWeight:600}}>✗ {pt.wrong}</span>
                      <span style={{fontSize:11,color:C.gray400}}>— {pt.unanswered} skipped</span>
                      <span style={{fontSize:11,color:C.gray500}}>· {pt.correct}/{pt.total}</span>
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:11,color:C.gray400}}>Score</div>
                  <div style={{fontSize:20,fontWeight:800,color:pct>=60?C.green:pct>=30?C.orange:C.red}}>{pct}%</div>
                </div>
              </div>
            </Card>
          );})}</div>
        )}
      </div>

      {showPlans&&<div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",padding:20}} onClick={()=>!paymentProcessing&&setShowPlans(false)}>
        <div style={{background:"#fff",borderRadius:20,padding:"32px 28px",maxWidth:780,width:"100%",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}><div style={{textAlign:"center",flex:1}}><h2 style={{fontSize:22,fontWeight:800,margin:0}}>Choose Your Plan</h2><p style={{color:C.gray500,fontSize:14,marginTop:6}}>Unlock tests, Pragati, and crash courses</p></div><button onClick={()=>setShowPlans(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:C.gray400}}>✕</button></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            {PLANS.map(plan=>(<div key={plan.id} style={{borderRadius:14,border:`2px solid ${plan.current?plan.color:plan.popular?plan.color:C.gray200}`,padding:"24px 20px",position:"relative",background:plan.current?`${plan.color}08`:"#fff"}}>
              {plan.popular&&!plan.current&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",padding:"3px 14px",borderRadius:10,fontSize:10,fontWeight:700,background:plan.color,color:"#fff"}}>MOST POPULAR</div>}
              <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:32,marginBottom:8}}>{plan.icon}</div><h3 style={{fontSize:18,fontWeight:800,margin:0}}>{plan.name}</h3><div style={{marginTop:8}}><span style={{fontSize:28,fontWeight:800,color:plan.color}}>{plan.price===0?"Free":`₹${plan.price}`}</span>{plan.period&&<span style={{fontSize:13,color:C.gray400}}>{plan.period}</span>}</div></div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>{plan.features.map((f,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,fontSize:13,color:C.gray600}}><span style={{color:C.green,flexShrink:0}}>✓</span><span>{f}</span></div>))}</div>
              {plan.current?<div style={{textAlign:"center",padding:"10px",borderRadius:8,background:C.greenBg,color:C.green,fontWeight:700,fontSize:13}}>✓ Current Plan</div>:plan.price>0&&<Btn onClick={()=>handleBuyPlan(plan)} disabled={paymentProcessing} style={{width:"100%",justifyContent:"center",background:plan.color,color:"#fff",padding:"10px",borderRadius:8}}>{paymentProcessing?"Processing...":`Buy ${plan.name} — ₹${plan.price}`}</Btn>}
            </div>))}
          </div>
          <div style={{textAlign:"center",marginTop:20,fontSize:12,color:C.gray400}}>💳 {PAYMENT_MODE==="razorpay"?"Secure payment via Razorpay":"Pay via UPI / QR Code"} · Instant activation</div>
        </div>
      </div>}

      {/* Payment Modal */}
      {paymentModal && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)",padding:20}} onClick={()=>setPaymentModal(null)}>
          <div style={{background:"#fff",borderRadius:20,maxWidth:420,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"20px 24px",background:"linear-gradient(135deg,#2563eb,#1e40af)",borderRadius:"20px 20px 0 0",color:"#fff",textAlign:"center"}}>
              <div style={{fontSize:13,opacity:0.8}}>Pay for</div>
              <div style={{fontSize:22,fontWeight:800}}>{paymentModal.name} Plan</div>
              <div style={{fontSize:36,fontWeight:900,marginTop:4}}>₹{paymentModal.price}</div>
              <div style={{fontSize:11,opacity:0.7,marginTop:2}}>{student.name} · {(student.courses||[student.course]).join(", ")}</div>
            </div>
            <div style={{padding:"20px 24px"}}>

              {/* Method 1: Admin Payment Link */}
              {PAYMENT_LINKS[paymentModal.id] && (
                <a href={PAYMENT_LINKS[paymentModal.id]} target="_blank" rel="noopener noreferrer" onClick={()=>submitPaymentRequest(paymentModal,"payment_link")}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px",borderRadius:10,background:"linear-gradient(135deg,#16a34a,#15803d)",color:"#fff",fontSize:15,fontWeight:700,textDecoration:"none",marginBottom:12}}>
                  💳 Pay ₹{paymentModal.price} Now
                </a>
              )}

              <div style={{display:"flex",alignItems:"center",gap:12,margin:"12px 0"}}><div style={{flex:1,height:1,background:C.gray200}}/><span style={{fontSize:11,color:C.gray400}}>OR scan QR</span><div style={{flex:1,height:1,background:C.gray200}}/></div>

              {/* Method 2: QR Code */}
              <div style={{textAlign:"center",marginBottom:12}}>
                <div style={{display:"inline-block",padding:10,background:"#fff",borderRadius:12,border:`2px solid ${C.gray200}`}}>
                  <img src={getQRUrl(paymentModal)} alt="QR" style={{width:150,height:150,display:"block"}} />
                </div>
                <div style={{fontSize:10,color:C.gray400,marginTop:6}}>Scan with Google Pay / PhonePe / Paytm</div>
              </div>

              {/* Method 3: UPI Direct */}
              <a href={getUPILink(paymentModal)} onClick={()=>submitPaymentRequest(paymentModal,"upi_direct")}
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",borderRadius:8,background:"#eff6ff",border:`1px solid #2563eb`,color:"#2563eb",fontSize:13,fontWeight:600,textDecoration:"none",marginBottom:10}}>
                📱 Open UPI App
              </a>

              {/* UPI ID */}
              <div style={{textAlign:"center",padding:"8px",background:C.gray50,borderRadius:6,marginBottom:12}}>
                <span style={{fontSize:11,color:C.gray500}}>UPI ID: </span>
                <strong style={{fontSize:13,fontFamily:"monospace"}}>{UPI_ID}</strong>
                <button onClick={()=>{navigator.clipboard.writeText(UPI_ID);setAutoSendToast("📋 Copied!");setTimeout(()=>setAutoSendToast(""),1500);}} style={{marginLeft:6,fontSize:10,color:C.primary,background:"none",border:"none",cursor:"pointer"}}>Copy</button>
              </div>

              {/* After Payment */}
              <button onClick={()=>submitPaymentRequest(paymentModal,"manual_upi")}
                style={{width:"100%",padding:"12px",borderRadius:10,border:`2px solid #16a34a`,background:"#f0fdf4",color:"#16a34a",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8}}>
                ✅ I've Paid — Submit for Approval
              </button>
              <button onClick={()=>setPaymentModal(null)}
                style={{width:"100%",padding:"10px",borderRadius:8,border:`1px solid ${C.gray300}`,background:"#fff",color:C.gray500,fontSize:13,cursor:"pointer"}}>Cancel</button>

              <div style={{textAlign:"center",fontSize:10,color:C.gray400,marginTop:10}}>⏳ Admin will verify your payment and activate the plan within 24 hours</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ EXAM SCREEN ═══
function ExamScreen({ onSubmit, customQuestions, examConfig }) {
  const questions = customQuestions || ALL_QUESTIONS;
  const config = examConfig || { name:"CET Mock Test", duration:1800 };
  const sections = [...new Set(questions.map(q=>q.subject||q.section||q.chapter||"General"))];
  const hasSectionTimers = config.sectionTimers && config.sectionTimers.length > 0;
  const sectionDefs = hasSectionTimers ? config.sectionTimers : [{name:"All",subjects:sections,duration:config.duration}];

  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState(new Set());
  const [section, setSection] = useState(sections[0]);
  const [showSummary, setShowSummary] = useState(false);
  const [startTime] = useState(Date.now());
  const [lastVisit, setLastVisit] = useState(Date.now());
  const [visited, setVisited] = useState(new Set([0]));
  const [questionTimes, setQuestionTimes] = useState({});
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [lockedSections, setLockedSections] = useState([]);
  const [sectionSubmitted, setSectionSubmitted] = useState(false);

  const currentSectionDef = sectionDefs[activeSectionIdx]||sectionDefs[0];
  const sectionTimeLeft = useTimer(currentSectionDef.duration, !showSummary && !sectionSubmitted);
  const timeLeft = hasSectionTimers ? sectionTimeLeft : useTimer(config.duration, !showSummary);

  const isQuestionLocked = (i) => {
    if (!hasSectionTimers) return false;
    const qSub = questions[i].subject||questions[i].section||"General";
    return lockedSections.some(ls=>(ls.subjects||[]).includes(qSub));
  };

  useEffect(()=>{
    if(!hasSectionTimers||showSummary)return;
    if(sectionTimeLeft<=0&&activeSectionIdx<sectionDefs.length-1){
      setLockedSections(p=>[...p,currentSectionDef]);
      setActiveSectionIdx(activeSectionIdx+1);setSectionSubmitted(true);
      setTimeout(()=>setSectionSubmitted(false),100);
      const nextSec=sectionDefs[activeSectionIdx+1];
      const firstQ=questions.findIndex(q=>(nextSec.subjects||[]).includes(q.subject||"General"));
      if(firstQ>=0)navigate(firstQ);
    }else if(sectionTimeLeft<=0&&activeSectionIdx===sectionDefs.length-1)doSubmit();
  },[sectionTimeLeft]);

  const navigate=(i)=>{if(isQuestionLocked(i))return;const now=Date.now();setQuestionTimes(p=>({...p,[cur]:(p[cur]||0)+(now-lastVisit)/1000}));setLastVisit(now);setCur(i);setVisited(p=>new Set([...p,i]));setSection(questions[i].subject||questions[i].section||"General");};
  const doSubmit=()=>{const elapsed=Math.round((Date.now()-startTime)/1000);let correct=0,wrong=0,unanswered=0;questions.forEach((q,i)=>{if(answers[i]===undefined)unanswered++;else if(answers[i]===q.correct)correct++;else wrong++;});onSubmit({correct,wrong,unanswered,total:questions.length,answers,questions,elapsed,testName:config.name,date:new Date().toLocaleDateString("en-IN"),time:new Date().toLocaleTimeString("en-IN"),course:"CET-PCM",questionTimes});};

  if(timeLeft<=0&&!showSummary)doSubmit();

  const getStatus=(i)=>{if(answers[i]!==undefined&&marked.has(i))return{bg:"#7c3aed",color:"#fff",shape:"circle-ring"};if(answers[i]!==undefined)return{bg:C.green,color:"#fff",shape:"circle"};if(marked.has(i))return{bg:C.purple,color:"#fff",shape:"default"};if(visited.has(i))return{bg:C.red,color:"#fff",shape:"default"};return{bg:C.gray200,color:C.gray600,shape:"default"};};
  const q=questions[cur];

  if(showSummary)return(
    <div style={{minHeight:"100vh",background:C.bg,padding:40}}><Card style={{maxWidth:600,margin:"0 auto",padding:32}}>
      <h2 style={{fontSize:20,fontWeight:800,marginBottom:20,textAlign:"center"}}>Submit Exam?</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {[{l:"Answered",v:Object.keys(answers).length,c:C.green},{l:"Marked",v:marked.size,c:C.purple},{l:"Not Visited",v:questions.length-visited.size,c:C.gray400},{l:"Total",v:questions.length,c:C.primary}].map(s=><div key={s.l} style={{textAlign:"center",padding:12,borderRadius:8,background:C.gray50}}><div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:C.gray500}}>{s.l}</div></div>)}
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}><Btn variant="ghost" onClick={()=>setShowSummary(false)}>← Back to Exam</Btn><Btn variant="success" onClick={doSubmit}>✓ Submit Exam</Btn></div>
    </Card></div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:"#fff",borderBottom:`1px solid ${C.gray200}`,padding:"10px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><h2 style={{fontSize:16,fontWeight:700,margin:0,color:C.gray800}}>{config.name}</h2>
          <div style={{display:"flex",gap:2,background:C.gray100,borderRadius:6,padding:2}}>
            {sections.map(sub=>{const isLocked=hasSectionTimers&&lockedSections.some(ls=>(ls.subjects||[]).includes(sub));return(
              <button key={sub} onClick={()=>{if(isLocked)return;setSection(sub);navigate(questions.findIndex(q=>(q.subject||"General")===sub));}} style={{padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:600,cursor:isLocked?"not-allowed":"pointer",border:"none",background:section===sub?C.primary:"transparent",color:section===sub?"#fff":isLocked?C.gray300:C.gray500,opacity:isLocked?0.5:1}}>{isLocked?"🔒 ":""}{sub}</button>
            );})}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {hasSectionTimers&&<span style={{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:6,background:"#f0fdf4",color:"#166534"}}>Section {activeSectionIdx+1}/{sectionDefs.length}</span>}
          <div style={{padding:"8px 16px",borderRadius:8,fontWeight:700,fontSize:16,fontFamily:"monospace",background:timeLeft<300?C.redBg:C.blue50,color:timeLeft<300?C.red:C.primary}}>{fmtTime(timeLeft)}</div>
        </div>
      </div>
      <div style={{display:"flex",maxWidth:1100,margin:"0 auto",gap:0,minHeight:"calc(100vh - 57px)"}}>
        <div style={{flex:1,padding:"24px 28px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <span style={{fontSize:14,color:C.gray500}}>Question {cur+1} of {questions.length}</span>
            <span style={{fontSize:12,color:C.gray400,background:C.gray100,padding:"4px 10px",borderRadius:4}}>{q.subject||section} · {q.chapter||""}</span>
          </div>
          <Card style={{marginBottom:20,padding:"24px 28px",borderLeft:`4px solid ${C.primary}`}}>
            <p style={{fontSize:16,fontWeight:600,color:C.gray800,lineHeight:1.6}}>Q{cur+1}. {q.q||q.question_text}</p>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
            {(q.options||[q.option_a,q.option_b,q.option_c,q.option_d]).map((opt,oi)=>{const sel=answers[cur]===oi;return(
              <div key={oi} onClick={()=>setAnswers({...answers,[cur]:oi})} style={{padding:"14px 18px",borderRadius:10,border:`2px solid ${sel?C.primary:C.gray200}`,background:sel?C.blue50:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                <span style={{width:28,height:28,borderRadius:"50%",background:sel?C.primary:C.gray100,color:sel?"#fff":C.gray600,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13}}>{String.fromCharCode(65+oi)}</span>
                <span style={{fontSize:14,color:sel?C.primary:C.gray700}}>{opt}</span>
              </div>
            );})}
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div style={{display:"flex",gap:8}}><Btn variant="ghost" onClick={()=>cur>0&&navigate(cur-1)} disabled={cur===0}>← Previous</Btn><Btn variant="ghost" onClick={()=>{setMarked(p=>{const n=new Set(p);if(n.has(cur))n.delete(cur);else n.add(cur);return n;})}}>{marked.has(cur)?"★ Unmark":"☆ Mark for Review"}</Btn>{answers[cur]!==undefined&&<Btn variant="ghost" onClick={()=>{const n={...answers};delete n[cur];setAnswers(n);}}>Clear</Btn>}</div>
            <div style={{display:"flex",gap:8}}>{cur<questions.length-1?<Btn onClick={()=>navigate(cur+1)}>Next →</Btn>:<Btn variant="success" onClick={()=>setShowSummary(true)}>Submit Exam</Btn>}</div>
          </div>
        </div>
        <div style={{width:240,borderLeft:`1px solid ${C.gray200}`,padding:"20px 16px",background:"#fff"}}>
          <h3 style={{fontSize:13,fontWeight:700,color:C.gray700,marginBottom:12}}>PALETTE</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:20}}>
            {questions.map((_,i)=>{const s=getStatus(i);const locked=isQuestionLocked(i);return(
              <div key={i} onClick={()=>{if(!locked)navigate(i);}} style={{width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:locked?"not-allowed":"pointer",borderRadius:s.shape==="circle"||s.shape==="circle-ring"?"50%":8,background:s.bg,color:s.color,fontSize:12,fontWeight:700,opacity:locked?0.3:1,outline:i===cur?`2.5px solid ${C.primary}`:"none",outlineOffset:1}}>{i+1}</div>
            );})}
          </div>
          <h3 style={{fontSize:13,fontWeight:700,color:C.gray700,marginBottom:8}}>LEGEND</h3>
          {[{bg:C.green,c:"#fff",l:"Answered"},{bg:C.red,c:"#fff",l:"Not Answered"},{bg:C.gray200,c:C.gray600,l:"Not Visited"},{bg:C.purple,c:"#fff",l:"Marked for Review"}].map(s=>(
            <div key={s.l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:20,height:20,borderRadius:4,background:s.bg,border:`1px solid ${s.bg}`}}></div><span style={{fontSize:12,color:C.gray600}}>{s.l}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ RESULTS ═══
function Results({ result, onRestart, isNewSubmission, isPragati }) {
  const { correct, wrong, unanswered, total, answers, questions, elapsed, testName } = result;
  const score = correct; const pct = total > 0 ? Math.round((correct/total)*100) : 0;
  const accuracy = (correct+wrong)>0 ? Math.round((correct/(correct+wrong))*100) : 0;
  const [tab, setTab] = useState("summary");

  const subjectStats = useMemo(()=>{const m={};questions.forEach((q,i)=>{const sub=q.subject||q.section||"General";if(!m[sub])m[sub]={subject:sub,total:0,correct:0,wrong:0,unanswered:0};m[sub].total++;if(answers[i]===undefined)m[sub].unanswered++;else if(answers[i]===q.correct)m[sub].correct++;else m[sub].wrong++;});return Object.values(m);},[questions,answers]);

  const chapterStats = {};
  questions.forEach((q,i)=>{const ch=q.chapter||"General";const sub=q.subject||"General";if(!chapterStats[ch])chapterStats[ch]={total:0,correct:0,wrong:0,unanswered:0,subject:sub};chapterStats[ch].total++;if(answers[i]===undefined)chapterStats[ch].unanswered++;else if(answers[i]===q.correct)chapterStats[ch].correct++;else chapterStats[ch].wrong++;});

  // For Pragati single-topic exams, only show the tested topic
  const displayChapterStats = result.pragatiInfo ? 
    Object.fromEntries(Object.entries(chapterStats).filter(([ch]) => ch === result.pragatiInfo.topicName || Object.keys(chapterStats).length <= 1)) : 
    chapterStats;

  const subjectRows = subjectStats.map(s=>{const sp=s.total>0?Math.round((s.correct/s.total)*100):0;const sa=(s.correct+s.wrong)>0?Math.round((s.correct/(s.correct+s.wrong))*100):0;return`<tr><td style="padding:10px 14px;font-weight:600">${s.subject}</td><td style="text-align:center">${s.total}</td><td style="text-align:center">${s.correct+s.wrong}</td><td style="text-align:center;color:#16a34a;font-weight:700">${s.correct}</td><td style="text-align:center;color:#dc2626">${s.wrong}</td><td style="text-align:center;font-weight:700;color:${sp>=60?"#16a34a":"#ea580c"}">${sp}%</td><td style="text-align:center">${sa}%</td></tr>`;}).join("");

  const downloadPDF = () => {
    const scoreDonut = `<svg width="140" height="140" viewBox="0 0 140 140" style="display:block;margin:0 auto 10px"><circle cx="70" cy="70" r="56" fill="none" stroke="#e5e7eb" stroke-width="14"/><circle cx="70" cy="70" r="56" fill="none" stroke="${pct>=60?"#16a34a":pct>=30?"#ea580c":"#dc2626"}" stroke-width="14" stroke-dasharray="${2*Math.PI*56*pct/100} ${2*Math.PI*56*(1-pct/100)}" transform="rotate(-90 70 70)" stroke-linecap="round"/><text x="70" y="64" text-anchor="middle" font-size="28" font-weight="900" fill="#1f2937">${pct}%</text><text x="70" y="84" text-anchor="middle" font-size="12" fill="#6b7280">${score}/${total}</text></svg>`;
    const subjectDonuts = subjectStats.map(s=>{const sp=s.total>0?Math.round((s.correct/s.total)*100):0;return`<div style="text-align:center;flex:1"><svg width="90" height="90" viewBox="0 0 90 90" style="display:block;margin:0 auto 6px"><circle cx="45" cy="45" r="36" fill="none" stroke="#e5e7eb" stroke-width="9"/><circle cx="45" cy="45" r="36" fill="none" stroke="${sp>=60?"#16a34a":sp>=30?"#ea580c":"#dc2626"}" stroke-width="9" stroke-dasharray="${2*Math.PI*36*sp/100} ${2*Math.PI*36*(1-sp/100)}" transform="rotate(-90 45 45)" stroke-linecap="round"/><text x="45" y="48" text-anchor="middle" font-size="18" font-weight="800" fill="#1f2937">${sp}%</text></svg><div style="font-size:14px;font-weight:700">${s.subject}</div><div style="font-size:11px;color:#6b7280">${s.correct}/${s.total}</div></div>`;}).join("");
    const chapterBars = Object.entries(displayChapterStats).map(([ch,s])=>{const cp=Math.round((s.correct/s.total)*100);return`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-weight:600">${ch} <span style="color:#9ca3af;font-size:11px">(${s.subject})</span></span><span style="font-weight:700;color:${cp>=60?"#16a34a":"#dc2626"}">${cp}%</span></div><div style="height:10px;border-radius:5px;background:#e5e7eb;overflow:hidden"><div style="height:100%;border-radius:5px;background:${cp>=60?"#16a34a":"#dc2626"};width:${cp}%"></div></div><div style="font-size:10px;color:#9ca3af">✓${s.correct} ✗${s.wrong} — ${s.unanswered} skipped</div></div>`;}).join("");

    const html = `<!DOCTYPE html><html><head><title>Test Report</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;padding:40px;color:#1f2937}h2{font-size:18px;margin:28px 0 14px;border-bottom:2px solid #2563eb;padding-bottom:6px}.row{display:flex;gap:16px;margin-bottom:24px}.sc{flex:1;border:1px solid #e5e7eb;border-radius:10px;padding:16px;text-align:center}.sc .n{font-size:26px;font-weight:800}.sc .l{font-size:12px;color:#6b7280}table{width:100%;border-collapse:collapse;font-size:14px}thead tr{background:#f3f4f6}th{padding:10px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase}tbody tr{border-bottom:1px solid #f3f4f6}@media print{body{padding:20px}}</style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #2563eb;padding-bottom:16px;margin-bottom:20px"><img src="${LOGO_BASE64}" style="height:52px"/><div style="text-align:right"><h1 style="font-size:20px;font-weight:800">Test Report Card</h1><p style="font-size:12px;color:#6b7280">${result.pragatiInfo?result.pragatiInfo.topicName+" · "+result.pragatiInfo.level+" · ":""}${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</p></div></div>
    <h2>Score Summary</h2>${scoreDonut}<div class="row"><div class="sc"><div class="n" style="color:#16a34a">${correct}</div><div class="l">Correct</div></div><div class="sc"><div class="n" style="color:#dc2626">${wrong}</div><div class="l">Incorrect</div></div><div class="sc"><div class="n" style="color:#6b7280">${unanswered}</div><div class="l">Skipped</div></div><div class="sc"><div class="n" style="color:#2563eb">${total}</div><div class="l">Total</div></div></div>
    <h2>Subject Analysis</h2><div style="display:flex;gap:16px;justify-content:center;margin-bottom:16px">${subjectDonuts}</div><table><thead><tr><th>Subject</th><th style="text-align:center">Total</th><th style="text-align:center">Attempted</th><th style="text-align:center">Correct</th><th style="text-align:center">Incorrect</th><th style="text-align:center">Score</th><th style="text-align:center">Accuracy</th></tr></thead><tbody>${subjectRows}</tbody></table>
    <h2>Chapter Analysis</h2>${chapterBars}
    <div style="margin-top:32px;padding:16px 0;border-top:2px solid #e5e7eb;display:flex;justify-content:space-between"><img src="${LOGO_BASE64}" style="height:30px;opacity:0.7"/><div style="color:#9ca3af;font-size:11px;text-align:right">GR Educational · Test Report · ${new Date().getFullYear()}</div></div>
    <script>window.onload=function(){window.print()}<\/script></body></html>`;
    const blob = new Blob([html], {type:"text/html;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Report_${(result.pragatiInfo?.topicName||"Test").replace(/\s/g,"_")}_${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  };

  const DonutChart = ({value,size=100,stroke=12,color}) => {
    const r=(size-stroke)/2;const circ=2*Math.PI*r;const dash=circ*value/100;
    return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.gray200} strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color||C.primary} strokeWidth={stroke} strokeDasharray={`${dash} ${circ-dash}`} transform={`rotate(-90 ${size/2} ${size/2})`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.6s"}}/><text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" style={{fontSize:size*0.22,fontWeight:800,fill:C.gray800}}>{value}%</text></svg>);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg}}><NavBar/>
      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div><h1 style={{fontSize:22,fontWeight:800}}>Test Results{result.pragatiInfo?` — ${result.pragatiInfo.topicName} · ⚡ ${result.pragatiInfo.level}`:""}</h1></div>
          <Btn onClick={downloadPDF} variant="outline" icon={Icon.download()}>Download PDF</Btn>
        </div>
        <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:`2px solid ${C.gray200}`}}>
          {[{id:"summary",l:"📊 Score Summary"},{id:"subject",l:"📚 Subject Analysis"},{id:"chapter",l:"📖 Chapter Analysis"},{id:"question",l:"📝 Question-wise"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"12px 16px",fontSize:13,fontWeight:600,border:"none",background:"transparent",cursor:"pointer",color:tab===t.id?C.primary:C.gray500,borderBottom:tab===t.id?`2.5px solid ${C.primary}`:"2.5px solid transparent",marginBottom:-2}}>{t.l}</button>
          ))}
        </div>

        {tab==="summary"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Card style={{textAlign:"center",padding:24}}>
            {(()=>{const r=55;const circ=2*Math.PI*r;const cA=circ*(correct/Math.max(total,1));const wA=circ*(wrong/Math.max(total,1));const sA=circ*(unanswered/Math.max(total,1));return(
            <svg width={140} height={140} viewBox="0 0 140 140" style={{display:"block",margin:"0 auto"}}>
              <circle cx={70} cy={70} r={r} fill="none" stroke="#e5e7eb" strokeWidth="14"/>
              {correct>0&&<circle cx={70} cy={70} r={r} fill="none" stroke="#16a34a" strokeWidth="14" strokeDasharray={`${cA} ${circ-cA}`} transform="rotate(-90 70 70)" strokeLinecap="round"/>}
              {wrong>0&&<circle cx={70} cy={70} r={r} fill="none" stroke="#dc2626" strokeWidth="14" strokeDasharray={`${wA} ${circ-wA}`} strokeDashoffset={`${-cA}`} transform="rotate(-90 70 70)" strokeLinecap="round"/>}
              {unanswered>0&&<circle cx={70} cy={70} r={r} fill="none" stroke="#9ca3af" strokeWidth="14" strokeDasharray={`${sA} ${circ-sA}`} strokeDashoffset={`${-(cA+wA)}`} transform="rotate(-90 70 70)" strokeLinecap="round"/>}
              <text x={70} y={64} textAnchor="middle" dominantBaseline="middle" style={{fontSize:28,fontWeight:900,fill:"#1f2937"}}>{pct}%</text>
              <text x={70} y={84} textAnchor="middle" style={{fontSize:12,fill:"#9ca3af"}}>{score}/{total}</text>
            </svg>);})()}
            <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:12}}>
              <span style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}><span style={{width:10,height:10,borderRadius:"50%",background:"#16a34a"}}/>Correct {correct}</span>
              <span style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}><span style={{width:10,height:10,borderRadius:"50%",background:"#dc2626"}}/>Wrong {wrong}</span>
              <span style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}><span style={{width:10,height:10,borderRadius:"50%",background:"#9ca3af"}}/>Skipped {unanswered}</span>
            </div>
          </Card>
          <Card style={{padding:24}}><h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>Performance</h3>{[{l:"Correct",v:correct,c:C.green},{l:"Incorrect",v:wrong,c:C.red},{l:"Unattempted",v:unanswered,c:C.gray400},{l:"Accuracy",v:`${accuracy}%`,c:C.primary},{l:"Result",v:pct>=70?"🏆 Excellent":pct>=40?"⚡ Good":"📖 Needs Improvement",c:pct>=70?C.green:pct>=40?C.orange:C.red},{l:"Time",v:`${Math.round(elapsed/60)}m ${elapsed%60}s`,c:C.gray600}].map(m=>(<div key={m.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.gray100}`}}><span style={{color:C.gray500}}>{m.l}</span><strong style={{color:m.c}}>{m.v}</strong></div>))}</Card>
        </div>}

        {tab==="subject"&&<Card style={{padding:24}}><h3 style={{fontSize:16,fontWeight:700,marginBottom:24}}>Subject-wise Comparison</h3>
          <div style={{display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>{subjectStats.map(s=>{const sp=s.total>0?Math.round((s.correct/s.total)*100):0;const sr=36;const sc=2*Math.PI*sr;const scA=sc*(s.correct/Math.max(s.total,1));const swA=sc*(s.wrong/Math.max(s.total,1));const ssA=sc*((s.total-s.correct-s.wrong)/Math.max(s.total,1));return(<div key={s.subject} style={{textAlign:"center"}}>
            <svg width={90} height={90} viewBox="0 0 90 90" style={{display:"block",margin:"0 auto"}}>
              <circle cx={45} cy={45} r={sr} fill="none" stroke="#e5e7eb" strokeWidth="10"/>
              {s.correct>0&&<circle cx={45} cy={45} r={sr} fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray={`${scA} ${sc-scA}`} transform="rotate(-90 45 45)" strokeLinecap="round"/>}
              {s.wrong>0&&<circle cx={45} cy={45} r={sr} fill="none" stroke="#dc2626" strokeWidth="10" strokeDasharray={`${swA} ${sc-swA}`} strokeDashoffset={`${-scA}`} transform="rotate(-90 45 45)" strokeLinecap="round"/>}
              <text x={45} y={43} textAnchor="middle" dominantBaseline="middle" style={{fontSize:16,fontWeight:900,fill:"#1f2937"}}>{sp}%</text>
              <text x={45} y={57} textAnchor="middle" style={{fontSize:9,fill:"#9ca3af"}}>{s.correct}/{s.total}</text>
            </svg>
            <div style={{fontSize:14,fontWeight:700,marginTop:6}}>{s.subject}</div>
            <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:4}}>
              <span style={{fontSize:10,color:"#16a34a"}}>✓{s.correct}</span>
              <span style={{fontSize:10,color:"#dc2626"}}>✗{s.wrong}</span>
              {(s.total-s.correct-s.wrong)>0&&<span style={{fontSize:10,color:"#9ca3af"}}>—{s.total-s.correct-s.wrong}</span>}
            </div>
          </div>);})}</div>
        </Card>}

        {tab==="chapter"&&<Card style={{padding:24}}><h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Chapter-wise Breakdown</h3>
          {Object.entries(displayChapterStats).map(([ch,s])=>{const cp=s.total>0?Math.round((s.correct/s.total)*100):0;return(<div key={ch} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontWeight:700}}>{ch} <span style={{fontSize:12,color:C.gray400}}>{s.subject}</span></span><span style={{fontWeight:800,color:cp>=60?C.green:C.orange}}>{cp}%</span></div>
            <div style={{height:8,borderRadius:4,background:C.gray200,overflow:"hidden"}}><div style={{height:"100%",borderRadius:4,background:cp>=60?C.green:cp>=30?C.orange:C.red,width:`${cp}%`}}/></div>
            <div style={{fontSize:11,color:C.gray400,marginTop:2}}>✓ {s.correct}  ✗ {s.wrong}  — {s.unanswered} skipped  ·  {s.correct}/{s.total}</div>
          </div>);})}
        </Card>}

        {tab==="question"&&<Card style={{padding:24}}><h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Question-wise Review</h3>
          {questions.map((q,i)=>{const userAns=answers[i];const isCorrect=userAns===q.correct;const isSkipped=userAns===undefined;return(
            <div key={i} style={{padding:"12px 16px",borderBottom:`1px solid ${C.gray100}`,display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0,background:isSkipped?C.gray100:isCorrect?C.greenBg:C.redBg,color:isSkipped?C.gray400:isCorrect?C.green:C.red}}>{isSkipped?"—":isCorrect?"✓":"✗"}</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.gray700}}>Q{i+1}. {q.q||q.question_text}</div><div style={{fontSize:12,color:C.gray500,marginTop:4}}>{q.subject} · {q.chapter}</div>
                {!isSkipped&&!isCorrect&&<div style={{fontSize:12,marginTop:4}}><span style={{color:C.red}}>Your: {String.fromCharCode(65+userAns)}</span> · <span style={{color:C.green}}>Correct: {String.fromCharCode(65+q.correct)}</span></div>}
                {q.solution&&<div style={{fontSize:12,color:C.primary,marginTop:4,padding:"4px 8px",background:C.blue50,borderRadius:4}}>💡 {q.solution}</div>}
              </div>
            </div>
          );})}
        </Card>}

        <div style={{textAlign:"center",marginTop:20}}><Btn onClick={onRestart} variant="primary">← Back to Dashboard</Btn></div>
      </div>
    </div>
  );
}

// ═══ PRAGATI ═══
const PRAGATI_SUBJECTS = {
  physics:[{id:"kin",name:"Kinematics",isFree:true},{id:"lom",name:"Laws of Motion",isFree:false},{id:"wep",name:"Work Energy Power",isFree:false},{id:"grv",name:"Gravitation",isFree:false},{id:"opt",name:"Optics",isFree:false},{id:"cel",name:"Current Electricity",isFree:false},{id:"elc",name:"Electrostatics",isFree:false},{id:"mag",name:"Magnetism",isFree:false},{id:"mod",name:"Modern Physics",isFree:false},{id:"thm",name:"Thermodynamics",isFree:false},{id:"wav",name:"Waves",isFree:false}],
  chemistry:[{id:"crx",name:"Chemical Reactions",isFree:true},{id:"bon",name:"Chemical Bonding",isFree:false},{id:"equ",name:"Ionic Equilibrium",isFree:false},{id:"mol",name:"Mole Concept",isFree:false},{id:"per",name:"Periodic Table",isFree:false},{id:"org",name:"Organic Chemistry",isFree:false},{id:"ecm",name:"Electrochemistry",isFree:false},{id:"sol",name:"Solid State",isFree:false}],
  math:[{id:"dif",name:"Differentiation",isFree:true},{id:"int",name:"Integration",isFree:false},{id:"mat",name:"Matrices",isFree:false},{id:"con",name:"Conic Sections",isFree:false},{id:"lim",name:"Limits",isFree:false},{id:"prb",name:"Probability",isFree:false},{id:"tri",name:"Trigonometry",isFree:false},{id:"alg",name:"Algebra",isFree:false},{id:"vec",name:"Vectors & 3D",isFree:false}],
};

const SUBJECT_META = {
  physics:{icon:"⚛️",color:"#dc2626",bg:"#fef2f2",label:"भौतिकी · Physics"},
  chemistry:{icon:"🧪",color:"#16a34a",bg:"#f0fdf4",label:"रसायन · Chemistry"},
  math:{icon:"📐",color:"#2563eb",bg:"#eff6ff",label:"गणित · Mathematics"},
};

const INITIAL_PRAGATI = {};
Object.entries(PRAGATI_SUBJECTS).forEach(([subId,topics])=>{INITIAL_PRAGATI[subId]={};topics.forEach(t=>{INITIAL_PRAGATI[subId][t.id]={arambh:null,shikhar:null,arambhAttempts:[],shikharAttempts:[]};});});
// Demo data
INITIAL_PRAGATI.physics.kin = {arambh:88,shikhar:72,arambhAttempts:[{score:88,date:"2026-02-01"},{score:75,date:"2026-01-25"}],shikharAttempts:[{score:72,date:"2026-02-05"}]};
INITIAL_PRAGATI.chemistry.crx = {arambh:65,shikhar:null,arambhAttempts:[{score:65,date:"2026-02-03"}],shikharAttempts:[]};

const getTopicStatus = (attempt) => {
  if (!attempt||(!attempt.arambh&&!attempt.shikhar)) return {key:"pending",label:"Pending",color:C.gray400,bg:C.gray100};
  if (attempt.shikhar>=70) return {key:"excellent",label:"Excellent",color:C.green,bg:C.greenBg};
  if (attempt.arambh>=70) return {key:"partial",label:"Partial",color:C.orange,bg:C.orangeBg};
  return {key:"attention",label:"Attention",color:C.red,bg:C.redBg};
};

function TopicRoadCard({topic, attempt, onAction, onViewResult}) {
  const a = attempt || {arambh:null,shikhar:null,arambhAttempts:[],shikharAttempts:[]};
  const status = getTopicStatus(a);
  return (
    <Card style={{borderLeft:`4px solid ${status.color}`,padding:"16px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h4 style={{fontSize:15,fontWeight:700,margin:0}}>{topic.name}</h4>
        <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:8,background:status.bg,color:status.color}}>{status.label}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{padding:10,borderRadius:8,background:a.arambh?C.greenBg:C.gray50,textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:600,color:C.gray500}}>Arambh</div>
          {a.arambh?<><div style={{fontSize:22,fontWeight:800,color:a.arambh>=70?C.green:C.orange}}>{a.arambh}%</div><div style={{fontSize:10,color:C.gray400}}>{a.arambhAttempts?.length||0} attempts</div><button onClick={()=>onViewResult&&onViewResult("arambh",a.arambh)} style={{background:"none",border:"none",color:C.primary,fontSize:11,cursor:"pointer",fontWeight:600,marginTop:4}}>📊 View</button></>:
          <Btn onClick={()=>onAction("arambh")} style={{width:"100%",justifyContent:"center",marginTop:6,fontSize:12}}>Start Arambh</Btn>}
        </div>
        <div style={{padding:10,borderRadius:8,background:a.shikhar?C.greenBg:a.arambh>=70?C.gray50:"#f9fafb",textAlign:"center",opacity:a.arambh>=70||a.shikhar?1:0.5}}>
          <div style={{fontSize:11,fontWeight:600,color:C.gray500}}>Shikhar</div>
          {a.shikhar?<><div style={{fontSize:22,fontWeight:800,color:a.shikhar>=70?C.green:C.orange}}>{a.shikhar}%</div><div style={{fontSize:10,color:C.gray400}}>{a.shikharAttempts?.length||0} attempts</div><button onClick={()=>onViewResult&&onViewResult("shikhar",a.shikhar)} style={{background:"none",border:"none",color:C.primary,fontSize:11,cursor:"pointer",fontWeight:600,marginTop:4}}>📊 View</button></>:
          a.arambh>=70?<Btn onClick={()=>onAction("shikhar")} variant="success" style={{width:"100%",justifyContent:"center",marginTop:6,fontSize:12}}>Start Shikhar</Btn>:
          <div style={{fontSize:11,color:C.gray400,marginTop:6}}>🔒 Complete Arambh first</div>}
        </div>
      </div>
      {(a.arambh&&a.arambh<70)&&<Btn onClick={()=>onAction("retake_arambh")} variant="outline" style={{width:"100%",justifyContent:"center",marginTop:8,fontSize:12}}>🔄 Retake Arambh</Btn>}
      {(a.shikhar&&a.shikhar<70)&&<Btn onClick={()=>onAction("retake_shikhar")} variant="outline" style={{width:"100%",justifyContent:"center",marginTop:8,fontSize:12}}>🔄 Retake Shikhar</Btn>}
    </Card>
  );
}

function PragatiScreen({onBack, onLaunchExam, progress, setProgress, onViewStoredResult, studentPlan, onUpgrade}) {
  const [openSubject, setOpenSubject] = useState(null);
  const [resultPreview, setResultPreview] = useState(null);
  const isPaid = studentPlan==="premium"||studentPlan==="crash"||studentPlan==="pragati";
  const canAccessTopic = (topic) => topic.isFree||isPaid;

  const [classLearned, setClassLearned] = useState({
    physics:{count:3,topics:["Kinematics","Laws of Motion","Gravitation"]},
    chemistry:{count:2,topics:["Chemical Reactions","Chemical Bonding"]},
    math:{count:1,topics:["Differentiation"]},
  });
  const [editingSubject, setEditingSubject] = useState(null);
  const [newTopicInput, setNewTopicInput] = useState("");
  const addClassTopic = (subId)=>{if(!newTopicInput.trim())return;setClassLearned(p=>({...p,[subId]:{count:(p[subId]?.count||0)+1,topics:[...(p[subId]?.topics||[]),newTopicInput.trim()]}}));setNewTopicInput("");};
  const removeClassTopic = (subId,idx)=>{setClassLearned(p=>({...p,[subId]:{count:Math.max(0,(p[subId]?.count||1)-1),topics:(p[subId]?.topics||[]).filter((_,i)=>i!==idx)}}));};

  const overall = useMemo(()=>{let done=0,total=0,excellent=0,partial=0,attention=0;Object.entries(PRAGATI_SUBJECTS).forEach(([subId,topics])=>{topics.filter(t=>canAccessTopic(t)).forEach(t=>{total++;const st=getTopicStatus(progress[subId]?.[t.id]);if(["excellent","partial","attention"].includes(st.key))done++;if(st.key==="excellent")excellent++;if(st.key==="partial")partial++;if(st.key==="attention")attention++;});});return{done,total,pct:total?Math.round((done/total)*100):0,excellent,partial,attention};},[progress,isPaid]);

  const handleAction = (subId, topic, action) => {
    const questions = ALL_QUESTIONS.filter(q=>q.subject===(subId==="math"?"Mathematics":subId.charAt(0).toUpperCase()+subId.slice(1))).slice(0,5);
    onLaunchExam({subjectKey:subId,topicId:topic.id,topicName:topic.name,level:action},{questions,name:`${topic.name} — ${action}`,duration:600});
  };

  if(openSubject){
    const meta=SUBJECT_META[openSubject];const topics=PRAGATI_SUBJECTS[openSubject]||[];
    return(<div style={{minHeight:"100vh",background:C.bg}}><NavBar/><div style={{maxWidth:800,margin:"0 auto",padding:"28px 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><button onClick={()=>setOpenSubject(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18}}>←</button><h1 style={{fontSize:24,fontWeight:800,margin:0,textTransform:"capitalize"}}>{openSubject}</h1></div>
      {classLearned[openSubject]?.topics?.length>0&&<Card style={{padding:"10px 16px",background:C.blue50,border:`1px solid ${C.blue100}`,marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:600,color:C.primary}}>📖 Learned: {classLearned[openSubject].topics.join(", ")}</span><span style={{fontSize:11,color:C.gray400}}>{classLearned[openSubject].count} topics</span></div></Card>}
      <div style={{display:"grid",gap:12}}>
        {topics.map(t=>canAccessTopic(t)?
          <TopicRoadCard key={t.id} topic={t} attempt={progress[openSubject]?.[t.id]} onAction={(action)=>handleAction(openSubject,t,action)} onViewResult={(level,score)=>{setResultPreview({topicName:t.name,level,score});}}/>:
          <Card key={t.id} style={{padding:"16px 20px",borderLeft:"4px solid #d1d5db",opacity:0.7}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{display:"flex",alignItems:"center",gap:8}}><h4 style={{fontSize:15,fontWeight:700,color:C.gray500,margin:0}}>🔒 {t.name}</h4><span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,background:"#FEF3C7",color:"#D97706"}}>👑 PREMIUM</span></div><p style={{fontSize:12,color:C.gray400,marginTop:4}}>Upgrade to access</p></div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <Btn onClick={()=>alert("Per-topic: ₹49 for "+t.name)} style={{fontSize:10,padding:"5px 10px",background:"#7c3aed",color:"#fff",borderRadius:8}}>📝 ₹49 Topic</Btn>
                <Btn onClick={onUpgrade} style={{fontSize:10,padding:"5px 10px",background:"#0e7490",color:"#fff",borderRadius:8}}>✨ ₹299 All Pragati</Btn>
                <Btn onClick={onUpgrade} style={{fontSize:10,padding:"5px 10px",background:"#D97706",color:"#fff",borderRadius:8}}>👑 ₹499 Premium</Btn>
              </div></div>
          </Card>
        )}
      </div>
    </div>
    {resultPreview&&<div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",padding:20}} onClick={()=>setResultPreview(null)}>
      <div style={{background:"#fff",borderRadius:16,maxWidth:650,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{padding:"20px 24px",background:`linear-gradient(135deg,${resultPreview.score>=70?"#16a34a":"#ea580c"},${resultPreview.score>=70?"#15803d":"#c2410c"})`,borderRadius:"16px 16px 0 0",color:"#fff"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><h2 style={{margin:0,fontSize:18,fontWeight:800}}>{resultPreview.topicName}</h2><p style={{margin:"4px 0 0",fontSize:13,opacity:0.8}}>{resultPreview.level==="arambh"?"⚡ Arambh":"🏔 Shikhar"} Exam Result</p></div>
            <button onClick={()=>setResultPreview(null)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16}}>✕</button>
          </div>
          <div style={{display:"flex",gap:20,marginTop:16}}>
            <div><div style={{fontSize:10,opacity:0.6}}>SCORE</div><div style={{fontSize:28,fontWeight:800}}>{resultPreview.score}%</div></div>
            <div><div style={{fontSize:10,opacity:0.6}}>RESULT</div><div style={{fontSize:28,fontWeight:800}}>{resultPreview.score>=70?"✅ Pass":"❌ Fail"}</div></div>
            <div><div style={{fontSize:10,opacity:0.6}}>STATUS</div><div style={{fontSize:28,fontWeight:800}}>{resultPreview.score>=80?"🏆":"⚡"}</div></div>
          </div>
        </div>
        <div style={{padding:"20px 24px"}}>
          {/* Score donut */}
          <div style={{textAlign:"center",marginBottom:20}}>
            <svg width={120} height={120} viewBox="0 0 120 120" style={{display:"block",margin:"0 auto"}}>
              <circle cx={60} cy={60} r={50} fill="none" stroke={C.gray200} strokeWidth="12"/>
              <circle cx={60} cy={60} r={50} fill="none" stroke={resultPreview.score>=70?C.green:resultPreview.score>=40?C.orange:C.red} strokeWidth="12" strokeDasharray={`${2*Math.PI*50*resultPreview.score/100} ${2*Math.PI*50*(1-resultPreview.score/100)}`} transform="rotate(-90 60 60)" strokeLinecap="round"/>
              <text x={60} y={55} textAnchor="middle" dominantBaseline="middle" style={{fontSize:28,fontWeight:900,fill:C.gray800}}>{resultPreview.score}%</text>
              <text x={60} y={75} textAnchor="middle" style={{fontSize:11,fill:C.gray400}}>{resultPreview.topicName}</text>
            </svg>
          </div>
          {/* Performance summary */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
            {[{l:"Correct",v:Math.round(5*resultPreview.score/100),c:C.green,icon:"✓"},{l:"Incorrect",v:5-Math.round(5*resultPreview.score/100),c:C.red,icon:"✗"},{l:"Accuracy",v:resultPreview.score+"%",c:C.primary,icon:"🎯"}].map(s=>(
              <div key={s.l} style={{textAlign:"center",padding:12,borderRadius:10,background:C.gray50}}>
                <div style={{fontSize:10,color:C.gray400}}>{s.icon} {s.l}</div>
                <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>
          {/* Next step */}
          <div style={{padding:"12px 16px",borderRadius:10,background:resultPreview.score>=70?"#f0fdf4":"#fef3c7",border:`1px solid ${resultPreview.score>=70?"#86efac":"#fcd34d"}`,marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:resultPreview.score>=70?"#166534":"#92400e"}}>
              {resultPreview.score>=80?"🏆 Excellent! Topic mastered. Move to next topic.":resultPreview.score>=70?"✅ Passed! You can now take Shikhar exam.":"⚡ Keep practicing. You have 1 retake available."}
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            <Btn onClick={()=>{setResultPreview(null);onViewStoredResult({score:Math.round(5*resultPreview.score/100),total:5,pct:resultPreview.score,answers:{},questions:Array.from({length:5},(_,i)=>({question_text:`Q${i+1} for ${resultPreview.topicName}`,options:["A","B","C","D"],correct:0,subject:openSubject,chapter:resultPreview.topicName})),elapsed:300,pragatiInfo:{topicName:resultPreview.topicName,level:resultPreview.level}});}} style={{fontSize:12,padding:"8px 16px"}}>📊 Full Detail Report</Btn>
            <button onClick={()=>setResultPreview(null)} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${C.gray300}`,background:"#fff",color:C.gray600,fontSize:12,fontWeight:600,cursor:"pointer"}}>Close</button>
          </div>
        </div>
      </div>
    </div>}
    </div>);
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg}}><NavBar/><div style={{maxWidth:880,margin:"0 auto",padding:"28px 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",fontSize:18}}>←</button><h1 style={{fontSize:22,fontWeight:800,margin:0}}>← Dashboard</h1></div>

      <div style={{borderRadius:20,padding:"24px 28px",background:C.gray900,color:"#fff",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,opacity:0.6,marginBottom:6}}>✨ YOUR EXAM ROADMAP</div><h1 style={{fontSize:28,fontWeight:800,margin:0}}>प्रगति — Pragati</h1><p style={{opacity:0.7,marginTop:6,fontSize:13}}>Topic-wise progress · Arambh → Shikhar pathway</p></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:36,fontWeight:800}}>{overall.pct}%</div><div style={{fontSize:11,opacity:0.5}}>{overall.done}/{overall.total} completed</div></div>
        </div>
        <div style={{display:"flex",gap:16,marginTop:16}}>{[{l:"Excellent",v:overall.excellent,c:"#86EFAC"},{l:"Partial",v:overall.partial,c:"#FCD34D"},{l:"Attention",v:overall.attention,c:"#FCA5A5"},{l:"Pending",v:overall.total-overall.done,c:"rgba(255,255,255,0.3)"}].map(s=>(<div key={s.l}><div style={{fontSize:9,textTransform:"uppercase",opacity:0.5}}>{s.l}</div><div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div></div>))}</div>
      </div>

      {/* Instructions */}
      <Card style={{marginBottom:16,padding:"16px 20px",background:"linear-gradient(135deg,#eff6ff,#f5f3ff)",border:"1.5px solid #c7d2fe"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
          <div style={{fontSize:28,flexShrink:0}}>📋</div>
          <div>
            <h3 style={{fontSize:15,fontWeight:800,color:"#1e3a5f",margin:"0 0 8px"}}>How Pragati Works — Instructions</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.primary,marginBottom:4}}>📚 Step 1: Select Topics</div>
                <p style={{fontSize:12,color:C.gray600,margin:0,lineHeight:1.6}}>Click "Edit" on each subject and add only the topics/chapters you have <strong>already learned in your coaching class</strong>. Don't add topics you haven't studied yet.</p>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#D97706",marginBottom:4}}>⚡ Step 2: Take Arambh First</div>
                <p style={{fontSize:12,color:C.gray600,margin:0,lineHeight:1.6}}>Start with <strong>Arambh (आरंभ)</strong> test for each topic. This is your <strong>foundation test</strong>. Pass with good marks to unlock Shikhar.</p>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#DC2626",marginBottom:4}}>🏔 Step 3: Take Shikhar</div>
                <p style={{fontSize:12,color:C.gray600,margin:0,lineHeight:1.6}}>After passing Arambh, take <strong>Shikhar (शिखर)</strong> — the advanced test. Pass with good marks to <strong>master</strong> the topic.</p>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#7c3aed",marginBottom:4}}>🔄 Retake Rules</div>
                <p style={{fontSize:12,color:C.gray600,margin:0,lineHeight:1.6}}>You get <strong>only 2 chances</strong> per level — 1 regular + 1 retake. If you fail both, contact your teacher for guidance.</p>
              </div>
            </div>
            <div style={{display:"flex",gap:16,marginTop:12,padding:"8px 12px",background:"#fff",borderRadius:8,border:`1px solid ${C.gray200}`}}>
              <span style={{fontSize:11,color:C.gray600}}>⚡ <strong>Arambh</strong> → Pass</span>
              <span style={{fontSize:11,color:C.gray400}}>→</span>
              <span style={{fontSize:11,color:C.gray600}}>🏔 <strong>Shikhar</strong> → Pass</span>
              <span style={{fontSize:11,color:C.gray400}}>→</span>
              <span style={{fontSize:11,color:C.green}}>✅ <strong>Topic Mastered!</strong></span>
              <span style={{fontSize:11,color:C.gray400,marginLeft:"auto"}}>🔄 Max 2 attempts per level</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Class vs Pragati */}
      <Card style={{marginBottom:20,padding:"20px 24px"}}><h3 style={{fontSize:16,fontWeight:700,margin:"0 0 16px"}}>📊 Class vs Pragati</h3>
        <div style={{display:"grid",gap:12}}>{Object.entries(PRAGATI_SUBJECTS).map(([subId,topics])=>{
          const meta=SUBJECT_META[subId];const classTopics=topics.filter(t=>canAccessTopic(t));const totalInSyllabus=classTopics.length;
          const learnedData=classLearned[subId]||{count:0,topics:[]};const learnedCount=learnedData.count;
          const masteredCount=classTopics.filter(t=>getTopicStatus(progress[subId]?.[t.id]).key==="excellent").length;
          const gap=learnedCount-masteredCount;const maxVal=Math.max(learnedCount,masteredCount,totalInSyllabus,1);
          const isEditing=editingSubject===subId;
          return(<div key={subId} style={{padding:"14px 16px",borderRadius:12,border:`1.5px solid ${C.gray200}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:15,fontWeight:700,color:meta.color}}>{meta.icon} {meta.label}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {gap>0&&<span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:8,background:C.redBg,color:C.red}}>🔴 {gap} behind</span>}
                {gap===0&&learnedCount>0&&<span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:8,background:"#fef9c3",color:"#a16207"}}>🟡 On Track</span>}
                {gap<0&&<span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:8,background:C.greenBg,color:C.green}}>🟢 Ahead</span>}
                <button onClick={()=>setEditingSubject(isEditing?null:subId)} style={{fontSize:11,color:C.primary,background:"none",border:"none",cursor:"pointer",fontWeight:600}}>{isEditing?"✓ Done":"✏ Edit"}</button>
              </div>
            </div>
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              <div style={{flex:1}}><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>📖 Learned in Class</div><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:20,borderRadius:6,background:C.gray100,overflow:"hidden"}}><div style={{height:"100%",borderRadius:6,background:C.primary,width:`${(learnedCount/maxVal)*100}%`}}></div></div><span style={{fontSize:18,fontWeight:800,color:C.primary,minWidth:28}}>{learnedCount}</span></div></div>
              <div style={{fontSize:12,fontWeight:800,color:C.gray400,paddingTop:12}}>vs</div>
              <div style={{flex:1}}><div style={{fontSize:11,color:C.gray500,marginBottom:4}}>🏆 Mastered in Pragati</div><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:20,borderRadius:6,background:C.gray100,overflow:"hidden"}}><div style={{height:"100%",borderRadius:6,background:C.green,width:`${(masteredCount/maxVal)*100}%`}}></div></div><span style={{fontSize:18,fontWeight:800,color:C.green,minWidth:28}}>{masteredCount}</span></div></div>
            </div>
            {gap>0&&<div style={{fontSize:12,color:C.red,fontWeight:600,marginTop:8,textAlign:"center",padding:"4px 0",background:C.redBg,borderRadius:6}}>⚠ {gap} topic{gap>1?"s":""} to catch up</div>}
            {gap<=0&&masteredCount>0&&<div style={{fontSize:12,color:C.green,fontWeight:600,marginTop:8,textAlign:"center",padding:"4px 0",background:C.greenBg,borderRadius:6}}>✅ Pragati mastery is on track</div>}
            {isEditing&&<div style={{marginTop:10,padding:"10px 12px",background:C.gray50,borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:600,color:C.gray600,marginBottom:6}}>Topics learned in coaching:</div>
              {learnedData.topics.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>{learnedData.topics.map((t,i)=>(<span key={i} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,fontSize:12,background:"#e0f2fe",color:"#0369a1"}}>{t}<button onClick={()=>removeClassTopic(subId,i)} style={{background:"none",border:"none",cursor:"pointer",color:"#0369a1",fontSize:10}}>✕</button></span>))}</div>}
              <div style={{display:"flex",gap:6}}><input value={newTopicInput} onChange={e=>setNewTopicInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addClassTopic(subId);}} placeholder="Type topic name..." style={{flex:1,padding:"7px 10px",borderRadius:6,border:`1.5px solid ${C.gray300}`,fontSize:12}}/><button onClick={()=>addClassTopic(subId)} style={{padding:"7px 14px",borderRadius:6,background:C.primary,color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:600}}>Add</button></div>
            </div>}
          </div>);
        })}</div>
      </Card>

      <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>Your Subjects</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280,1fr))",gap:14}}>
        {Object.entries(PRAGATI_SUBJECTS).map(([subId,topics])=>{const meta=SUBJECT_META[subId];const subProgress=progress[subId]||{};const totalTopics=topics.length;const accessibleTopics=topics.filter(t=>canAccessTopic(t));const done=accessibleTopics.filter(t=>{const st=getTopicStatus(subProgress[t.id]);return["excellent","partial","attention"].includes(st.key);}).length;const excellent=accessibleTopics.filter(t=>getTopicStatus(subProgress[t.id]).key==="excellent").length;const partial=accessibleTopics.filter(t=>getTopicStatus(subProgress[t.id]).key==="partial").length;const attention=accessibleTopics.filter(t=>getTopicStatus(subProgress[t.id]).key==="attention").length;const notStarted=totalTopics-excellent-partial-attention;const excellentPct=totalTopics?Math.round((excellent/totalTopics)*100):0;
          const r=40;const circumference=2*Math.PI*r;const excellentArc=circumference*excellent/Math.max(totalTopics,1);const partialArc=circumference*partial/Math.max(totalTopics,1);const attentionArc=circumference*attention/Math.max(totalTopics,1);
          return(<Card key={subId} style={{padding:"20px 22px",cursor:"pointer",borderLeft:`4px solid ${meta.color}`}} onClick={()=>setOpenSubject(subId)}>
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              {/* Donut Chart */}
              <div style={{position:"relative",flexShrink:0}}>
                <svg width={100} height={100} viewBox="0 0 100 100">
                  <circle cx={50} cy={50} r={r} fill="none" stroke={C.gray200} strokeWidth="10"/>
                  {excellent>0&&<circle cx={50} cy={50} r={r} fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray={`${excellentArc} ${circumference-excellentArc}`} transform="rotate(-90 50 50)" strokeLinecap="round"/>}
                  {partial>0&&<circle cx={50} cy={50} r={r} fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray={`${partialArc} ${circumference-partialArc}`} strokeDashoffset={`${-excellentArc}`} transform="rotate(-90 50 50)" strokeLinecap="round"/>}
                  {attention>0&&<circle cx={50} cy={50} r={r} fill="none" stroke="#dc2626" strokeWidth="10" strokeDasharray={`${attentionArc} ${circumference-attentionArc}`} strokeDashoffset={`${-(excellentArc+partialArc)}`} transform="rotate(-90 50 50)" strokeLinecap="round"/>}
                  <text x={50} y={44} textAnchor="middle" dominantBaseline="middle" style={{fontSize:22,fontWeight:900,fill:meta.color}}>{excellentPct}%</text>
                  <text x={50} y={62} textAnchor="middle" style={{fontSize:9,fill:C.gray500}}>mastered</text>
                </svg>
              </div>
              {/* Info */}
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:20}}>{meta.icon}</span>
                    <h3 style={{fontSize:18,fontWeight:700,margin:0,textTransform:"capitalize"}}>{subId}</h3>
                  </div>
                  <span style={{color:C.gray400}}>→</span>
                </div>
                {/* Clear numbered stats */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:6,background:C.gray50}}>
                    <span style={{fontSize:16,fontWeight:800,color:C.primary}}>{totalTopics}</span>
                    <span style={{fontSize:10,color:C.gray500,lineHeight:1.2}}>Total<br/>Topics</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:6,background:C.greenBg}}>
                    <span style={{fontSize:16,fontWeight:800,color:C.green}}>{excellent}</span>
                    <span style={{fontSize:10,color:C.green,lineHeight:1.2}}>Excellent<br/>Mastered</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:6,background:C.redBg}}>
                    <span style={{fontSize:16,fontWeight:800,color:C.red}}>{attention+partial}</span>
                    <span style={{fontSize:10,color:C.red,lineHeight:1.2}}>Needs<br/>Attention</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:6,background:C.gray100}}>
                    <span style={{fontSize:16,fontWeight:800,color:C.gray500}}>{notStarted}</span>
                    <span style={{fontSize:10,color:C.gray500,lineHeight:1.2}}>Not Yet<br/>Started</span>
                  </div>
                </div>
                {!isPaid&&topics.filter(t=>!t.isFree).length>0&&<div style={{fontSize:10,color:"#d97706",marginTop:6}}>🔒 {topics.filter(t=>!t.isFree).length} paid topics locked — Upgrade to unlock all</div>}
              </div>
            </div>
          </Card>);
        })}
      </div>
    </div></div>
  );
}

// ═══ MAIN APP ═══
export default function StudentApp() {
  const [screen, setScreen] = useState("signin");
  const [autoSendToast, setAutoSendToast] = useState("");
  const [currentTest, setCurrentTest] = useState(null);
  const [result, setResult] = useState(null);
  const [pastTests, setPastTests] = useState(()=>{
    try { return JSON.parse(localStorage.getItem("gr_past_tests")||"[]"); } catch { return []; }
  });
  const savePastTests = (tests) => { setPastTests(tests); try { localStorage.setItem("gr_past_tests", JSON.stringify(tests.map(t=>({testName:t.testName,correct:t.correct,wrong:t.wrong,unanswered:t.unanswered,total:t.total,date:t.date,time:t.time,elapsed:t.elapsed,course:t.course,pragatiInfo:t.pragatiInfo})))); } catch{} };
  const [isNewSubmission, setIsNewSubmission] = useState(false);
  const [studentPlan, setStudentPlan] = useState("free");
  const [pragatiProgress, setPragatiProgress] = useState(INITIAL_PRAGATI);
  const [pragatiExam, setPragatiExam] = useState(null);
  const [pragatiQuestions, setPragatiQuestions] = useState(null);
  const [pragatiConfig, setPragatiConfig] = useState(null);
  const [autoSendMsg, setAutoSendMsg] = useState("");

  const handleSubmit = (r) => {
    const resultWithInfo = pragatiExam ? {...r, pragatiInfo:{topicName:pragatiExam.topicName, level:pragatiExam.level}} : r;
    setResult(resultWithInfo);
    setIsNewSubmission(true);
    const score = r.total>0?Math.round((r.correct/r.total)*100):0;
    setAutoSendMsg(`✅ Result auto-sent to student & parent — ${r.testName}: ${score}%`);
    setTimeout(()=>setAutoSendMsg(""),5000);

    if(pragatiExam){
      const {subjectKey,topicId,level} = pragatiExam;
      setPragatiProgress(prev=>{const sub={...prev[subjectKey]};const topic={...(sub[topicId]||{arambh:null,shikhar:null,arambhAttempts:[],shikharAttempts:[]})};
        if(level.includes("arambh")){topic.arambh=Math.max(topic.arambh||0,score);topic.arambhAttempts=[...(topic.arambhAttempts||[]),{score,date:new Date().toLocaleDateString("en-IN")}];}
        else{topic.shikhar=Math.max(topic.shikhar||0,score);topic.shikharAttempts=[...(topic.shikharAttempts||[]),{score,date:new Date().toLocaleDateString("en-IN")}];}
        sub[topicId]=topic;return{...prev,[subjectKey]:sub};});
    }
    savePastTests([...pastTests,{...resultWithInfo,testName:currentTest?.name||pragatiExam?.topicName||"Test"}]);
    setScreen("results");
  };

  const handleViewResult = (r) => {setResult(r);setIsNewSubmission(false);setScreen("results");};
  const handleRestart = () => {setScreen("dashboard");setResult(null);setPragatiExam(null);setPragatiQuestions(null);setPragatiConfig(null);};
  const handleLaunchPragatiExam = (exam,config) => {setPragatiExam(exam);const qs=config?.questions||ALL_QUESTIONS.slice(0,5);setPragatiQuestions(qs);setPragatiConfig({name:`${exam.topicName} — ${exam.level}`,duration:config?.duration||600});setCurrentTest({name:`${exam.topicName} — ${exam.level}`});setScreen("exam");};
  const handleViewStoredResult = (r) => {setResult(r);setIsNewSubmission(false);setScreen("results");};

  return (
    <div style={{fontFamily:"'General Sans',-apple-system,sans-serif"}}>
      {screen === "signin" && <SignIn onSignIn={()=>setScreen("dashboard")} onRegister={()=>setScreen("register")} />}
      {screen === "register" && <Registration onDone={()=>setScreen("editprofile")} />}
      {screen === "editprofile" && <EditProfile onSave={(profileData)=>{
        // Auto-send WhatsApp welcome message
        const studentName = student?.name || "Student";
        const coursesText = (profileData?.courses||[]).join(", ") || "Not selected";
        const classText = profileData?.studentClass || "";
        const msg = `🎓 Welcome to GR Educational Consultancy!\n\nHi ${studentName},\nYour registration is complete! ✅\n\n📚 Class: ${classText}\n📋 Courses: ${coursesText}\n\n✨ You can now:\n• Take free mock tests\n• Access Pragati monitoring\n• Track your performance\n\nStart your journey: ${window.location.origin}\n\nAll the best! 🚀\n— GR Educational Team`;
        
        // Send to student
        const studentMobile = student?.mobile || "";
        if (studentMobile) {
          window.open(`https://wa.me/91${studentMobile}?text=${encodeURIComponent(msg)}`, "_blank");
        }

        // Show toast
        setAutoSendToast("✅ Welcome message sent via WhatsApp!");
        setTimeout(()=>setAutoSendToast(""), 4000);
        setScreen("dashboard");
      }} />}
      {/* WhatsApp auto-send toast */}
      {autoSendToast && (
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:"#25D366",color:"#fff",padding:"12px 24px",borderRadius:12,fontSize:14,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>📱</span>{autoSendToast}
        </div>
      )}
      {screen === "dashboard" && <Dashboard onLaunchTest={t=>{setPragatiExam(null);setPragatiQuestions(null);setPragatiConfig(null);setCurrentTest(t);setScreen("instructions");}} pastTests={pastTests} onViewResult={handleViewResult} onPragati={()=>setScreen("pragati")} studentPlan={studentPlan} setStudentPlan={setStudentPlan} onEditProfile={()=>setScreen("editprofile")} />}
      {screen === "instructions" && <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <Card style={{maxWidth:600,padding:32,textAlign:"center"}}><h2 style={{fontSize:22,fontWeight:800,marginBottom:12}}>{currentTest?.name}</h2><p style={{color:C.gray500,marginBottom:8}}>{currentTest?.qs||15} Questions · {currentTest?.dur||"30 min"}</p>
          <div style={{background:C.gray50,borderRadius:10,padding:16,marginBottom:20,textAlign:"left"}}><h4 style={{fontWeight:700,marginBottom:8}}>Instructions:</h4><ul style={{fontSize:13,color:C.gray600,lineHeight:2,paddingLeft:20}}><li>Answer all questions within the time limit</li><li>Click on an option to select your answer</li><li>You can mark questions for review</li><li>Use the palette to navigate between questions</li></ul></div>
          <Btn onClick={()=>setScreen("exam")} variant="success" style={{padding:"12px 32px",fontSize:15}}>Start Exam →</Btn>
        </Card>
      </div>}
      {screen === "exam" && <ExamScreen onSubmit={handleSubmit} customQuestions={pragatiQuestions||undefined} examConfig={pragatiConfig||{name:currentTest?.name||"Mock Test",duration:(currentTest?.qs||15)*120,...(currentTest?.sectionTimers?{sectionTimers:currentTest.sectionTimers}:{})}} />}
      {screen === "results" && result && <Results result={result} onRestart={handleRestart} isNewSubmission={isNewSubmission} isPragati={!!pragatiExam} />}
      {screen === "pragati" && <PragatiScreen onBack={()=>setScreen("dashboard")} onLaunchExam={handleLaunchPragatiExam} progress={pragatiProgress} setProgress={setPragatiProgress} onViewStoredResult={handleViewStoredResult} studentPlan={studentPlan} onUpgrade={()=>setScreen("dashboard")} />}
      {autoSendMsg && <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"#25D366",color:"#fff",padding:"12px 24px",borderRadius:12,fontSize:14,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",zIndex:9999}}>📱 {autoSendMsg}</div>}
    </div>
  );
}
