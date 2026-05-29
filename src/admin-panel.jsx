import { useState, useEffect, useCallback, useMemo } from "react";
import * as db from './lib/db';

// ═══ THEME COLORS ═══
const C = {
  primary:"#2563eb", primaryDark:"#1d4ed8", blue50:"#eff6ff", blue100:"#dbeafe",
  green:"#16a34a", greenBg:"#f0fdf4", red:"#dc2626", redBg:"#fef2f2",
  orange:"#ea580c", orangeBg:"#fff7ed", purple:"#7c3aed", purpleBg:"#f5f3ff",
  gray50:"#f9fafb", gray100:"#f3f4f6", gray200:"#e5e7eb", gray300:"#d1d5db",
  gray400:"#9ca3af", gray500:"#6b7280", gray600:"#4b5563", gray700:"#374151",
  gray800:"#1f2937", gray900:"#111827", white:"#fff", bg:"#f8f9fb",
};

const SUBJECTS = [
  { id:1, name:"Physics", code:"PHY", color:"#3b82f6" },
  { id:2, name:"Chemistry", code:"CHE", color:"#10b981" },
  { id:3, name:"Mathematics", code:"MAT", color:"#8b5cf6" },
  { id:4, name:"Biology", code:"BIO", color:"#f59e0b" },
];

const CHAPTERS = {
  1:["Kinematics","Laws of Motion","Work Energy Power","Gravitation","Optics","Current Electricity","Electrostatics","Magnetism","Modern Physics","Thermodynamics","Waves"],
  2:["Chemical Reactions","Chemical Bonding","Ionic Equilibrium","Mole Concept","Periodic Table","Organic Chemistry","Electrochemistry","Solid State"],
  3:["Differentiation","Integration","Matrices","Conic Sections","Limits","Probability","Trigonometry","Algebra","Vectors & 3D"],
  4:["Cell Biology","Genetics","Ecology","Human Physiology","Plant Physiology","Evolution"],
};

// Stream → Chapter mapping (which chapters appear for each stream)
const STREAM_CHAPTERS = {
  1:{ // Physics
    "MHT CET":["Kinematics","Laws of Motion","Work Energy Power","Gravitation","Optics","Current Electricity","Electrostatics","Magnetism","Thermodynamics","Waves"],
    "JEE":["Kinematics","Laws of Motion","Work Energy Power","Gravitation","Optics","Current Electricity","Electrostatics","Magnetism","Modern Physics","Thermodynamics","Waves"],
    "NEET":["Kinematics","Laws of Motion","Gravitation","Optics","Current Electricity","Electrostatics","Modern Physics","Thermodynamics"],
  },
  2:{ // Chemistry
    "MHT CET":["Chemical Reactions","Chemical Bonding","Ionic Equilibrium","Mole Concept","Periodic Table","Organic Chemistry"],
    "JEE":["Chemical Reactions","Chemical Bonding","Ionic Equilibrium","Mole Concept","Periodic Table","Organic Chemistry","Electrochemistry","Solid State"],
    "NEET":["Chemical Reactions","Chemical Bonding","Mole Concept","Periodic Table","Organic Chemistry"],
  },
  3:{ // Mathematics
    "MHT CET":["Differentiation","Integration","Matrices","Conic Sections","Limits","Probability","Trigonometry"],
    "JEE":["Differentiation","Integration","Matrices","Conic Sections","Limits","Probability","Trigonometry","Algebra","Vectors & 3D"],
    "NEET":[],
  },
  4:{ // Biology
    "MHT CET":[],
    "JEE":[],
    "NEET":["Cell Biology","Genetics","Ecology","Human Physiology","Plant Physiology","Evolution"],
  },
};

const LOGO_BASE64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIHJ4PSI4IiBmaWxsPSIjMGUxYjJlIi8+PHRleHQgeD0iMTAiIHk9IjI4IiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iODAwIiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+R1IgRURVQ0FUSU9OQUw8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjQyIiBmb250LXNpemU9IjkiIGZpbGw9IiM5M2M1ZmQiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5XaXRoIHlvdSBhdCBldmVyeSBzdGVwPC90ZXh0Pjwvc3ZnPg==";

const TEACHER_PERMISSIONS = [
  { id:"question_bank", label:"My Questions", icon:"📚", desc:"View own uploaded questions", pageId:"questions" },
  { id:"view_all_questions", label:"View All Questions", icon:"👁", desc:"See entire question bank" },
  { id:"add_question", label:"Add Question", icon:"➕", desc:"Add questions manually", pageId:"add-question" },
  { id:"csv_upload", label:"CSV Upload", icon:"📄", desc:"Bulk upload via CSV", pageId:"csv-upload" },
  { id:"create_test", label:"Create Test", icon:"🧪", desc:"Create new tests", pageId:"create-test" },
  { id:"my_tests", label:"My Tests", icon:"📋", desc:"Manage own tests", pageId:"my-tests" },
  { id:"manage_students", label:"My Students", icon:"👨‍🎓", desc:"Add/manage students", pageId:"my-students" },
  { id:"view_results", label:"Student Results", icon:"📊", desc:"View test results", pageId:"results" },
];

const INITIAL_PRAGATI_SYLLABUS = {
  physics:[
    {id:"kin",name:"Kinematics",tags:["11","CET","JEE"],isFree:true},
    {id:"lom",name:"Laws of Motion",tags:["11","CET","JEE"],isFree:false},
    {id:"wep",name:"Work Energy Power",tags:["11","CET","JEE"],isFree:false},
    {id:"grv",name:"Gravitation",tags:["11","CET","JEE","NEET"],isFree:false},
    {id:"opt",name:"Optics",tags:["12","CET","JEE","NEET"],isFree:false},
    {id:"cel",name:"Current Electricity",tags:["12","CET","JEE"],isFree:false},
    {id:"elc",name:"Electrostatics",tags:["12","CET","JEE","NEET"],isFree:false},
    {id:"thm",name:"Thermodynamics",tags:["11","CET","JEE","NEET"],isFree:false},
  ],
  chemistry:[
    {id:"crx",name:"Chemical Reactions",tags:["11","CET","JEE","NEET"],isFree:true},
    {id:"bon",name:"Chemical Bonding",tags:["11","CET","JEE","NEET"],isFree:false},
    {id:"equ",name:"Ionic Equilibrium",tags:["11","CET","JEE"],isFree:false},
    {id:"org",name:"Organic Chemistry",tags:["12","CET","JEE","NEET"],isFree:false},
  ],
  math:[
    {id:"dif",name:"Differentiation",tags:["12","CET","JEE"],isFree:true},
    {id:"int",name:"Integration",tags:["12","CET","JEE"],isFree:false},
    {id:"mat",name:"Matrices",tags:["12","CET","JEE"],isFree:false},
    {id:"lim",name:"Limits",tags:["11","CET","JEE"],isFree:false},
  ],
};

// ═══ DEMO DATA ═══
const DEMO_STUDENTS = [
  {id:1,name:"Vikram Joshi",email:"vikram@test.com",mobile:"9876543210",course:"CET PCM",stream:"PCM",class:"12",status:"active",plan:"prime",gender:"Male",city:"Pune",avgScore:89,testsAttempted:6,joinDate:"2025-12-15",college:1,parentMobile:"9876543200"},
  {id:2,name:"Kavita Rane",email:"kavita@test.com",mobile:"9876543211",course:"NEET",stream:"PCB",class:"12",status:"active",plan:"prime",gender:"Female",city:"Mumbai",avgScore:88,testsAttempted:9,joinDate:"2025-11-20",college:2,parentMobile:"9876543201"},
  {id:3,name:"Priya Patil",email:"priya@test.com",mobile:"9876543212",course:"CET PCB",stream:"PCB",class:"12",status:"active",plan:"free",gender:"Female",city:"Pune",avgScore:85,testsAttempted:12,joinDate:"2025-10-05",college:1,parentMobile:"9876543202"},
  {id:4,name:"Ritu Bhosale",email:"ritu@test.com",mobile:"9876543213",course:"B.Sc Nursing",stream:"Nursing",class:"12",status:"active",plan:"free",gender:"Female",city:"Nagpur",avgScore:82,testsAttempted:6,joinDate:"2025-12-01",college:3,parentMobile:"9876543203"},
  {id:5,name:"Arjun Nair",email:"arjun@test.com",mobile:"9876543214",course:"CET PCB",stream:"PCB",class:"11",status:"active",plan:"prime",gender:"Male",city:"Pune",avgScore:81,testsAttempted:7,joinDate:"2026-01-10",college:1,parentMobile:"9876543204"},
  {id:6,name:"Sanjay Patil",email:"sanjay@test.com",mobile:"9876543215",course:"JEE",stream:"PCM",class:"12",status:"active",plan:"free",gender:"Male",city:"Nashik",avgScore:35,testsAttempted:2,joinDate:"2025-11-15",college:4,parentMobile:"9876543205"},
  {id:7,name:"Sneha Desai",email:"sneha@test.com",mobile:"9876543216",course:"NEET",stream:"PCB",class:"12",status:"active",plan:"free",gender:"Female",city:"Mumbai",avgScore:45,testsAttempted:5,joinDate:"2025-10-20",college:2,parentMobile:"9876543206"},
  {id:8,name:"Prasad Kadam",email:"prasad@test.com",mobile:"9876543217",course:"B.Pharma",stream:"Pharmacy",class:"graduate",status:"active",plan:"free",gender:"Male",city:"Kolhapur",avgScore:58,testsAttempted:5,joinDate:"2026-01-25",college:3,parentMobile:"9876543207"},
  {id:9,name:"Rohan Mehta",email:"rohan@test.com",mobile:"9876543218",course:"MBA CET",stream:"MBA",class:"graduate",status:"active",plan:"prime",gender:"Male",city:"Pune",avgScore:62,testsAttempted:10,joinDate:"2025-09-15",college:1,parentMobile:"9876543208"},
  {id:10,name:"Amit Kumar",email:"amit@test.com",mobile:"9876543219",course:"JEE",stream:"PCM",class:"12",status:"active",plan:"free",gender:"Male",city:"Thane",avgScore:68,testsAttempted:15,joinDate:"2025-08-20",college:4,parentMobile:"9876543209"},
  {id:11,name:"Ishita Jain",email:"ishita@test.com",mobile:"9876543220",course:"NEET",stream:"PCB",class:"11",status:"pending",plan:"free",gender:"Female",city:"Pune",avgScore:0,testsAttempted:0,joinDate:"2026-02-12",college:1,parentMobile:"9876543210"},
  {id:12,name:"Aarav Deshmukh",email:"aarav@test.com",mobile:"9876543221",course:"CET PCM",stream:"PCM",class:"12",status:"pending",plan:"free",gender:"Male",city:"Mumbai",avgScore:0,testsAttempted:0,joinDate:"2026-02-11",college:2,parentMobile:"9876543211"},
  {id:13,name:"Karan Singh",email:"karan@test.com",mobile:"9876543222",course:"JEE",stream:"PCM",class:"11",status:"active",plan:"free",gender:"Male",city:"Nashik",avgScore:72,testsAttempted:3,joinDate:"2026-02-01",college:4,parentMobile:"9876543212"},
  {id:14,name:"Meera Iyer",email:"meera@test.com",mobile:"9876543223",course:"CET PCM",stream:"PCM",class:"12",status:"active",plan:"free",gender:"Female",city:"Pune",avgScore:76,testsAttempted:4,joinDate:"2026-01-20",college:1,parentMobile:"9876543213"},
  {id:15,name:"Rahul Sharma",email:"rahul@test.com",mobile:"9876543224",course:"CET PCM",stream:"PCM",class:"12",status:"blocked",plan:"free",gender:"Male",city:"Pune",avgScore:40,testsAttempted:2,joinDate:"2025-11-01",college:1,parentMobile:"9876543214"},
  {id:16,name:"Neha Kulkarni",email:"neha@test.com",mobile:"9876543225",course:"Law Entrance",stream:"Law",class:"graduate",status:"active",plan:"prime",gender:"Female",city:"Mumbai",avgScore:79,testsAttempted:8,joinDate:"2025-10-10",college:2,parentMobile:"9876543215"},
  {id:17,name:"Aditya Pawar",email:"aditya@test.com",mobile:"9876543226",course:"MBA CET",stream:"MBA",class:"graduate",status:"inactive",plan:"free",gender:"Male",city:"Solapur",avgScore:55,testsAttempted:3,joinDate:"2025-09-20",college:3,parentMobile:"9876543216"},
  {id:18,name:"Pooja Gaikwad",email:"pooja@test.com",mobile:"9876543227",course:"CET PCM",stream:"PCM",class:"12",status:"active",plan:"free",gender:"Female",city:"Pune",avgScore:71,testsAttempted:5,joinDate:"2025-12-20",college:1,parentMobile:"9876543217"},
];

const DEMO_QUESTIONS = Array.from({length:8}, (_,i) => ({
  id:i+1, subject_id:(i%3)+1, chapter_id:0, difficulty:["easy","medium","hard"][i%3], status:"active",
  question_text:`Sample question ${i+1} for ${SUBJECTS[i%3].name}`,
  option_a:"Option A", option_b:"Option B", option_c:"Option C", option_d:"Option D",
  correct_option:i%4, solution:`Solution for Q${i+1}`,
  chapter:CHAPTERS[(i%3)+1][i%3], created_by_teacher:i<4?1:null,
}));

const DEMO_TESTS = [
  {id:1,name:"Mock Test 1 — Full Syllabus",status:"active",mode:"combined",stream:"PCM",duration:30,totalQuestions:15,marks:1,negative:0,isFree:true,price:0,accessLevel:"free",assignType:"all",assignedCourses:[],assignedStreams:[],assignedStudentIds:[],approval_status:"approved",academic_year:"2025-26",created_by_role:"admin",questionIds:[1,2,3,4,5]},
  {id:2,name:"Mock Test 2 — Physics Focus",status:"active",mode:"subject_wise",stream:"PCM",duration:60,totalQuestions:50,marks:1,negative:0.25,isFree:false,price:49,accessLevel:"prime",assignType:"all",assignedCourses:[],assignedStreams:[],assignedStudentIds:[],approval_status:"approved",academic_year:"2025-26",created_by_role:"admin",questionIds:[1,3,5]},
  {id:3,name:"Mock Test 3 — Grand Test",status:"draft",mode:"combined",stream:"PCM",duration:180,totalQuestions:150,marks:2,negative:0.5,isFree:false,price:99,accessLevel:"prime",assignType:"course",assignedCourses:["CET PCM"],assignedStreams:[],assignedStudentIds:[],approval_status:"approved",academic_year:"2025-26",created_by_role:"admin",questionIds:[]},
  {id:4,name:"Physics — Kinematics Practice",status:"active",mode:"chapter_wise",stream:"PCM",duration:30,totalQuestions:20,marks:1,negative:0,isFree:true,price:0,accessLevel:"free",assignType:"all",assignedCourses:[],assignedStreams:[],assignedStudentIds:[],approval_status:"approved",academic_year:"2025-26",created_by_role:"teacher",questionIds:[1,3]},
  {id:5,name:"Chemistry — Organic Focus",status:"pending_approval",mode:"chapter_wise",stream:"PCB",duration:45,totalQuestions:30,marks:1,negative:0,isFree:true,price:0,accessLevel:"free",assignType:"all",assignedCourses:[],assignedStreams:[],assignedStudentIds:[],approval_status:"pending",academic_year:"2025-26",created_by_role:"teacher",questionIds:[2]},
  {id:6,name:"Maths — Integration Mastery",status:"active",mode:"chapter_wise",stream:"PCM",duration:40,totalQuestions:25,marks:1,negative:0,isFree:false,price:29,accessLevel:"prime",assignType:"stream",assignedCourses:[],assignedStreams:["PCM"],assignedStudentIds:[],approval_status:"approved",academic_year:"2025-26",created_by_role:"admin",questionIds:[4,5]},
];

const DEMO_ATTEMPTS = [
  {id:1,studentId:1,student:"Vikram Joshi",test:"Mock Test 1 — Full Syllabus",date:"2026-02-05",score:14,total:15,pct:93,correct:14,incorrect:1,unanswered:0,time:"18m 20s"},
  {id:2,studentId:1,student:"Vikram Joshi",test:"Mock Test 2 — Physics Focus",date:"2026-02-08",score:40,total:50,pct:80,correct:40,incorrect:8,unanswered:2,time:"52m 10s"},
  {id:3,studentId:2,student:"Kavita Rane",test:"Mock Test 1 — Full Syllabus",date:"2026-02-06",score:13,total:15,pct:87,correct:13,incorrect:2,unanswered:0,time:"22m 15s"},
  {id:4,studentId:3,student:"Priya Patil",test:"Mock Test 1 — Full Syllabus",date:"2026-02-07",score:12,total:15,pct:80,correct:12,incorrect:2,unanswered:1,time:"25m 30s"},
  {id:5,studentId:5,student:"Arjun Nair",test:"Mock Test 1 — Full Syllabus",date:"2026-02-08",score:12,total:15,pct:80,correct:12,incorrect:3,unanswered:0,time:"27m 00s"},
  {id:6,studentId:6,student:"Sanjay Patil",test:"Mock Test 1 — Full Syllabus",date:"2026-02-05",score:5,total:15,pct:33,correct:5,incorrect:8,unanswered:2,time:"29m 50s"},
  {id:7,studentId:7,student:"Sneha Desai",test:"Mock Test 1 — Full Syllabus",date:"2026-02-06",score:7,total:15,pct:47,correct:7,incorrect:5,unanswered:3,time:"28m 10s"},
  {id:8,studentId:10,student:"Amit Kumar",test:"Mock Test 1 — Full Syllabus",date:"2026-02-08",score:9,total:15,pct:60,correct:9,incorrect:4,unanswered:2,time:"27m 00s"},
  {id:9,studentId:13,student:"Karan Singh",test:"Mock Test 1 — Full Syllabus",date:"2026-02-10",score:11,total:15,pct:73,correct:11,incorrect:3,unanswered:1,time:"24m 30s"},
  {id:10,studentId:14,student:"Meera Iyer",test:"Mock Test 1 — Full Syllabus",date:"2026-02-09",score:10,total:15,pct:67,correct:10,incorrect:4,unanswered:1,time:"26m 45s"},
];

const DEMO_COLLEGES = [
  {id:1,name:"Fergusson College",shortName:"FC",city:"Pune",color:"#2563eb",isActive:true},
  {id:2,name:"St. Xavier's College",shortName:"SXC",city:"Mumbai",color:"#dc2626",isActive:true},
  {id:3,name:"Symbiosis Institute",shortName:"SI",city:"Pune",color:"#16a34a",isActive:true},
  {id:4,name:"COEP Technological University",shortName:"COEP",city:"Pune",color:"#7c3aed",isActive:true},
];

const DEMO_TEACHERS = [
  {id:1,name:"Prof. Rajesh Kulkarni",email:"rajesh@college.com",phone:"9988776655",username:"rajesh.k",password:"Teacher@123",college_id:1,subjects:[1,2,3,4],permissions:["question_bank","view_all_questions","add_question","csv_upload","create_test","my_tests","manage_students","view_results"],status:"active",questions_added:45,joinDate:"2025-06-15"},
  {id:2,name:"Dr. Sunita Deshpande",email:"sunita@college.com",phone:"9988776656",username:"sunita.d",password:"Teacher@123",college_id:2,subjects:[2,4],permissions:["question_bank","add_question","create_test","view_results"],status:"active",questions_added:32,joinDate:"2025-07-20"},
];

// ═══ UTILITY COMPONENTS ═══
function parseCSVLine(line) {
  const result = []; let current = ""; let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ""; }
    else current += ch;
  }
  result.push(current.trim()); return result;
}

