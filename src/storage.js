const fs = require('fs');
const path = require('path');

const IS_VERCEL = !!process.env.VERCEL;
const BUNDLED_DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'data') : BUNDLED_DATA_DIR;
const SCHOOLS_FILE = path.join(DATA_DIR, 'schools.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const PHOTOS_DIR = path.join(DATA_DIR, 'photos');

const ALLOWED_USER_IDS = [639844644, 1276188382];

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

// On Vercel, copy initial data files to /tmp if they don't exist yet
if (IS_VERCEL) {
  if (!fs.existsSync(SCHOOLS_FILE) && fs.existsSync(path.join(BUNDLED_DATA_DIR, 'schools.json'))) {
    try { fs.copyFileSync(path.join(BUNDLED_DATA_DIR, 'schools.json'), SCHOOLS_FILE); } catch (e) {}
  }
  if (!fs.existsSync(CONFIG_FILE) && fs.existsSync(path.join(BUNDLED_DATA_DIR, 'config.json'))) {
    try { fs.copyFileSync(path.join(BUNDLED_DATA_DIR, 'config.json'), CONFIG_FILE); } catch (e) {}
  }
}

function getSchools() {
  try {
    const raw = fs.readFileSync(SCHOOLS_FILE, 'utf8');
    return JSON.parse(raw).schools;
  } catch (err) {
    console.error("Error reading schools.json:", err);
    return [];
  }
}

function saveSchools(schools) {
  const tmpFile = SCHOOLS_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify({ schools }, null, 2), 'utf8');
  fs.renameSync(tmpFile, SCHOOLS_FILE);
}

function getSchool(id) {
  const schools = getSchools();
  return schools.find(s => s.id === id);
}

function updateSchool(id, updateObj) {
  const schools = getSchools();
  const index = schools.findIndex(s => s.id === id);
  if (index !== -1) {
    schools[index] = { ...schools[index], ...updateObj };
    saveSchools(schools);
    return schools[index];
  }
  return null;
}

function updateStudents(schoolId, boys, girls) {
  const schools = getSchools();
  const school = schools.find(s => s.id === schoolId);
  if (school) {
    const b = parseInt(boys) || 0;
    const g = parseInt(girls) || 0;
    school.students = {
      boys: b,
      girls: g,
      total: b + g
    };
    saveSchools(schools);
    return school;
  }
  return null;
}

function addTeacher(schoolId, teacherData) {
  const schools = getSchools();
  const school = schools.find(s => s.id === schoolId);
  if (school) {
    const newId = 't' + (Date.now() % 100000);
    const amount = Number(teacherData.salary_amount) || 0;
    let salaryTextEn = `$${amount}/month`;
    let salaryTextAr = `${amount} دولار شهرياً`;
    let type = 'project';
    if (amount === 0) {
      if (teacherData.salary_type === 'government') {
        salaryTextEn = 'Government Salary';
        salaryTextAr = 'راتب حكومي';
        type = 'government';
      } else {
        salaryTextEn = 'No salary (Volunteer)';
        salaryTextAr = 'لا يتقاضى راتباً (متطوع)';
        type = 'volunteer';
      }
    }
    const newTeacher = {
      id: newId,
      name_ar: teacherData.name_ar || teacherData.name,
      name_en: teacherData.name_en || teacherData.name,
      salary_type: type,
      salary_amount: amount,
      salary_text_ar: salaryTextAr,
      salary_text_en: salaryTextEn,
      note_ar: teacherData.note_ar || 'معلم مضاف حديثاً',
      note_en: teacherData.note_en || 'Newly added teacher',
      photo: teacherData.photo || null
    };
    school.teachers.push(newTeacher);
    saveSchools(schools);
    return newTeacher;
  }
  return null;
}

function updateTeacher(schoolId, teacherId, updates) {
  const schools = getSchools();
  const school = schools.find(s => s.id === schoolId);
  if (school) {
    const teacher = school.teachers.find(t => t.id === teacherId);
    if (teacher) {
      if (updates.salary_amount !== undefined) {
        const amt = Number(updates.salary_amount);
        teacher.salary_amount = amt;
        if (amt === 0) {
          if (updates.salary_type === 'government') {
            teacher.salary_type = 'government';
            teacher.salary_text_ar = 'راتب حكومي';
            teacher.salary_text_en = 'Government Salary';
          } else {
            teacher.salary_type = 'volunteer';
            teacher.salary_text_ar = 'لا يتقاضى راتباً (متطوع)';
            teacher.salary_text_en = 'No salary (Volunteer)';
          }
        } else {
          teacher.salary_type = 'project';
          teacher.salary_text_ar = `${amt} دولار شهرياً`;
          teacher.salary_text_en = `$${amt}/month`;
        }
      }
      if (updates.name_en) teacher.name_en = updates.name_en;
      if (updates.name_ar) teacher.name_ar = updates.name_ar;
      if (updates.note_ar) teacher.note_ar = updates.note_ar;
      if (updates.note_en) teacher.note_en = updates.note_en;
      if (updates.photo !== undefined) teacher.photo = updates.photo;
      saveSchools(schools);
      return teacher;
    }
  }
  return null;
}

