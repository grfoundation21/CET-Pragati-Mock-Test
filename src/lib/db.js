import { supabase } from '../supabase'

// ── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  },
  async signOut() {
    await supabase.auth.signOut()
  },
  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },
  onAuthChange(cb) {
    return supabase.auth.onAuthStateChange((_event, session) => cb(session))
  },
  onAuthEvent(cb) {
    return supabase.auth.onAuthStateChange(cb)
  },
  async resetPassword(emailOrMobile) {
    const email = emailOrMobile.includes('@') ? emailOrMobile : `91${emailOrMobile}@grapp.in`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) throw error
  },
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  },
}

// ── Students ─────────────────────────────────────────────────────────────────
function studentToUI(row) {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    name: row.name,
    email: row.email,
    mobile: row.mobile || '',
    parentMobile: row.parent_mobile || '',
    gender: row.gender || '',
    dob: row.dob || '',
    city: row.city || '',
    stream: row.stream || '',
    courses: row.courses || [],
    course: (row.courses || [])[0] || '',
    class: row.class || '',
    college: row.college_id || null,
    plan: row.plan || 'free',
    status: row.status || 'pending',
    joinDate: row.join_date || '',
    avgScore: 0,
    testsAttempted: 0,
  }
}

function studentToDB(ui) {
  const planMap = { prime: 'premium', premium: 'premium', free: 'free', crash: 'crash', pragati: 'pragati' }
  const courses = Array.isArray(ui.courses) ? ui.courses : ui.course ? [ui.course] : []
  return {
    name: ui.name,
    email: ui.email,
    mobile: ui.mobile || null,
    parent_mobile: ui.parentMobile || null,
    gender: ui.gender || null,
    dob: ui.dob || null,
    city: ui.city || null,
    stream: ui.stream || null,
    courses,
    class: ui.class || null,
    college_id: ui.college || null,
    plan: planMap[ui.plan] || ui.plan || 'free',
    status: ui.status || 'pending',
  }
}

export const students = {
  async getAll() {
    const { data, error } = await supabase
      .from('students').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(studentToUI)
  },
  async getByAuthId(authUserId) {
    const { data } = await supabase
      .from('students').select('*').eq('auth_user_id', authUserId).single()
    return data ? studentToUI(data) : null
  },
  async create(ui) {
    const { data, error } = await supabase
      .from('students').insert(studentToDB(ui)).select().single()
    if (error) throw error
    return studentToUI(data)
  },
  async createWithAuthId(authUserId, ui) {
    const { data, error } = await supabase
      .from('students').insert({ ...studentToDB(ui), auth_user_id: authUserId }).select().single()
    if (error) throw error
    return studentToUI(data)
  },
  async update(id, ui) {
    const { data, error } = await supabase
      .from('students')
      .update({ ...studentToDB(ui), updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) throw error
    return studentToUI(data)
  },
  async remove(id) {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) throw error
  },
}

// ── Teachers ─────────────────────────────────────────────────────────────────
export const teachers = {
  async getAll() {
    const { data, error } = await supabase.from('teachers').select('*')
    if (error) throw error
    return data || []
  },
  async getByAuthId(authUserId) {
    const { data } = await supabase
      .from('teachers').select('*').eq('auth_user_id', authUserId).single()
    return data || null
  },
  async create(row) {
    const { data, error } = await supabase.from('teachers').insert(row).select().single()
    if (error) throw error
    return data
  },
  async update(id, row) {
    const { data, error } = await supabase
      .from('teachers').update(row).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async remove(id) {
    const { error } = await supabase.from('teachers').delete().eq('id', id)
    if (error) throw error
  },
}

// ── Transactions ─────────────────────────────────────────────────────────────
function txnToUI(t) {
  return {
    id: t.id,
    studentId: t.student_id,
    studentName: t.students?.name || '',
    studentMobile: t.students?.mobile || '',
    planId: t.plan_id,
    planName: t.plan_name,
    amount: Number(t.amount),
    method: t.method || '',
    date: t.created_at,
    status: t.status,
    courses: Array.isArray(t.courses) ? t.courses.join(', ') : '',
    approvedDate: t.status !== 'pending' ? t.updated_at : null,
    notes: t.notes || '',
  }
}

export const transactions = {
  async getAll() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, students(name, mobile)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(txnToUI)
  },
  async create({ studentId, planId, planName, amount, method, courses }) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        student_id: studentId,
        plan_id: planId,
        plan_name: planName,
        amount,
        method: method || 'other',
        courses: Array.isArray(courses) ? courses : courses ? [courses] : [],
        status: 'pending',
      })
      .select().single()
    if (error) throw error
    return data
  },
  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, students(name, mobile)')
      .single()
    if (error) throw error
    return txnToUI(data)
  },
}

// ── Settings ─────────────────────────────────────────────────────────────────
export const settings = {
  async get(key) {
    const { data } = await supabase
      .from('app_settings').select('value').eq('key', key).single()
    return data?.value ?? null
  },
  async upsert(key, value) {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
    if (error) throw error
  },
}

// ── Admins ────────────────────────────────────────────────────────────────────
export const admins = {
  async getByAuthId(authUserId) {
    const { data } = await supabase
      .from('admins').select('*').eq('auth_user_id', authUserId).single()
    return data || null
  },
}

// ── Test Attempts ─────────────────────────────────────────────────────────────
function attemptToUI(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    testName: row.test_name,
    correct: row.correct,
    wrong: row.wrong,
    unanswered: row.unanswered,
    total: row.total,
    elapsed: row.elapsed,
    course: row.course || '',
    pragatiInfo: row.pragati_info || null,
    date: row.created_at,
  }
}

export const testAttempts = {
  async getByStudentId(studentId) {
    const { data, error } = await supabase
      .from('test_attempts').select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(attemptToUI)
  },
  async save({ studentId, testName, correct, wrong, unanswered, total, elapsed, course, pragatiInfo }) {
    const { data, error } = await supabase
      .from('test_attempts')
      .insert({
        student_id: studentId,
        test_name: testName,
        correct, wrong, unanswered, total, elapsed,
        course: course || null,
        pragati_info: pragatiInfo || null,
      })
      .select().single()
    if (error) throw error
    return attemptToUI(data)
  },
}

// ── Pragati Attempts ──────────────────────────────────────────────────────────
export const pragatiAttempts = {
  async getByStudentId(studentId) {
    const { data, error } = await supabase
      .from('pragati_attempts').select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data || []
  },
  async save({ studentId, subjectKey, topicId, level, score }) {
    const { error } = await supabase
      .from('pragati_attempts')
      .insert({ student_id: studentId, subject_key: subjectKey, topic_id: topicId, level, score })
    if (error) throw error
  },
}
