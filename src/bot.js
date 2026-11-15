require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const https = require('https');

const storage = require('./storage');
const formatter = require('./formatter');
const keyboards = require('./keyboards');
const { t } = require('./i18n');
const pdfGenerator = require('./pdfGenerator');

const BOT_TOKEN = process.env.BOT_TOKEN || '9241388793:AAHvUswsGqRHaoW8LhZlND2TaOd_I8pBko0';
const bot = new Telegraf(BOT_TOKEN);

// User sessions for interactive wizards
const userState = {};

function resetState(userId) {
  delete userState[userId];
}

// Convert Eastern Arabic and Persian numerals to standard digits (0-9)
function normalizeNumbers(str) {
  if (!str) return '';
  const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return str
    .replace(/[٠-٩]/g, d => arabicDigits.indexOf(d))
    .replace(/[۰-۹]/g, d => persianDigits.indexOf(d))
    .trim();
}

// Smart parser for student counts (supports Arabic/English, labeled or plain numbers)
function parseStudentsInput(rawText) {
  const text = normalizeNumbers(rawText);
  // 1. Try labeled format (e.g., 'طلاب: 44 طالبات: 49' or 'Boys: 44, Girls: 49')
  const boyMatch = text.match(/(?:بنين|طلاب|طلابًا|boys?)\s*[:=]?\s*(\d+)/i);
  const girlMatch = text.match(/(?:بنات|طالبات|طالبة|girls?)\s*[:=]?\s*(\d+)/i);
  if (boyMatch && girlMatch) {
    return {
      boys: parseInt(boyMatch[1], 10),
      girls: parseInt(girlMatch[1], 10),
      valid: true
    };
  }
  // 2. Try any 2 numbers found in the text (e.g., '44 49' or '44, 49' or '44 - 49')
  const nums = text.match(/\d+/g);
  if (nums && nums.length >= 2) {
    return {
      boys: parseInt(nums[0], 10),
      girls: parseInt(nums[1], 10),
      valid: true
    };
  }
  return { valid: false };
}

// Smart parser for teacher salary and status input
function parseSalaryInput(rawText) {
  const text = normalizeNumbers(rawText).toLowerCase();
  if (text.includes('حكوم') || text.includes('gov')) {
    return { type: 'government', amount: 0, valid: true };
  }
  if (text.includes('تطوع') || text.includes('بدون') || text.includes('volunteer')) {
    return { type: 'volunteer', amount: 0, valid: true };
  }
  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const amount = parseFloat(match[1]);
    return {
      type: amount > 0 ? 'project' : 'volunteer',
      amount,
      valid: true
    };
  }
  return { valid: false };
}

// 1. STRICT WHITELIST ACCESS CONTROL
// Allowed IDs: 639844644, 1276188382
// For any other user: ignore completely and show nothing!
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;
  if (!userId || !storage.isUserAuthorized(userId)) {
    // Drop silently, respond nothing at all!
    if (ctx.callbackQuery) {
      try {
        await ctx.answerCbQuery();
      } catch (e) {}
    }
    return;
  }
  return next();
});

// START COMMAND
bot.command('start', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  resetState(userId);

  const welcomeText = t('welcome', lang);
  await ctx.replyWithHTML(welcomeText, keyboards.getMainMenuInline(lang));
});

// LANGUAGE SELECTION COMMAND
bot.command(['lang', 'language'], async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  await ctx.replyWithHTML(t('select_lang_prompt', lang), keyboards.getLanguageSelectKeyboard());
});

// HELP COMMAND
bot.command('help', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  await ctx.replyWithHTML(t('help_text', lang));
});

// REPORT COMMANDS
bot.command('report', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const stats = storage.getOverallStats();
  const text = formatter.formatOverallReport(schools, stats, lang);
  await ctx.replyWithHTML(text, keyboards.getOverallReportInline(lang));
});

bot.command(['pdf', 'export'], async (ctx) => {
  await handleExportPdf(ctx);
});

bot.command('schools', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  await ctx.replyWithHTML(t('select_school_view', lang), keyboards.getSchoolsKeyboard(schools, lang));
});

bot.command('salaries', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const stats = storage.getOverallStats();
  const text = formatter.formatSalariesReport(schools, stats, lang);
  await ctx.replyWithHTML(text, keyboards.getMainMenuInline(lang));
});

bot.command('students', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const stats = storage.getOverallStats();
  const text = formatter.formatStudentsReport(schools, stats, lang);
  await ctx.replyWithHTML(text, keyboards.getMainMenuInline(lang));
});

bot.command('autoreport', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  await broadcastAutoReport(ctx.chat.id, lang);
});

bot.command('admin', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  resetState(userId);
  const title = (lang === 'en')
    ? `⚙️ <b>Admin Dashboard</b>\nSelect an action below:`
    : `⚙️ <b>لوحة تحكم المشرف (Admin Dashboard)</b>\nيرجى اختيار العملية المطلوبة أدناه:`;
  return ctx.replyWithHTML(title, keyboards.getAdminPanelKeyboard(lang));
});

