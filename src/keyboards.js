const { Markup } = require('telegraf');
const { t } = require('./i18n');

function getLanguageSelectKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇬🇧 English', 'set_lang_en'),
      Markup.button.callback('🇸🇦 العربية', 'set_lang_ar')
    ]
  ]);
}

function getMainMenuInline(lang = 'ar') {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t('btn_overall_report', lang), 'menu_overall'),
      Markup.button.callback(t('btn_schools_report', lang), 'menu_schools')
    ],
    [
      Markup.button.callback(t('btn_salaries_report', lang), 'menu_salaries'),
      Markup.button.callback(t('btn_students_report', lang), 'menu_students')
    ],
    [
      Markup.button.callback(t('btn_export_pdf', lang), 'menu_export_pdf'),
      Markup.button.callback(t('btn_broadcast_now', lang), 'menu_broadcast_now')
    ],
    [
      Markup.button.callback(t('btn_admin_panel', lang), 'menu_admin'),
      Markup.button.callback(t('btn_language', lang), 'menu_language')
    ]
  ]);
}

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

function getSchoolsKeyboard(schools, lang = 'ar') {
  const isEn = (lang === 'en');
  const buttons = schools.map((s, idx) => {
    const name = isEn ? (s.name_en || s.name_ar) : s.name_ar;
    return [Markup.button.callback(`${idx + 1}. ${name}`, `school_${s.id}`)];
  });
  buttons.push([Markup.button.callback(t('btn_back', lang), 'menu_back')]);
  return Markup.inlineKeyboard(buttons);
}

function getSchoolActionKeyboard(school, lang = 'ar') {
  const buttons = [];
  
  if (school.photos && school.photos.length > 0) {
    buttons.push([Markup.button.callback(`${t('btn_view_photos', lang)} (${school.photos.length})`, `photos_${school.id}`)]);
  }

  buttons.push([
    Markup.button.callback(t('btn_edit_school', lang), `edit_school_${school.id}`),
    Markup.button.callback(t('btn_add_teacher', lang), `add_teacher_${school.id}`)
  ]);

  buttons.push([
    Markup.button.callback(t('btn_schools_list', lang), 'menu_schools'),
    Markup.button.callback(t('btn_back', lang), 'menu_back')
  ]);

  return Markup.inlineKeyboard(buttons);
}

function getAdminPanelKeyboard(lang = 'ar') {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t('btn_edit_salary', lang), 'admin_edit_salary'),
      Markup.button.callback(t('btn_add_teacher', lang), 'admin_add_teacher')
    ],
    [
      Markup.button.callback(t('btn_edit_students', lang), 'admin_edit_students'),
      Markup.button.callback(t('btn_upload_photo', lang), 'admin_upload_photo')
    ],
    [
      Markup.button.callback(t('btn_delete_teacher', lang), 'admin_delete_teacher'),
      Markup.button.callback(t('btn_export_pdf', lang), 'menu_export_pdf')
    ],
    [
      Markup.button.callback(t('btn_backup_json', lang), 'admin_backup'),
      Markup.button.callback(t('btn_import_json', lang), 'admin_import_json')
    ],
    [
      Markup.button.callback(t('btn_broadcast_now', lang), 'menu_broadcast_now'),
      Markup.button.callback(t('btn_language', lang), 'menu_language')
    ],
    [
      Markup.button.callback(t('btn_back', lang), 'menu_back')
    ]
  ]);
}

function getSchoolSelectForActionKeyboard(schools, actionPrefix, lang = 'ar') {
  const isEn = (lang === 'en');
  const buttons = schools.map(s => {
    const name = isEn ? (s.name_en || s.name_ar) : s.name_ar;
    return [Markup.button.callback(name, `${actionPrefix}_${s.id}`)];
  });
  buttons.push([Markup.button.callback(t('btn_cancel', lang), 'menu_admin')]);
  return Markup.inlineKeyboard(buttons);
}

function getTeachersSelectKeyboard(school, actionPrefix, lang = 'ar') {
  const isEn = (lang === 'en');
  const buttons = (school.teachers || []).map(t => {
    const name = isEn ? (t.name_en || t.name_ar) : t.name_ar;
    const sal = isEn ? (t.salary_text_en || `$${t.salary_amount}`) : (t.salary_text_ar || `${t.salary_amount}$`);
    return [Markup.button.callback(`${name} (${sal})`, `${actionPrefix}_${school.id}_${t.id}`)];
  });
  buttons.push([Markup.button.callback(t('btn_cancel', lang), 'menu_admin')]);
  return Markup.inlineKeyboard(buttons);
}

function getCancelKeyboard(backCallback = 'menu_admin', lang = 'ar') {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t('btn_cancel', lang), backCallback)]
  ]);
}

module.exports = {
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
