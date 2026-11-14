const translations = {
  en: {
    welcome: `🏛 <b>THE 7 SCHOOLS ERP SYSTEM</b>\n` +
      `Automated tracking and monthly reporting platform for the 7 schools network.\n\n` +
      `📊 <b>Network Overview:</b>\n` +
      `• Active Schools: <b>7 Institutions</b>\n` +
      `• Total Students: <b>582 Enrolled</b>\n` +
      `• Teaching Faculty: <b>22 Educators</b>\n` +
      `• Monthly Payroll: <b>$300.00 / month</b>\n\n` +
      `👇 <i>Please choose an option below to view reports or export PDF:</i>`,
    
    select_lang_prompt: `🌐 <b>Language Selection / اختيار اللغة</b>\nPlease select your preferred language below:`,
    lang_changed: `✅ Language set to <b>English</b>.`,

    // Menu Buttons
    btn_overall_report: `📊 Overall Monthly Report`,
    btn_schools_report: `🏫 School-by-School Reports`,
    btn_salaries_report: `💰 Teacher Salaries & Budget`,
    btn_students_report: `👨‍🎓 Student Statistics`,
    btn_export_pdf: `📄 Export PDF Report`,
    btn_broadcast_now: `📢 Send Auto-Report Now`,
    btn_admin_panel: `⚙️ Admin Dashboard`,
    btn_language: `🌐 Language (EN / عربي)`,
    btn_back: `🔙 Back to Main Menu`,
    btn_schools_list: `🔙 All 7 Schools List`,
    btn_view_photos: `🖼 View Photos`,
    btn_edit_school: `✏️ Edit This School`,
    btn_add_teacher: `➕ Add Teacher`,
    btn_cancel: `❌ Cancel`,

    // Admin Buttons
    btn_edit_salary: `💵 Edit Teacher Salary`,
    btn_edit_students: `👨‍🎓 Edit Student Numbers`,
    btn_upload_photo: `📸 Upload Photo`,
    btn_delete_teacher: `🗑 Delete Teacher`,
    btn_backup_json: `📥 Download JSON Backup`,
    btn_import_json: `📤 Upload/Import JSON Data`,

    // Prompts & Messages
    select_school_view: `🏫 <b>Select an institution to inspect detailed report:</b>`,
    select_school_action: `🏫 <b>Select a school to proceed:</b>`,
    select_teacher_action: `👨‍🏫 <b>Select a faculty member:</b>`,
    generating_pdf: `⏳ Generating official PDF report, please wait a moment...`,
    pdf_caption: `📄 <b>Executive Monthly Report (Official PDF)</b>\n🏛 The 7 Schools Network\n📅 Date: `,
    prompt_new_salary: `💵 <b>Set new monthly salary ($) for:</b>\n` +
      `• Enter a number, e.g.: <code>30</code>, <code>60</code>, or <code>100</code>\n` +
      `• Enter <code>0</code> for volunteer / unpaid\n` +
      `• Enter <code>gov</code> for government-funded`,
    prompt_teacher_name: `➕ <b>Enter new teacher's full name (English or Arabic):</b>\nExample: <code>Ustadh Ahmad bin Ali / أستاذ أحمد بن علي</code>`,
    prompt_teacher_salary: `💵 <b>Enter monthly allowance amount ($):</b>\nExample: <code>30</code>, <code>60</code>, <code>0</code> (volunteer) or <code>gov</code> (government)`,
    prompt_students: `👨‍🎓 <b>Enter student counts separated by a space:</b>\nFormat: <code>[boys] [girls]</code>\nExample: <code>60 45</code> (60 boys and 45 girls)`,
    prompt_upload_photo: `📸 <b>Please send an image (Photo) to attach to this school now.</b>`,
    prompt_send_json: `📤 <b>Upload Database JSON File:</b>\n\nPlease send your <code>schools.json</code> document file to this chat. The system will automatically validate and update the entire database!`,
    confirm_delete_teacher: `🗑 <b>Select a faculty member to remove:</b>`,
    
    // Success messages
    success_salary_updated: `✅ Faculty salary updated successfully!`,
    success_teacher_added: `✅ New faculty member added successfully!`,
    success_teacher_deleted: `✅ Faculty record removed successfully!`,
    success_students_updated: `✅ Enrollment numbers updated successfully!`,
    success_photo_uploaded: `✅ Photo successfully uploaded and saved!`,
    broadcast_started: `Broadcasting auto-report now...`,

    // Help Text
    help_text: `📖 <b>SYSTEM GUIDE & COMMANDS:</b>\n\n` +
      `• /start - Main Interactive Menu\n` +
      `• /report - Executive Monthly Summary\n` +
      `• /pdf - Export Official PDF Report Document\n` +
      `• /schools - School Profiles & Faculty Directory\n` +
      `• /salaries - Compensation & Sponsorship Breakdown\n` +
      `• /students - Student Enrollment Statistics\n` +
      `• /autoreport - Broadcast Monthly Auto-Report\n` +
      `• /lang - Change Interface Language (EN / عربي)\n` +
      `• /admin - Administrative Management Console\n` +
      `• /help - Display this manual`
  },

  ar: {
    welcome: `🏛 <b>نـظـام إدارة وتقارير المـدارس السـبـع</b>\n` +
      `المنظومة الموحدة للمتابعة والتقارير الشهرية لشبكة المدارس الإسلامية السبع.\n\n` +
      `📊 <b>المؤشرات العامة للشبكة:</b>\n` +
      `• المدارس النشطة: <b>٧ مدارس تعليمية</b>\n` +
      `• إجمالي الطلاب: <b>٥٨٢ طالباً وطالبة</b>\n` +
      `• الكادر التعليمي: <b>٢٢ معلماً ومعلمة</b>\n` +
      `• الميزانية الشهرية: <b>٣٠٠ دولار شهرياً</b>\n\n` +
      `👇 <i>يرجى اختيار القسم المطلوب من الأزرار أدناه للاطلاع على التقارير أو تصدير ملف PDF:</i>`,
    
    select_lang_prompt: `🌐 <b>اختيار لغة الواجهة / Language Selection</b>\nيرجى تحديد لغتكم المفضلة من الخيارات أدناه:`,
    lang_changed: `✅ تم ضبط لغة النظام إلى <b>العربية</b> بنجاح.`,

    // Menu Buttons
    btn_overall_report: `📊 التقرير الشهري الشامل`,
    btn_schools_report: `🏫 تقارير المدارس السبع`,
    btn_salaries_report: `💰 رواتب ومخصصات المعلمين`,
    btn_students_report: `👨‍🎓 إحصائيات وترتيب الطلاب`,
    btn_export_pdf: `📄 تصدير كملف PDF رسمي`,
    btn_broadcast_now: `📢 إرسال التقرير التلقائي الآن`,
    btn_admin_panel: `⚙️ لوحة تحكم المشرف (Admin)`,
    btn_language: `🌐 تغيير اللغة (عربي / EN)`,
    btn_back: `🔙 العودة للقائمة الرئيسية`,
    btn_schools_list: `🔙 قائمة المدارس السبع`,
    btn_view_photos: `🖼 عرض الصور الميدانية`,
    btn_edit_school: `✏️ تعديل بيانات المدرسة`,
    btn_add_teacher: `➕ إضافة معلّم جديد`,
    btn_cancel: `❌ إلغاء العملية`,

    // Admin Buttons
    btn_edit_salary: `💵 تعديل راتب/مخصص المعلم`,
    btn_edit_students: `👨‍🎓 تعديل أعداد الطلاب`,
    btn_upload_photo: `📸 إضافة صور للمدرسة`,
    btn_delete_teacher: `🗑 حذف معلّم`,
    btn_backup_json: `📥 تحميل نسخة احتياطية JSON`,
    btn_import_json: `📤 رفع / استيراد بيانات JSON`,

    // Prompts & Messages
    select_school_view: `🏫 <b>اختر مدرسة للاطلاع على تقريرها المفصل:</b>`,
    select_school_action: `🏫 <b>اختر المدرسة للمتابعة:</b>`,
    select_teacher_action: `👨‍🏫 <b>اختر المعلّم للمتابعة:</b>`,
    generating_pdf: `⏳ جارٍ إعداد وتصدير ملف التقرير الرسمي بصيغة PDF...`,
    pdf_caption: `📄 <b>التقرير الإداري والشهري الشامل (ملف PDF معتمد)</b>\n🏛 شبكة المدارس الإسلامية السبع\n📅 التاريخ: `,
    prompt_new_salary: `💵 <b>أدخل الراتب / المخصص الشهري الجديد ($) لـ:</b>\n` +
      `• اكتب رقماً، مثال: <code>30</code> أو <code>60</code> أو <code>100</code>\n` +
      `• اكتب <code>0</code> للمتطوع بدون راتب\n` +
      `• اكتب <code>gov</code> للراتب الحكومي`,
    prompt_teacher_name: `➕ <b>أدخل اسم المعلّم الجديد بالكامل:</b>\nمثال: <code>أستاذ أحمد بن علي</code>`,
    prompt_teacher_salary: `💵 <b>أدخل مقدار المخصص الشهري ($):</b>\nمثال: <code>30</code>، <code>60</code>، <code>0</code> (متطوع) أو <code>gov</code> (حكومي)`,
    prompt_students: `👨‍🎓 <b>أدخل أعداد الطلاب مفصولين بمسافة:</b>\nالصيغة: <code>[بنين] [بنات]</code>\nمثال: <code>60 45</code> (٦٠ بنين و ٤٥ بنات)`,
    prompt_upload_photo: `📸 <b>يرجى إرسال الصورة (Photo) الآن ليتم حفظها للمدرسة.</b>`,
    prompt_send_json: `📤 <b>رفع وتحديث ملف قاعدة البيانات:</b>\n\nيرجى إرسال ملف <code>schools.json</code> (كمستند Document) في هذه المحادثة الآن. سيقوم النظام بالتحقق منه وتحديث قاعدة البيانات فوراً!`,
    confirm_delete_teacher: `🗑 <b>اختر المعلّم المراد حذفه من النظام:</b>`,
    
    // Success messages
    success_salary_updated: `✅ تم تعديل مخصص المعلّم بنجاح!`,
    success_teacher_added: `✅ تم تسجيل المعلّم الجديد بنجاح!`,
    success_teacher_deleted: `✅ تم حذف المعلّم من السجلات بنجاح!`,
    success_students_updated: `✅ تم تحديث أعداد الطلاب بنجاح!`,
    success_photo_uploaded: `✅ تم حفظ الصورة وأرشفتها بنجاح!`,
    broadcast_started: `جارٍ إرسال التقرير التلقائي...`,

    // Help Text
    help_text: `📖 <b>دليل استخدام النظام والأوامر الرسمية:</b>\n\n` +
      `• /start - فتح لوحة التحكم والقائمة التفاعلية\n` +
      `• /report - عرض التقرير الإداري والشهري الشامل\n` +
      `• /pdf - استخراج وتحميل ملف التقرير الرسمي PDF\n` +
      `• /schools - ملفات المدارس السبع ودليل المعلمين\n` +
      `• /salaries - تقرير الرواتب ودراسة جدوى الكفالات\n` +
      `• /students - تقرير أعداد ونسب الطلاب\n` +
      `• /autoreport - بث التقرير التلقائي الفوري\n` +
      `• /lang - تغيير لغة الواجهة (العربية / English)\n` +
      `• /admin - لوحة تحكم المشرف (Admin Console)\n` +
      `• /help - عرض هذا الدليل الإرشادي`
  }
};

function t(key, lang = 'ar') {
  const l = (lang === 'en') ? 'en' : 'ar';
  return translations[l][key] || translations['ar'][key] || key;
}

module.exports = {
  translations,
  t
};