bot.command(['edit', 'editschool'], async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  resetState(userId);
  const schools = storage.getSchools();
  const text = (lang === 'en')
    ? `✏️ <b>Direct Edit:</b> Select the school you want to modify:`
    : `✏️ <b>تعديل مباشر:</b> اختر المدرسة المراد تعديل بياناتها:`;
  return ctx.replyWithHTML(text, keyboards.getSchoolSelectForActionKeyboard(schools, 'edit_school', lang));
});

bot.command(['backup', 'exportjson'], async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolsPath = path.join(__dirname, '..', 'data', 'schools.json');

  if (fs.existsSync(schoolsPath)) {
    const dates = formatter.getFormattedDates(lang);
    const caption = (lang === 'en')
      ? `💾 <b>Schools JSON Backup Data</b>\n📅 Generated: ${dates.combined}\n\n<i>You can edit this file and send it back to update the database anytime!</i>`
      : `💾 <b>نسخة احتياطية لقاعدة البيانات (JSON Backup)</b>\n📅 بتاريخ: ${dates.combined}\n\n<i>يمكنكم تعديل هذا الملف وإعادة إرساله لتحديث قاعدة البيانات فوراً في أي وقت!</i>`;

    await ctx.replyWithDocument(
      { source: schoolsPath, filename: `schools_backup_${new Date().toISOString().slice(0, 10)}.json` },
      { caption, parse_mode: 'HTML' }
    );
  }
});

// LANGUAGE CALLBACKS
bot.action('menu_language', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  await ctx.replyWithHTML(t('select_lang_prompt', lang), keyboards.getLanguageSelectKeyboard());
});

bot.action('set_lang_en', async (ctx) => {
  const userId = ctx.from.id;
  storage.setUserLanguage(userId, 'en');
  await ctx.answerCbQuery('Language set to English');
  await ctx.replyWithHTML(t('lang_changed', 'en'), keyboards.getMainMenuInline('en'));
});

bot.action('set_lang_ar', async (ctx) => {
  const userId = ctx.from.id;
  storage.setUserLanguage(userId, 'ar');
  await ctx.answerCbQuery('تم تعيين اللغة إلى العربية');
  await ctx.replyWithHTML(t('lang_changed', 'ar'), keyboards.getMainMenuInline('ar'));
});