function Card({ children, style = {}, ...props }) {
  return <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.gray200}`, padding:"20px 22px", ...style }} {...props}>{children}</div>;
}
function Btn({ children, variant="primary", icon, style={}, ...props }) {
  const base = { display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", border:"none", fontFamily:"inherit", transition:"all 0.15s" };
  const v = { primary:{background:C.primary,color:"#fff"}, success:{background:C.green,color:"#fff"}, danger:{background:C.red,color:"#fff"}, outline:{background:"transparent",border:`1.5px solid ${C.gray300}`,color:C.gray700}, ghost:{background:"transparent",color:C.gray500}, purple:{background:C.purple,color:"#fff"} };
  return <button style={{...base,...(v[variant]||v.primary),...style}} {...props}>{icon}{children}</button>;
}
function Input({ label, value, onChange, type="text", placeholder="", style={}, inputStyle={}, ...props }) {
  return (
    <div style={{ marginBottom:14, ...style }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.gray600, marginBottom:5 }}>{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.gray200}`, fontSize:type==="number"?13:14, color:C.gray800, outline:"none", background:C.white, ...inputStyle }} {...props} />
    </div>
  );
}
function Select({ label, value, onChange, options=[], style={} }) {
  return (
    <div style={{ marginBottom:14, ...style }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.gray600, marginBottom:5 }}>{label}</label>}
      <select value={value||""} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.gray200}`, fontSize:14, color:C.gray800, outline:"none", background:C.white }}>
        <option value="">Select...</option>
        {options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
function Textarea({ label, value, onChange, rows=3, placeholder="" }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.gray600, marginBottom:5 }}>{label}</label>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder}
        style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${C.gray200}`, fontSize:14, color:C.gray800, resize:"vertical", fontFamily:"inherit" }} />
    </div>
  );
}
function Badge({ label, color, bg }) {
  return <span style={{ padding:"4px 10px", borderRadius:12, fontSize:11, fontWeight:700, background:bg||C.gray100, color:color||C.gray600 }}>{label}</span>;
}
function StatCard({ label, value, color, icon, onClick }) {
  return (
    <Card style={{ padding:"16px 18px", cursor:onClick?"pointer":"default", transition:"box-shadow 0.2s" }} onClick={onClick}
      onMouseEnter={e=>{if(onClick)e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.08)"}} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>
        <div><div style={{ fontSize:24, fontWeight:800, color:C.gray900 }}>{value}</div><div style={{ fontSize:12, color:C.gray500, fontWeight:500, marginTop:2 }}>{label}</div></div>
      </div>
    </Card>
  );
}
function MiniBar({ value, max, color }) {
  const pct = max > 0 ? (value/max)*100 : 0;
  return <div style={{ flex:1, height:6, borderRadius:3, background:C.gray200, overflow:"hidden" }}><div style={{ height:"100%", borderRadius:3, background:color, width:`${pct}%`, transition:"width 0.5s" }} /></div>;
}

// This file is very large. For the complete admin panel with all features,
// please start a new conversation and reference the transcript.
// The key architecture: single default export function with sidebar navigation,
// page routing via switch/case, and all demo data above.

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState(DEMO_QUESTIONS);
  const [tests, setTests] = useState(DEMO_TESTS);
  const [teachers, setTeachers] = useState([]);
  const [colleges, setColleges] = useState(DEMO_COLLEGES);
  const [modes, setModes] = useState([{value:"combined",label:"Combined"},{value:"subject_wise",label:"Subject-wise"},{value:"chapter_wise",label:"Chapter-wise"},{value:"mock_test",label:"Mock Test"}]);
  const [streams, setStreams] = useState([{value:"PCM",label:"PCM"},{value:"PCB",label:"PCB"},{value:"Law",label:"Law"},{value:"MBA",label:"MBA"},{value:"Pharmacy",label:"Pharmacy"},{value:"Nursing",label:"Nursing"}]);
  const [courses, setCourses] = useState([{value:"CET PCM",label:"CET PCM"},{value:"CET PCB",label:"CET PCB"},{value:"JEE",label:"JEE"},{value:"NEET",label:"NEET"},{value:"MBA CET",label:"MBA CET"},{value:"Law Entrance",label:"Law Entrance"},{value:"B.Pharma",label:"B.Pharma"},{value:"B.Sc Nursing",label:"B.Sc Nursing"}]);
  const [classes, setClasses] = useState([{value:"11",label:"11th"},{value:"12",label:"12th"},{value:"repeater",label:"Repeater"},{value:"dropper",label:"Dropper"},{value:"graduate",label:"Graduate"}]);
  const [activeYear, setActiveYear] = useState("2025-26");
  const [pragatiExams, setPragatiExams] = useState({});
  const [pragatiConfig, setPragatiConfig] = useState({arambh:{questions:5,duration:10,passPercent:70},shikhar:{questions:5,duration:10,passPercent:80}});
  const [streamConfig, setStreamConfig] = useState({
    "MHT CET PCM":{subjects:{Physics:["Kinematics","Laws of Motion","Work Energy Power","Gravitation","Optics","Current Electricity","Electrostatics","Magnetism","Thermodynamics","Waves"],Chemistry:["Chemical Reactions","Chemical Bonding","Ionic Equilibrium","Mole Concept","Periodic Table","Organic Chemistry"],Mathematics:["Differentiation","Integration","Matrices","Conic Sections","Limits","Probability","Trigonometry"]}},
    "MHT CET PCB":{subjects:{Physics:["Kinematics","Laws of Motion","Gravitation","Optics","Current Electricity","Electrostatics","Thermodynamics","Waves"],Chemistry:["Chemical Reactions","Chemical Bonding","Ionic Equilibrium","Mole Concept","Periodic Table","Organic Chemistry"],Biology:["Cell Biology","Genetics","Ecology","Human Physiology","Plant Physiology"]}},
    "JEE":{subjects:{Physics:["Kinematics","Laws of Motion","Work Energy Power","Gravitation","Optics","Current Electricity","Electrostatics","Magnetism","Modern Physics","Thermodynamics","Waves"],Chemistry:["Chemical Reactions","Chemical Bonding","Ionic Equilibrium","Mole Concept","Periodic Table","Organic Chemistry","Electrochemistry","Solid State"],Mathematics:["Differentiation","Integration","Matrices","Conic Sections","Limits","Probability","Trigonometry","Algebra","Vectors & 3D"]}},
    "NEET":{subjects:{Physics:["Kinematics","Laws of Motion","Gravitation","Optics","Current Electricity","Electrostatics","Modern Physics","Thermodynamics"],Chemistry:["Chemical Reactions","Chemical Bonding","Mole Concept","Periodic Table","Organic Chemistry"],Biology:["Cell Biology","Genetics","Ecology","Human Physiology","Plant Physiology","Evolution"]}},
  });

  useEffect(() => {
    db.auth.getSession().then(async session => {
      if (!session) return;
      const [teacher, admin] = await Promise.all([
        db.teachers.getByAuthId(session.user.id),
        db.admins.getByAuthId(session.user.id),
      ]);
      if (!teacher && !admin) { await db.auth.signOut(); window.location.href = '/'; return; }
      setCurrentUser(teacher || { ...admin, role: 'admin' });
      setIsTeacher(!!teacher);
      setLoggedIn(true);
      const [s, t] = await Promise.all([db.students.getAll(), db.teachers.getAll()]);
      setStudents(s);
      setTeachers(t);
    }).catch(console.error);
  }, []);

  // Login screen
  if (!loggedIn) {
    return (
      <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, #0E1B2E 0%, #1E3A5F 100%)`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'General Sans',-apple-system,sans-serif" }}>
        <LoginScreen onLogin={async (user, isTeacherUser) => {
          setLoggedIn(true); setIsTeacher(isTeacherUser); setCurrentUser(user);
          try {
            const [s, t] = await Promise.all([db.students.getAll(), db.teachers.getAll()]);
            setStudents(s); setTeachers(t);
          } catch(e) { console.error('Failed to load data:', e); }
        }} />
      </div>
    );
  }

  const role = isTeacher ? "teacher" : "admin";
  const navItems = isTeacher ? TEACHER_PERMISSIONS.filter(p => (currentUser?.permissions||[]).includes(p.id)).filter(p=>p.pageId).map(p=>({id:p.pageId,label:p.label,icon:p.icon})) :
    [{id:"dashboard",label:"Dashboard",icon:"📊"},{id:"questions",label:"Question Bank",icon:"📚"},{id:"add-question",label:"Add Question",icon:"➕"},{id:"csv-upload",label:"CSV Upload",icon:"📄"},{id:"create-test",label:"Create Test",icon:"🧪"},{id:"manage-tests",label:"Manage Tests",icon:"📋"},{id:"manage-students",label:"Manage Students",icon:"👨‍🎓"},{id:"results",label:"Student Results",icon:"📊"},{id:"transactions",label:"Transactions",icon:"💰"},{id:"pragati",label:"Pragati Exams",icon:"✨"},{id:"settings",label:"Settings",icon:"⚙️"},{id:"teachers",label:"Manage Teachers",icon:"👨‍🏫"}];

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'General Sans',-apple-system,sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width:240, background:"#0E1B2E", padding:"20px 0", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"0 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.1)", marginBottom:12 }}>
          <img src={LOGO_BASE64} alt="Logo" style={{ height:36, objectFit:"contain" }} />
        </div>
        {navItems.map(n => (
          <button key={n.id} onClick={()=>setPage(n.id)}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 20px", background:page===n.id?"rgba(37,99,235,0.2)":"transparent", color:page===n.id?"#93c5fd":"rgba(255,255,255,0.6)", border:"none", cursor:"pointer", fontSize:13, fontWeight:page===n.id?700:500, width:"100%", textAlign:"left", borderLeft:page===n.id?"3px solid #3b82f6":"3px solid transparent", fontFamily:"inherit" }}>
            <span style={{ fontSize:16 }}>{n.icon}</span>{n.label}
          </button>
        ))}
        <div style={{ marginTop:"auto", padding:"12px 20px", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={async ()=>{ await db.auth.signOut(); setLoggedIn(false); setPage("dashboard"); setStudents([]); setTeachers([]); }} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>🚪 Logout</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, background:C.bg, overflow:"auto" }}>
        {/* Top bar */}
        <div style={{ background:C.white, borderBottom:`1px solid ${C.gray200}`, padding:"14px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.gray800 }}>{navItems.find(n=>n.id===page)?.label||"Dashboard"}</div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:13, fontWeight:600, color:C.gray600 }}>{currentUser?.name||"Admin"}</span>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg, ${isTeacher?C.purple:C.primary}, #1e40af)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700 }}>
              {(currentUser?.name||"A")[0]}
            </div>
          </div>
        </div>

        <div style={{ padding:"24px 28px", maxWidth:1200, margin:"0 auto" }}>
          {page === "dashboard" && <DashboardPage students={students} tests={tests} questions={questions} courses={courses} />}
          {page === "questions" && <QuestionBankPage questions={questions} setQuestions={setQuestions} tests={tests} currentUser={currentUser} role={role} />}
          {page === "results" && <StudentResultsPage students={isTeacher ? students.filter(s=>s.college===currentUser?.college_id) : students} />}
          {page === "transactions" && <TransactionsPage students={students} setStudents={setStudents} />}
          {page === "manage-students" && <ManageStudentsPage students={students} setStudents={setStudents} role="admin" />}
          {page === "manage-tests" && <ManageTestsPage tests={tests} setTests={setTests} students={students} />}
          {page === "settings" && <SettingsPage pragatiConfig={pragatiConfig} setPragatiConfig={setPragatiConfig} streamConfig={streamConfig} setStreamConfig={setStreamConfig} />}
          {page === "teachers" && <ManageTeachersPage teachers={teachers} setTeachers={setTeachers} colleges={colleges} />}
          {/* Teacher-specific pages */}
          {page === "add-question" && <AddQuestionPage questions={questions} setQuestions={setQuestions} currentUser={currentUser} role={role} />}
          {page === "csv-upload" && <CSVUploadPage questions={questions} setQuestions={setQuestions} currentUser={currentUser} role={role} />}
          {page === "my-tests" && <ManageTestsPage tests={tests.filter(t=>t.created_by_teacher===currentUser?.id||t.created_by_role==="teacher")} setTests={setTests} students={students} />}
          {page === "my-students" && <ManageStudentsPage students={students.filter(s=>s.college===currentUser?.college_id)} setStudents={setStudents} role="teacher" />}
          {page === "create-test" && <CreateTestPage questions={isTeacher ? questions.filter(q=>q.created_by_teacher===currentUser?.id) : questions} students={students} streams={streams} courses={courses} tests={tests} setTests={setTests} />}
          {page === "pragati" && <PragatiExamsPage streamConfig={streamConfig} pragatiExams={pragatiExams} setPragatiExams={setPragatiExams} pragatiConfig={pragatiConfig} />}
        </div>
      </div>
    </div>
  );
}

// ═══ LOGIN SCREEN ═══
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError("Email and password required"); return; }
    setLoading(true); setError("");
    try {
      const { session } = await db.auth.signIn(email.trim(), password);
      const [teacher, admin] = await Promise.all([
        db.teachers.getByAuthId(session.user.id),
        db.admins.getByAuthId(session.user.id),
      ]);
      if (!teacher && !admin) throw new Error('Not authorized');
      onLogin(teacher || { ...admin, role: 'admin' }, !!teacher);
    } catch(e) {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <Card style={{ width:"100%", maxWidth:400, padding:"40px 36px", boxShadow:"0 8px 40px rgba(0,0,0,0.3)" }}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg, #2563eb, #7c3aed)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:20, marginBottom:14 }}>GR</div>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, margin:0 }}>Admin Portal</h1>
        <p style={{ color:C.gray500, fontSize:13, marginTop:4 }}>GR Educational Consultancy</p>
      </div>
      {error && <div style={{ background:C.redBg, color:C.red, padding:"8px 12px", borderRadius:8, fontSize:13, marginBottom:14 }}>{error}</div>}
      <Input label="Email" value={email} onChange={v=>{setEmail(v);setError("");}} placeholder="admin@grfoundation.com" />
      <Input label="Password" value={password} onChange={v=>{setPassword(v);setError("");}} type="password" placeholder="Enter password" />
      <Btn onClick={handleLogin} disabled={loading} style={{ width:"100%", justifyContent:"center", padding:"12px", fontSize:15 }}>{loading ? "Signing in…" : "Sign In"}</Btn>
    </Card>
  );
}