function deleteTeacher(schoolId, teacherId) {
  const schools = getSchools();
  const school = schools.find(s => s.id === schoolId);
  if (school) {
    const idx = school.teachers.findIndex(t => t.id === teacherId);
    if (idx !== -1) {
      const removed = school.teachers.splice(idx, 1);
      saveSchools(schools);
      return removed[0];
    }
  }
  return null;
}

function addSchoolPhoto(schoolId, filename) {
  const schools = getSchools();
  const school = schools.find(s => s.id === schoolId);
  if (school) {
    if (!school.photos) school.photos = [];
    school.photos.push(filename);
    saveSchools(schools);
    return true;
  }
  return false;
}

function getConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {
      adminSecret: "admin123",
      allowedUsers: ALLOWED_USER_IDS,
      admins: ALLOWED_USER_IDS,
      subscribers: ALLOWED_USER_IDS,
      userLanguages: {},
      autoReportEnabled: true,
      autoReportCron: "0 8 1 * *"
    };
  }
}

function saveConfig(cfg) {
  const tmp = CONFIG_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(cfg, null, 2), 'utf8');
  fs.renameSync(tmp, CONFIG_FILE);
}

function isUserAuthorized(userId) {
  const uid = Number(userId);
  return ALLOWED_USER_IDS.includes(uid);
}

function isAdmin(userId) {
  const uid = Number(userId);
  return ALLOWED_USER_IDS.includes(uid);
}

function getUserLanguage(userId) {
  const cfg = getConfig();
  const uid = String(userId);
  return cfg.userLanguages?.[uid] || 'ar'; // Default to Arabic or English
}

function setUserLanguage(userId, lang) {
  const cfg = getConfig();
  if (!cfg.userLanguages) cfg.userLanguages = {};
  cfg.userLanguages[String(userId)] = (lang === 'en') ? 'en' : 'ar';
  saveConfig(cfg);
}

function getSubscribers() {
  const cfg = getConfig();
  const set = new Set([...ALLOWED_USER_IDS, ...(cfg.subscribers || [])]);
  // Filter only allowed users
  return Array.from(set).filter(id => isUserAuthorized(id));
}

function getOverallStats() {
  const schools = getSchools();
  let totalBoys = 0;
  let totalGirls = 0;
  let totalTeachers = 0;
  let volunteerTeachers = 0;
  let govtTeachers = 0;
  let paidTeachers = 0;
  let totalMonthlySalary = 0;

  for (const s of schools) {
    totalBoys += (s.students?.boys || 0);
    totalGirls += (s.students?.girls || 0);
    for (const t of (s.teachers || [])) {
      totalTeachers++;
      if (t.salary_type === 'government') {
        govtTeachers++;
      } else if (t.salary_amount > 0) {
        paidTeachers++;
        totalMonthlySalary += t.salary_amount;
      } else {
        volunteerTeachers++;
      }
    }
  }

  return {
    schoolsCount: schools.length,
    totalBoys,
    totalGirls,
    totalStudents: totalBoys + totalGirls,
    totalTeachers,
    paidTeachers,
    govtTeachers,
    volunteerTeachers,
    totalMonthlySalary
  };
}

const SUPER_ADMIN_ID = 1276188382;

function isSuperAdmin(userId) {
  return Number(userId) === SUPER_ADMIN_ID;
}

function getSuperAdminId() {
  return SUPER_ADMIN_ID;
}

function isSuperAdminAlertsEnabled() {
  const cfg = getConfig();
  return cfg.superAdminAlerts !== false;
}

function setSuperAdminAlerts(enabled) {
  const cfg = getConfig();
  cfg.superAdminAlerts = !!enabled;
  saveConfig(cfg);
  return cfg.superAdminAlerts;
}

module.exports = {
  SUPER_ADMIN_ID,
  isSuperAdmin,
  getSuperAdminId,
  isSuperAdminAlertsEnabled,
  setSuperAdminAlerts,
  ALLOWED_USER_IDS,
  PHOTOS_DIR,
  getSchools,
  getSchool,
  updateSchool,
  updateStudents,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  addSchoolPhoto,
  getConfig,
  saveConfig,
  isUserAuthorized,
  isAdmin,
  getUserLanguage,
  setUserLanguage,
  getSubscribers,
  getOverallStats
};
