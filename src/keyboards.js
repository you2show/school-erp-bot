const { Markup } = require('telegraf');
const { t } = require('./i18n');

// 1. Persistent Bottom Keyboard (always accessible right under the text input box)
function getPersistentReplyKeyboard(lang = 'ar') {
  const isEn = (lang === 'en');
  return Markup.keyboard([
    [
      isEn ? '📊 Overall Report' : '📊 التقرير الشامل',
      isEn ? '🏫 7 Schools' : '🏫 المدارس السبع'
    ],
    [
      isEn ? '📄 Export PDF' : '📄 تقرير PDF',
      isEn ? '⚙️ Admin Panel' : '⚙️ لوحة الإدارة'
    ]
  ]).resize();
}

function getLanguageSelectKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇬🇧 English', 'set_lang_en'),
      Markup.button.callback('🇸🇦 العربية', 'set_lang_ar')
    ]
  ]);
}

// 2. Streamlined Clean Main Menu (Fast & uncluttered)
function getMainMenuInline(lang = 'ar') {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t('btn_overall_report', lang), 'menu_overall'),
      Markup.button.callback(t('btn_schools_report', lang), 'menu_schools')
    ],
    [
      Markup.button.callback(t('btn_export_pdf', lang), 'menu_export_pdf'),
      Markup.button.callback(t('btn_admin_panel', lang), 'menu_admin')
    ],
    [
      Markup.button.callback(t('btn_language', lang), 'menu_language')
    ]
  ]);
}

// 3. Overall Report Actions
function getOverallReportInline(lang = 'ar') {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t('btn_export_pdf', lang), 'menu_export_pdf'),
      Markup.button.callback(t('btn_schools_report', lang), 'menu_schools')
    ],
    [
      Markup.button.callback(t('btn_salaries_report', lang), 'menu_salaries'),
      Markup.button.callback(t('btn_students_report', lang), 'menu_students')
    ],
    [
      Markup.button.callback(t('btn_back', lang), 'menu_back')
    ]
  ]);
}

// 4. 7 Schools List (2 columns or clean rows for easy 1-tap navigation)
function getSchoolsKeyboard(schools, lang = 'ar') {
  const isEn = (lang === 'en');
  const buttons = [];
  
  // Arrange in clean 1-per-row or 2-per-row
  schools.forEach((s, idx) => {
    const name = isEn ? (s.name_en || s.name_ar) : s.name_ar;
    buttons.push([Markup.button.callback(`${idx + 1}. ${name}`, `school_${s.id}`)]);
  });
  
  buttons.push([
    Markup.button.callback(t('btn_back', lang), 'menu_back')
  ]);
  
  return Markup.inlineKeyboard(buttons);
}

// 5. 1-Click School Card Actions (Direct, NO nested menus!)
function getSchoolActionKeyboard(school, lang = 'ar') {
  const buttons = [];

  // Row 1: Direct 1-click edits (Students & Salaries)
  buttons.push([
    Markup.button.callback(t('btn_edit_students', lang), `sel_school_stu_${school.id}`),
    Markup.button.callback(t('btn_edit_salary', lang), `sel_school_sal_${school.id}`)
  ]);

  // Row 2: Add teacher & Upload photo
  buttons.push([
    Markup.button.callback(t('btn_add_teacher', lang), `sel_school_addt_${school.id}`),
    Markup.button.callback(t('btn_upload_photo', lang), `sel_school_photo_${school.id}`)
  ]);

  // Row 3: Photos (if any) & Delete teacher
  const row3 = [];
  if (school.photos && school.photos.length > 0) {
    row3.push(Markup.button.callback(`${t('btn_view_photos', lang)} (${school.photos.length})`, `photos_${school.id}`));
  }
  if (school.teachers && school.teachers.length > 0) {
    row3.push(Markup.button.callback(t('btn_delete_teacher', lang), `sel_school_delt_${school.id}`));
  }
  if (row3.length > 0) buttons.push(row3);

  // Row 4: Navigation (Schools List & Main Menu)
  buttons.push([
    Markup.button.callback(t('btn_schools_list', lang), 'menu_schools'),
    Markup.button.callback(t('btn_back', lang), 'menu_back')
  ]);

  return Markup.inlineKeyboard(buttons);
}

// 6. Compact Admin Panel (Focused & straightforward)
function getAdminPanelKeyboard(lang = 'ar') {
  const isEn = (lang === 'en');
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(isEn ? '✏️ Quick Edit School Data' : '✏️ تعديل بيانات المدارس مباشرة', 'admin_select_school_edit')
    ],
    [
      Markup.button.callback(t('btn_backup_json', lang), 'admin_backup'),
      Markup.button.callback(t('btn_import_json', lang), 'admin_import_json')
    ],
    [
      Markup.button.callback(t('btn_broadcast_now', lang), 'menu_broadcast_now'),
      Markup.button.callback(t('btn_export_pdf', lang), 'menu_export_pdf')
    ],
    [
      Markup.button.callback(t('btn_back', lang), 'menu_back')
    ]
  ]);
}

// 7. School selector for specific action
function getSchoolSelectForActionKeyboard(schools, actionPrefix, lang = 'ar') {
  const isEn = (lang === 'en');
  const buttons = schools.map(s => {
    const name = isEn ? (s.name_en || s.name_ar) : s.name_ar;
    return [Markup.button.callback(name, `${actionPrefix}_${s.id}`)];
  });
  buttons.push([Markup.button.callback(t('btn_cancel', lang), 'menu_admin')]);
  return Markup.inlineKeyboard(buttons);
}

// 8. Teacher selector with salary info right on button
function getTeachersSelectKeyboard(school, actionPrefix, lang = 'ar') {
  const isEn = (lang === 'en');
  const buttons = (school.teachers || []).map(t => {
    const name = isEn ? (t.name_en || t.name_ar) : t.name_ar;
    const sal = isEn ? (t.salary_text_en || `$${t.salary_amount}`) : (t.salary_text_ar || `${t.salary_amount}$`);
    return [Markup.button.callback(`${name} (${sal})`, `${actionPrefix}_${school.id}_${t.id}`)];
  });
  buttons.push([Markup.button.callback(t('btn_cancel', lang), `school_${school.id}`)]);
  return Markup.inlineKeyboard(buttons);
}

function getCancelKeyboard(backCallback = 'menu_admin', lang = 'ar') {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('btn_cancel', lang), backCallback)]
  ]);
}

module.exports = {
  getPersistentReplyKeyboard,
  getLanguageSelectKeyboard,
  getMainMenuInline,
  getOverallReportInline,
  getSchoolsKeyboard,
  getSchoolActionKeyboard,
  getAdminPanelKeyboard,
  getSchoolSelectForActionKeyboard,
  getTeachersSelectKeyboard,
  getCancelKeyboard
};