// ═══ DASHBOARD ═══
function DashboardPage({ students, tests, questions, courses }) {
  const [leaderFilter, setLeaderFilter] = useState("");
  const activeStudents = students.filter(s=>s.status==="active").length;
  const pendingStudents = students.filter(s=>s.status==="pending").length;
  const blockedStudents = students.filter(s=>s.status==="blocked").length;
  const inactiveStudents = students.filter(s=>s.status==="inactive").length;
  const maleCount = students.filter(s=>s.gender==="Male").length;
  const femaleCount = students.filter(s=>s.gender==="Female").length;
  const primeCount = students.filter(s=>s.plan==="prime").length;
  const freeCount = students.filter(s=>s.plan==="free").length;
  const pendingTests = tests.filter(t=>t.approval_status==="pending").length;
  const topPerformers = [...students].filter(s=>s.testsAttempted>=2).sort((a,b)=>b.avgScore-a.avgScore).slice(0,5);
  const lowPerformers = [...students].filter(s=>s.testsAttempted>=2).sort((a,b)=>a.avgScore-b.avgScore).slice(0,5);
  const recentStudents = [...students].sort((a,b)=>new Date(b.joinDate)-new Date(a.joinDate)).slice(0,5);
  const totalRevenue = students.reduce((a,s)=>a+(s.plan==="prime"?499:0),0);

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:4 }}>Dashboard</h1>
      <p style={{ color:C.gray500, fontSize:14, marginBottom:20 }}>Overview of your educational platform</p>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, marginBottom:20 }}>
        <StatCard label="Pending Tests" value={pendingTests} color={C.orange} icon="⏳" />
        <StatCard label="Question Bank" value={questions.length} color={C.primary} icon="📚" />
        <StatCard label="Total Tests" value={tests.length} color={C.purple} icon="📝" />
        <StatCard label="Pending Students" value={pendingStudents} color={C.red} icon="⏳" />
      </div>

      {/* Panels */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:20 }}>
        <Card style={{ padding:16 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:14 }}>Student Status</h3>
          {[{label:"Active",count:activeStudents,color:C.green},{label:"Blocked",count:blockedStudents,color:C.red},{label:"Inactive",count:inactiveStudents,color:C.gray400}].map(s=>(
            <div key={s.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ fontSize:11, fontWeight:600, color:s.color, minWidth:50 }}>{s.label}</span>
              <MiniBar value={s.count} max={students.length} color={s.color} />
              <span style={{ fontSize:14, fontWeight:800, color:s.color, minWidth:24, textAlign:"right" }}>{s.count}</span>
            </div>
          ))}
        </Card>
        <Card style={{ padding:16 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:14 }}>Gender Split</h3>
          {[{label:"Male",count:maleCount,color:C.primary,icon:"♂"},{label:"Female",count:femaleCount,color:C.purple,icon:"♀"}].map(g=>(
            <div key={g.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ fontSize:14 }}>{g.icon}</span><span style={{ fontSize:11, fontWeight:600, color:g.color, minWidth:42 }}>{g.label}</span>
              <MiniBar value={g.count} max={students.length} color={g.color} />
              <span style={{ fontSize:14, fontWeight:800, color:g.color, minWidth:24, textAlign:"right" }}>{g.count}</span>
            </div>
          ))}
        </Card>
        <Card style={{ padding:16 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:14 }}>⭐ Plan Breakdown</h3>
          {[{label:"Prime",count:primeCount,color:"#d97706",icon:"⭐"},{label:"Free",count:freeCount,color:C.gray500,icon:"🆓"}].map(p=>(
            <div key={p.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ fontSize:14 }}>{p.icon}</span><span style={{ fontSize:11, fontWeight:600, color:p.color, minWidth:40 }}>{p.label}</span>
              <MiniBar value={p.count} max={students.length} color={p.color} />
              <span style={{ fontSize:14, fontWeight:800, color:p.color, minWidth:24, textAlign:"right" }}>{p.count}</span>
            </div>
          ))}
          <div style={{ fontSize:11, color:C.green, fontWeight:700, marginTop:6, padding:"6px 10px", background:C.greenBg, borderRadius:6, textAlign:"center" }}>💰 Revenue: ₹{totalRevenue.toLocaleString("en-IN")}</div>
        </Card>
      </div>

      {/* Course filter */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
        <span style={{ fontSize:11, fontWeight:600, color:C.gray500, display:"flex", alignItems:"center", marginRight:4 }}>Filter:</span>
        <button onClick={()=>setLeaderFilter("")} style={{ padding:"3px 10px", borderRadius:8, fontSize:10, fontWeight:600, cursor:"pointer", border:`1px solid ${!leaderFilter?C.primary:C.gray300}`, background:!leaderFilter?C.blue50:"#fff", color:!leaderFilter?C.primary:C.gray500 }}>All</button>
        {[...new Set(students.map(s=>s.course))].filter(Boolean).map(c=>(
          <button key={c} onClick={()=>setLeaderFilter(leaderFilter===c?"":c)} style={{ padding:"3px 10px", borderRadius:8, fontSize:10, fontWeight:600, cursor:"pointer", border:`1px solid ${leaderFilter===c?C.primary:C.gray300}`, background:leaderFilter===c?C.blue50:"#fff", color:leaderFilter===c?C.primary:C.gray500 }}>{c}</button>
        ))}
      </div>

      {/* Leaderboards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:20 }}>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", background:C.greenBg, borderBottom:`1px solid ${C.green}30` }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.green, margin:0 }}>🏆 Top Performers {leaderFilter && <span style={{fontSize:10,color:C.gray500}}>· {leaderFilter}</span>}</h3>
          </div>
          {topPerformers.filter(s=>!leaderFilter||s.course===leaderFilter).slice(0,5).map((s,i)=>(
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderBottom:`1px solid ${C.gray100}` }}>
              <span style={{ fontSize:16, fontWeight:900, color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":C.gray300, minWidth:22 }}>{i<3?["🥇","🥈","🥉"][i]:`${i+1}.`}</span>
              <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:C.gray800 }}>{s.name}</div><div style={{ fontSize:10, color:C.gray400 }}>{s.course} · {s.testsAttempted} tests</div></div>
              <span style={{ fontSize:16, fontWeight:800, color:C.green }}>{s.avgScore}%</span>
            </div>
          ))}
        </Card>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", background:C.redBg, borderBottom:`1px solid ${C.red}30` }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.red, margin:0 }}>⚠ Needs Attention {leaderFilter && <span style={{fontSize:10,color:C.gray500}}>· {leaderFilter}</span>}</h3>
          </div>
          {lowPerformers.filter(s=>!leaderFilter||s.course===leaderFilter).slice(0,5).map((s,i)=>(
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderBottom:`1px solid ${C.gray100}` }}>
              <span style={{ fontSize:13, fontWeight:800, color:C.gray300, minWidth:22 }}>{i+1}.</span>
              <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:C.gray800 }}>{s.name}</div><div style={{ fontSize:10, color:C.gray400 }}>{s.course} · {s.testsAttempted} tests</div></div>
              <span style={{ fontSize:16, fontWeight:800, color:s.avgScore<40?C.red:C.orange }}>{s.avgScore}%</span>
            </div>
          ))}
        </Card>
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", background:C.blue50, borderBottom:`1px solid ${C.primary}30` }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.primary, margin:0 }}>🆕 Recently Joined {leaderFilter && <span style={{fontSize:10,color:C.gray500}}>· {leaderFilter}</span>}</h3>
          </div>
          {recentStudents.filter(s=>!leaderFilter||s.course===leaderFilter).slice(0,5).map(s=>(
            <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderBottom:`1px solid ${C.gray100}` }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:C.gray200, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:C.gray600 }}>{s.name[0]}</div>
              <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:C.gray800 }}>{s.name}</div><div style={{ fontSize:10, color:C.gray400 }}>{s.course} · {s.stream}</div></div>
              <div style={{ textAlign:"right" }}><div style={{ fontSize:11, color:C.gray500 }}>{new Date(s.joinDate).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
                <span style={{ fontSize:10, fontWeight:600, color:s.status==="active"?C.green:s.status==="pending"?C.orange:C.gray400 }}>• {s.status}</span></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ═══ QUESTION BANK ═══
function QuestionBankPage({ questions, setQuestions, tests=[], currentUser, role }) {
  const canViewAll = role==="admin"||(currentUser?.permissions||[]).includes("view_all_questions");
  const [bankTab, setBankTab] = useState("admin"); // "admin" or "teacher"
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedForTransfer, setSelectedForTransfer] = useState(new Set());

  const availableChapters = filterSubject ? (CHAPTERS[Number(filterSubject)] || []) : [];

  // Partition questions
  const adminQuestions = questions.filter(q => q.bank === "admin" || !q.created_by_teacher);
  const teacherQuestions = questions.filter(q => q.bank === "teacher" || q.created_by_teacher);

  // What current user sees
  const visibleQuestions = bankTab === "admin" ? adminQuestions :
    role === "admin" ? teacherQuestions :
    teacherQuestions.filter(q => q.created_by_teacher === currentUser?.id);

  const filtered = visibleQuestions.filter(q => {
    if (filterSubject && q.subject_id !== Number(filterSubject)) return false;
    if (filterChapter && q.chapter !== filterChapter) return false;
    if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
    if (search && !q.question_text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const deleteQuestion = (id) => setQuestions(prev=>prev.filter(q=>q.id!==id));
  const toggleStatus = (id) => setQuestions(prev=>prev.map(q=>q.id===id?{...q,status:q.status==="active"?"inactive":"active"}:q));
  const startEdit = (q) => { setEditingQ(q.id); setEditForm({...q}); };
  const saveEdit = () => { setQuestions(prev=>prev.map(q=>q.id===editingQ?{...q,...editForm}:q)); setEditingQ(null); };

  // Transfer teacher questions to admin bank
  const transferToAdmin = (ids) => {
    setQuestions(prev => prev.map(q => ids.has(q.id) ? {...q, bank:"admin", created_by_teacher:null, approved_by_admin:true} : q));
    setSelectedForTransfer(new Set());
  };

  const toggleTransferSelect = (id) => {
    setSelectedForTransfer(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:4 }}>Question Bank</h1>
      <p style={{ color:C.gray500, fontSize:14, marginBottom:12 }}>{questions.length} total · Admin: {adminQuestions.length} · Teacher: {teacherQuestions.length}</p>

      {/* Bank tabs */}
      {role === "admin" ? (
        <div style={{ display:"flex", gap:0, marginBottom:16, borderBottom:`2px solid ${C.gray200}` }}>
          <button onClick={()=>{setBankTab("admin");setSelectedForTransfer(new Set());}} style={{ padding:"10px 20px", fontSize:13, fontWeight:600, border:"none", background:"transparent", cursor:"pointer", color:bankTab==="admin"?C.primary:C.gray500, borderBottom:bankTab==="admin"?`2.5px solid ${C.primary}`:"2.5px solid transparent", marginBottom:-2 }}>
            🏛 Admin Question Bank ({adminQuestions.length})
          </button>
          <button onClick={()=>setBankTab("teacher")} style={{ padding:"10px 20px", fontSize:13, fontWeight:600, border:"none", background:"transparent", cursor:"pointer", color:bankTab==="teacher"?C.purple:C.gray500, borderBottom:bankTab==="teacher"?`2.5px solid ${C.purple}`:"2.5px solid transparent", marginBottom:-2 }}>
            👨‍🏫 Teacher Uploads ({teacherQuestions.length})
          </button>
        </div>
      ) : (
        <div style={{ background:"#fef3c7", border:"1px solid #fcd34d", borderRadius:10, padding:"10px 16px", marginBottom:16 }}>
          <span style={{ fontSize:13, color:"#92400e", fontWeight:500 }}>👁 Showing only your uploaded questions ({visibleQuestions.length})</span>
        </div>
      )}

      {/* Transfer bar for teacher tab */}
      {bankTab === "teacher" && role === "admin" && selectedForTransfer.size > 0 && (
        <div style={{ background:C.blue50, border:`1.5px solid ${C.primary}`, borderRadius:10, padding:"10px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, fontWeight:600, color:C.primary }}>✓ {selectedForTransfer.size} questions selected</span>
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="success" onClick={()=>transferToAdmin(selectedForTransfer)} style={{ fontSize:12, padding:"6px 16px" }}>🏛 Transfer to Admin Bank</Btn>
            <Btn variant="ghost" onClick={()=>setSelectedForTransfer(new Set())} style={{ fontSize:12 }}>Clear</Btn>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:10, marginBottom:16 }}>
        <Input label="" value={search} onChange={setSearch} placeholder="🔍 Search questions..." style={{marginBottom:0}} />
        <Select label="" value={filterSubject} onChange={v=>{setFilterSubject(v);setFilterChapter("");}} options={[{value:"",label:"All Subjects"},...SUBJECTS.map(s=>({value:s.id,label:s.name}))]} style={{marginBottom:0}} />
        <Select label="" value={filterChapter} onChange={setFilterChapter} options={[{value:"",label:"All Topics"},...availableChapters.map(c=>({value:c,label:c}))]} style={{marginBottom:0}} />
        <Select label="" value={filterDifficulty} onChange={setFilterDifficulty} options={[{value:"",label:"All Levels"},{value:"easy",label:"Easy"},{value:"medium",label:"Medium"},{value:"hard",label:"Hard"}]} style={{marginBottom:0}} />
      </div>

      {/* Select all for transfer */}
      {bankTab === "teacher" && role === "admin" && filtered.length > 0 && (
        <div style={{ display:"flex", gap:8, marginBottom:10, alignItems:"center" }}>
          <button onClick={()=>{const allIds = new Set(filtered.map(q=>q.id)); setSelectedForTransfer(prev=>prev.size===allIds.size?new Set():allIds);}}
            style={{ fontSize:11, color:C.primary, background:"none", border:`1px solid ${C.primary}`, borderRadius:6, padding:"4px 10px", cursor:"pointer", fontWeight:600 }}>
            {selectedForTransfer.size===filtered.length?"☐ Deselect All":"☑ Select All"} ({filtered.length})
          </button>
          <span style={{ fontSize:11, color:C.gray400 }}>Select questions to transfer to admin bank</span>
        </div>
      )}

      {filtered.length === 0 && (
        <Card style={{ textAlign:"center", padding:"40px" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>📚</div>
          <p style={{ color:C.gray400 }}>No questions found. {bankTab==="teacher"?"Teachers haven't uploaded questions yet.":"Try adjusting filters."}</p>
        </Card>
      )}

      {filtered.map(q => (
        <Card key={q.id} style={{ marginBottom:10, borderLeft:`4px solid ${SUBJECTS.find(s=>s.id===q.subject_id)?.color||C.gray300}`, cursor:"pointer" }} onClick={()=>setExpandedId(expandedId===q.id?null:q.id)}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ display:"flex", gap:10, flex:1 }}>
              {/* Transfer checkbox */}
              {bankTab === "teacher" && role === "admin" && (
                <div onClick={e=>{e.stopPropagation();toggleTransferSelect(q.id);}} style={{ width:20, height:20, borderRadius:4, border:`1.5px solid ${selectedForTransfer.has(q.id)?C.primary:C.gray300}`, background:selectedForTransfer.has(q.id)?C.primary:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, marginTop:2 }}>
                  {selectedForTransfer.has(q.id) && <span style={{ color:"#fff", fontSize:11 }}>✓</span>}
                </div>
              )}
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:C.gray800, marginBottom:6 }}>{q.question_text}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <Badge label={SUBJECTS.find(s=>s.id===q.subject_id)?.name} color={C.primary} bg={C.blue50} />
                  <Badge label={q.chapter||"General"} color={C.purple} bg={C.purpleBg} />
                  <Badge label={q.difficulty} color={q.difficulty==="easy"?C.green:q.difficulty==="hard"?C.red:C.orange} bg={q.difficulty==="easy"?C.greenBg:q.difficulty==="hard"?C.redBg:C.orangeBg} />
                  <Badge label={q.status} color={q.status==="active"?C.green:C.red} bg={q.status==="active"?C.greenBg:C.redBg} />
                  {bankTab==="teacher" && q.created_by_teacher && <Badge label="👨‍🏫 Teacher" color={C.purple} bg={C.purpleBg} />}
                  {q.approved_by_admin && <Badge label="✓ Verified" color={C.green} bg={C.greenBg} />}
                </div>
              </div>
            </div>
            <span style={{ fontSize:11, color:C.gray400 }}>#{q.id}</span>
          </div>

          {expandedId === q.id && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.gray200}` }} onClick={e=>e.stopPropagation()}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                {["option_a","option_b","option_c","option_d"].map((opt,oi) => (
                  <div key={opt} style={{ padding:"8px 12px", borderRadius:8, background:q.correct_option===oi?C.greenBg:C.gray50, border:`1px solid ${q.correct_option===oi?C.green:C.gray200}`, fontSize:13 }}>
                    <strong>{String.fromCharCode(65+oi)}.</strong> {q[opt]} {q.correct_option===oi && <span style={{color:C.green,fontWeight:700}}>✓</span>}
                  </div>
                ))}
              </div>
              {q.solution && <div style={{ padding:"8px 12px", borderRadius:8, background:"#fef9c3", borderLeft:`3px solid #d97706`, fontSize:13, marginBottom:10 }}><strong>Solution:</strong> {q.solution}</div>}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <Btn variant="primary" onClick={()=>startEdit(q)} style={{ fontSize:12, padding:"6px 12px" }}>✏ Edit</Btn>
                <Btn onClick={()=>toggleStatus(q.id)} style={{ fontSize:12, padding:"6px 12px", background:q.status==="active"?C.greenBg:C.redBg, color:q.status==="active"?C.green:C.red, border:`1px solid ${q.status==="active"?C.green:C.red}` }}>{q.status==="active"?"✓ Active":"✗ Inactive"}</Btn>
                {bankTab==="teacher" && role==="admin" && <Btn variant="success" onClick={()=>transferToAdmin(new Set([q.id]))} style={{ fontSize:12, padding:"6px 12px" }}>🏛 Transfer to Admin</Btn>}
                <Btn variant="danger" onClick={()=>deleteQuestion(q.id)} style={{ fontSize:12, padding:"6px 12px" }}>Delete</Btn>
              </div>

              {editingQ === q.id && (
                <div style={{ marginTop:12, padding:16, background:C.blue50, borderRadius:10, border:`1.5px solid ${C.primary}` }}>
                  <Textarea label="Question" value={editForm.question_text||""} onChange={v=>setEditForm({...editForm,question_text:v})} rows={2} />
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                    {["option_a","option_b","option_c","option_d"].map((opt,oi)=>(
                      <div key={opt} style={{ display:"flex", gap:4 }}>
                        <input value={editForm[opt]||""} onChange={e=>setEditForm({...editForm,[opt]:e.target.value})} style={{ flex:1, padding:"6px 8px", borderRadius:6, border:`1px solid ${editForm.correct_option===oi?C.green:C.gray300}`, fontSize:12 }} placeholder={`Option ${String.fromCharCode(65+oi)}`} />
                        <button onClick={()=>setEditForm({...editForm,correct_option:oi})} style={{ padding:"6px 8px", borderRadius:6, border:`1px solid ${editForm.correct_option===oi?C.green:C.gray300}`, background:editForm.correct_option===oi?C.green:"#fff", color:editForm.correct_option===oi?"#fff":C.gray400, cursor:"pointer", fontSize:11 }}>✓</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
                    <Select label="Subject" value={editForm.subject_id} onChange={v=>setEditForm({...editForm,subject_id:Number(v)})} options={SUBJECTS.map(s=>({value:s.id,label:s.name}))} />
                    <Select label="Chapter" value={editForm.chapter} onChange={v=>setEditForm({...editForm,chapter:v})} options={(CHAPTERS[editForm.subject_id]||[]).map(c=>({value:c,label:c}))} />
                    <Select label="Difficulty" value={editForm.difficulty} onChange={v=>setEditForm({...editForm,difficulty:v})} options={["easy","medium","hard"]} />
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <Btn variant="success" onClick={saveEdit} style={{ fontSize:12 }}>💾 Save</Btn>
                    <Btn variant="ghost" onClick={()=>setEditingQ(null)} style={{ fontSize:12 }}>Cancel</Btn>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ═══ STUDENT RESULTS ═══
function StudentResultsPage({ students=[] }) {
  const attempts = DEMO_ATTEMPTS;
  const [expandedId, setExpandedId] = useState(null);
  const [detailReport, setDetailReport] = useState(null);

  const studentSummaries = [...new Set(attempts.map(a=>a.studentId))].map(sid => {
    const sa = attempts.filter(a=>a.studentId===sid);
    const s = students.find(st=>st.id===sid)||{name:"Unknown"};
    return { ...s, attempts:sa, count:sa.length, avgPct:Math.round(sa.reduce((a,x)=>a+x.pct,0)/sa.length), bestPct:Math.max(...sa.map(a=>a.pct)), worstPct:Math.min(...sa.map(a=>a.pct)) };
  });

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:20 }}>Student Results</h1>
      {studentSummaries.map(s => (
        <Card key={s.id} style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }} onClick={()=>setExpandedId(expandedId===s.id?null:s.id)}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700 }}>{s.name[0]}</div>
              <div><div style={{ fontSize:15, fontWeight:700, color:C.gray800 }}>{s.name}</div><div style={{ fontSize:11, color:C.gray400 }}>{s.course} · {s.count} tests taken</div></div>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <div style={{ textAlign:"center" }}><div style={{ fontSize:18, fontWeight:800, color:C.primary }}>{s.avgPct}%</div><div style={{ fontSize:10, color:C.gray400 }}>AVG</div></div>
              <div style={{ textAlign:"center" }}><div style={{ fontSize:18, fontWeight:800, color:C.green }}>{s.bestPct}%</div><div style={{ fontSize:10, color:C.gray400 }}>BEST</div></div>
              <div style={{ textAlign:"center" }}><div style={{ fontSize:18, fontWeight:800, color:C.red }}>{s.worstPct}%</div><div style={{ fontSize:10, color:C.gray400 }}>WORST</div></div>
            </div>
          </div>
          {expandedId === s.id && (
            <div style={{ marginTop:12, borderTop:`1px solid ${C.gray200}`, paddingTop:12 }}>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:6, marginBottom:10 }}>
                <button onClick={()=>window.open(`https://wa.me/91${s.mobile||"9876543210"}?text=${encodeURIComponent(`Test Report for ${s.name}: Avg ${s.avgPct}%`)}`,"_blank")} style={{ padding:"5px 12px", borderRadius:6, border:"none", background:"#25D366", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>📱 Send to Student</button>
                <button onClick={()=>window.open(`https://wa.me/91${s.parentMobile||"9876543210"}?text=${encodeURIComponent(`Parent Report: ${s.name} scored Avg ${s.avgPct}%`)}`,"_blank")} style={{ padding:"5px 12px", borderRadius:6, border:"none", background:"#0E7C66", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>👨‍👩‍👦 Send to Parent</button>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead><tr style={{ background:C.gray50 }}>{["Test","Date","Score","%","Correct","Incorrect","Time","Report"].map(h=><th key={h} style={{ padding:"8px 10px", textAlign:h==="Test"?"left":"center", fontSize:11, fontWeight:700, color:C.gray400, textTransform:"uppercase" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {s.attempts.sort((a,b)=>b.date.localeCompare(a.date)).map(a=>(
                    <tr key={a.id} style={{ borderBottom:`1px solid ${C.gray100}` }}>
                      <td style={{ padding:"8px 10px", fontWeight:600, color:C.gray700, fontSize:12 }}>{a.test}</td>
                      <td style={{ padding:"8px 10px", textAlign:"center", color:C.gray500, fontSize:12 }}>{a.date}</td>
                      <td style={{ padding:"8px 10px", textAlign:"center", fontWeight:700, fontSize:12 }}>{a.score}/{a.total}</td>
                      <td style={{ padding:"8px 10px", textAlign:"center" }}><span style={{ padding:"3px 8px", borderRadius:4, fontSize:11, fontWeight:700, background:a.pct>=70?C.greenBg:a.pct>=40?C.orangeBg:C.redBg, color:a.pct>=70?C.green:a.pct>=40?C.orange:C.red }}>{a.pct}%</span></td>
                      <td style={{ padding:"8px 10px", textAlign:"center", color:C.green, fontWeight:600, fontSize:12 }}>{a.correct}</td>
                      <td style={{ padding:"8px 10px", textAlign:"center", color:C.red, fontWeight:600, fontSize:12 }}>{a.incorrect}</td>
                      <td style={{ padding:"8px 10px", textAlign:"center", color:C.gray500, fontSize:12 }}>{a.time}</td>
                      <td style={{ padding:"8px 10px", textAlign:"center" }}>
                        <button onClick={()=>setDetailReport({...a,student:s.name})} style={{ padding:"4px 10px", borderRadius:6, border:`1px solid ${C.primary}`, background:C.blue50, color:C.primary, fontSize:11, fontWeight:600, cursor:"pointer" }}>📊 Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:12, paddingTop:12, borderTop:`1px solid ${C.gray200}` }}>
                <Btn variant="success" onClick={()=>setExpandedId(null)} style={{ fontSize:12, padding:"8px 20px" }}>💾 Save Changes</Btn>
                <Btn variant="ghost" onClick={()=>setExpandedId(null)} style={{ fontSize:12, padding:"8px 16px" }}>Close</Btn>
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* Detail Report Modal */}
      {detailReport && (()=>{
        const dr = detailReport;
        const subjects = ["Physics","Chemistry","Mathematics"];
        const qPerSub = Math.ceil(dr.total / subjects.length);
        const subjectData = subjects.map((sub,si)=>{
          const start=si*qPerSub; const cnt=Math.min(qPerSub, dr.total-start);
          const c=Math.round(cnt*dr.pct/100); const w=cnt-c;
          return {name:sub, total:cnt, correct:c, wrong:w, pct:cnt?Math.round((c/cnt)*100):0};
        });
        const chapters = ["Kinematics","Chemical Reactions","Differentiation","Laws of Motion","Chemical Bonding","Integration"];
        const chapterData = chapters.slice(0,Math.min(6,dr.total)).map((ch,i)=>{
          const isCorrect = i < dr.correct;
          return {name:ch, subject:subjects[i%3], correct:isCorrect?1:0, total:1, pct:isCorrect?100:0};
        });
        const questionData = Array.from({length:dr.total},(_,i)=>({
          num:i+1, subject:subjects[i%3], chapter:chapters[i%6]||"General",
          question:`Sample question ${i+1} for ${subjects[i%3]}`,
          yourAnswer:String.fromCharCode(65+(i%4)), correctAnswer:i<dr.correct?"A":String.fromCharCode(65+((i+1)%4)),
          isCorrect:i<dr.correct
        }));

        return (
        <div style={{ position:"fixed", inset:0, zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.5)", padding:20 }} onClick={()=>setDetailReport(null)}>
          <div style={{ background:"#fff", borderRadius:16, maxWidth:750, width:"100%", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding:"20px 24px", background:`linear-gradient(135deg, ${C.primary}, #1e40af)`, borderRadius:"16px 16px 0 0", color:"#fff" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div><h2 style={{ margin:0, fontSize:18, fontWeight:800 }}>{dr.student} — Detail Report</h2><p style={{ margin:"4px 0 0", fontSize:13, opacity:0.8 }}>{dr.test} · {dr.date}</p></div>
                <button onClick={()=>setDetailReport(null)} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:16 }}>✕</button>
              </div>
              <div style={{ display:"flex", gap:20, marginTop:16 }}>
                {[{l:"SCORE",v:`${dr.score}/${dr.total}`},{l:"%",v:`${dr.pct}%`},{l:"CORRECT",v:dr.correct,c:"#86efac"},{l:"INCORRECT",v:dr.incorrect,c:"#fca5a5"},{l:"TIME",v:dr.time}].map(d=>(
                  <div key={d.l}><div style={{ fontSize:10, opacity:0.6 }}>{d.l}</div><div style={{ fontSize:24, fontWeight:800, color:d.c||"#fff" }}>{d.v}</div></div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ padding:"0 24px" }}>
              <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${C.gray200}`, marginTop:16, marginBottom:16 }}>
                {["score","subject","chapter","question"].map(t=>(
                  <button key={t} onClick={()=>setDetailReport({...dr,_tab:t})}
                    style={{ padding:"10px 16px", fontSize:12, fontWeight:600, border:"none", background:"transparent", cursor:"pointer", color:(dr._tab||"score")===t?C.primary:C.gray500, borderBottom:(dr._tab||"score")===t?`2.5px solid ${C.primary}`:"2.5px solid transparent", marginBottom:-2, textTransform:"capitalize" }}>
                    {t==="score"?"📊 Score Summary":t==="subject"?"📚 Subject Analysis":t==="chapter"?"📖 Chapter Analysis":"📝 Question-wise"}
                  </button>
                ))}
              </div>

              {/* Score Summary */}
              {(dr._tab||"score")==="score" && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
                  <div style={{ textAlign:"center", padding:20 }}>
                    <svg width={140} height={140} viewBox="0 0 140 140" style={{ display:"block", margin:"0 auto" }}>
                      <circle cx={70} cy={70} r={56} fill="none" stroke={C.gray200} strokeWidth="14"/>
                      <circle cx={70} cy={70} r={56} fill="none" stroke={dr.pct>=70?C.green:dr.pct>=40?C.orange:C.red} strokeWidth="14" strokeDasharray={`${2*Math.PI*56*dr.pct/100} ${2*Math.PI*56*(1-dr.pct/100)}`} transform="rotate(-90 70 70)" strokeLinecap="round"/>
                      <text x={70} y={65} textAnchor="middle" dominantBaseline="middle" style={{ fontSize:28, fontWeight:900, fill:C.gray800 }}>{dr.pct}%</text>
                      <text x={70} y={88} textAnchor="middle" style={{ fontSize:12, fill:C.gray400 }}>{dr.score}/{dr.total}</text>
                    </svg>
                  </div>
                  <div style={{ padding:16 }}>
                    {[{l:"Accuracy",v:`${dr.total>0?Math.round((dr.correct/(dr.correct+dr.incorrect||1))*100):0}%`,c:C.primary},{l:"Attempted",v:`${dr.correct+dr.incorrect}/${dr.total}`},{l:"Time",v:dr.time},{l:"Result",v:dr.pct>=70?"Excellent":dr.pct>=40?"Good":"Needs Improvement",c:dr.pct>=70?C.green:dr.pct>=40?C.orange:C.red}].map(m=>(
                      <div key={m.l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.gray100}` }}>
                        <span style={{ fontSize:13, color:C.gray500 }}>{m.l}</span>
                        <strong style={{ fontSize:13, color:m.c||C.gray700 }}>{m.v}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject Analysis */}
              {dr._tab==="subject" && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
                  {subjectData.map(sub=>(
                    <div key={sub.name} style={{ textAlign:"center", padding:16, borderRadius:10, border:`1px solid ${C.gray200}` }}>
                      <svg width={80} height={80} viewBox="0 0 80 80" style={{ display:"block", margin:"0 auto 8px" }}>
                        <circle cx={40} cy={40} r={32} fill="none" stroke={C.gray200} strokeWidth="8"/>
                        <circle cx={40} cy={40} r={32} fill="none" stroke={sub.pct>=70?C.green:sub.pct>=40?C.orange:C.red} strokeWidth="8" strokeDasharray={`${2*Math.PI*32*sub.pct/100} ${2*Math.PI*32*(1-sub.pct/100)}`} transform="rotate(-90 40 40)" strokeLinecap="round"/>
                        <text x={40} y={42} textAnchor="middle" dominantBaseline="middle" style={{ fontSize:16, fontWeight:800, fill:C.gray800 }}>{sub.pct}%</text>
                      </svg>
                      <div style={{ fontSize:14, fontWeight:700, color:C.gray800 }}>{sub.name}</div>
                      <div style={{ fontSize:11, color:C.gray500 }}>✓{sub.correct} ✗{sub.wrong} / {sub.total}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chapter Analysis */}
              {dr._tab==="chapter" && (
                <div style={{ marginBottom:20 }}>
                  {chapterData.map(ch=>{
                    const barColor = ch.pct>=70?C.green:ch.pct>=40?C.orange:C.red;
                    return (
                      <div key={ch.name} style={{ marginBottom:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:13, fontWeight:600, color:C.gray800 }}>{ch.name} <span style={{ fontSize:11, color:C.gray400 }}>{ch.subject}</span></span>
                          <span style={{ fontSize:13, fontWeight:700, color:barColor }}>{ch.pct}%</span>
                        </div>
                        <div style={{ height:8, borderRadius:4, background:C.gray200, overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:4, background:barColor, width:`${ch.pct}%`, transition:"width 0.5s" }}/>
                        </div>
                        <div style={{ fontSize:10, color:C.gray400, marginTop:2 }}>✓{ch.correct} ✗{ch.total-ch.correct} · {ch.correct}/{ch.total}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Question-wise */}
              {dr._tab==="question" && (
                <div style={{ marginBottom:20, maxHeight:350, overflowY:"auto" }}>
                  {questionData.map(q=>(
                    <div key={q.num} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${C.gray100}` }}>
                      <span style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, background:q.isCorrect?C.greenBg:C.redBg, color:q.isCorrect?C.green:C.red, flexShrink:0 }}>{q.isCorrect?"✓":"✗"}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:C.gray700 }}>Q{q.num}. {q.question}</div>
                        <div style={{ fontSize:11, color:C.gray400 }}>{q.subject} · {q.chapter}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:11 }}>Your: <strong style={{ color:q.isCorrect?C.green:C.red }}>{q.yourAnswer}</strong></div>
                        {!q.isCorrect && <div style={{ fontSize:11 }}>Correct: <strong style={{ color:C.green }}>{q.correctAnswer}</strong></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display:"flex", gap:8, justifyContent:"center", paddingBottom:20 }}>
                <button onClick={()=>window.open(`https://wa.me/91${dr.studentMobile||"9876543210"}?text=${encodeURIComponent(`Test Report: ${dr.student}\n${dr.test}\nScore: ${dr.score}/${dr.total} (${dr.pct}%)\nCorrect: ${dr.correct} | Incorrect: ${dr.incorrect}\nTime: ${dr.time}`)}`,"_blank")} style={{ padding:"8px 16px", borderRadius:8, border:"none", background:"#25D366", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>📱 Send to Student</button>
                <button onClick={()=>setDetailReport(null)} style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${C.gray300}`, background:"#fff", color:C.gray600, fontSize:12, fontWeight:600, cursor:"pointer" }}>Close</button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

// ═══ MANAGE STUDENTS ═══
function ManageStudentsPage({ students, setStudents, role="admin" }) {
  const isAdmin = role === "admin";
  const [filter, setFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const filtered = students.filter(s => {
    if (filter && s.status !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase()) && !s.course.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const updateStudent = async (id, key, val) => {
    const s = students.find(x => x.id === id);
    if (!s) return;
    const updated = { ...s, [key]: val };
    setStudents(prev => prev.map(x => x.id === id ? updated : x));
    try { await db.students.update(id, updated); }
    catch(e) { console.error('Failed to update student:', e); setStudents(prev => prev.map(x => x.id === id ? s : x)); }
  };
  const deleteStudent = async (id) => {
    const snapshot = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    setExpandedId(null);
    setConfirmDeleteId(null);
    try { await db.students.remove(id); }
    catch(e) { console.error('Failed to delete student:', e); if (snapshot) setStudents(prev => [snapshot, ...prev]); }
  };

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:4 }}>Manage Students</h1>
      <p style={{ color:C.gray500, fontSize:14, marginBottom:16 }}>{students.length} total · {students.filter(s=>s.status==="active").length} active · {students.filter(s=>s.status==="pending").length} pending</p>

      {/* Filters */}
      <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
        {["","active","pending","blocked","inactive"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", border:`1px solid ${filter===f?C.primary:C.gray300}`, background:filter===f?C.blue50:"#fff", color:filter===f?C.primary:C.gray500 }}>{f||"All"} ({f?students.filter(s=>s.status===f).length:students.length})</button>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search name, email, course..." style={{ marginLeft:"auto", padding:"6px 12px", borderRadius:8, border:`1px solid ${C.gray300}`, fontSize:12, width:220 }} />
      </div>

      {/* Pending banner */}
      {students.filter(s=>s.status==="pending").length > 0 && !filter && (
        <div style={{ background:"#fef3c7", border:"1px solid #fcd34d", borderRadius:10, padding:"10px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, color:"#92400e", fontWeight:600 }}>⏳ {students.filter(s=>s.status==="pending").length} students pending approval</span>
          <button onClick={()=>setFilter("pending")} style={{ fontSize:11, color:"#92400e", background:"none", border:"1px solid #d97706", borderRadius:6, padding:"3px 10px", cursor:"pointer", fontWeight:600 }}>View Pending</button>
        </div>
      )}

      {/* Student list */}
      {filtered.map(s => {
        const expanded = expandedId === s.id;
        const statusColors = {active:{c:C.green,bg:C.greenBg},pending:{c:C.orange,bg:C.orangeBg},blocked:{c:C.red,bg:C.redBg},inactive:{c:C.gray400,bg:C.gray100}};
        const sc = statusColors[s.status] || statusColors.inactive;
        const planColors = {premium:{c:"#d97706",bg:"#fef3c7",label:"Premium"},free:{c:C.gray500,bg:C.gray100,label:"Free"},crash:{c:C.red,bg:C.redBg,label:"Crash"},pragati:{c:"#0e7490",bg:"#ecfeff",label:"Pragati"}};
        const pc = planColors[s.plan] || planColors.free;

        return (
          <Card key={s.id} style={{ marginBottom:8, padding:0, overflow:"hidden" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", cursor:"pointer" }} onClick={()=>setExpandedId(expanded?null:s.id)}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:sc.c, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff" }}>{s.name[0]}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:C.gray800 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:C.gray400 }}>{s.email} · {s.course} · Class {s.class}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Badge label={s.status} color={sc.c} bg={sc.bg} />
                <Badge label={pc.label} color={pc.c} bg={pc.bg} />
                {s.status==="pending" && isAdmin && <>
                  <Btn variant="success" onClick={e=>{e.stopPropagation();updateStudent(s.id,"status","active");}} style={{ fontSize:10, padding:"4px 8px" }}>✓</Btn>
                  <Btn variant="danger" onClick={e=>{e.stopPropagation();updateStudent(s.id,"status","blocked");}} style={{ fontSize:10, padding:"4px 8px" }}>✗</Btn>
                </>}
                {s.status==="pending" && !isAdmin && <span style={{ fontSize:10, color:C.orange }}>⏳ Awaiting admin</span>}
                <span style={{ fontSize:12, color:C.gray400 }}>{expanded?"▲":"▼"}</span>
              </div>
            </div>

            {expanded && (
              <div style={{ padding:"0 16px 16px", borderTop:`1px solid ${C.gray100}` }}>
                {/* Details */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, padding:"12px 0" }}>
                  {[{l:"Mobile",v:s.mobile||"—"},{l:"City",v:s.city||"—"},{l:"Gender",v:s.gender||"—"},{l:"Stream",v:s.stream||"—"},{l:"Joined",v:new Date(s.joinDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})},{l:"Tests",v:s.testsAttempted||0},{l:"Avg Score",v:s.avgScore?s.avgScore+"%":"—"},{l:"Parent Mobile",v:s.parentMobile||"—"}].map(d=>(
                    <div key={d.l} style={{ fontSize:12 }}><span style={{ color:C.gray400 }}>{d.l}:</span> <strong style={{ color:C.gray700 }}>{d.v}</strong></div>
                  ))}
                </div>

                {/* Status change */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:6 }}>📋 Change Status</div>
                  <div style={{ display:"flex", gap:6 }}>
                    {(isAdmin ? ["active","blocked","inactive"] : ["active","blocked"]).map(st=>{
                      const stc = statusColors[st];
                      return <button key={st} onClick={()=>updateStudent(s.id,"status",st)} style={{ padding:"6px 14px", borderRadius:8, fontSize:11, fontWeight:s.status===st?700:500, cursor:"pointer", border:`1.5px solid ${s.status===st?stc.c:C.gray300}`, background:s.status===st?stc.bg:"#fff", color:s.status===st?stc.c:C.gray500, textTransform:"capitalize" }}>{s.status===st?"✓ ":""}{st}</button>;
                    })}
                  </div>
                </div>

                {/* Plan change - Admin only */}
                {isAdmin && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.gray600, marginBottom:6 }}>💎 Change Plan</div>
                  <div style={{ display:"flex", gap:6 }}>
                    {[{id:"free",label:"🆓 Free"},{id:"premium",label:"👑 Premium"},{id:"crash",label:"🚀 Crash"},{id:"pragati",label:"✨ Pragati"}].map(p=>{
                      const active = s.plan===p.id;
                      return <button key={p.id} onClick={()=>updateStudent(s.id,"plan",p.id)} style={{ padding:"6px 14px", borderRadius:8, fontSize:11, fontWeight:active?700:500, cursor:"pointer", border:`1.5px solid ${active?C.primary:C.gray300}`, background:active?C.blue50:"#fff", color:active?C.primary:C.gray500 }}>{active?"✓ ":""}{p.label}</button>;
                    })}
                  </div>
                </div>
                )}
                {!isAdmin && (
                  <div style={{ marginBottom:12, padding:"8px 12px", background:C.gray50, borderRadius:8, fontSize:12, color:C.gray500 }}>
                    💎 Plan: <strong>{s.plan==="prime"?"👑 Premium":s.plan==="crash"?"🚀 Crash":"🆓 Free"}</strong> <span style={{ fontSize:10, color:C.gray400 }}>· Only admin can change plans</span>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display:"flex", gap:8, paddingTop:12, borderTop:`1px solid ${C.gray100}` }}>
                  <button onClick={()=>window.open(`https://wa.me/91${s.mobile||s.parentMobile||""}`,"_blank")} style={{ padding:"6px 12px", borderRadius:6, border:"none", background:"#25D366", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}>📱 WhatsApp</button>
                  <button onClick={()=>window.open(`https://wa.me/91${s.parentMobile||""}`,"_blank")} style={{ padding:"6px 12px", borderRadius:6, border:"none", background:"#0E7C66", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}>👨‍👩‍👦 Parent</button>
                  <div style={{ flex:1 }} />
                  {confirmDeleteId === s.id ? <>
                    <span style={{ fontSize:11, color:C.red, fontWeight:600, alignSelf:"center" }}>Remove student?</span>
                    <Btn variant="danger" onClick={()=>deleteStudent(s.id)} style={{ fontSize:11, padding:"6px 12px" }}>Yes, remove</Btn>
                    <Btn variant="outline" onClick={()=>setConfirmDeleteId(null)} style={{ fontSize:11, padding:"6px 12px" }}>Cancel</Btn>
                  </> : <>
                    <Btn variant="danger" onClick={()=>setConfirmDeleteId(s.id)} style={{ fontSize:11, padding:"6px 12px" }}>🗑 Remove</Btn>
                    <Btn variant="success" onClick={()=>setExpandedId(null)} style={{ fontSize:11, padding:"6px 16px" }}>💾 Save</Btn>
                  </>}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ═══ MANAGE TESTS ═══
function ManageTestsPage({ tests, setTests, students }) {
  const [expandedId, setExpandedId] = useState(null);
  const [searchTest, setSearchTest] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const statusColors = { active:{color:C.green,bg:C.greenBg}, draft:{color:C.gray500,bg:C.gray100}, pending_approval:{color:C.orange,bg:C.orangeBg}, upcoming:{color:C.purple,bg:C.purpleBg}, archived:{color:C.gray400,bg:C.gray100} };

  const filteredTests = tests.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterMode && t.mode !== filterMode) return false;
    if (searchTest && !t.name.toLowerCase().includes(searchTest.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:4 }}>Manage Tests</h1>
      <p style={{ color:C.gray500, fontSize:14, marginBottom:12 }}>{tests.length} total · {filteredTests.length} shown</p>

      {/* Search + Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <input value={searchTest} onChange={e=>setSearchTest(e.target.value)} placeholder="🔍 Search test name..." style={{ padding:"7px 12px", borderRadius:8, border:`1px solid ${C.gray300}`, fontSize:12, width:220 }} />
        <div style={{ display:"flex", gap:4 }}>
          {["","active","draft","pending_approval","archived"].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)} style={{ padding:"5px 10px", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", border:`1px solid ${filterStatus===s?C.primary:C.gray300}`, background:filterStatus===s?C.blue50:"#fff", color:filterStatus===s?C.primary:C.gray500 }}>{s||"All"}</button>
          ))}
        </div>
        <select value={filterMode} onChange={e=>setFilterMode(e.target.value)} style={{ padding:"6px 10px", borderRadius:6, border:`1px solid ${C.gray300}`, fontSize:11 }}>
          <option value="">All Modes</option>
          <option value="combined">Combined</option>
          <option value="subject_wise">Subject-wise</option>
          <option value="chapter_wise">Chapter-wise</option>
          <option value="mock_test">Mock Test</option>
        </select>
      </div>

      {filteredTests.length === 0 && <Card style={{ textAlign:"center", padding:"40px" }}><div style={{ fontSize:36, marginBottom:8 }}>📋</div><p style={{ color:C.gray400 }}>No tests match your search</p></Card>}

      {filteredTests.map(t => {
        const sc = statusColors[t.status]||{color:C.gray500,bg:C.gray100};
        const expanded = expandedId === t.id;
        return (
          <Card key={t.id} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }} onClick={()=>setExpandedId(expanded?null:t.id)}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:C.gray800 }}>{t.name}</div>
                <div style={{ fontSize:11, color:C.gray400 }}>{t.totalQuestions} Qs · {t.duration} min · {t.mode} · {t.stream}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Badge label={t.status} color={sc.color} bg={sc.bg} />
                <Badge label={t.isFree?"FREE":`₹${t.price}`} color={t.isFree?C.green:C.orange} bg={t.isFree?C.greenBg:C.orangeBg} />
                <span style={{ fontSize:14, color:C.gray400 }}>{expanded?"▲":"▼"}</span>
              </div>
            </div>
            {expanded && (
              <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.gray200}` }}>
                {/* Timer Pattern */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.gray700, marginBottom:8 }}>⏱ Exam Timer</div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>setTests(p=>p.map(x=>x.id===t.id?{...x,timerMode:"single",sectionTimers:null}:x))}
                      style={{ flex:1, padding:"8px 10px", borderRadius:8, border:`1.5px solid ${(!t.timerMode||t.timerMode==="single")?C.primary:C.gray200}`, background:(!t.timerMode||t.timerMode==="single")?C.blue50:"#fff", cursor:"pointer", fontSize:12, fontWeight:600, color:(!t.timerMode||t.timerMode==="single")?C.primary:C.gray500 }}>🕐 Single Timer</button>
                    <button onClick={()=>setTests(p=>p.map(x=>x.id===t.id?{...x,timerMode:"section",sectionTimers:x.sectionTimers||[{name:"Section 1",subjects:[],duration:60}]}:x))}
                      style={{ flex:1, padding:"8px 10px", borderRadius:8, border:`1.5px solid ${t.timerMode==="section"?C.primary:C.gray200}`, background:t.timerMode==="section"?C.blue50:"#fff", cursor:"pointer", fontSize:12, fontWeight:600, color:t.timerMode==="section"?C.primary:C.gray500 }}>📋 Section Timer</button>
                  </div>
                  {t.timerMode==="section" && (
                    <div style={{ background:C.gray50, borderRadius:8, padding:10, marginTop:8 }}>
                      <div style={{ display:"flex", gap:4, marginBottom:8, flexWrap:"wrap" }}>
                        {[{l:"CET 90+90",s:[{name:"Physics + Chemistry",subjects:["Physics","Chemistry"],duration:90},{name:"Mathematics",subjects:["Mathematics"],duration:90}]},
                          {l:"CET 120+60",s:[{name:"Physics + Chemistry",subjects:["Physics","Chemistry"],duration:120},{name:"Mathematics",subjects:["Mathematics"],duration:60}]},
                          {l:"CET PCB",s:[{name:"Physics + Chemistry",subjects:["Physics","Chemistry"],duration:90},{name:"Biology",subjects:["Biology"],duration:90}]},
                          {l:"JEE 60×3",s:[{name:"Physics",subjects:["Physics"],duration:60},{name:"Chemistry",subjects:["Chemistry"],duration:60},{name:"Mathematics",subjects:["Mathematics"],duration:60}]},
                          {l:"NEET 200",s:[{name:"All Subjects",subjects:["Physics","Chemistry","Biology"],duration:200}]}
                        ].map(p=><button key={p.l} onClick={()=>setTests(prev=>prev.map(x=>x.id===t.id?{...x,sectionTimers:p.s}:x))} style={{ padding:"3px 8px", borderRadius:6, fontSize:10, fontWeight:600, border:`1px solid ${C.primary}`, background:C.blue50, color:C.primary, cursor:"pointer" }}>{p.l}</button>)}
                      </div>
                      {/* Column headers */}
                      <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 60px 20px", gap:6, marginBottom:4 }}>
                        <span style={{ fontSize:10, fontWeight:700, color:C.gray400 }}>SECTION NAME</span>
                        <span style={{ fontSize:10, fontWeight:700, color:C.gray400 }}>SUBJECTS (comma separated)</span>
                        <span style={{ fontSize:10, fontWeight:700, color:C.gray400 }}>MIN</span>
                        <span></span>
                      </div>
                      {(t.sectionTimers||[]).map((sec,si)=>(
                        <div key={si} style={{ display:"grid", gridTemplateColumns:"2fr 2fr 60px 20px", gap:6, marginBottom:4 }}>
                          <input value={sec.name} onChange={e=>{const ts=[...(t.sectionTimers||[])];ts[si]={...ts[si],name:e.target.value};setTests(p=>p.map(x=>x.id===t.id?{...x,sectionTimers:ts}:x));}} style={{ padding:"5px 8px", borderRadius:6, border:`1px solid ${C.gray300}`, fontSize:11 }} placeholder="e.g. Physics + Chemistry" />
                          <input value={(sec.subjects||[]).join(", ")} onChange={e=>{const ts=[...(t.sectionTimers||[])];ts[si]={...ts[si],subjects:e.target.value.split(",").map(s=>s.trim())};setTests(p=>p.map(x=>x.id===t.id?{...x,sectionTimers:ts}:x));}} style={{ padding:"5px 8px", borderRadius:6, border:`1px solid ${C.gray300}`, fontSize:11 }} placeholder="Physics, Chemistry" />
                          <input type="number" value={sec.duration} onChange={e=>{const ts=[...(t.sectionTimers||[])];ts[si]={...ts[si],duration:Number(e.target.value)};setTests(p=>p.map(x=>x.id===t.id?{...x,sectionTimers:ts}:x));}} style={{ padding:"5px 6px", borderRadius:6, border:`1px solid ${C.gray300}`, fontSize:11 }} />
                          <button onClick={()=>{const ts=(t.sectionTimers||[]).filter((_,i)=>i!==si);setTests(p=>p.map(x=>x.id===t.id?{...x,sectionTimers:ts}:x));}} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, fontSize:11 }}>✕</button>
                        </div>
                      ))}
                      {/* Add Section button */}
                      <button onClick={()=>{const ts=[...(t.sectionTimers||[]),{name:"Section "+((t.sectionTimers||[]).length+1),subjects:[],duration:60}];setTests(p=>p.map(x=>x.id===t.id?{...x,sectionTimers:ts}:x));}}
                        style={{ display:"flex", alignItems:"center", gap:4, marginTop:6, padding:"6px 12px", borderRadius:6, border:`1.5px dashed ${C.primary}`, background:C.blue50, color:C.primary, fontSize:11, fontWeight:600, cursor:"pointer", width:"100%" }}>
                        + Add Section
                      </button>
                      {/* Total time */}
                      {(t.sectionTimers||[]).length > 0 && (
                        <div style={{ marginTop:8, fontSize:11, color:C.gray500, textAlign:"right" }}>
                          Total: <strong style={{ color:C.primary }}>{(t.sectionTimers||[]).reduce((a,s)=>a+s.duration,0)} min</strong> ({(t.sectionTimers||[]).length} sections)
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status actions */}
                <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                  {["draft","active","archived"].map(st=>(
                    <Btn key={st} onClick={()=>setTests(p=>p.map(x=>x.id===t.id?{...x,status:st}:x))} variant={t.status===st?"primary":"outline"} style={{ fontSize:11, padding:"6px 12px", textTransform:"capitalize" }}>{st}</Btn>
                  ))}
                  {t.approval_status==="pending" && <>
                    <Btn variant="success" onClick={()=>setTests(p=>p.map(x=>x.id===t.id?{...x,approval_status:"approved",status:"draft"}:x))} style={{ fontSize:11, padding:"6px 12px" }}>✓ Approve</Btn>
                    <Btn variant="danger" onClick={()=>setTests(p=>p.map(x=>x.id===t.id?{...x,approval_status:"rejected"}:x))} style={{ fontSize:11, padding:"6px 12px" }}>✗ Reject</Btn>
                  </>}
                </div>

                {/* Save */}
                <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:12, borderTop:`1px solid ${C.gray200}` }}>
                  <Btn variant="success" onClick={()=>setExpandedId(null)} style={{ fontSize:12, padding:"8px 20px" }}>💾 Save Changes</Btn>
                  <Btn variant="ghost" onClick={()=>setExpandedId(null)} style={{ fontSize:12 }}>Close</Btn>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ═══ SETTINGS ═══
function SettingsPage({ pragatiConfig, setPragatiConfig, streamConfig, setStreamConfig }) {
  const [brandName, setBrandName] = useState("GR Educational Consultancy");
  const [tagline, setTagline] = useState("With you at every step");
  const [brandLogo, setBrandLogo] = useState("");
  const [plans, setPlans] = useState([
    {id:"free",name:"Free",icon:"🆓",price:0,color:C.gray400,bg:"#f9fafb",border:C.gray200,desc:"Free mock tests for your class\nBasic result analysis\nLimited attempts"},
    {id:"premium",name:"Premium",icon:"👑",price:499,color:"#92400E",bg:"#FFFBEB",border:"#FCD34D",desc:"All free + paid mock tests\nPragati topic monitoring\nDetailed analysis + PDF\nUnlimited attempts\nWhatsApp result sharing"},
    {id:"crash",name:"Crash Course",icon:"🚀",price:999,color:"#7F1D1D",bg:"#FEF2F2",border:"#FCA5A5",desc:"Everything in Premium\nAll crash course tests (200 Qs)\nSubject-wise intensive tests\nPriority doubt support"},
    {id:"topic",name:"Per Topic",icon:"📝",price:49,color:"#5b21b6",bg:"#f5f3ff",border:"#a78bfa",desc:"Buy individual Pragati topics\n₹49 per topic only\nArambh + Shikhar + Retake\n90 days access per topic"},
    {id:"pragati",name:"Pragati Monitor",icon:"✨",price:299,color:"#0e7490",bg:"#ecfeff",border:"#67e8f9",desc:"Full Pragati monitoring system\nAll subjects & topics access\nClass vs Pragati comparison\nProgress tracking dashboard\nParent report sharing"},
  ]);
  const updatePlan = (id, key, val) => setPlans(prev => prev.map(p => p.id===id ? {...p, [key]:val} : p));
  const [activeSettingsTab, setActiveSettingsTab] = useState("brand");
  const [editStream, setEditStream] = useState(null);
  const [editSubject, setEditSubject] = useState(null);
  const [newStreamName, setNewStreamName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState("");

  useEffect(() => {
    Promise.all([
      db.settings.get('brand'),
      db.settings.get('plans'),
      db.settings.get('pragati_config'),
      db.settings.get('stream_config'),
    ]).then(([brand, savedPlans, pragatiCfg, streamCfg]) => {
      if (brand) { setBrandName(brand.brandName || "GR Educational Consultancy"); setTagline(brand.tagline || "With you at every step"); }
      if (savedPlans) setPlans(savedPlans);
      if (pragatiCfg) setPragatiConfig(pragatiCfg);
      if (streamCfg) setStreamConfig(streamCfg);
    }).catch(console.error);
  }, []);

  const saveAll = async () => {
    setSettingsSaving(true);
    try {
      await Promise.all([
        db.settings.upsert('brand', { brandName, tagline }),
        db.settings.upsert('plans', plans),
        db.settings.upsert('pragati_config', pragatiConfig),
        db.settings.upsert('stream_config', streamConfig),
      ]);
      setSettingsSaved("All settings saved!");
      setTimeout(() => setSettingsSaved(""), 3000);
    } catch(e) {
      console.error('Failed to save settings:', e);
      setSettingsSaved("Save failed — see console");
      setTimeout(() => setSettingsSaved(""), 3000);
    }
    setSettingsSaving(false);
  };

  const addStream = () => {
    if (!newStreamName.trim()) return;
    setStreamConfig(prev => ({...prev, [newStreamName.trim()]:{subjects:{}}}));
    setNewStreamName("");
  };
  const deleteStream = (name) => { setStreamConfig(prev => { const n={...prev}; delete n[name]; return n; }); if(editStream===name) setEditStream(null); };
  const addSubjectToStream = (stream) => {
    if (!newSubjectName.trim()) return;
    setStreamConfig(prev => ({...prev, [stream]:{...prev[stream], subjects:{...prev[stream].subjects, [newSubjectName.trim()]:[] }}}));
    setNewSubjectName("");
  };
  const deleteSubjectFromStream = (stream, sub) => { setStreamConfig(prev => { const s={...prev[stream].subjects}; delete s[sub]; return {...prev, [stream]:{...prev[stream], subjects:s}}; }); };
  const addTopicToSubject = (stream, sub) => {
    if (!newTopicName.trim()) return;
    setStreamConfig(prev => ({...prev, [stream]:{...prev[stream], subjects:{...prev[stream].subjects, [sub]:[...prev[stream].subjects[sub], newTopicName.trim()] }}}));
    setNewTopicName("");
  };
  const deleteTopicFromSubject = (stream, sub, topic) => {
    setStreamConfig(prev => ({...prev, [stream]:{...prev[stream], subjects:{...prev[stream].subjects, [sub]:prev[stream].subjects[sub].filter(t=>t!==topic) }}}));
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:4 }}>Settings</h1>
          <p style={{ color:C.gray500, fontSize:14, margin:0 }}>Manage platform configuration</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {settingsSaved && <span style={{ fontSize:12, color:settingsSaved.includes("failed") ? C.red : C.green, fontWeight:600 }}>✓ {settingsSaved}</span>}
          <Btn variant="primary" onClick={saveAll} style={{ opacity:settingsSaving?0.6:1, pointerEvents:settingsSaving?"none":"auto" }}>
            {settingsSaving ? "Saving…" : "💾 Save Settings"}
          </Btn>
        </div>
      </div>

      {/* Settings tabs */}
      <div style={{ display:"flex", gap:0, marginBottom:20, borderBottom:`2px solid ${C.gray200}` }}>
        {[{id:"brand",label:"🏷 Brand & Plans"},{id:"streams",label:"🎓 Streams & Subjects"},{id:"pragati",label:"✨ Pragati Config"}].map(t=>(
          <button key={t.id} onClick={()=>setActiveSettingsTab(t.id)} style={{ padding:"10px 20px", fontSize:13, fontWeight:600, border:"none", background:"transparent", cursor:"pointer", color:activeSettingsTab===t.id?C.primary:C.gray500, borderBottom:activeSettingsTab===t.id?`2.5px solid ${C.primary}`:"2.5px solid transparent", marginBottom:-2 }}>{t.label}</button>
        ))}
      </div>

      {/* BRAND & PLANS TAB */}
      {activeSettingsTab === "brand" && (
        <>
          <Card style={{ marginBottom:20, borderLeft:"4px solid #2563eb" }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:16 }}>🏷 Brand Settings</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:16, marginBottom:16 }}>
              <Input label="Brand Name" value={brandName} onChange={setBrandName} />
              <Input label="Tagline" value={tagline} onChange={setTagline} />
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.gray600, marginBottom:5 }}>Logo</label>
                <div style={{ width:120, height:60, borderRadius:8, border:`2px dashed ${C.gray300}`, display:"flex", alignItems:"center", justifyContent:"center", background:C.gray50, cursor:"pointer", position:"relative", overflow:"hidden" }}>
                  {brandLogo ? (
                    <div style={{ position:"relative", width:"100%", height:"100%" }}>
                      <img src={brandLogo} alt="Logo" style={{ width:"100%", height:"100%", objectFit:"contain", padding:4 }} />
                      <button onClick={()=>setBrandLogo("")} style={{ position:"absolute", top:2, right:2, width:16, height:16, borderRadius:"50%", background:C.red, color:"#fff", border:"none", cursor:"pointer", fontSize:9, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                    </div>
                  ) : (
                    <label htmlFor="brandLogoUpload" style={{ cursor:"pointer", textAlign:"center" }}>
                      <div style={{ fontSize:18 }}>🖼</div>
                      <div style={{ fontSize:9, color:C.gray400 }}>Upload</div>
                    </label>
                  )}
                  <input type="file" id="brandLogoUpload" accept="image/*" style={{ display:"none" }} onChange={e=>{
                    const file=e.target.files[0]; if(!file)return;
                    const reader=new FileReader(); reader.onload=ev=>setBrandLogo(ev.target.result); reader.readAsDataURL(file);
                  }} />
                </div>
              </div>
            </div>
          </Card>
          <Card style={{ borderLeft:"4px solid #d97706", marginBottom:20 }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:16 }}>💰 Plan Pricing</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:12 }}>
              {plans.map(plan=>(
                <div key={plan.id} style={{ padding:14, borderRadius:12, border:`1.5px solid ${plan.border}`, background:plan.bg }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{plan.icon}</div>
                  <Input label="Plan Name" value={plan.name} onChange={v=>updatePlan(plan.id,"name",v)} />
                  <Input label="Price (₹)" value={plan.price} onChange={v=>updatePlan(plan.id,"price",Number(v))} type="number" />
                  <div style={{ marginBottom:8 }}>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, color:C.gray500, marginBottom:4 }}>Description</label>
                    <textarea value={plan.desc} onChange={e=>updatePlan(plan.id,"desc",e.target.value)} rows={5} style={{ width:"100%", padding:"8px 10px", borderRadius:6, border:`1px solid ${C.gray200}`, fontSize:11, resize:"vertical", fontFamily:"inherit", lineHeight:1.5, color:C.gray700 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {/* Payment Settings */}
          <Card style={{ borderLeft:"4px solid #16a34a" }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:16 }}>💳 Payment Settings</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <Input label="UPI ID (Google Pay / PhonePe)" value="greducational@upi" onChange={()=>{}} placeholder="yourname@upi" />
              <Input label="UPI Display Name" value="GR Educational Consultancy" onChange={()=>{}} />
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:C.gray700, marginBottom:10 }}>🔗 Payment Links (per plan)</div>
            <div style={{ fontSize:11, color:C.gray500, marginBottom:10 }}>Create payment links at Razorpay / Instamojo / Google Pay Business and paste here. Students will be redirected to these links.</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[{id:"premium",name:"Premium ₹499",icon:"👑"},{id:"crash",name:"Crash Course ₹999",icon:"🚀"},{id:"topic",name:"Per Topic ₹49",icon:"📝"},{id:"pragati",name:"Pragati Monitor ₹299",icon:"✨"}].map(p=>(
                <div key={p.id} style={{ marginBottom:8 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:C.gray600, display:"block", marginBottom:4 }}>{p.icon} {p.name}</label>
                  <input defaultValue={`https://rzp.io/l/gr-${p.id}`} placeholder="Paste payment link URL..." style={{ width:"100%", padding:"8px 10px", borderRadius:6, border:`1px solid ${C.gray200}`, fontSize:12, fontFamily:"monospace" }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, padding:"10px 14px", background:"#f0fdf4", borderRadius:8, fontSize:12, color:"#166534" }}>
              💡 <strong>How to create payment links:</strong> Razorpay → Payment Links → Create → Set amount → Copy link. Or use Google Pay Business / Instamojo (free for UPI).
            </div>
          </Card>
        </>
      )}

      {/* STREAMS & SUBJECTS TAB */}
      {activeSettingsTab === "streams" && (
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:20 }}>
          {/* Left: Stream list */}
          <div>
            <Card style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", background:C.blue50, borderBottom:`1px solid ${C.primary}30` }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:C.primary, margin:0 }}>🎓 Streams / Courses</h3>
              </div>
              {Object.keys(streamConfig).map(stream => (
                <div key={stream} onClick={()=>{setEditStream(stream);setEditSubject(null);}} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", cursor:"pointer", background:editStream===stream?C.blue50:"#fff", borderBottom:`1px solid ${C.gray100}`, borderLeft:editStream===stream?`3px solid ${C.primary}`:"3px solid transparent" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:editStream===stream?700:500, color:editStream===stream?C.primary:C.gray700 }}>{stream}</div>
                    <div style={{ fontSize:10, color:C.gray400 }}>{Object.keys(streamConfig[stream].subjects).length} subjects · {Object.values(streamConfig[stream].subjects).flat().length} topics</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();deleteStream(stream);}} style={{ background:"none",border:"none",cursor:"pointer",color:C.gray300,fontSize:12 }} onMouseEnter={e=>e.currentTarget.style.color=C.red} onMouseLeave={e=>e.currentTarget.style.color=C.gray300}>🗑</button>
                </div>
              ))}
              {/* Add stream */}
              <div style={{ padding:"10px 16px", display:"flex", gap:6 }}>
                <input value={newStreamName} onChange={e=>setNewStreamName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addStream();}} placeholder="New stream..." style={{ flex:1, padding:"6px 8px", borderRadius:6, border:`1px solid ${C.gray300}`, fontSize:12 }} />
                <Btn variant="primary" onClick={addStream} style={{ fontSize:11, padding:"6px 10px" }}>+</Btn>
              </div>
            </Card>
          </div>

          {/* Right: Subject & Topic editor */}
          <div>
            {!editStream ? (
              <Card style={{ textAlign:"center", padding:"60px 24px" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🎓</div>
                <h3 style={{ fontSize:18, fontWeight:700, color:C.gray700 }}>Select a Stream</h3>
                <p style={{ fontSize:14, color:C.gray400 }}>Choose a stream from the left to manage its subjects and topics</p>
              </Card>
            ) : (
              <>
                <Card style={{ marginBottom:14, borderLeft:`4px solid ${C.primary}` }}>
                  <h3 style={{ fontSize:16, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:4 }}>{editStream}</h3>
                  <p style={{ fontSize:12, color:C.gray500, margin:0 }}>{Object.keys(streamConfig[editStream]?.subjects||{}).length} subjects · {Object.values(streamConfig[editStream]?.subjects||{}).flat().length} topics total</p>
                </Card>

                {/* Quick Add from Existing */}
                {(() => {
                  const allExistingSubjects = {};
                  Object.entries(streamConfig).forEach(([stream, cfg]) => {
                    if (stream === editStream) return;
                    Object.entries(cfg.subjects || {}).forEach(([sub, topics]) => {
                      if (!allExistingSubjects[sub]) allExistingSubjects[sub] = new Set();
                      topics.forEach(t => allExistingSubjects[sub].add(t));
                    });
                  });
                  const currentSubs = streamConfig[editStream]?.subjects || {};
                  const hasNewOptions = Object.keys(allExistingSubjects).some(sub => {
                    const existing = allExistingSubjects[sub];
                    const current = new Set(currentSubs[sub] || []);
                    return [...existing].some(t => !current.has(t));
                  });

                  if (Object.keys(allExistingSubjects).length === 0) return null;
                  return (
                    <Card style={{ marginBottom:14, background:"#fefce8", border:"1.5px solid #fde68a" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#92400e" }}>⚡ Quick Add from Existing Streams</div>
                          <div style={{ fontSize:11, color:"#a16207" }}>Select subjects & topics from other streams to add here</div>
                        </div>
                      </div>
                      {Object.entries(allExistingSubjects).map(([sub, topicSet]) => {
                        const subColor = sub==="Physics"?"#3b82f6":sub==="Chemistry"?"#10b981":sub==="Mathematics"?"#8b5cf6":sub==="Biology"?"#f59e0b":"#6b7280";
                        const currentTopics = new Set(currentSubs[sub] || []);
                        const allTopics = [...topicSet];
                        const allAdded = allTopics.every(t => currentTopics.has(t));
                        return (
                          <div key={sub} style={{ marginBottom:10, padding:"8px 12px", background:"#fff", borderRadius:8, border:`1px solid ${C.gray200}` }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }} onClick={()=>{
                                if (allAdded) {
                                  setStreamConfig(prev => {const s={...prev[editStream].subjects}; delete s[sub]; return {...prev,[editStream]:{...prev[editStream],subjects:s}};});
                                } else {
                                  setStreamConfig(prev => ({...prev,[editStream]:{...prev[editStream],subjects:{...prev[editStream].subjects,[sub]:[...new Set([...(prev[editStream].subjects[sub]||[]),...allTopics])]}}}));
                                }
                              }}>
                                <span style={{ width:16, height:16, borderRadius:4, border:`1.5px solid ${currentTopics.size>0?subColor:C.gray300}`, background:allAdded?subColor:currentTopics.size>0?`${subColor}40`:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff" }}>{allAdded?"✓":currentTopics.size>0?"−":""}</span>
                                <span style={{ fontSize:13, fontWeight:700, color:subColor }}>{sub}</span>
                                <span style={{ fontSize:10, color:C.gray400 }}>{currentTopics.size}/{allTopics.length} selected</span>
                              </div>
                              <button onClick={()=>{
                                if (allAdded) {
                                  setStreamConfig(prev => {const s={...prev[editStream].subjects}; delete s[sub]; return {...prev,[editStream]:{...prev[editStream],subjects:s}};});
                                } else {
                                  setStreamConfig(prev => ({...prev,[editStream]:{...prev[editStream],subjects:{...prev[editStream].subjects,[sub]:[...new Set([...(prev[editStream].subjects[sub]||[]),...allTopics])]}}}));
                                }
                              }} style={{ padding:"3px 10px", borderRadius:6, fontSize:10, fontWeight:700, cursor:"pointer", border:`1.5px solid ${allAdded?C.red:subColor}`, background:allAdded?"#fef2f2":`${subColor}10`, color:allAdded?C.red:subColor }}>
                                {allAdded?"✕ Remove All":"✓ Add All"}
                              </button>
                            </div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                              {allTopics.map(topic => {
                                const added = currentTopics.has(topic);
                                return (
                                  <button key={topic} onClick={()=>{
                                    setStreamConfig(prev => {
                                      const cur = prev[editStream].subjects[sub] || [];
                                      const updated = added ? cur.filter(t=>t!==topic) : [...cur, topic];
                                      if (updated.length === 0) { const s={...prev[editStream].subjects}; delete s[sub]; return {...prev,[editStream]:{...prev[editStream],subjects:s}}; }
                                      return {...prev,[editStream]:{...prev[editStream],subjects:{...prev[editStream].subjects,[sub]:updated}}};
                                    });
                                  }} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", borderRadius:6, fontSize:11, cursor:"pointer", border:`1px solid ${added?subColor:C.gray300}`, background:added?`${subColor}15`:"#fff", color:added?subColor:C.gray500, fontWeight:added?600:400 }}>
                                    <span style={{ width:13, height:13, borderRadius:3, border:`1.5px solid ${added?subColor:C.gray300}`, background:added?subColor:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#fff" }}>{added?"✓":""}</span>
                                    {topic}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </Card>
                  );
                })()}

                {/* Subject cards */}
                {Object.entries(streamConfig[editStream]?.subjects||{}).map(([sub, topics]) => {
                  const isOpen = editSubject === sub;
                  const subColor = sub==="Physics"?"#3b82f6":sub==="Chemistry"?"#10b981":sub==="Mathematics"?"#8b5cf6":sub==="Biology"?"#f59e0b":"#6b7280";
                  return (
                    <Card key={sub} style={{ marginBottom:10, borderLeft:`4px solid ${subColor}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }} onClick={()=>setEditSubject(isOpen?null:sub)}>
                        <div>
                          <span style={{ fontSize:14, fontWeight:700, color:subColor }}>{sub}</span>
                          <span style={{ fontSize:11, color:C.gray400, marginLeft:8 }}>{topics.length} topics</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <button onClick={e=>{e.stopPropagation();deleteSubjectFromStream(editStream,sub);}} style={{ background:"none",border:"none",cursor:"pointer",color:C.gray300,fontSize:11 }} onMouseEnter={e=>e.currentTarget.style.color=C.red} onMouseLeave={e=>e.currentTarget.style.color=C.gray300}>🗑 Remove</button>
                          <span style={{ fontSize:12, color:C.gray400 }}>{isOpen?"▲":"▼"}</span>
                        </div>
                      </div>
                      {isOpen && (
                        <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.gray100}` }}>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                            {topics.map(topic => (
                              <span key={topic} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:6, background:`${subColor}10`, border:`1px solid ${subColor}30`, fontSize:12, color:subColor }}>
                                {topic}
                                <button onClick={()=>deleteTopicFromSubject(editStream,sub,topic)} style={{ background:"none",border:"none",cursor:"pointer",color:subColor,fontSize:12,fontWeight:700,marginLeft:2 }}>✕</button>
                              </span>
                            ))}
                          </div>
                          <div style={{ display:"flex", gap:6 }}>
                            <input value={newTopicName} onChange={e=>setNewTopicName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){addTopicToSubject(editStream,sub);}}} placeholder="Add topic..." style={{ flex:1, padding:"6px 10px", borderRadius:6, border:`1.5px solid ${subColor}50`, fontSize:12 }} />
                            <Btn onClick={()=>addTopicToSubject(editStream,sub)} style={{ fontSize:11, padding:"6px 12px", background:subColor, color:"#fff", border:"none" }}>+ Add</Btn>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}

                {/* Add subject to stream */}
                <Card style={{ padding:12, background:C.gray50, border:`1.5px dashed ${C.gray300}` }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <input value={newSubjectName} onChange={e=>setNewSubjectName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addSubjectToStream(editStream);}} placeholder="Add new subject to this stream..." style={{ flex:1, padding:"8px 12px", borderRadius:6, border:`1px solid ${C.gray300}`, fontSize:13 }} />
                    <Btn variant="primary" onClick={()=>addSubjectToStream(editStream)} style={{ fontSize:12, padding:"8px 16px" }}>+ Add Subject</Btn>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {/* PRAGATI CONFIG TAB */}
      {activeSettingsTab === "pragati" && (
        <Card style={{ borderLeft:"4px solid #7c3aed" }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:16 }}>✨ Pragati Exam Configuration</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {["arambh","shikhar"].map(level=>(
              <div key={level} style={{ padding:16, borderRadius:10, background:level==="arambh"?C.orangeBg:C.redBg }}>
                <h4 style={{ fontSize:14, fontWeight:700, color:level==="arambh"?C.orange:C.red, margin:"0 0 12px", textTransform:"capitalize" }}>{level==="arambh"?"⚡ Arambh (Start)":"🏔 Shikhar (Peak)"}</h4>
                <Input label="Questions per exam" value={pragatiConfig[level].questions} onChange={v=>setPragatiConfig(p=>({...p,[level]:{...p[level],questions:Number(v)}}))} type="number" />
                <Input label="Duration (min)" value={pragatiConfig[level].duration} onChange={v=>setPragatiConfig(p=>({...p,[level]:{...p[level],duration:Number(v)}}))} type="number" />
                <Input label="Pass % required" value={pragatiConfig[level].passPercent} onChange={v=>setPragatiConfig(p=>({...p,[level]:{...p[level],passPercent:Number(v)}}))} type="number" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══ TRANSACTIONS ═══
function TransactionsPage({ students, setStudents }) {
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    db.transactions.getAll().then(setTransactions).catch(console.error);
  }, []);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [searchTxn, setSearchTxn] = useState("");

  const filtered = transactions.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterCourse && !(t.courses||"").includes(filterCourse)) return false;
    if (searchTxn && !t.studentName.toLowerCase().includes(searchTxn.toLowerCase()) && !t.planName.toLowerCase().includes(searchTxn.toLowerCase()) && !(t.studentMobile||"").includes(searchTxn)) return false;
    return true;
  });

  const allCourses = [...new Set(transactions.map(t=>t.courses).filter(Boolean).flatMap(c=>c.split(", ")))];
  const pending = transactions.filter(t=>t.status==="pending").length;
  const approved = transactions.filter(t=>t.status==="approved").length;
  const totalRevenue = transactions.filter(t=>t.status==="approved").reduce((a,t)=>a+t.amount,0);

  const updateTxn = async (id, status) => {
    try {
      const updated = await db.transactions.updateStatus(id, status);
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
      if (status === 'approved' && updated.studentId) {
        const s = students.find(x => x.id === updated.studentId);
        if (s) {
          await db.students.update(updated.studentId, { ...s, plan: updated.planId });
          setStudents(prev => prev.map(x => x.id === updated.studentId ? { ...x, plan: updated.planId } : x));
        }
        if (updated.studentMobile) {
          window.open(`https://wa.me/91${updated.studentMobile}?text=${encodeURIComponent(`✅ Payment Approved!\n\n🎓 GR Educational\n📋 Plan: ${updated.planName}\n💰 ₹${updated.amount}\n\nYour ${updated.planName} plan is now active!\n\n🙏 Thank you!`)}`, "_blank");
        }
      }
    } catch(e) { console.error('Failed to update transaction:', e); }
  };

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:4 }}>Transactions</h1>
      <p style={{ color:C.gray500, fontSize:14, marginBottom:16 }}>Payment requests from students — verify and approve</p>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        <StatCard label="Pending Approvals" value={pending} color={C.orange} icon="⏳" />
        <StatCard label="Approved" value={approved} color={C.green} icon="✅" />
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} color={C.primary} icon="💰" />
        <StatCard label="Total Transactions" value={transactions.length} color={C.purple} icon="📊" />
      </div>

      {/* Search + Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:10, alignItems:"center" }}>
        <input value={searchTxn} onChange={e=>setSearchTxn(e.target.value)} placeholder="🔍 Search student, plan, mobile..." style={{ padding:"7px 12px", borderRadius:8, border:`1px solid ${C.gray300}`, fontSize:12, width:250 }} />
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        <span style={{ fontSize:12, fontWeight:600, color:C.gray500, display:"flex", alignItems:"center" }}>Status:</span>
        {["","pending","approved","rejected"].map(s=>(
          <button key={s} onClick={()=>setFilterStatus(s)} style={{ padding:"5px 12px", borderRadius:8, fontSize:11, fontWeight:600, cursor:"pointer", border:`1px solid ${filterStatus===s?C.primary:C.gray300}`, background:filterStatus===s?C.blue50:"#fff", color:filterStatus===s?C.primary:C.gray500 }}>{s||"All"}</button>
        ))}
        <span style={{ fontSize:12, fontWeight:600, color:C.gray500, display:"flex", alignItems:"center", marginLeft:12 }}>Course:</span>
        {["", ...allCourses].map(c=>(
          <button key={c} onClick={()=>setFilterCourse(c)} style={{ padding:"5px 12px", borderRadius:8, fontSize:11, fontWeight:600, cursor:"pointer", border:`1px solid ${filterCourse===c?C.primary:C.gray300}`, background:filterCourse===c?C.blue50:"#fff", color:filterCourse===c?C.primary:C.gray500 }}>{c||"All"}</button>
        ))}
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <Card style={{ textAlign:"center", padding:"40px 24px" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>💰</div>
          <p style={{ color:C.gray400, fontSize:14 }}>No transactions yet. Students will appear here when they submit payment.</p>
        </Card>
      ) : (
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.gray200}`, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:C.gray50 }}>
                {["Student","Course","Plan","Amount","Method","Date","Status","Action"].map(h=>(
                  <th key={h} style={{ padding:"10px 14px", textAlign:h==="Action"?"center":"left", fontSize:11, fontWeight:700, color:C.gray400, textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t=>(
                <tr key={t.id} style={{ borderBottom:`1px solid ${C.gray100}` }}>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ fontWeight:600, color:C.gray800 }}>{t.studentName}</div>
                    <div style={{ fontSize:10, color:C.gray400 }}>{t.studentMobile}</div>
                  </td>
                  <td style={{ padding:"10px 14px", fontSize:12, color:C.gray600 }}>{t.courses}</td>
                  <td style={{ padding:"10px 14px" }}>
                    <Badge label={t.planName} color={t.planId==="premium"?"#d97706":t.planId==="crash"?C.red:C.purple} bg={t.planId==="premium"?"#fef3c7":t.planId==="crash"?C.redBg:C.purpleBg} />
                  </td>
                  <td style={{ padding:"10px 14px", fontWeight:700, color:C.gray800 }}>₹{t.amount}</td>
                  <td style={{ padding:"10px 14px", fontSize:11, color:C.gray500 }}>{t.method==="payment_link"?"Payment Link":t.method==="upi_direct"?"UPI App":"Manual UPI"}</td>
                  <td style={{ padding:"10px 14px", fontSize:11, color:C.gray500 }}>{new Date(t.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</td>
                  <td style={{ padding:"10px 14px", textAlign:"center" }}>
                    <Badge label={t.status} color={t.status==="approved"?C.green:t.status==="rejected"?C.red:C.orange} bg={t.status==="approved"?C.greenBg:t.status==="rejected"?C.redBg:C.orangeBg} />
                  </td>
                  <td style={{ padding:"10px 14px", textAlign:"center" }}>
                    {t.status === "pending" ? (
                      <div style={{ display:"flex", gap:4, justifyContent:"center" }}>
                        <Btn variant="success" onClick={()=>updateTxn(t.id,"approved")} style={{ fontSize:10, padding:"4px 10px" }}>✓ Approve</Btn>
                        <Btn variant="danger" onClick={()=>updateTxn(t.id,"rejected")} style={{ fontSize:10, padding:"4px 10px" }}>✗ Reject</Btn>
                      </div>
                    ) : t.status === "approved" ? (
                      <span style={{ fontSize:11, color:C.green }}>✓ Done</span>
                    ) : (
                      <span style={{ fontSize:11, color:C.red }}>✗ Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══ ADD QUESTION (Teacher/Admin) ═══
function AddQuestionPage({ questions, setQuestions, currentUser, role }) {
  const isAdmin = role === "admin";
  const [form, setForm] = useState({ question_text:"", option_a:"", option_b:"", option_c:"", option_d:"", correct_option:0, subject_id:1, chapter:"", difficulty:"medium", solution:"" });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!form.question_text.trim()) return;
    const newQ = { ...form, id:Date.now(), status:"active",
      bank: isAdmin ? "admin" : "teacher",
      created_by_teacher: isAdmin ? null : (currentUser?.id || null),
      approved_by_admin: isAdmin || undefined };
    setQuestions(prev => [...prev, newQ]);
    setForm({ question_text:"", option_a:"", option_b:"", option_c:"", option_d:"", correct_option:0, subject_id:form.subject_id, chapter:"", difficulty:"medium", solution:"" });
    setSaved(true); setTimeout(()=>setSaved(false), 3000);
  };

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:4 }}>Add Question</h1>
      <p style={{ color:C.gray500, fontSize:14, marginBottom:20 }}>Add questions manually to your question bank</p>
      {saved && <div style={{ background:C.greenBg, border:`1px solid ${C.green}`, borderRadius:10, padding:"10px 16px", marginBottom:14, fontSize:13, color:C.green, fontWeight:600 }}>✅ Question added successfully!</div>}
      <Card>
        <Textarea label="Question Text *" value={form.question_text} onChange={v=>setForm(p=>({...p,question_text:v}))} rows={3} placeholder="Type your question here..." />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          {["option_a","option_b","option_c","option_d"].map((opt,oi)=>(
            <div key={opt}>
              <label style={{ fontSize:12, fontWeight:600, color:form.correct_option===oi?C.green:C.gray600, display:"block", marginBottom:4 }}>{String.fromCharCode(65+oi)}. {form.correct_option===oi?"✓ Correct Answer":"Option"}</label>
              <div style={{ display:"flex", gap:6 }}>
                <input value={form[opt]} onChange={e=>setForm(p=>({...p,[opt]:e.target.value}))} placeholder={`Option ${String.fromCharCode(65+oi)}`} style={{ flex:1, padding:"8px 10px", borderRadius:6, border:`1.5px solid ${form.correct_option===oi?C.green:C.gray200}`, fontSize:13, background:form.correct_option===oi?C.greenBg:"#fff" }} />
                <button onClick={()=>setForm(p=>({...p,correct_option:oi}))} style={{ padding:"8px 12px", borderRadius:6, border:`1.5px solid ${form.correct_option===oi?C.green:C.gray300}`, background:form.correct_option===oi?C.green:"#fff", color:form.correct_option===oi?"#fff":C.gray400, cursor:"pointer", fontWeight:700 }}>✓</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
          <Select label="Subject *" value={form.subject_id} onChange={v=>setForm(p=>({...p,subject_id:Number(v),chapter:""}))} options={SUBJECTS.map(s=>({value:s.id,label:s.name}))} />
          <Select label="Chapter/Topic *" value={form.chapter} onChange={v=>setForm(p=>({...p,chapter:v}))} options={(CHAPTERS[form.subject_id]||[]).map(c=>({value:c,label:c}))} />
          <Select label="Difficulty" value={form.difficulty} onChange={v=>setForm(p=>({...p,difficulty:v}))} options={[{value:"easy",label:"Easy"},{value:"medium",label:"Medium"},{value:"hard",label:"Hard"}]} />
        </div>
        <Textarea label="Solution (optional)" value={form.solution} onChange={v=>setForm(p=>({...p,solution:v}))} rows={2} placeholder="Explain the answer..." />
        <Btn variant="success" onClick={handleSave} style={{ padding:"10px 24px", fontSize:14 }}>💾 Save Question</Btn>
      </Card>
    </div>
  );
}

// ═══ CSV UPLOAD (Teacher/Admin) ═══
function CSVUploadPage({ questions, setQuestions, currentUser, role }) {
  const isAdmin = role === "admin";
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState([]);
  const [imported, setImported] = useState(0);

  const parseCSV = (text) => {
    setCsvText(text);
    if (!text.trim()) { setPreview([]); return; }
    const lines = text.trim().split("\n");
    const rows = lines.slice(1).map((line,i) => {
      const c = parseCSVLine(line);
      if (c.length < 6) return { _error:`Row ${i+2}: Need 6+ columns`, _row:i+2 };
      return { question_text:c[0], option_a:c[1], option_b:c[2], option_c:c[3], option_d:c[4], correct_option:Number(c[5])||0, solution:c[6]||"", subject:c[7]||"", chapter:c[8]||"", difficulty:c[9]||"medium" };
    });
    setPreview(rows);
  };

  const handleImport = () => {
    const valid = preview.filter(r=>!r._error);
    const newQs = valid.map((r,i) => ({
      ...r, id:Date.now()+i, status:"active",
      bank: isAdmin ? "admin" : "teacher",
      created_by_teacher: isAdmin ? null : (currentUser?.id || null),
      approved_by_admin: isAdmin || undefined,
      subject_id: SUBJECTS.find(s=>s.name.toLowerCase()===r.subject?.toLowerCase())?.id || 1,
    }));
    setQuestions(prev => [...prev, ...newQs]);
    setImported(newQs.length);
    setCsvText(""); setPreview([]);
    setTimeout(()=>setImported(0), 4000);
  };

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:4 }}>CSV Upload</h1>
      <p style={{ color:C.gray500, fontSize:14, marginBottom:20 }}>Bulk upload questions via CSV file</p>
      {imported > 0 && <div style={{ background:C.greenBg, border:`1px solid ${C.green}`, borderRadius:10, padding:"10px 16px", marginBottom:14, fontSize:13, color:C.green, fontWeight:600 }}>✅ {imported} questions imported!</div>}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:700, color:C.gray800 }}>Upload Questions</span>
          <button onClick={()=>{const t="question,option_a,option_b,option_c,option_d,correct,solution,subject,chapter,difficulty\nWhat is velocity?,Distance/Time,Mass*Acc,Force/Mass,Energy/Time,0,v=d/t,Physics,Kinematics,easy\nSI unit of force?,Newton,Joule,Watt,Pascal,0,Force=ma,Physics,Laws of Motion,medium";const b=new Blob([t],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="question_template.csv";a.click();}} style={{ padding:"6px 14px", borderRadius:6, border:`1px solid ${C.primary}`, background:C.blue50, color:C.primary, fontSize:12, fontWeight:600, cursor:"pointer" }}>📥 Download Template</button>
        </div>
        <div style={{ border:`2px dashed ${C.gray300}`, borderRadius:10, padding:"20px", textAlign:"center", marginBottom:12, background:C.gray50 }}>
          <input type="file" accept=".csv" id="csvUploadFile" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>parseCSV(ev.target.result);r.readAsText(f);}} />
          <label htmlFor="csvUploadFile" style={{ cursor:"pointer" }}>
            <div style={{ fontSize:28, marginBottom:4 }}>📂</div>
            <div style={{ fontSize:13, fontWeight:600, color:C.primary }}>Click to browse CSV file</div>
            <div style={{ fontSize:11, color:C.gray400, marginTop:2 }}>or paste CSV data below</div>
          </label>
        </div>
        <Textarea value={csvText} onChange={parseCSV} rows={5} placeholder="question,option_a,option_b,option_c,option_d,correct(0-3),solution,subject,chapter,difficulty" />
        {preview.length > 0 && (
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>
              <span style={{ color:C.green }}>✓ {preview.filter(r=>!r._error).length} valid</span>
              {preview.some(r=>r._error) && <span style={{ color:C.red, marginLeft:8 }}>✗ {preview.filter(r=>r._error).length} errors</span>}
            </div>
            <div style={{ maxHeight:200, overflowY:"auto", marginBottom:12 }}>
              {preview.slice(0,5).map((r,i)=>(
                <div key={i} style={{ padding:"6px 10px", borderRadius:6, marginBottom:4, background:r._error?C.redBg:C.greenBg, fontSize:12 }}>
                  {r._error ? <span style={{ color:C.red }}>{r._error}</span> : <span style={{ color:C.green }}>✓ {r.question_text?.slice(0,60)}... [{r.subject||"?"} · {r.chapter||"?"} · {r.difficulty}]</span>}
                </div>
              ))}
              {preview.length > 5 && <div style={{ fontSize:11, color:C.gray400 }}>...and {preview.length-5} more</div>}
            </div>
            <Btn variant="success" onClick={handleImport} style={{ padding:"10px 24px", fontSize:14 }}>📥 Import {preview.filter(r=>!r._error).length} Questions</Btn>
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══ CREATE TEST ═══
function CreateTestPage({ questions, students, streams, courses, tests, setTests }) {
  const [form, setForm] = useState({ name:"", duration:60, marks:1, negative:0, totalQuestions:15, subjects:[1,2,3], perSubject:{1:5,2:5,3:5}, selectedChapters:{}, easy:30, medium:40, hard:30, mode:"combined", stream:"PCM" });
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const [createMethod, setCreateMethod] = useState("auto");
  const [generated, setGenerated] = useState(null);
  const [csvText, setCsvText] = useState("");
  const [csvPreview, setCsvPreview] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [saved, setSaved] = useState(false);
  const [openChapterDD, setOpenChapterDD] = useState(null);
  const [manualSearch, setManualSearch] = useState("");
  const [manualSubject, setManualSubject] = useState("");
  const [manualChapter, setManualChapter] = useState("");
  const [manualDifficulty, setManualDifficulty] = useState("");

  const toggleSubject = (id) => {
    setForm(prev => {
      const has = prev.subjects.includes(id);
      const subjects = has ? prev.subjects.filter(s=>s!==id) : [...prev.subjects, id];
      const perSubject = {...prev.perSubject};
      const selectedChapters = {...prev.selectedChapters};
      if (has) { delete perSubject[id]; delete selectedChapters[id]; }
      else { perSubject[id] = Math.ceil(Number(prev.totalQuestions)/(subjects.length||1)); selectedChapters[id] = [...(CHAPTERS[id]||[])]; }
      return {...prev, subjects, perSubject, selectedChapters};
    });
  };

  const toggleChapter = (subId, chapter) => {
    setForm(prev => {
      const current = prev.selectedChapters[subId] || [];
      const has = current.includes(chapter);
      return {...prev, selectedChapters:{...prev.selectedChapters, [subId]: has ? current.filter(c=>c!==chapter) : [...current, chapter]}};
    });
  };

  const toggleAllChapters = (subId) => {
    setForm(prev => {
      const all = (STREAM_CHAPTERS[subId]||{})[prev.stream] || CHAPTERS[subId] || [];
      const current = prev.selectedChapters[subId] || [];
      const allSelected = current.length === all.length;
      return {...prev, selectedChapters:{...prev.selectedChapters, [subId]: allSelected ? [] : [...all]}};
    });
  };

  // Filter questions by selected subjects AND chapters
  const filteredQuestions = questions.filter(q => {
    if (q.status !== "active") return false;
    if (!form.subjects.includes(q.subject_id)) return false;
    const selChapters = form.selectedChapters[q.subject_id] || [];
    if (selChapters.length > 0 && !selChapters.includes(q.chapter)) return false;
    return true;
  });

  // Manual select filtered questions (additional filters within filteredQuestions)
  const manualFiltered = filteredQuestions.filter(q => {
    if (manualSubject && q.subject_id !== Number(manualSubject)) return false;
    if (manualChapter && q.chapter !== manualChapter) return false;
    if (manualDifficulty && q.difficulty !== manualDifficulty) return false;
    if (manualSearch && !q.question_text.toLowerCase().includes(manualSearch.toLowerCase())) return false;
    return true;
  });

  const getAvail = (subId) => {
    const selChapters = form.selectedChapters[subId] || [];
    return questions.filter(q => q.subject_id===subId && q.status==="active" && (selChapters.length===0 || selChapters.includes(q.chapter))).length;
  };

  const handleGenerate = () => {
    const qs = [];
    form.subjects.forEach(sid => {
      const selChapters = form.selectedChapters[sid] || [];
      const subQs = questions.filter(q=>q.subject_id===sid&&q.status==="active"&&(selChapters.length===0||selChapters.includes(q.chapter)));
      const count = Number(form.perSubject[sid]) || 5;
      const shuffled = [...subQs].sort(()=>Math.random()-0.5).slice(0, count);
      qs.push(...shuffled);
    });
    setGenerated({ questions: qs, timestamp: Date.now() });
  };

  const handleCSVParse = (text) => {
    setCsvText(text);
    if (!text.trim()) { setCsvPreview([]); return; }
    const lines = text.trim().split("\n");
    const rows = lines.slice(1).map((line, i) => {
      const cols = parseCSVLine(line);
      if (cols.length < 6) return { _error: "Need 6+ columns", _row: i+2 };
      return { question_text:cols[0], option_a:cols[1], option_b:cols[2], option_c:cols[3], option_d:cols[4], correct_option:Number(cols[5])||0, solution:cols[6]||"", subject:cols[7]||"", chapter:cols[8]||"" };
    });
    setCsvPreview(rows);
  };

  const getPreviewQs = () => {
    if (createMethod==="auto") return generated?.questions || [];
    if (createMethod==="upload") return csvPreview.filter(r=>!r._error);
    if (createMethod==="manual") return questions.filter(q=>selectedIds.has(q.id));
    return [];
  };
  const previewQs = getPreviewQs();

  const handleSave = () => {
    const newTest = { id:Date.now(), name:form.name||"New Test", status:"draft", mode:form.mode, stream:form.stream, duration:Number(form.duration), totalQuestions:previewQs.length, marks:Number(form.marks), negative:Number(form.negative), isFree:true, price:0, accessLevel:"free", assignType:"all", assignedCourses:[], assignedStreams:[], assignedStudentIds:[], approval_status:"approved", academic_year:"2025-26", created_by_role:"admin", questionIds:previewQs.map(q=>q.id) };
    setTests(prev => [...prev, newTest]);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:4 }}>Create Test</h1>
      <p style={{ color:C.gray500, fontSize:14, marginBottom:20 }}>Build a new test with auto-generate, CSV upload, or manual selection</p>

      {saved && <div style={{ background:C.greenBg, border:`1px solid ${C.green}`, borderRadius:10, padding:"10px 16px", marginBottom:16, fontSize:13, color:C.green, fontWeight:600 }}>✅ Test saved as draft! Go to Manage Tests to publish.</div>}

      {/* Test Info + Subject Selection */}
      <Card style={{ marginBottom:14 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:12 }}>Test Info</h3>
            <Input label="Test Name *" value={form.name} onChange={v=>update("name",v)} placeholder="e.g. Mock Test 4 — Full Syllabus" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <Input label="Duration (min)" value={form.duration} onChange={v=>update("duration",v)} type="number" />
              <Input label="Marks / Q" value={form.marks} onChange={v=>update("marks",v)} type="number" />
            </div>
            <Input label="Negative Marks" value={form.negative} onChange={v=>update("negative",v)} type="number" />
            <Select label="Mode" value={form.mode} onChange={v=>update("mode",v)} options={["combined","subject_wise","chapter_wise","mock_test","practice"]} />
          </div>
          <div>
            <h3 style={{ fontSize:15, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:12 }}>Subject & Topic Selection</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <Input label="Total Questions" value={form.totalQuestions} onChange={v=>update("totalQuestions",v)} type="number" style={{ marginBottom:0 }} />
              <Select label="Exam Stream" value={form.stream} onChange={v=>update("stream",v)} options={["MHT CET","JEE","NEET"]} style={{ marginBottom:0 }} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {SUBJECTS.map(s => {
                const active = form.subjects.includes(s.id);
                const streamChapters = (STREAM_CHAPTERS[s.id]||{})[form.stream] || [];
                if (streamChapters.length === 0 && !active) return null; // Hide subjects with no chapters for this stream
                const selChapters = form.selectedChapters[s.id] || [];
                const showDropdown = openChapterDD === s.id;
                const allSelected = selChapters.length === streamChapters.length && streamChapters.length > 0;
                return (
                  <div key={s.id}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 10px", borderRadius:8, background:active?C.blue50:C.gray50, border:`1.5px solid ${active?C.primary:C.gray200}`, cursor:"pointer" }} onClick={()=>toggleSubject(s.id)}>
                      <input type="checkbox" checked={active} readOnly style={{ accentColor:C.primary }} />
                      <div style={{ flex:1 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:active?C.primary:C.gray700 }}>{s.name}</span>
                        <span style={{ fontSize:11, color:C.gray400, marginLeft:6 }}>{getAvail(s.id)} Qs · {streamChapters.length} topics</span>
                      </div>
                      {active && <input type="number" value={form.perSubject[s.id]||""} onClick={e=>e.stopPropagation()} onChange={e=>setForm(prev=>({...prev,perSubject:{...prev.perSubject,[s.id]:e.target.value}}))} style={{ width:50, padding:"4px 6px", borderRadius:5, border:`1.5px solid ${C.gray200}`, fontSize:12, textAlign:"center" }} placeholder="Qty" />}
                    </div>
                    {/* Topic dropdown */}
                    {active && streamChapters.length > 0 && (
                      <div style={{ marginLeft:24, marginTop:4, marginBottom:4 }}>
                        <div onClick={()=>setOpenChapterDD(showDropdown?null:s.id)} style={{ padding:"6px 10px", borderRadius:6, border:`1px solid ${C.gray300}`, background:"#fff", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12 }}>
                          <span style={{ color:selChapters.length>0?C.primary:C.gray500 }}>
                            {selChapters.length === 0 ? "Select topics..." : selChapters.length === streamChapters.length ? "All topics selected" : `${selChapters.length} of ${streamChapters.length} topics`}
                          </span>
                          <span style={{ fontSize:10, color:C.gray400 }}>{showDropdown?"▲":"▼"}</span>
                        </div>
                        {showDropdown && (
                          <div style={{ border:`1px solid ${C.primary}`, borderRadius:8, background:"#fff", marginTop:4, padding:6, boxShadow:"0 4px 12px rgba(0,0,0,0.1)", maxHeight:200, overflowY:"auto" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 6px", borderBottom:`1px solid ${C.gray100}`, marginBottom:4 }}>
                              <span style={{ fontSize:11, fontWeight:700, color:C.primary }}>{s.name} — {form.stream}</span>
                              <button onClick={()=>toggleAllChapters(s.id)} style={{ fontSize:10, color:C.primary, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>{allSelected?"Deselect All":"Select All"}</button>
                            </div>
                            {streamChapters.map(ch => {
                              const sel = selChapters.includes(ch);
                              return (
                                <div key={ch} onClick={()=>toggleChapter(s.id,ch)} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 8px", borderRadius:4, cursor:"pointer", fontSize:12, background:sel?"#f0fdf4":"transparent" }}>
                                  <span style={{ width:14, height:14, borderRadius:3, border:`1.5px solid ${sel?"#16a34a":C.gray300}`, background:sel?"#16a34a":"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff", flexShrink:0 }}>{sel?"✓":""}</span>
                                  <span style={{ color:sel?"#166534":C.gray600 }}>{ch}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        </div>
      </Card>

      {/* Method tabs */}
      <div style={{ display:"flex", gap:0, marginBottom:16, borderBottom:`2px solid ${C.gray200}` }}>
        {[{id:"auto",label:"⚡ Auto Generate"},{id:"upload",label:"📄 CSV Upload"},{id:"manual",label:"✋ Manual Select"}].map(t=>(
          <button key={t.id} onClick={()=>setCreateMethod(t.id)} style={{ padding:"10px 20px", fontSize:13, fontWeight:600, border:"none", background:"transparent", cursor:"pointer", color:createMethod===t.id?C.primary:C.gray500, borderBottom:createMethod===t.id?`2.5px solid ${C.primary}`:"2.5px solid transparent", marginBottom:-2 }}>{t.label}</button>
        ))}
      </div>

      {/* Auto Generate */}
      {createMethod === "auto" && (
        <Card style={{ marginBottom:14 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:8 }}>Difficulty Mix</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
            {[{key:"easy",label:"Easy",color:C.green},{key:"medium",label:"Medium",color:C.orange},{key:"hard",label:"Hard",color:C.red}].map(d=>(
              <div key={d.key}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span style={{ fontWeight:600, color:d.color }}>{d.label}</span>
                  <span style={{ fontWeight:700, color:d.color }}>{form[d.key]}%</span>
                </div>
                <input type="range" min={0} max={100} value={form[d.key]} onChange={e=>update(d.key,Number(e.target.value))} style={{ width:"100%", accentColor:d.color }} />
              </div>
            ))}
          </div>
          <Btn variant="purple" onClick={handleGenerate} style={{ width:"100%", justifyContent:"center", padding:12, fontSize:14 }}>⚡ Auto Generate</Btn>
        </Card>
      )}

      {/* CSV Upload */}
      {createMethod === "upload" && (
        <Card style={{ marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.gray800, margin:0 }}>Upload Questions via CSV</h3>
            <button onClick={()=>{const t="question,option_a,option_b,option_c,option_d,correct,solution,subject,chapter\nWhat is velocity?,Distance/Time,Mass*Acc,Force/Mass,Energy/Time,0,v=d/t,Physics,Kinematics";const b=new Blob([t],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="test_template.csv";a.click();}} style={{ padding:"6px 12px", borderRadius:6, border:`1px solid ${C.primary}`, background:C.blue50, color:C.primary, fontSize:11, fontWeight:600, cursor:"pointer" }}>📥 Download Template</button>
          </div>
          <div style={{ border:`2px dashed ${C.gray300}`, borderRadius:10, padding:"16px 20px", textAlign:"center", marginBottom:10, background:C.gray50 }}>
            <input type="file" accept=".csv" id="csvFile" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>handleCSVParse(ev.target.result);r.readAsText(f);}} />
            <label htmlFor="csvFile" style={{ cursor:"pointer" }}><div style={{ fontSize:24, marginBottom:4 }}>📂</div><div style={{ fontSize:13, fontWeight:600, color:C.primary }}>Click to browse CSV file</div></label>
          </div>
          <Textarea value={csvText} onChange={handleCSVParse} rows={4} placeholder="Or paste CSV data here..." />
          {csvPreview.length>0 && <div style={{ fontSize:12, color:C.green, fontWeight:600 }}>✓ {csvPreview.filter(r=>!r._error).length} valid questions parsed</div>}
        </Card>
      )}

      {/* Manual Select */}
      {createMethod === "manual" && (
        <Card style={{ marginBottom:14 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:10 }}>Select Questions ({selectedIds.size} selected of {filteredQuestions.length} available)</h3>
          {/* Filters */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:8, marginBottom:12 }}>
            <input value={manualSearch} onChange={e=>setManualSearch(e.target.value)} placeholder="🔍 Search questions..." style={{ padding:"8px 10px", borderRadius:6, border:`1px solid ${C.gray300}`, fontSize:12 }} />
            <select value={manualSubject} onChange={e=>{setManualSubject(e.target.value);setManualChapter("");}} style={{ padding:"8px 10px", borderRadius:6, border:`1px solid ${C.gray300}`, fontSize:12 }}>
              <option value="">All Subjects</option>
              {SUBJECTS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={manualChapter} onChange={e=>setManualChapter(e.target.value)} style={{ padding:"8px 10px", borderRadius:6, border:`1px solid ${C.gray300}`, fontSize:12 }}>
              <option value="">All Topics</option>
              {(manualSubject ? (CHAPTERS[Number(manualSubject)]||[]) : []).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={manualDifficulty} onChange={e=>setManualDifficulty(e.target.value)} style={{ padding:"8px 10px", borderRadius:6, border:`1px solid ${C.gray300}`, fontSize:12 }}>
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          {/* Quick select buttons */}
          <div style={{ display:"flex", gap:6, marginBottom:10 }}>
            <button onClick={()=>{const ids=new Set(manualFiltered.map(q=>q.id));setSelectedIds(prev=>{const n=new Set(prev);manualFiltered.forEach(q=>n.add(q.id));return n;});}} style={{ fontSize:11, color:C.primary, background:C.blue50, border:`1px solid ${C.primary}`, borderRadius:6, padding:"4px 10px", cursor:"pointer", fontWeight:600 }}>☑ Select All Shown ({manualFiltered.length})</button>
            <button onClick={()=>{const ids=new Set(manualFiltered.map(q=>q.id));setSelectedIds(prev=>{const n=new Set(prev);ids.forEach(id=>n.delete(id));return n;});}} style={{ fontSize:11, color:C.gray500, background:"#fff", border:`1px solid ${C.gray300}`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>☐ Deselect Shown</button>
            {selectedIds.size>0 && <button onClick={()=>setSelectedIds(new Set())} style={{ fontSize:11, color:C.red, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Clear All ({selectedIds.size})</button>}
          </div>
          {/* Question list */}
          <div style={{ maxHeight:400, overflowY:"auto" }}>
          {manualFiltered.map(q=>{
            const sel = selectedIds.has(q.id);
            return (
              <div key={q.id} onClick={()=>setSelectedIds(prev=>{const n=new Set(prev);if(sel)n.delete(q.id);else n.add(q.id);return n;})}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:6, cursor:"pointer", marginBottom:4, background:sel?C.blue50:"transparent", border:`1px solid ${sel?C.primary:C.gray200}` }}>
                <span style={{ width:18, height:18, borderRadius:4, border:`1.5px solid ${sel?C.primary:C.gray300}`, background:sel?C.primary:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", flexShrink:0 }}>{sel?"✓":""}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:sel?600:400, color:sel?C.primary:C.gray700 }}>{q.question_text}</div>
                  <div style={{ display:"flex", gap:4, marginTop:2 }}>
                    <span style={{ fontSize:10, padding:"1px 6px", borderRadius:4, background:C.blue50, color:C.primary }}>{SUBJECTS.find(s=>s.id===q.subject_id)?.name}</span>
                    <span style={{ fontSize:10, padding:"1px 6px", borderRadius:4, background:C.purpleBg, color:C.purple }}>{q.chapter||"General"}</span>
                    <span style={{ fontSize:10, padding:"1px 6px", borderRadius:4, background:q.difficulty==="easy"?C.greenBg:q.difficulty==="hard"?C.redBg:C.orangeBg, color:q.difficulty==="easy"?C.green:q.difficulty==="hard"?C.red:C.orange }}>{q.difficulty}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {manualFiltered.length===0 && <div style={{ padding:20, textAlign:"center", fontSize:13, color:C.gray400 }}>No questions match filters</div>}
          </div>
        </Card>
      )}

      {/* Preview */}
      {previewQs.length > 0 && (
        <Card style={{ borderLeft:`4px solid ${C.green}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div>
              <h3 style={{ fontSize:16, fontWeight:700, color:C.gray800, margin:0 }}>{createMethod==="auto"?"Generated Preview":createMethod==="upload"?"CSV Preview":"Selected Questions"}</h3>
              <p style={{ fontSize:12, color:C.gray500, marginTop:2 }}>{previewQs.length} questions ready</p>
            </div>
            <Btn variant="success" onClick={handleSave} style={{ padding:"10px 24px", fontSize:14 }}>💾 Save as Draft</Btn>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
            {SUBJECTS.map(s=>{const c=previewQs.filter(q=>q.subject_id===s.id).length;return c>0?<Badge key={s.id} label={`${s.code}: ${c}`} color={s.color} bg={`${s.color}15`} />:null;})}
          </div>
          {previewQs.slice(0,5).map((q,i)=>(
            <div key={q.id||i} style={{ padding:"8px 0", borderBottom:`1px solid ${C.gray100}`, fontSize:13 }}>
              <span style={{ fontWeight:700, color:C.gray500, marginRight:8 }}>Q{i+1}.</span>
              <span style={{ color:C.gray800 }}>{q.question_text}</span>
              <span style={{ fontSize:10, color:C.gray400, marginLeft:8 }}>[{SUBJECTS.find(s=>s.id===q.subject_id)?.code||q.subject||"?"} · {q.difficulty||"medium"}]</span>
            </div>
          ))}
          {previewQs.length>5 && <div style={{ fontSize:12, color:C.gray400, paddingTop:8 }}>... and {previewQs.length-5} more questions</div>}
        </Card>
      )}
    </div>
  );
}

// ═══ PRAGATI EXAMS ═══
function PragatiExamsPage({ streamConfig, pragatiExams, setPragatiExams, pragatiConfig }) {
  const [openSubject, setOpenSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState("arambh");
  const [filterStream, setFilterStream] = useState("");
  const [csvText, setCsvText] = useState("");
  const [pragatiMeta, setPragatiMeta] = useState({}); // {topicKey: {isFree:bool}}

  // Derive subjects and topics from streamConfig
  const allSubjects = useMemo(() => {
    const subMap = {};
    Object.entries(streamConfig).forEach(([stream, cfg]) => {
      Object.entries(cfg.subjects || {}).forEach(([sub, topics]) => {
        if (!subMap[sub]) subMap[sub] = { name: sub, topics: {}, streams: [] };
        if (!subMap[sub].streams.includes(stream)) subMap[sub].streams.push(stream);
        topics.forEach(t => {
          if (!subMap[sub].topics[t]) subMap[sub].topics[t] = { name: t, streams: [] };
          if (!subMap[sub].topics[t].streams.includes(stream)) subMap[sub].topics[t].streams.push(stream);
        });
      });
    });
    return subMap;
  }, [streamConfig]);

  const SUBJECT_COLORS = { Physics:"#3b82f6", Chemistry:"#10b981", Mathematics:"#8b5cf6", Biology:"#f59e0b", English:"#ec4899", Reasoning:"#06b6d4" };

  const selectedSubData = openSubject ? allSubjects[openSubject] : null;
  const selectedTopicData = selectedSubData && selectedTopic ? selectedSubData.topics[selectedTopic] : null;
  const topicKey = openSubject && selectedTopic ? `${openSubject}_${selectedTopic}` : null;
  const isFree = topicKey ? (pragatiMeta[topicKey]?.isFree || false) : false;
  const examKey = topicKey ? `${topicKey}_${activeTab}` : null;
  const examQuestions = examKey ? (pragatiExams[examKey]?.questions || []) : [];
  const reqQs = activeTab.includes("arambh") ? pragatiConfig.arambh.questions : pragatiConfig.shikhar.questions;

  const addQuestion = () => {
    if (!examKey) return;
    const existing = pragatiExams[examKey]?.questions || [];
    const newQ = { id:Date.now(), question_text:"New question "+(existing.length+1), option_a:"A", option_b:"B", option_c:"C", option_d:"D", correct_option:0, solution:"" };
    setPragatiExams(prev => ({...prev, [examKey]:{...prev[examKey], questions:[...existing, newQ]}}));
  };

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:4 }}>Pragati Exams</h1>
      <p style={{ color:C.gray500, fontSize:14, marginBottom:6 }}>Topics auto-synced from Settings → Streams & Subjects</p>
      <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:8, padding:"8px 14px", marginBottom:16, fontSize:12, color:"#166534" }}>
        🔗 Integrated with Settings → When you add/remove topics in a stream, Pragati updates automatically
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20, minHeight:"70vh" }}>
        {/* LEFT: Subjects + Topics */}
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.gray200}`, overflow:"hidden" }}>
          {/* Stream filter */}
          <div style={{ padding:"10px 12px", borderBottom:`1px solid ${C.gray100}`, display:"flex", gap:4, flexWrap:"wrap" }}>
            <button onClick={()=>setFilterStream("")} style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, cursor:"pointer", border:`1px solid ${!filterStream?C.primary:C.gray300}`, background:!filterStream?C.blue50:"#fff", color:!filterStream?C.primary:C.gray500 }}>All</button>
            {Object.keys(streamConfig).map(s=>(
              <button key={s} onClick={()=>setFilterStream(filterStream===s?"":s)} style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, cursor:"pointer", border:`1px solid ${filterStream===s?C.primary:C.gray300}`, background:filterStream===s?C.blue50:"#fff", color:filterStream===s?C.primary:C.gray500 }}>{s}</button>
            ))}
          </div>

          {Object.entries(allSubjects).map(([subName, subData]) => {
            const color = SUBJECT_COLORS[subName] || C.gray500;
            const isOpen = openSubject === subName;
            const topicList = Object.entries(subData.topics).filter(([_, td]) => !filterStream || td.streams.includes(filterStream));
            if (filterStream && topicList.length === 0) return null;

            return (
              <div key={subName}>
                <button onClick={()=>setOpenSubject(isOpen?null:subName)} style={{ width:"100%", padding:"12px 16px", display:"flex", alignItems:"center", gap:8, cursor:"pointer", border:"none", background:isOpen?`${color}10`:"#fff", borderBottom:`1px solid ${C.gray100}`, textAlign:"left" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color }}>{subName}</div>
                    <div style={{ fontSize:10, color:C.gray400 }}>{topicList.length} topics · {subData.streams.length} streams</div>
                  </div>
                  <span style={{ fontSize:12, color:C.gray400 }}>{isOpen?"▲":"▼"}</span>
                </button>
                {isOpen && topicList.map(([topicName, topicData]) => {
                  const tKey = `${subName}_${topicName}`;
                  const isSelected = selectedTopic === topicName;
                  const tFree = pragatiMeta[tKey]?.isFree || false;
                  const topicPrice = pragatiMeta[tKey]?.price || 49;
                  return (
                    <button key={topicName} onClick={()=>setSelectedTopic(topicName)} style={{ width:"100%", padding:"8px 16px 8px 42px", display:"flex", alignItems:"center", gap:6, cursor:"pointer", border:"none", background:isSelected?C.blue50:"#fff", borderBottom:`1px solid ${C.gray50}`, textAlign:"left" }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{ fontSize:12, fontWeight:isSelected?700:500, color:isSelected?C.primary:C.gray600 }}>{topicName}</span>
                          <span style={{ fontSize:8, fontWeight:700, padding:"1px 5px", borderRadius:4, background:tFree?"#f0fdf4":topicPrice>0?"#fef3c7":"#fef3c7", color:tFree?"#16a34a":"#d97706" }}>{tFree?"FREE":topicPrice>0?`₹${topicPrice}`:"PAID"}</span>
                        </div>
                        <div style={{ display:"flex", gap:2, marginTop:2 }}>{topicData.streams.map(st=><span key={st} style={{ fontSize:8, padding:"1px 4px", borderRadius:3, background:C.gray100, color:C.gray500 }}>{st}</span>)}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:2 }} onClick={e=>e.stopPropagation()}>
                        <select value={tFree?"free":"paid"} onChange={e=>{setPragatiMeta(prev=>({...prev,[tKey]:{...prev[tKey],isFree:e.target.value==="free"}}));}} style={{ padding:"2px 4px", borderRadius:4, border:`1px solid ${C.gray300}`, fontSize:9, width:50 }}>
                          <option value="free">Free</option>
                          <option value="paid">Paid</option>
                        </select>
                        {!tFree && <input type="number" value={topicPrice||""} onClick={e=>e.stopPropagation()} onChange={e=>{setPragatiMeta(prev=>({...prev,[tKey]:{...prev[tKey],price:Number(e.target.value)}}));}} placeholder="₹" style={{ width:40, padding:"2px 4px", borderRadius:4, border:`1px solid ${C.gray300}`, fontSize:9, textAlign:"center" }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* RIGHT: Exam questions */}
        <div>
          {!selectedTopicData ? (
            <Card style={{ textAlign:"center", padding:"60px 24px" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✨</div>
              <h3 style={{ fontSize:18, fontWeight:700, color:C.gray700 }}>Select a topic</h3>
              <p style={{ fontSize:14, color:C.gray400 }}>Choose a subject → topic from the left panel</p>
            </Card>
          ) : (
            <>
              <Card style={{ marginBottom:14, borderLeft:`4px solid ${SUBJECT_COLORS[openSubject]||C.gray400}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <h2 style={{ fontSize:18, fontWeight:800, color:C.gray900, margin:0 }}>{selectedTopic}</h2>
                    <p style={{ fontSize:13, color:C.gray500, marginTop:2 }}>{openSubject} · Streams: {selectedTopicData.streams.join(", ")}</p>
                  </div>
                  <Badge label={isFree?"FREE":`₹${pragatiMeta[topicKey]?.price||49}`} color={isFree?C.green:"#d97706"} bg={isFree?C.greenBg:"#fef3c7"} />
                </div>
              </Card>

              {/* Level tabs */}
              <div style={{ display:"flex", gap:0, marginBottom:16, borderBottom:`2px solid ${C.gray200}` }}>
                {[{id:"arambh",label:"⚡ Arambh",color:"#D97706"},{id:"retake_arambh",label:"🔄 Retake A",color:"#B45309"},{id:"shikhar",label:"🏔 Shikhar",color:"#DC2626"},{id:"retake_shikhar",label:"🔄 Retake S",color:"#991B1B"}].map(tab=>(
                  <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ padding:"10px 16px", fontSize:13, fontWeight:600, border:"none", background:"transparent", cursor:"pointer", color:activeTab===tab.id?tab.color:C.gray500, borderBottom:activeTab===tab.id?`2.5px solid ${tab.color}`:"2.5px solid transparent", marginBottom:-2 }}>{tab.label}</button>
                ))}
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <span style={{ fontSize:13, color:C.gray600 }}>
                  Questions: <strong style={{ color:examQuestions.length>=reqQs?C.green:C.orange }}>{examQuestions.length}/{reqQs}</strong>
                  {examQuestions.length>=reqQs ? <span style={{ color:C.green, marginLeft:8 }}>✓ Ready</span> : <span style={{ color:C.orange, marginLeft:8 }}>⚠ Need {reqQs-examQuestions.length} more</span>}
                </span>
                <Btn variant="success" onClick={addQuestion} style={{ fontSize:12, padding:"6px 14px" }}>+ Add Question</Btn>
              </div>

              {examQuestions.length===0 ? (
                <Card style={{ textAlign:"center", padding:"40px 24px" }}>
                  <div style={{ fontSize:36, marginBottom:12 }}>📝</div>
                  <p style={{ color:C.gray400 }}>No questions yet</p>
                  <Btn variant="primary" onClick={addQuestion} style={{ marginTop:12 }}>+ Add First Question</Btn>
                </Card>
              ) : examQuestions.map((q,qi)=>(
                <Card key={q.id} style={{ marginBottom:8, padding:"12px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:C.gray800, marginBottom:4 }}>Q{qi+1}. {q.question_text}</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, fontSize:12 }}>
                        {["option_a","option_b","option_c","option_d"].map((opt,oi)=>(
                          <div key={opt} style={{ padding:"4px 8px", borderRadius:4, background:q.correct_option===oi?C.greenBg:C.gray50, border:`1px solid ${q.correct_option===oi?C.green:C.gray200}` }}>
                            {String.fromCharCode(65+oi)}. {q[opt]} {q.correct_option===oi&&<span style={{color:C.green}}>✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={()=>{setPragatiExams(prev=>({...prev,[examKey]:{...prev[examKey],questions:(prev[examKey]?.questions||[]).filter(x=>x.id!==q.id)}}));}} style={{ background:"none",border:"none",cursor:"pointer",color:C.gray300,fontSize:14,marginLeft:8 }}>🗑</button>
                  </div>
                </Card>
              ))}

              {/* CSV Upload */}
              <Card style={{ marginTop:16 }}>
                <h4 style={{ fontSize:13, fontWeight:700, color:C.gray700, margin:"0 0 8px" }}>📄 Bulk Upload</h4>
                <Textarea value={csvText} onChange={setCsvText} rows={3} placeholder="question,option_a,option_b,option_c,option_d,correct(0-3),solution" />
                <Btn variant="primary" onClick={()=>{
                  if(!csvText.trim()||!examKey)return;
                  const newQs=csvText.trim().split("\n").slice(1).map((line,i)=>{const c=parseCSVLine(line);if(c.length<6)return null;return{id:Date.now()+i,question_text:c[0],option_a:c[1],option_b:c[2],option_c:c[3],option_d:c[4],correct_option:Number(c[5])||0,solution:c[6]||""};}).filter(Boolean);
                  if(newQs.length>0)setPragatiExams(prev=>({...prev,[examKey]:{...prev[examKey],questions:[...(prev[examKey]?.questions||[]),...newQs]}}));
                  setCsvText("");
                }} style={{ fontSize:12 }}>Upload</Btn>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══ MANAGE TEACHERS ═══
function ManageTeachersPage({ teachers, setTeachers, colleges }) {
  const [expandedId, setExpandedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name:"", email:"", phone:"", auth_user_id:"", college_id:1, collegeName:"", collegeLogo:"", subjects:[], permissions:["question_bank","add_question"] });
  const [addError, setAddError] = useState("");

  const handleAddTeacher = async () => {
    if (!addForm.name.trim() || !addForm.email.trim()) return;
    const row = {
      name: addForm.name, email: addForm.email, phone: addForm.phone || null,
      auth_user_id: addForm.auth_user_id || null,
      college_id: addForm.college_id || null,
      subjects: addForm.subjects, permissions: addForm.permissions, status: "active",
    };
    setAddError("");
    try {
      const created = await db.teachers.create(row);
      setTeachers(prev => [...prev, { ...created, collegeName: addForm.collegeName, collegeLogo: addForm.collegeLogo }]);
    } catch(e) { setAddError('Failed to add teacher: ' + (e.message || e)); return; }
    setAddForm({ name:"", email:"", phone:"", auth_user_id:"", college_id:1, collegeName:"", collegeLogo:"", subjects:[], permissions:["question_bank","add_question"] });
    setShowAdd(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAddForm(prev => ({...prev, collegeLogo: ev.target.result}));
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, marginBottom:4 }}>Manage Teachers</h1>
          <p style={{ color:C.gray500, fontSize:14 }}>{teachers.length} teachers registered</p>
        </div>
        <Btn variant="primary" onClick={()=>setShowAdd(!showAdd)} style={{ padding:"10px 20px", fontSize:14 }}>
          {showAdd ? "✕ Cancel" : "+ Add Teacher"}
        </Btn>
      </div>

      {/* Add Teacher Form */}
      {showAdd && (
        <Card style={{ marginBottom:20, borderLeft:`4px solid ${C.green}`, padding:24 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:C.gray800, marginTop:0, marginBottom:16 }}>➕ Add New Teacher</h3>

          {/* Teacher Info */}
          <div style={{ fontSize:13, fontWeight:700, color:C.gray600, marginBottom:8 }}>👤 Teacher Information</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="Full Name *" value={addForm.name} onChange={v=>setAddForm(p=>({...p,name:v}))} placeholder="Prof. Meena Sharma" />
            <Input label="Email *" value={addForm.email} onChange={v=>setAddForm(p=>({...p,email:v}))} placeholder="meena@college.com" />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="Phone" value={addForm.phone} onChange={v=>setAddForm(p=>({...p,phone:v}))} placeholder="9988776655" />
            <div>
              <Input label="Supabase Auth ID" value={addForm.auth_user_id} onChange={v=>setAddForm(p=>({...p,auth_user_id:v}))} placeholder="UUID from Auth › Users" />
              <div style={{ fontSize:11, color:C.gray400, marginTop:-10, marginBottom:8 }}>Create teacher's Auth account in Supabase first, then paste the UUID here</div>
            </div>
          </div>

          {/* College / Brand */}
          <div style={{ fontSize:13, fontWeight:700, color:C.gray600, marginBottom:8, marginTop:8 }}>🏫 College / Brand</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <Select label="Select Existing College" value={addForm.college_id} onChange={v=>setAddForm(p=>({...p,college_id:Number(v)}))}
                options={colleges.map(c=>({value:c.id, label:`${c.name} (${c.shortName})`}))} />
              <div style={{ fontSize:11, color:C.gray400, textAlign:"center", margin:"4px 0" }}>— or create new —</div>
              <Input label="New College/Brand Name" value={addForm.collegeName} onChange={v=>setAddForm(p=>({...p,collegeName:v}))} placeholder="e.g. Modern College" />
            </div>
            <div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.gray600, marginBottom:5 }}>College Logo</label>
                <div style={{ border:`2px dashed ${C.gray300}`, borderRadius:10, padding:16, textAlign:"center", background:C.gray50, cursor:"pointer", position:"relative" }}>
                  {addForm.collegeLogo ? (
                    <div>
                      <img src={addForm.collegeLogo} alt="Logo" style={{ maxHeight:60, maxWidth:120, objectFit:"contain", marginBottom:6 }} />
                      <div style={{ fontSize:11, color:C.green, fontWeight:600 }}>✓ Logo uploaded</div>
                      <button onClick={()=>setAddForm(p=>({...p,collegeLogo:""}))} style={{ fontSize:10, color:C.red, background:"none", border:"none", cursor:"pointer", marginTop:4 }}>Remove</button>
                    </div>
                  ) : (
                    <label htmlFor="logoUpload" style={{ cursor:"pointer" }}>
                      <div style={{ fontSize:28, marginBottom:4 }}>🖼</div>
                      <div style={{ fontSize:12, fontWeight:600, color:C.primary }}>Click to upload logo</div>
                      <div style={{ fontSize:10, color:C.gray400, marginTop:2 }}>PNG, JPG (max 200x200)</div>
                    </label>
                  )}
                  <input type="file" id="logoUpload" accept="image/*" style={{ display:"none" }} onChange={handleLogoUpload} />
                </div>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div style={{ fontSize:13, fontWeight:700, color:C.gray600, marginBottom:8 }}>📚 Assigned Subjects</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
            {SUBJECTS.map(s => {
              const sel = addForm.subjects.includes(s.id);
              return (
                <button key={s.id} onClick={()=>setAddForm(p=>({...p,subjects:sel?p.subjects.filter(x=>x!==s.id):[...p.subjects,s.id]}))}
                  style={{ padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:sel?700:500, cursor:"pointer", border:`1.5px solid ${sel?s.color:C.gray300}`, background:sel?`${s.color}15`:"#fff", color:sel?s.color:C.gray500 }}>
                  {sel?"✓ ":""}{s.name}
                </button>
              );
            })}
          </div>

          {/* Permissions */}
          <div style={{ fontSize:13, fontWeight:700, color:C.gray600, marginBottom:8 }}>🔐 Page Permissions</div>
          <div style={{ display:"flex", gap:4, marginBottom:8 }}>
            <button onClick={()=>setAddForm(p=>({...p,permissions:TEACHER_PERMISSIONS.map(pp=>pp.id)}))} style={{ padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", border:`1px solid ${C.green}`, background:C.greenBg, color:C.green }}>✓ All</button>
            <button onClick={()=>setAddForm(p=>({...p,permissions:[]}))} style={{ padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", border:`1px solid ${C.gray300}`, background:"#fff", color:C.gray500 }}>None</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:16 }}>
            {TEACHER_PERMISSIONS.map(p => {
              const has = addForm.permissions.includes(p.id);
              return (
                <div key={p.id} onClick={()=>setAddForm(prev=>({...prev,permissions:has?prev.permissions.filter(x=>x!==p.id):[...prev.permissions,p.id]}))}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:8, background:has?C.blue50:C.gray50, border:`1.5px solid ${has?C.primary:C.gray200}`, cursor:"pointer" }}>
                  <span style={{ width:16, height:16, borderRadius:4, border:`1.5px solid ${has?C.primary:C.gray300}`, background:has?C.primary:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff" }}>{has?"✓":""}</span>
                  <span style={{ fontSize:13 }}>{p.icon}</span>
                  <span style={{ fontSize:12, fontWeight:has?600:400, color:has?C.primary:C.gray600 }}>{p.label}</span>
                </div>
              );
            })}
          </div>

          {/* Save */}
          {addError && <div style={{ color:C.red, fontSize:13, marginBottom:8, padding:"6px 12px", background:C.redBg, borderRadius:6 }}>{addError}</div>}
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="success" onClick={handleAddTeacher} style={{ padding:"10px 24px", fontSize:14 }}>💾 Add Teacher</Btn>
            <Btn variant="ghost" onClick={()=>{setShowAdd(false);setAddError("");}} style={{ fontSize:13 }}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Teacher List */}
      {teachers.map(t=>{
        const college = colleges.find(c=>c.id===t.college_id);
        return (
        <Card key={t.id} style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }} onClick={()=>setExpandedId(expandedId===t.id?null:t.id)}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {t.collegeLogo ? (
                <img src={t.collegeLogo} alt="" style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.gray200}` }} />
              ) : (
                <div style={{ width:40, height:40, borderRadius:"50%", background:C.purple, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700 }}>{t.name[0]}</div>
              )}
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:C.gray800 }}>{t.name}</div>
                <div style={{ fontSize:11, color:C.gray400 }}>
                  {t.email} · {t.questions_added} questions
                  {(college || t.collegeName) && <span style={{ marginLeft:6, padding:"1px 6px", borderRadius:4, background:C.blue50, color:C.primary, fontSize:10, fontWeight:600 }}>🏫 {t.collegeName || college?.shortName || ""}</span>}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ display:"flex", gap:3 }}>
                {SUBJECTS.filter(s=>(t.subjects||[]).includes(s.id)).map(s=>(
                  <span key={s.id} style={{ padding:"2px 6px", borderRadius:4, fontSize:9, fontWeight:700, background:`${s.color}15`, color:s.color }}>{s.code}</span>
                ))}
              </div>
              <Badge label={t.status} color={t.status==="active"?C.green:C.red} bg={t.status==="active"?C.greenBg:C.redBg} />
              <span style={{ fontSize:12, color:C.gray400 }}>{expandedId===t.id?"▲":"▼"}</span>
            </div>
          </div>
          {expandedId===t.id && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.gray200}` }}>
              {/* Teacher details */}
              <div style={{ display:"flex", gap:16, marginBottom:14, padding:"8px 12px", background:C.gray50, borderRadius:8, flexWrap:"wrap" }}>
                <div style={{ fontSize:12 }}><span style={{ color:C.gray500 }}>Email:</span> <strong>{t.email}</strong></div>
                <div style={{ fontSize:12 }}><span style={{ color:C.gray500 }}>Phone:</span> <strong>{t.phone||"—"}</strong></div>
                <div style={{ fontSize:12 }}><span style={{ color:C.gray500 }}>Auth ID:</span> <strong style={{fontSize:10}}>{t.auth_user_id||"—"}</strong></div>
              </div>
              {/* Permissions */}
              <div style={{ fontSize:13, fontWeight:700, color:C.gray700, marginBottom:8 }}>🔐 Permissions</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {TEACHER_PERMISSIONS.map(p=>{
                  const has = (t.permissions||[]).includes(p.id);
                  return (
                    <div key={p.id} onClick={()=>setTeachers(prev=>prev.map(x=>x.id===t.id?{...x,permissions:has?x.permissions.filter(pp=>pp!==p.id):[...x.permissions,p.id]}:x))}
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:8, background:has?C.blue50:C.gray50, border:`1.5px solid ${has?C.primary:C.gray200}`, cursor:"pointer" }}>
                      <span style={{ width:18, height:18, borderRadius:4, border:`1.5px solid ${has?C.primary:C.gray300}`, background:has?C.primary:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff" }}>{has?"✓":""}</span>
                      <span style={{ fontSize:14 }}>{p.icon}</span>
                      <div><div style={{ fontSize:12, fontWeight:has?700:500, color:has?C.primary:C.gray600 }}>{p.label}</div><div style={{ fontSize:10, color:C.gray400 }}>{p.desc}</div></div>
                    </div>
                  );
                })}
              </div>
              {/* Actions */}
              <div style={{ display:"flex", gap:8, marginTop:14, paddingTop:12, borderTop:`1px solid ${C.gray200}` }}>
                <Btn onClick={()=>setTeachers(prev=>prev.map(x=>x.id===t.id?{...x,status:t.status==="active"?"inactive":"active"}:x))}
                  style={{ fontSize:12, padding:"6px 14px", background:t.status==="active"?C.orangeBg:C.greenBg, color:t.status==="active"?C.orange:C.green, border:`1px solid ${t.status==="active"?C.orange:C.green}` }}>
                  {t.status==="active"?"⏸ Deactivate":"▶ Activate"}
                </Btn>
                <Btn variant="danger" onClick={async ()=>{ const snap=t; setTeachers(prev=>prev.filter(x=>x.id!==t.id)); setExpandedId(null); try { await db.teachers.remove(t.id); } catch(e){ console.error(e); setTeachers(prev=>[snap,...prev]); } }} style={{ fontSize:12, padding:"6px 14px" }}>🗑 Remove</Btn>
                <div style={{ flex:1 }} />
                <Btn variant="success" onClick={async ()=>{ try { await db.teachers.update(t.id, { permissions: t.permissions, status: t.status }); } catch(e){ console.error(e); } setExpandedId(null); }} style={{ fontSize:12, padding:"8px 20px" }}>💾 Save</Btn>
              </div>
            </div>
          )}
        </Card>
        );
      })}
    </div>
  );
}
