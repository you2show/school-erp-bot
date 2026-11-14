function getFormattedDates(lang = 'ar', date = new Date()) {
  const isEn = (lang === 'en');
  try {
    if (isEn) {
      const hijri = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
      const greg = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
      return {
        hijri,
        greg,
        combined: `${hijri} (Corresponding to: ${greg})`
      };
    } else {
      const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
      const greg = new Intl.DateTimeFormat('ar-SA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
      return {
        hijri,
        greg,
        combined: `${hijri} | الموافق: ${greg}م`
      };
    }
  } catch (e) {
    const fallback = date.toLocaleDateString(isEn ? 'en-US' : 'ar-SA');
    return { hijri: '', greg: fallback, combined: fallback };
  }
}

function formatOverallReport(schools, stats, lang = 'ar') {
  const isEn = (lang === 'en');
  const dates = getFormattedDates(lang);

  if (isEn) {
    let msg = `📊 <b>EXECUTIVE MONTHLY REPORT</b>\n`;
    msg += `🏛 <b>The 7 Schools Network</b>\n`;
    msg += `📅 <b>Date:</b> ${dates.combined}\n\n`;

    msg += `👥 <b>Student Enrollment:</b>\n`;
    msg += `• Total Students: <b>${stats.totalStudents}</b>\n`;
    msg += `• Boys: <b>${stats.totalBoys}</b> (${Math.round((stats.totalBoys / (stats.totalStudents || 1)) * 100)}%)\n`;
    msg += `• Girls: <b>${stats.totalGirls}</b> (${Math.round((stats.totalGirls / (stats.totalStudents || 1)) * 100)}%)\n\n`;

    msg += `👨‍🏫 <b>Teaching Faculty:</b>\n`;
    msg += `• Total Faculty: <b>${stats.totalTeachers} Educators</b>\n`;
    msg += `• Monthly Allowance: <b>${stats.paidTeachers}</b>\n`;
    msg += `• Government Payroll: <b>${stats.govtTeachers}</b>\n`;
    msg += `• Volunteer / Unpaid: <b>${stats.volunteerTeachers}</b>\n\n`;

    msg += `💰 <b>Financial Allocation:</b>\n`;
    msg += `• Monthly Payroll: <b>$${stats.totalMonthlySalary}.00 / month</b>\n`;
    msg += `• Annual Budget: <b>$${stats.totalMonthlySalary * 12}.00 / year</b>\n\n`;

    msg += `🏫 <b>Summary by School:</b>\n\n`;
    schools.forEach((s, idx) => {
      const expense = (s.teachers || []).reduce((acc, t) => acc + (t.salary_amount || 0), 0);
      const st = s.students || { boys: 0, girls: 0, total: 0 };
      const tc = (s.teachers || []).length;
      msg += `<b>${idx + 1}. ${s.name_en || s.name_ar}</b>\n`;
      msg += `<i>${s.name_ar}</i>\n`;
      msg += `• Students: <b>${st.total}</b> (${st.boys} Boys | ${st.girls} Girls)\n`;
      msg += `• Faculty: <b>${tc}</b> teachers | Monthly Budget: <b>$${expense}</b>\n\n`;
    });

    msg += `💡 <i>Tap any school from the menu below to view full details or export PDF.</i>`;
    return msg;
  }

  // Arabic (العربية) with Hijri date
  let msg = `📊 <b>التقرير الإداري والشهري الشامل</b>\n`;
  msg += `🏛 <b>شبكة المدارس الإسلامية والمراكز التعليمية السبع</b>\n`;
  msg += `📅 <b>التاريخ:</b> ${dates.combined}\n\n`;

  msg += `👥 <b>إحصائيات الطلاب والطالبات:</b>\n`;
  msg += `• إجمالي المقيدين: <b>${stats.totalStudents} طالباً وطالبة</b>\n`;
  msg += `• البنين: <b>${stats.totalBoys}</b> (${Math.round((stats.totalBoys / (stats.totalStudents || 1)) * 100)}٪)\n`;
  msg += `• البنات: <b>${stats.totalGirls}</b> (${Math.round((stats.totalGirls / (stats.totalStudents || 1)) * 100)}٪)\n\n`;

  msg += `👨‍🏫 <b>الكادر التعليمي والإداري:</b>\n`;
  msg += `• إجمالي المعلمين: <b>${stats.totalTeachers} معلماً ومعلمة</b>\n`;
  msg += `• يتقاضون مخصصات شهرية: <b>${stats.paidTeachers} معلمين</b>\n`;
  msg += `• يتقاضون رواتب حكومية: <b>${stats.govtTeachers} معلمين</b>\n`;
  msg += `• متطوعون بدون راتب: <b>${stats.volunteerTeachers} معلماً</b>\n\n`;

  msg += `💰 <b>المصروفات والميزانية المالية:</b>\n`;
  msg += `• إجمالي المخصصات الشهرية: <b>${stats.totalMonthlySalary} دولار / شهرياً</b>\n`;
  msg += `• الميزانية السنوية التقديرية: <b>${stats.totalMonthlySalary * 12} دولار / سنوياً</b>\n\n`;

  msg += `🏫 <b>بيانات المدارس السبع:</b>\n\n`;
  schools.forEach((s, idx) => {
    const expense = (s.teachers || []).reduce((acc, t) => acc + (t.salary_amount || 0), 0);
    const st = s.students || { boys: 0, girls: 0, total: 0 };
    const tc = (s.teachers || []).length;
    msg += `<b>${idx + 1}. ${s.name_ar}</b>\n`;
    msg += `• الطلاب: <b>${st.total}</b> (${st.boys} بنين | ${st.girls} بنات)\n`;
    msg += `• الكادر: <b>${tc}</b> معلمين | المخصصات: <b>${expense} دولار شهرياً</b>\n\n`;
  });

  msg += `💡 <i>يمكنكم الضغط على أزرار المدارس بالأسفل للاطلاع على تفاصيل كل مدرسة أو تصدير ملف PDF.</i>`;
  return msg;
}

function formatSchoolDetail(school, lang = 'ar') {
  const isEn = (lang === 'en');
  const teachers = school.teachers || [];
  const schoolExpense = teachers.reduce((acc, t) => acc + (t.salary_amount || 0), 0);
  const students = school.students || { boys: 0, girls: 0, total: 0 };
  const boyPct = students.total > 0 ? Math.round((students.boys / students.total) * 100) : 0;
  const girlPct = students.total > 0 ? (100 - boyPct) : 0;

  if (isEn) {
    let msg = `🏫 <b>${school.name_en || school.name_ar}</b>\n`;
    msg += `<i>${school.name_ar}</i>\n\n`;

    msg += `🏢 <b>Classrooms & Facilities:</b>\n`;
    msg += `• ${school.classrooms_info_en || school.classrooms_info_ar || 'Standard Classrooms'}\n\n`;

    msg += `👥 <b>Student Enrollment:</b>\n`;
    msg += `• Total Students: <b>${students.total}</b>\n`;
    msg += `• Boys: <b>${students.boys}</b> (${boyPct}%)\n`;
    msg += `• Girls: <b>${students.girls}</b> (${girlPct}%)\n\n`;

    msg += `👨‍🏫 <b>Teaching Faculty (${teachers.length}):</b>\n`;
    if (teachers.length === 0) {
      msg += `<i>No staff registered currently.</i>\n`;
    } else {
      teachers.forEach((t, i) => {
        let badge = '';
        if (t.salary_type === 'government') {
          badge = '🟢 Government Payroll';
        } else if (t.salary_amount > 0) {
          badge = `🟡 Allowance: $${t.salary_amount}/mo`;
        } else {
          badge = '🔴 Volunteer / Unpaid';
        }

        msg += `\n<b>${i + 1}. ${t.name_ar}</b>\n`;
        if (t.name_en) msg += `   En: ${t.name_en}\n`;
        msg += `   Status: <b>${badge}</b>\n`;
        if (t.note_en || t.note_ar) msg += `   Note: <i>${t.note_en || t.note_ar}</i>\n`;
      });
    }

    msg += `\n💰 <b>Monthly School Budget:</b> <b>$${schoolExpense}.00 / month</b>\n`;
    if (school.photos && school.photos.length > 0) {
      msg += `🖼 <b>Photos:</b> ${school.photos.length} photos available.\n`;
    }
    return msg;
  }

  // Arabic
  let msg = `🏫 <b>${school.name_ar}</b>\n\n`;

  msg += `🏢 <b>الفصول والمرافق الدراسية:</b>\n`;
  msg += `• ${school.classrooms_info_ar || 'فصول دراسية'}\n\n`;

  msg += `👥 <b>أعداد الطلاب والطالبات:</b>\n`;
  msg += `• إجمالي الطلاب: <b>${students.total} طالباً وطالبة</b>\n`;
  msg += `• بنين: <b>${students.boys}</b> (${boyPct}٪)\n`;
  msg += `• بنات: <b>${students.girls}</b> (${girlPct}٪)\n\n`;

  msg += `👨‍🏫 <b>الكادر التعليمي والإداري (${teachers.length} معلمين):</b>\n`;
  if (teachers.length === 0) {
    msg += `<i>لا يوجد كادر مسجل حالياً.</i>\n`;
  } else {
    teachers.forEach((t, i) => {
      let badge = '';
      if (t.salary_type === 'government') {
        badge = '🟢 راتب حكومي';
      } else if (t.salary_amount > 0) {
        badge = `🟡 مخصص: ${t.salary_amount}$ شهرياً`;
      } else {
        badge = '🔴 متطوع بدون راتب';
      }

      msg += `\n<b>${i + 1}. ${t.name_ar}</b>\n`;
      msg += `   الحالة: <b>${badge}</b>\n`;
      if (t.note_ar) msg += `   ملاحظة: <i>${t.note_ar}</i>\n`;
    });
  }

  msg += `\n💰 <b>ميزانية المدرسة الشهرية:</b> <b>${schoolExpense} دولار / شهرياً</b>\n`;
  if (school.photos && school.photos.length > 0) {
    msg += `🖼 <b>الصور المتوفرة:</b> ${school.photos.length} صور وثائقية للمدرسة.\n`;
  }
  return msg;
}

function formatSalariesReport(schools, stats, lang = 'ar') {
  const isEn = (lang === 'en');
  const dates = getFormattedDates(lang);

  if (isEn) {
    let msg = `💰 <b>PAYROLL & SPONSORSHIP REPORT</b>\n`;
    msg += `📅 <b>Period:</b> ${dates.combined}\n`;
    msg += `💵 Active Monthly Payroll: <b>$${stats.totalMonthlySalary}.00 / mo</b> ($${stats.totalMonthlySalary * 12}.00 / yr)\n\n`;

    msg += `🟡 <b>1. Educators Receiving Monthly Allowance (${stats.paidTeachers}):</b>\n`;
    let paidCount = 0;
    schools.forEach(s => {
      const paidT = (s.teachers || []).filter(t => t.salary_amount > 0);
      if (paidT.length > 0) {
        msg += `\n<b>• ${s.name_en || s.name_ar}:</b>\n`;
        paidT.forEach(t => {
          paidCount++;
          msg += `  ${paidCount}. ${t.name_ar} ➔ <b>$${t.salary_amount}/mo</b>\n`;
        });
      }
    });

    msg += `\n🟢 <b>2. Government Payroll Faculty (${stats.govtTeachers}):</b>\n`;
    let govtCount = 0;
    schools.forEach(s => {
      const govtT = (s.teachers || []).filter(t => t.salary_type === 'government');
      if (govtT.length > 0) {
        msg += `<b>• ${s.name_en || s.name_ar}:</b>\n`;
        govtT.forEach(t => {
          govtCount++;
          msg += `  ${govtCount}. ${t.name_ar} ➔ <i>Government Funded</i>\n`;
        });
      }
    });

    msg += `\n🔴 <b>3. Volunteer / Unpaid Teachers (${stats.volunteerTeachers}):</b>\n`;
    msg += `<i>Dedicated teachers serving without financial compensation:</i>\n`;
    schools.forEach(s => {
      const volT = (s.teachers || []).filter(t => t.salary_type === 'volunteer' || (t.salary_amount === 0 && t.salary_type !== 'government'));
      if (volT.length > 0) {
        msg += `\n<b>• ${s.name_en || s.name_ar}:</b>\n`;
        volT.forEach(t => {
          msg += `  - ${t.name_ar}\n`;
        });
      }
    });

    msg += `\n💡 <b>Sponsorship Estimation:</b>\n`;
    msg += `To sponsor all <b>${stats.volunteerTeachers} volunteer teachers</b> at <b>$30/mo</b> per teacher:\n`;
    msg += `• Monthly Budget: <b>+$${stats.volunteerTeachers * 30}.00 / month</b>\n`;
    msg += `• Annual Budget: <b>+$${stats.volunteerTeachers * 360}.00 / year</b>`;
    return msg;
  }

  // Arabic
  let msg = `💰 <b>تقرير رواتب ومخصصات الكادر التعليمي</b>\n`;
  msg += `📅 <b>الفترة:</b> ${dates.combined}\n`;
  msg += `💵 إجمالي المخصصات: <b>${stats.totalMonthlySalary} دولار / شهرياً</b> (${stats.totalMonthlySalary * 12} دولار / سنوياً)\n\n`;

  msg += `🟡 <b>١. المعلمون الذين يتقاضون مخصصات شهرية (${stats.paidTeachers} معلمين):</b>\n`;
  let paidCount = 0;
  schools.forEach(s => {
    const paidT = (s.teachers || []).filter(t => t.salary_amount > 0);
    if (paidT.length > 0) {
      msg += `\n<b>• ${s.name_ar}:</b>\n`;
      paidT.forEach(t => {
        paidCount++;
        msg += `  ${paidCount}. ${t.name_ar} ➔ <b>${t.salary_amount} دولار</b>\n`;
      });
    }
  });

  msg += `\n🟢 <b>٢. المعلمون الذين يتقاضون رواتب حكومية (${stats.govtTeachers} معلمين):</b>\n`;
  let govtCount = 0;
  schools.forEach(s => {
    const govtT = (s.teachers || []).filter(t => t.salary_type === 'government');
    if (govtT.length > 0) {
      msg += `<b>• ${s.name_ar}:</b>\n`;
      govtT.forEach(t => {
        govtCount++;
        msg += `  ${govtCount}. ${t.name_ar} ➔ <i>راتب رسمي من الدولة</i>\n`;
      });
    }
  });

  msg += `\n🔴 <b>٣. الكادر المتطوع الذي لم يتقاضَ راتباً (${stats.volunteerTeachers} معلماً):</b>\n`;
  msg += `<i>(معلمون مخلصون يبذلون جهدهم ويحتاجون إلى كفالة مالية ودعم)</i>\n`;
  schools.forEach(s => {
    const volT = (s.teachers || []).filter(t => t.salary_type === 'volunteer' || (t.salary_amount === 0 && t.salary_type !== 'government'));
    if (volT.length > 0) {
      msg += `\n<b>• ${s.name_ar}:</b>\n`;
      volT.forEach(t => {
        msg += `  - ${t.name_ar}\n`;
      });
    }
  });

  msg += `\n💡 <b>دراسة جدوى الكفالة الشهرية:</b>\n`;
  msg += `في حال كفالة المعلمين المتطوعين وعددهم <b>${stats.volunteerTeachers} معلماً</b> بواقع <b>٣٠ دولاراً</b> شهرياً لكل معلم:\n`;
  msg += `• الميزانية الشهرية المطلوبة: <b>+${stats.volunteerTeachers * 30} دولار / شهرياً</b>\n`;
  msg += `• الميزانية السنوية المطلوبة: <b>+${stats.volunteerTeachers * 360} دولار / سنوياً</b>`;
  return msg;
}

function formatStudentsReport(schools, stats, lang = 'ar') {
  const isEn = (lang === 'en');
  const sorted = [...schools].sort((a, b) => (b.students?.total || 0) - (a.students?.total || 0));

  if (isEn) {
    let msg = `👨‍🎓 <b>STUDENT ENROLLMENT STATISTICS</b>\n`;
    msg += `👥 Total Enrollment: <b>${stats.totalStudents} Students</b>\n`;
    msg += `• Boys: <b>${stats.totalBoys}</b> (${Math.round((stats.totalBoys / (stats.totalStudents || 1)) * 100)}%)\n`;
    msg += `• Girls: <b>${stats.totalGirls}</b> (${Math.round((stats.totalGirls / (stats.totalStudents || 1)) * 100)}%)\n\n`;

    sorted.forEach((s, idx) => {
      const st = s.students || { boys: 0, girls: 0, total: 0 };
      const pct = stats.totalStudents > 0 ? Math.round((st.total / stats.totalStudents) * 100) : 0;

      msg += `<b>${idx + 1}. ${s.name_en || s.name_ar}</b>\n`;
      msg += `<i>${s.name_ar}</i>\n`;
      msg += `• Total Students: <b>${st.total}</b> (${pct}% of total)\n`;
      msg += `• Boys: <b>${st.boys}</b> | Girls: <b>${st.girls}</b>\n`;
      msg += `• Facilities: ${s.classrooms_info_en || s.classrooms_info_ar || 'Standard rooms'}\n\n`;
    });
    return msg;
  }

  // Arabic
  let msg = `👨‍🎓 <b>تقرير إحصائيات وترتيب الطلاب في المدارس السبع</b>\n`;
  msg += `👥 إجمالي المقيدين: <b>${stats.totalStudents} طالباً وطالبة</b>\n`;
  msg += `• البنين: <b>${stats.totalBoys}</b> (${Math.round((stats.totalBoys / (stats.totalStudents || 1)) * 100)}٪)\n`;
  msg += `• البنات: <b>${stats.totalGirls}</b> (${Math.round((stats.totalGirls / (stats.totalStudents || 1)) * 100)}٪)\n\n`;

  sorted.forEach((s, idx) => {
    const st = s.students || { boys: 0, girls: 0, total: 0 };
    const pct = stats.totalStudents > 0 ? Math.round((st.total / stats.totalStudents) * 100) : 0;

    msg += `<b>${idx + 1}. ${s.name_ar}</b>\n`;
    msg += `• إجمالي الطلاب: <b>${st.total}</b> (${pct}٪ من المجموع)\n`;
    msg += `• بنين: <b>${st.boys}</b> | بنات: <b>${st.girls}</b>\n`;
    msg += `• الفصول: ${s.classrooms_info_ar || 'فصول دراسية'}\n\n`;
  });
  return msg;
}

function formatAutoReportAnnouncement(schools, stats, lang = 'ar') {
  const isEn = (lang === 'en');
  let header = isEn
    ? `📢 <b>Official Monthly Auto-Report Broadcast</b>\n\n`
    : `📢 <b>البث الرسمي للتقرير الشهري التلقائي الموحد</b>\n\n`;
  return header + formatOverallReport(schools, stats, lang);
}

module.exports = {
  getFormattedDates,
  formatOverallReport,
  formatSchoolDetail,
  formatSalariesReport,
  formatStudentsReport,
  formatAutoReportAnnouncement
};