// PDF EXPORT HANDLER
async function handleExportPdf(ctx) {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const stats = storage.getOverallStats();
  const dates = formatter.getFormattedDates(lang);

  let loadingMsg = null;
  try {
    loadingMsg = await ctx.replyWithHTML(t('generating_pdf', lang));
  } catch (e) {}

  try {
    const pdfPath = await pdfGenerator.generateReportPdf(schools, stats, lang);
    const caption = t('pdf_caption', lang) + `<b>${dates.combined}</b>`;
    const filename = `School_ERP_Monthly_Report_${lang.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;

    await ctx.replyWithDocument(
      { source: pdfPath, filename },
      { caption, parse_mode: 'HTML' }
    );

    if (loadingMsg) {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error generating PDF:', err);
    await ctx.replyWithHTML(
      lang === 'en'
        ? `❌ Failed to generate PDF document: ${err.message}`
        : `❌ تعذر استخراج ملف PDF: ${err.message}`
    );
  }
}

bot.action('menu_export_pdf', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  await ctx.answerCbQuery(lang === 'en' ? 'Generating PDF...' : 'جارٍ إنشاء ملف PDF...');
  await handleExportPdf(ctx);
});

// INLINE CALLBACK HANDLERS
bot.action('menu_back', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  resetState(userId);

  const title = (lang === 'en')
    ? `👋 <b>The 7 Schools ERP Main Menu</b>\nPlease choose a section:`
    : `👋 <b>القائمة الرئيسية لنظام المدارس السبع</b>\nيرجى اختيار القسم المطلوب:`;

  try {
    await ctx.editMessageText(title, {
      parse_mode: 'HTML',
      ...keyboards.getMainMenuInline(lang)
    });
  } catch (e) {
    await ctx.replyWithHTML(title, keyboards.getMainMenuInline(lang));
  }
});

bot.action('menu_overall', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const stats = storage.getOverallStats();
  const text = formatter.formatOverallReport(schools, stats, lang);

  try {
    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboards.getOverallReportInline(lang) });
  } catch (e) {
    await ctx.replyWithHTML(text, keyboards.getOverallReportInline(lang));
  }
});

bot.action('menu_schools', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();

  try {
    await ctx.editMessageText(t('select_school_view', lang), {
      parse_mode: 'HTML',
      ...keyboards.getSchoolsKeyboard(schools, lang)
    });
  } catch (e) {
    await ctx.replyWithHTML(t('select_school_view', lang), keyboards.getSchoolsKeyboard(schools, lang));
  }
});

bot.action('menu_salaries', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const stats = storage.getOverallStats();
  const text = formatter.formatSalariesReport(schools, stats, lang);

  try {
    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboards.getMainMenuInline(lang) });
  } catch (e) {
    await ctx.replyWithHTML(text, keyboards.getMainMenuInline(lang));
  }
});

bot.action('menu_students', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const stats = storage.getOverallStats();
  const text = formatter.formatStudentsReport(schools, stats, lang);

  try {
    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboards.getMainMenuInline(lang) });
  } catch (e) {
    await ctx.replyWithHTML(text, keyboards.getMainMenuInline(lang));
  }
});

bot.action('menu_broadcast_now', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  await ctx.answerCbQuery(t('broadcast_started', lang));
  await broadcastAutoReport(ctx.chat.id, lang);
});

bot.action('menu_admin', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  resetState(userId);

  const title = (lang === 'en')
    ? `⚙️ <b>Admin Dashboard</b>\nPlease choose an operation below:`
    : `⚙️ <b>لوحة تحكم المشرف (Admin Dashboard)</b>\nيرجى اختيار العملية المطلوبة أدناه:`;

  try {
    await ctx.editMessageText(title, {
      parse_mode: 'HTML',
      ...keyboards.getAdminPanelKeyboard(lang)
    });
  } catch (e) {
    await ctx.replyWithHTML(title, keyboards.getAdminPanelKeyboard(lang));
  }
});

// SCHOOL DETAIL VIEW
bot.action(/^school_(.+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolId = ctx.match[1];
  const school = storage.getSchool(schoolId);
  if (!school) return ctx.answerCbQuery('School not found');

  const text = formatter.formatSchoolDetail(school, lang);
  try {
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      ...keyboards.getSchoolActionKeyboard(school, lang)
    });
  } catch (e) {
    await ctx.replyWithHTML(text, keyboards.getSchoolActionKeyboard(school, lang));
  }
});

// PHOTOS VIEW - Compact and elegant Telegram Media Group (Album)
bot.action(/^photos_(.+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolId = ctx.match[1];
  const school = storage.getSchool(schoolId);
  if (!school || !school.photos || school.photos.length === 0) {
    return ctx.answerCbQuery(lang === 'en' ? 'No photos available' : 'لا توجد صور متاحة لهذه المدرسة');
  }

  const validPhotos = school.photos.filter(p => fs.existsSync(path.join(storage.PHOTOS_DIR, p)));
  if (validPhotos.length === 0) {
    return ctx.answerCbQuery(lang === 'en' ? 'No photos found' : 'لم يتم العثور على ملفات الصور');
  }

  const sendingText = (lang === 'en')
    ? `Sending photos for ${school.name_en || school.name_ar}...`
    : `جارٍ إرسال صور ${school.name_ar}...`;
  await ctx.answerCbQuery(sendingText);

  if (validPhotos.length === 1) {
    const photoFile = path.join(storage.PHOTOS_DIR, validPhotos[0]);
    const caption = (lang === 'en')
      ? `🖼 <b>${school.name_en || school.name_ar}</b>\nOfficial Photo Archive`
      : `🖼 <b>${school.name_ar}</b>\nالأرشيف المصور الرسمي للمدرسة`;
    await ctx.replyWithPhoto({ source: photoFile }, { caption, parse_mode: 'HTML' });
  } else {
    // Send as sleek Media Group Album
    const mediaGroup = validPhotos.map((photoName, idx) => {
      const photoFile = path.join(storage.PHOTOS_DIR, photoName);
      const item = {
        type: 'photo',
        media: { source: photoFile }
      };
      if (idx === 0) {
        item.caption = (lang === 'en')
          ? `🖼 <b>${school.name_en || school.name_ar}</b>\nOfficial Photo Archive (${validPhotos.length} photos)`
          : `🖼 <b>${school.name_ar}</b>\nالأرشيف المصور الرسمي للمدرسة (${validPhotos.length} صور)`;
        item.parse_mode = 'HTML';
      }
      return item;
    });
    await ctx.replyWithMediaGroup(mediaGroup);
  }

  const contText = (lang === 'en') ? `👉 <b>Options:</b>` : `👉 <b>خيارات المتابعة:</b>`;
  await ctx.replyWithHTML(contText, keyboards.getSchoolActionKeyboard(school, lang));
});

// DIRECT EDIT SCHOOL SHORTCUTS
bot.action(/^edit_school_(.+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolId = ctx.match[1];
  const school = storage.getSchool(schoolId);
  if (!school) return ctx.answerCbQuery('Not found');

  const text = (lang === 'en')
    ? `✏️ <b>Edit School: ${school.name_en || school.name_ar}</b>\nChoose an option below:`
    : `✏️ <b>تعديل مدرسة: ${school.name_ar}</b>\nاختر من الخيارات التالية:`;

  const buttons = [
    [Markup.button.callback(t('btn_edit_salary', lang), `sel_school_sal_${schoolId}`)],
    [Markup.button.callback(t('btn_add_teacher', lang), `sel_school_addt_${schoolId}`)],
    [Markup.button.callback(t('btn_edit_students', lang), `sel_school_stu_${schoolId}`)],
    [Markup.button.callback(t('btn_upload_photo', lang), `sel_school_photo_${schoolId}`)],
    [Markup.button.callback(t('btn_delete_teacher', lang), `sel_school_delt_${schoolId}`)],
    [Markup.button.callback(t('btn_back', lang), `school_${schoolId}`)]
  ];

  await ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
});

// ADMIN: EDIT SALARY
bot.action('admin_edit_salary', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const text = (lang === 'en')
    ? `💵 <b>Edit Teacher Salary:</b>\nSelect the school of the teacher:`
    : `💵 <b>تعديل مخصصات ورواتب المعلمين:</b>\nاختر المدرسة التي يتبع لها المعلم:`;
  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    ...keyboards.getSchoolSelectForActionKeyboard(schools, 'sel_school_sal', lang)
  });
});

bot.action(/^sel_school_sal_(.+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolId = ctx.match[1];
  const school = storage.getSchool(schoolId);
  if (!school) return ctx.answerCbQuery('Not found');

  if (!school.teachers || school.teachers.length === 0) {
    const noT = (lang === 'en')
      ? `⚠️ This school has no teachers registered yet. Please add a teacher first.`
      : `⚠️ لا يوجد معلمون مسجلون في هذه المدرسة حتى الآن. يرجى إضافة معلم أولاً.`;
    return ctx.replyWithHTML(noT, keyboards.getAdminPanelKeyboard(lang));
  }

  const prompt = (lang === 'en')
    ? `👨‍🏫 <b>Select teacher to update salary:</b>\nSchool: <b>${school.name_en || school.name_ar}</b>`
    : `👨‍🏫 <b>اختر المعلّم لتعديل راتبه:</b>\nالمدرسة: <b>${school.name_ar}</b>`;

  await ctx.editMessageText(prompt, {
    parse_mode: 'HTML',
    ...keyboards.getTeachersSelectKeyboard(school, 'sel_t_sal', lang)
  });
});

bot.action(/^sel_t_sal_(.+)_(.+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolId = ctx.match[1];
  const teacherId = ctx.match[2];
  const school = storage.getSchool(schoolId);
  const teacher = (school?.teachers || []).find(t => t.id === teacherId);

  if (!teacher) return ctx.answerCbQuery('Teacher not found');

  userState[userId] = {
    action: 'awaiting_new_salary',
    schoolId,
    teacherId
  };

  const name = (lang === 'en') ? (teacher.name_en || teacher.name_ar) : teacher.name_ar;
  const curSal = (lang === 'en') ? (teacher.salary_text_en || `$${teacher.salary_amount}`) : (teacher.salary_text_ar || `${teacher.salary_amount}$`);

  let msg = `💵 <b>${name}</b>\n`;
  msg += (lang === 'en')
    ? `📌 Current Salary: <b>${curSal}</b>\n\n${t('prompt_new_salary', lang)}`
    : `📌 الراتب الحالي: <b>${curSal}</b>\n\n${t('prompt_new_salary', lang)}`;

  await ctx.replyWithHTML(msg, keyboards.getCancelKeyboard('menu_admin', lang));
});

// ADMIN: ADD TEACHER
bot.action('admin_add_teacher', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const text = (lang === 'en')
    ? `➕ <b>Add New Teacher:</b>\nSelect the target school:`
    : `➕ <b>إضافة معلّم جديد:</b>\nاختر المدرسة المراد إضافة المعلم إليها:`;

  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    ...keyboards.getSchoolSelectForActionKeyboard(schools, 'sel_school_addt', lang)
  });
});

bot.action(/^add_teacher_(.+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolId = ctx.match[1];
  const school = storage.getSchool(schoolId);
  if (!school) return ctx.answerCbQuery('Not found');

  userState[userId] = { action: 'awaiting_add_teacher_name', schoolId };
  await ctx.replyWithHTML(`➕ <b>${school.name_en || school.name_ar}</b>\n\n${t('prompt_teacher_name', lang)}`, keyboards.getCancelKeyboard('menu_admin', lang));
});

bot.action(/^sel_school_addt_(.+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolId = ctx.match[1];
  const school = storage.getSchool(schoolId);
  if (!school) return ctx.answerCbQuery('Not found');

  userState[userId] = { action: 'awaiting_add_teacher_name', schoolId };
  await ctx.replyWithHTML(`➕ <b>${school.name_en || school.name_ar}</b>\n\n${t('prompt_teacher_name', lang)}`, keyboards.getCancelKeyboard('menu_admin', lang));
});

// ADMIN: EDIT STUDENTS
bot.action('admin_edit_students', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const text = (lang === 'en')
    ? `👨‍🎓 <b>Edit Student Counts:</b>\nSelect the school:`
    : `👨‍🎓 <b>تعديل أعداد الطلاب:</b>\nاختر المدرسة:`;

  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    ...keyboards.getSchoolSelectForActionKeyboard(schools, 'sel_school_stu', lang)
  });
});

bot.action(/^sel_school_stu_(.+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolId = ctx.match[1];
  const school = storage.getSchool(schoolId);
  if (!school) return ctx.answerCbQuery('Not found');

  userState[userId] = { action: 'awaiting_student_numbers', schoolId };
  const cur = school.students || { boys: 0, girls: 0, total: 0 };

  const prompt = (lang === 'en')
    ? `👨‍🎓 <b>${school.name_en || school.name_ar}</b>\n• Current: Total ${cur.total} (Boys: ${cur.boys} | Girls: ${cur.girls})\n\n${t('prompt_students', lang)}`
    : `👨‍🎓 <b>${school.name_ar}</b>\n• حالياً: الإجمالي ${cur.total} (بنين: ${cur.boys} | بنات: ${cur.girls})\n\n${t('prompt_students', lang)}`;

  await ctx.replyWithHTML(prompt, keyboards.getCancelKeyboard('menu_admin', lang));
});

// ADMIN: UPLOAD PHOTO
bot.action('admin_upload_photo', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const text = (lang === 'en')
    ? `📸 <b>Upload School Photo:</b>\nSelect the school:`
    : `📸 <b>إضافة صور للمدرسة:</b>\nاختر المدرسة المراد رفع صورة لها:`;

  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    ...keyboards.getSchoolSelectForActionKeyboard(schools, 'sel_school_photo', lang)
  });
});

bot.action(/^sel_school_photo_(.+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolId = ctx.match[1];
  const school = storage.getSchool(schoolId);
  if (!school) return ctx.answerCbQuery('Not found');

  userState[userId] = { action: 'awaiting_photo_upload', schoolId };
  const prompt = (lang === 'en')
    ? `📸 <b>${school.name_en || school.name_ar}</b>\n\n${t('prompt_upload_photo', lang)}`
    : `📸 <b>${school.name_ar}</b>\n\n${t('prompt_upload_photo', lang)}`;

  await ctx.replyWithHTML(prompt, keyboards.getCancelKeyboard('menu_admin', lang));
});

// ADMIN: DELETE TEACHER
bot.action('admin_delete_teacher', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schools = storage.getSchools();
  const text = (lang === 'en')
    ? `🗑 <b>Delete Teacher:</b>\nSelect the school:`
    : `🗑 <b>حذف معلّم:</b>\nاختر المدرسة:`;

  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    ...keyboards.getSchoolSelectForActionKeyboard(schools, 'sel_school_delt', lang)
  });
});

bot.action(/^sel_school_delt_(.+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolId = ctx.match[1];
  const school = storage.getSchool(schoolId);
  if (!school) return ctx.answerCbQuery('Not found');

  await ctx.editMessageText(t('confirm_delete_teacher', lang), {
    parse_mode: 'HTML',
    ...keyboards.getTeachersSelectKeyboard(school, 'confirm_delt', lang)
  });
});

bot.action(/^confirm_delt_(.+)_(.+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolId = ctx.match[1];
  const teacherId = ctx.match[2];
  const deleted = storage.deleteTeacher(schoolId, teacherId);

  if (deleted) {
    const name = (lang === 'en') ? (deleted.name_en || deleted.name_ar) : deleted.name_ar;
    const msg = (lang === 'en')
      ? `✅ <b>${name}</b> was removed successfully.`
      : `✅ تم حذف المعلّم <b>${name}</b> بنجاح!`;
    await ctx.replyWithHTML(msg, keyboards.getAdminPanelKeyboard(lang));
  } else {
    await ctx.replyWithHTML('Not found / تعذر العثور على المعلم', keyboards.getAdminPanelKeyboard(lang));
  }
});

// ADMIN: BACKUP JSON
bot.action('admin_backup', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const schoolsPath = path.join(__dirname, '..', 'data', 'schools.json');

  if (fs.existsSync(schoolsPath)) {
    const dates = formatter.getFormattedDates(lang);
    const caption = (lang === 'en')
      ? `💾 <b>Schools JSON Backup Data</b>\n📅 Generated: ${dates.combined}\n\n<i>You can edit this file and send it back to update the database!</i>`
      : `💾 <b>نسخة احتياطية لبيانات المدارس (JSON Backup)</b>\n📅 بتاريخ: ${dates.combined}\n\n<i>يمكنكم تعديل هذا الملف وإعادة إرساله لتحديث قاعدة البيانات فوراً!</i>`;

    await ctx.replyWithDocument(
      { source: schoolsPath, filename: `schools_backup_${new Date().toISOString().slice(0, 10)}.json` },
      { caption, parse_mode: 'HTML' }
    );
  }
});

// ADMIN: IMPORT JSON PROMPT
bot.action('admin_import_json', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  userState[userId] = { action: 'awaiting_json_file' };
  await ctx.replyWithHTML(t('prompt_send_json', lang), keyboards.getCancelKeyboard('menu_admin', lang));
});

// HANDLE DOCUMENT UPLOAD (schools.json upload / import)
bot.on('document', async (ctx) => {
  const userId = ctx.from.id;
  const lang = storage.getUserLanguage(userId);
  const doc = ctx.message.document;

  if (!doc.file_name.toLowerCase().endsWith('.json')) {
    const errMsg = (lang === 'en')
      ? `⚠️ Please send a valid <code>.json</code> document file.`
      : `⚠️ يرجى إرسال ملف بيانات صالح بصيغة <code>.json</code>.`;
    return ctx.replyWithHTML(errMsg, keyboards.getAdminPanelKeyboard(lang));
  }

  try {
    const fileLink = await ctx.telegram.getFileLink(doc.file_id);
    const tmpDest = path.join(storage.PHOTOS_DIR, `temp_upload_${Date.now()}.json`);

    await downloadFile(fileLink.href, tmpDest);
    const content = fs.readFileSync(tmpDest, 'utf8');
    const parsed = JSON.parse(content);
    fs.unlinkSync(tmpDest);

    if (!parsed.schools || !Array.isArray(parsed.schools)) {
      throw new Error("Missing 'schools' array in JSON");
    }

    // Save previous data as safety backup
    const curSchools = storage.getSchools();
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'schools_prev_backup.json'), JSON.stringify({ schools: curSchools }, null, 2), 'utf8');

    // Save imported schools
    storage.saveSchools(parsed.schools);
    const newStats = storage.getOverallStats();
    resetState(userId);

    const succMsg = (lang === 'en')
      ? `✅ <b>Data Successfully Imported & Updated!</b>\n\n` +
        `• Schools Loaded: <b>${newStats.schoolsCount}</b>\n` +
        `• Teaching Staff: <b>${newStats.totalTeachers}</b>\n` +
        `• Total Students: <b>${newStats.totalStudents}</b>\n` +
        `• Monthly Budget: <b>$${newStats.totalMonthlySalary} / mo</b>`
      : `✅ <b>تم استيراد وتحديث قاعدة البيانات بنجاح!</b>\n\n` +
        `• عدد المدارس: <b>${newStats.schoolsCount}</b>\n` +
        `• الكادر التعليمي: <b>${newStats.totalTeachers} معلماً</b>\n` +
        `• إجمالي الطلاب: <b>${newStats.totalStudents} طالباً وطالبة</b>\n` +
        `• إجمالي الميزانية: <b>${newStats.totalMonthlySalary} دولار شهرياً</b>`;

    await ctx.replyWithHTML(succMsg, keyboards.getAdminPanelKeyboard(lang));
  } catch (err) {
    console.error('Error importing JSON:', err);
    const errMsg = (lang === 'en')
      ? `❌ <b>Failed to parse JSON file:</b>\n<code>${err.message}</code>\nPlease verify the JSON format.`
      : `❌ <b>تعذر قراءة ملف JSON:</b>\n<code>${err.message}</code>\nيرجى التأكد من صحة الملف وتنسيقه.`;
    await ctx.replyWithHTML(errMsg, keyboards.getAdminPanelKeyboard(lang));
  }
});

// HANDLE TEXT MESSAGES (Interactive FSM Wizards)
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const state = userState[userId];
  const text = ctx.message.text.trim();
  const lang = storage.getUserLanguage(userId);

  if (!state) return;

  // 1. Edit Teacher Salary
  if (state.action === 'awaiting_new_salary') {
    const { schoolId, teacherId } = state;
    resetState(userId);

    const salRes = parseSalaryInput(text);
    if (!salRes.valid) {
      const errMsg = (lang === 'en')
        ? `⚠️ Invalid salary format. Enter a number (e.g. 50, $50) or 'gov' for government salary.`
        : `⚠️ صيغة الراتب غير واضحة. يرجى إدخال رقم (مثال: 50 أو ٥٠) أو كتابة 'حكومي' للراتب الحكومي.`;
      return ctx.replyWithHTML(errMsg, keyboards.getAdminPanelKeyboard(lang));
    }

    const updated = storage.updateTeacher(schoolId, teacherId, {
      salary_amount: salRes.amount,
      salary_type: salRes.type
    });

    if (updated) {
      const school = storage.getSchool(schoolId);
      const tName = (lang === 'en') ? (updated.name_en || updated.name_ar) : updated.name_ar;
      const sName = (lang === 'en') ? (school.name_en || school.name_ar) : school.name_ar;
      const sal = (lang === 'en') ? (updated.salary_text_en || `$${updated.salary_amount}`) : (updated.salary_text_ar || `${updated.salary_amount}$`);

      const resMsg = (lang === 'en')
        ? `✅ <b>Salary Updated Successfully!</b>\n` +
          `👤 Teacher: <b>${tName}</b>\n` +
          `💵 New Salary: <b>${sal}</b>\n` +
          `🏫 School: <b>${sName}</b>`
        : `✅ <b>تم تعديل الراتب بنجاح!</b>\n` +
          `👤 المعلّم: <b>${tName}</b>\n` +
          `💵 الراتب الجديد: <b>${sal}</b>\n` +
          `🏫 المدرسة: <b>${sName}</b>`;
      return ctx.replyWithHTML(resMsg, keyboards.getAdminPanelKeyboard(lang));
    }
  }

  // 2. Add Teacher: Name -> Salary step
  if (state.action === 'awaiting_add_teacher_name') {
    state.action = 'awaiting_add_teacher_salary';
    state.teacherName = text;
    const promptSal = (lang === 'en')
      ? `💵 <b>Name registered: ${text}</b>\n\n${t('prompt_teacher_salary', lang)}`
      : `💵 <b>تم تسجيل الاسم: ${text}</b>\n\n${t('prompt_teacher_salary', lang)}`;
    return ctx.replyWithHTML(promptSal);
  }

  // 3. Add Teacher: Salary finalize
  if (state.action === 'awaiting_add_teacher_salary') {
    const { schoolId, teacherName } = state;
    resetState(userId);

    const salRes = parseSalaryInput(text);
    const amount = salRes.valid ? salRes.amount : 0;
    const type = salRes.valid ? salRes.type : 'volunteer';

    const newTeacher = storage.addTeacher(schoolId, {
      name: teacherName,
      name_ar: teacherName,
      name_en: teacherName,
      salary_amount: amount,
      salary_type: type
    });

    const school = storage.getSchool(schoolId);
    const sal = (lang === 'en') ? newTeacher.salary_text_en : newTeacher.salary_text_ar;
    const sName = (lang === 'en') ? (school.name_en || school.name_ar) : school.name_ar;

    const resMsg = (lang === 'en')
      ? `✅ <b>New Teacher Added Successfully!</b>\n` +
        `👤 Name: <b>${newTeacher.name_en}</b>\n` +
        `💵 Salary: <b>${sal}</b>\n` +
        `🏫 School: <b>${sName}</b>`
      : `✅ <b>تمت إضافة المعلّم الجديد بنجاح!</b>\n` +
        `👤 الاسم: <b>${newTeacher.name_ar}</b>\n` +
        `💵 الراتب/المخصص: <b>${sal}</b>\n` +
        `🏫 المدرسة: <b>${sName}</b>`;

    return ctx.replyWithHTML(resMsg, keyboards.getAdminPanelKeyboard(lang));
  }

  // 4. Edit Student Numbers
  if (state.action === 'awaiting_student_numbers') {
    const { schoolId } = state;
    resetState(userId);

    const parsedStu = parseStudentsInput(text);
    if (!parsedStu.valid) {
      const errParts = (lang === 'en')
        ? `⚠️ Could not parse student counts. Please enter two numbers (e.g. <code>50 40</code> or <code>Boys: 50, Girls: 40</code>).`
        : `⚠️ تعذر فهم أعداد الطلاب. يرجى إدخال رقمين مفصولين بمسافة (مثال: <code>50 40</code> أو <code>بنين: 50 بنات: 40</code>).`;
      return ctx.replyWithHTML(errParts, keyboards.getAdminPanelKeyboard(lang));
    }

    const updated = storage.updateStudents(schoolId, parsedStu.boys, parsedStu.girls);
    if (updated) {
      const sName = (lang === 'en') ? (updated.name_en || updated.name_ar) : updated.name_ar;
      const resMsg = (lang === 'en')
        ? `✅ <b>Student Enrollment Updated!</b>\n` +
          `🏫 School: <b>${sName}</b>\n` +
          `👥 Total Students: <b>${updated.students.total}</b>\n` +
          `👦 Boys: <b>${updated.students.boys}</b> | 👧 Girls: <b>${updated.students.girls}</b>`
        : `✅ <b>تم تعديل أعداد الطلاب بنجاح!</b>\n` +
          `🏫 المدرسة: <b>${sName}</b>\n` +
          `👥 الإجمالي: <b>${updated.students.total}</b>\n` +
          `👦 بنين: <b>${updated.students.boys}</b> | 👧 بنات: <b>${updated.students.girls}</b>`;

      return ctx.replyWithHTML(resMsg, keyboards.getAdminPanelKeyboard(lang));
    }
  }
});

// HANDLE PHOTO UPLOADS
bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  const state = userState[userId];
  const lang = storage.getUserLanguage(userId);

  if (!state || state.action !== 'awaiting_photo_upload') {
    return;
  }

  const { schoolId } = state;
  resetState(userId);

  try {
    const photos = ctx.message.photo;
    const bestPhoto = photos[photos.length - 1];
    const fileLink = await ctx.telegram.getFileLink(bestPhoto.file_id);

    const filename = `custom_${schoolId}_${Date.now()}.jpg`;
    const destPath = path.join(storage.PHOTOS_DIR, filename);

    await downloadFile(fileLink.href, destPath);

    storage.addSchoolPhoto(schoolId, filename);
    const school = storage.getSchool(schoolId);
    const sName = (lang === 'en') ? (school.name_en || school.name_ar) : school.name_ar;

    const succMsg = (lang === 'en')
      ? `✅ <b>Photo Added Successfully!</b>\n🏫 School: <b>${sName}</b>\nTotal Photos: <b>${school.photos.length}</b>.`
      : `✅ <b>تم رفع وحفظ الصورة بنجاح!</b>\n🏫 المدرسة: <b>${sName}</b>\nإجمالي الصور المتوفرة: <b>${school.photos.length}</b>.`;

    await ctx.replyWithHTML(succMsg, keyboards.getAdminPanelKeyboard(lang));
  } catch (err) {
    console.error('Error saving photo:', err);
    const errMsg = (lang === 'en')
      ? `❌ Error downloading image. Please try again.`
      : `❌ حدث خطأ أثناء تنزيل الصورة، يرجى المحاولة لاحقاً.`;
    await ctx.replyWithHTML(errMsg, keyboards.getAdminPanelKeyboard(lang));
  }
});

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// BROADCAST AUTO REPORT
async function broadcastAutoReport(targetChatId = null, forcedLang = null) {
  const schools = storage.getSchools();
  const stats = storage.getOverallStats();

  if (targetChatId) {
    const lang = forcedLang || storage.getUserLanguage(targetChatId);
    const text = formatter.formatAutoReportAnnouncement(schools, stats, lang);
    try {
      await bot.telegram.sendMessage(targetChatId, text, {
        parse_mode: 'HTML',
        ...keyboards.getOverallReportInline(lang)
      });
    } catch (e) {
      console.error(`Failed to send report to target ${targetChatId}:`, e.message);
    }
    return;
  }

  const recipients = storage.getSubscribers();
  console.log(`Broadcasting auto report to ${recipients.length} authorized recipients...`);

  for (const chatId of recipients) {
    const lang = storage.getUserLanguage(chatId);
    const text = formatter.formatAutoReportAnnouncement(schools, stats, lang);
    try {
      await bot.telegram.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        ...keyboards.getOverallReportInline(lang)
      });
    } catch (e) {
      console.error(`Failed to send report to ${chatId}:`, e.message);
    }
  }

  const cfg = storage.getConfig();
  cfg.lastReportSent = new Date().toISOString();
  storage.saveConfig(cfg);
}

// REGISTER TELEGRAM BOT COMMANDS
async function setupBotCommands() {
  try {
    await bot.telegram.setMyCommands([
      { command: 'start', description: '🏠 Main Menu / القائمة الرئيسية' },
      { command: 'report', description: '📊 Monthly Report / التقرير الشهري' },
      { command: 'pdf', description: '📄 Export PDF Report / استخراج تقرير PDF' },
      { command: 'schools', description: '🏫 Schools List / قائمة المدارس' },
      { command: 'salaries', description: '💰 Teacher Salaries / رواتب المعلمين' },
      { command: 'students', description: '👨‍🎓 Student Stats / إحصائيات الطلاب' },
      { command: 'admin', description: '⚙️ Admin Dashboard / لوحة التحكم' },
      { command: 'edit', description: '✏️ Direct Edit School / تعديل مدرسة' },
      { command: 'backup', description: '💾 Download JSON / تحميل قاعدة البيانات' },
      { command: 'autoreport', description: '📢 Send Auto-Report Now / إرسال التقرير' },
      { command: 'lang', description: '🌐 Change Language / تغيير اللغة' },
      { command: 'help', description: '📖 Guide / دليل الاستخدام' }
    ]);
    console.log('✅ Bot commands registered with Telegram API.');
  } catch (e) {
    console.error('Error setting bot commands:', e.message);
  }
}

// CRON SCHEDULER: Auto-report on 1st of every month at 08:00 AM
cron.schedule('0 8 1 * *', async () => {
  console.log('⏰ Cron triggered: Sending Monthly Auto-Report to authorized users...');
  await broadcastAutoReport();
});

// START BOT
async function start() {
  await setupBotCommands();
  console.log('🔒 Whitelist Access Control: ACTIVE for IDs [639844644, 1276188382]');
  console.log('🌐 Languages: English (en) & Arabic (ar)');
  console.log('🌙 Automatic Hijri Date: ACTIVE');
  console.log('📄 PDF Generation: Ready with Microsoft Edge engine');
  console.log('🚀 Starting School ERP Telegram Bot (@SchoolERPSystemBot)...');

  bot.launch({
    dropPendingUpdates: true
  }).catch((err) => {
    console.error('Failed to launch bot:', err);
  });

  console.log('✅ Polling started! Bot is active and listening for authorized messages.');
}

start();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot, broadcastAutoReport };
