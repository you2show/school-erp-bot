const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { getFormattedDates } = require('./formatter');

const REPORTS_DIR = path.join(__dirname, '..', 'data', 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Cross-platform browser detection (Windows Edge/Chrome & Linux Chromium/Chrome)
const BROWSER_PATHS = [
  process.env.CHROME_BIN,
  process.env.CHROME_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable'
].filter(Boolean);

function getEdgePath() {
  for (const p of BROWSER_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function renderHtmlReport(schools, stats, lang = 'ar') {
  const isEn = (lang === 'en');
  const dates = getFormattedDates(lang);
  const dir = isEn ? 'ltr' : 'rtl';

  let schoolsRowsHtml = '';
  schools.forEach((s, idx) => {
    const expense = (s.teachers || []).reduce((acc, t) => acc + (t.salary_amount || 0), 0);
    const st = s.students || { boys: 0, girls: 0, total: 0 };
    const tc = (s.teachers || []).length;
    const name = isEn ? (s.name_en || s.name_ar) : s.name_ar;
    const subName = isEn ? s.name_ar : (s.name_en || '');
    const facilities = isEn ? (s.classrooms_info_en || s.classrooms_info_ar || '-') : (s.classrooms_info_ar || '-');

    schoolsRowsHtml += `
      <tr>
        <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: #1a365d; font-size: 13px;">${name}</div>
          <div style="font-size: 11px; color: #718096;">${subName}</div>
        </td>
        <td style="font-size: 11px;">${facilities}</td>
        <td style="text-align: center; font-weight: 600;">${st.boys}</td>
        <td style="text-align: center; font-weight: 600;">${st.girls}</td>
        <td style="text-align: center; font-weight: bold; background: #edf2f7; color: #2b6cb0;">${st.total}</td>
        <td style="text-align: center; font-weight: 600;">${tc}</td>
        <td style="text-align: right; font-weight: bold; color: #276749;">$${expense}.00</td>
      </tr>
    `;
  });

  // Detailed Teachers Roster
  let teachersRowsHtml = '';
  let globalTIdx = 0;
  schools.forEach(s => {
    (s.teachers || []).forEach(t => {
      globalTIdx++;
      let badgeStyle = 'background: #fed7d7; color: #9b2c2c;'; // unpaid
      let badgeText = isEn ? 'Unpaid / Volunteer' : 'متطوع بدون راتب';
      let salText = '$0.00';

      if (t.salary_type === 'government') {
        badgeStyle = 'background: #c6f6d5; color: #22543d;';
        badgeText = isEn ? 'Government Payroll' : 'راتب حكومي';
        salText = isEn ? 'Gov. Paid' : 'حكومي';
      } else if (t.salary_amount > 0) {
        badgeStyle = 'background: #feebc8; color: #7b341e;';
        badgeText = isEn ? `Allowance: $${t.salary_amount}/mo` : `مخصص: ${t.salary_amount}$`;
        salText = `$${t.salary_amount}.00`;
      }

      const schoolTitle = isEn ? (s.name_en || s.name_ar) : s.name_ar;
      const note = (isEn ? (t.note_en || t.note_ar) : t.note_ar) || '-';

      teachersRowsHtml += `
        <tr>
          <td style="text-align: center;">${globalTIdx}</td>
          <td style="font-weight: 600; color: #2d3748;">
            ${t.name_ar}
            ${t.name_en ? `<div style="font-size: 11px; color: #718096; font-weight: normal;">${t.name_en}</div>` : ''}
          </td>
          <td style="font-size: 11px; color: #4a5568;">${schoolTitle}</td>
          <td style="text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; ${badgeStyle}">
              ${badgeText}
            </span>
          </td>
          <td style="text-align: right; font-weight: 700; color: #1a202c;">${salText}</td>
          <td style="font-size: 11px; color: #718096;">${note}</td>
        </tr>
      `;
    });
  });

  return `
<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <title>${isEn ? 'Executive Monthly Report' : 'التقرير الإداري والمالي الموحد'}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #2d3748;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.5;
    }
    .header-box {
      border-bottom: 3px solid #1a365d;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-titles h1 {
      margin: 0 0 4px 0;
      font-size: 20px;
      color: #1a365d;
      letter-spacing: -0.5px;
    }
    .header-titles h2 {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: #4a5568;
      font-weight: 600;
    }
    .header-titles .sub {
      font-size: 11px;
      color: #718096;
      margin: 0;
    }
    .header-meta {
      text-align: ${isEn ? 'right' : 'left'};
      font-size: 11px;
      color: #4a5568;
    }
    .header-meta .date-badge {
      background: #ebf8ff;
      color: #2b6cb0;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: bold;
      display: inline-block;
      margin-bottom: 4px;
      font-size: 11px;
    }
    
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .kpi-card {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      border-top: 3px solid #3182ce;
    }
    .kpi-card.green { border-top-color: #38a169; }
    .kpi-card.amber { border-top-color: #dd6b20; }
    .kpi-card.purple { border-top-color: #805ad5; }
    .kpi-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #718096;
      font-weight: 700;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .kpi-value {
      font-size: 18px;
      font-weight: 800;
      color: #1a202c;
    }
    .kpi-sub {
      font-size: 10px;
      color: #a0aec0;
      margin-top: 2px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #1a365d;
      margin: 18px 0 8px 0;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .section-title::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 14px;
      background: #3182ce;
      margin-${isEn ? 'right' : 'left'}: 8px;
      border-radius: 2px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th {
      background: #edf2f7;
      color: #4a5568;
      font-size: 10px;
      font-weight: 700;
      padding: 7px 8px;
      border: 1px solid #cbd5e0;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      font-size: 11px;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .total-row td {
      background: #edf2f7 !important;
      font-weight: bold;
      border-top: 2px solid #cbd5e0;
    }

    .footer-box {
      margin-top: 20px;
      border-top: 1px dashed #cbd5e0;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #718096;
    }
    .signature-area {
      display: flex;
      justify-content: space-between;
      margin-top: 25px;
      page-break-inside: avoid;
    }
    .sig-box {
      width: 42%;
      text-align: center;
      border-top: 1px solid #718096;
      padding-top: 6px;
      font-weight: 600;
      font-size: 11px;
      color: #4a5568;
    }
  </style>
</head>
<body>

  <div class="header-box">
    <div class="header-titles">
      <h1>${isEn ? 'THE 7 SCHOOLS ISLAMIC NETWORK' : 'شبكة المدارس الإسلامية والمراكز التعليمية السبع'}</h1>
      <h2>${isEn ? 'Official Monthly Executive & Payroll Report' : 'التقرير الإداري والمالي الموحد للكادر والطلاب'}</h2>
      <p class="sub">${isEn ? 'Institutional Governance & Academic Supervision System' : 'نظام الإدارة الموحد والمتابعة الأكاديمية والمالية'}</p>
    </div>
    <div class="header-meta">
      <div class="date-badge">📅 ${dates.combined}</div>
      <div>REF: ERP-REP-${Date.now().toString().slice(-6)}</div>
      <div>Status: <b>Official Approved Report</b></div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">${isEn ? 'Total Institutions' : 'إجمالي المدارس'}</div>
      <div class="kpi-value">${stats.schoolsCount} <span style="font-size:12px;font-weight:normal;">${isEn ? 'Schools' : 'مدارس'}</span></div>
      <div class="kpi-sub">${isEn ? '7 Active Centers' : '٧ مراكز تعليمية نشطة'}</div>
    </div>
    <div class="kpi-card green">
      <div class="kpi-label">${isEn ? 'Total Enrollment' : 'إجمالي الطلاب'}</div>
      <div class="kpi-value">${stats.totalStudents}</div>
      <div class="kpi-sub">${stats.totalBoys} 👦 ${isEn ? 'Boys' : 'بنين'} | ${stats.totalGirls} 👧 ${isEn ? 'Girls' : 'بنات'}</div>
    </div>
    <div class="kpi-card amber">
      <div class="kpi-label">${isEn ? 'Teaching Faculty' : 'الكادر التعليمي'}</div>
      <div class="kpi-value">${stats.totalTeachers} <span style="font-size:12px;font-weight:normal;">${isEn ? 'Educators' : 'معلماً'}</span></div>
      <div class="kpi-sub">${stats.paidTeachers} 🟡 ${isEn ? 'Paid' : 'مخصص'} | ${stats.govtTeachers} 🟢 ${isEn ? 'Gov' : 'حكومي'} | ${stats.volunteerTeachers} 🔴 ${isEn ? 'Unpaid' : 'متطوع'}</div>
    </div>
    <div class="kpi-card purple">
      <div class="kpi-label">${isEn ? 'Monthly Budget' : 'الميزانية الشهرية'}</div>
      <div class="kpi-value">$${stats.totalMonthlySalary}.00</div>
      <div class="kpi-sub">${isEn ? 'Annual:' : 'السنوي:'} $${(stats.totalMonthlySalary * 12).toLocaleString()}.00 / yr</div>
    </div>
  </div>

  <div class="section-title">
    ${isEn ? '1. Institutional Overview & Student Enrollment Breakdown' : '١. ملخص المدارس السبع وتوزيع أعداد الطلاب والفصول'}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%; text-align: center;">#</th>
        <th style="width: 25%; text-align: ${isEn ? 'left' : 'right'};">${isEn ? 'School Name' : 'اسم المدرسة'}</th>
        <th style="width: 25%; text-align: ${isEn ? 'left' : 'right'};">${isEn ? 'Classrooms & Facilities' : 'الفصول والمرافق'}</th>
        <th style="width: 9%; text-align: center;">${isEn ? 'Boys' : 'بنين'}</th>
        <th style="width: 9%; text-align: center;">${isEn ? 'Girls' : 'بنات'}</th>
        <th style="width: 9%; text-align: center;">${isEn ? 'Total' : 'المجموع'}</th>
        <th style="width: 8%; text-align: center;">${isEn ? 'Staff' : 'الكادر'}</th>
        <th style="width: 10%; text-align: right;">${isEn ? 'Monthly' : 'المخصص'}</th>
      </tr>
    </thead>
    <tbody>
      ${schoolsRowsHtml}
      <tr class="total-row">
        <td colspan="3" style="text-align: ${isEn ? 'right' : 'left'}; font-weight: 800;">${isEn ? 'NETWORK TOTAL' : 'الإجمالي الكلي العام'}</td>
        <td style="text-align: center;">${stats.totalBoys}</td>
        <td style="text-align: center;">${stats.totalGirls}</td>
        <td style="text-align: center; color: #2b6cb0;">${stats.totalStudents}</td>
        <td style="text-align: center;">${stats.totalTeachers}</td>
        <td style="text-align: right; color: #276749;">$${stats.totalMonthlySalary}.00</td>
      </tr>
    </tbody>
  </table>

  <div style="page-break-before: always;"></div>

  <div class="section-title">
    ${isEn ? '2. Full Faculty & Personnel Compensation Directory' : '٢. السجل الشامل لبيانات ومخصصات الكادر التعليمي'}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%; text-align: center;">#</th>
        <th style="width: 28%; text-align: ${isEn ? 'left' : 'right'};">${isEn ? 'Teacher Name' : 'اسم المعلّم'}</th>
        <th style="width: 24%; text-align: ${isEn ? 'left' : 'right'};">${isEn ? 'Assigned School' : 'المدرسة'}</th>
        <th style="width: 18%; text-align: center;">${isEn ? 'Status' : 'الحالة'}</th>
        <th style="width: 10%; text-align: right;">${isEn ? 'Amount' : 'المخصص'}</th>
        <th style="width: 15%; text-align: ${isEn ? 'left' : 'right'};">${isEn ? 'Notes' : 'ملاحظات'}</th>
      </tr>
    </thead>
    <tbody>
      ${teachersRowsHtml}
    </tbody>
  </table>

  <div style="background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 12px 16px; margin-top: 15px;">
    <div style="font-weight: bold; color: #2b6cb0; font-size: 13px; margin-bottom: 4px;">
      💡 ${isEn ? 'Faculty Sponsorship & Philanthropic Opportunity' : 'دراسة جدوى رعاية وكفالة الكادر التعليمي المتطوع'}
    </div>
    <div style="color: #2c5282; font-size: 11px;">
      ${isEn 
        ? `Currently, <b>${stats.volunteerTeachers} volunteer teachers</b> are teaching without compensation. Sponsoring all volunteer teachers at a rate of <b>$30/month</b> requires an additional <b>$${stats.volunteerTeachers * 30}.00/month</b> ($${stats.volunteerTeachers * 360}.00/year).`
        : `يوجد حالياً <b>${stats.volunteerTeachers} معلماً متطوعاً</b> يبذلون جهدهم دون مخصصات مالية. في حال كفالة جميع المتطوعين بواقع <b>٣٠ دولاراً شهرياً</b>، فإن التكلفة الإضافية المطلوبة تبلغ <b>${stats.volunteerTeachers * 30} دولاراً شهرياً</b> (${stats.volunteerTeachers * 360} دولاراً سنوياً).`
      }
    </div>
  </div>

  <div class="signature-area">
    <div class="sig-box">
      ${isEn ? 'Prepared & Compiled by:<br>School ERP Administration' : 'إعداد ومراجعة:<br>إدارة نظام المدارس الموحد'}
    </div>
    <div class="sig-box">
      ${isEn ? 'Supervised & Authorized by:<br>General Academic Direction' : 'اعتماد وتصديق:<br>الإشراف العام والتوجيه التعليمي'}
    </div>
  </div>

  <div class="footer-box">
    <div>${isEn ? 'System Generated Document - SchoolERPSystemBot' : 'وثيقة رسمية صادرة آلياً عن نظام إدارة المدارس السبع'}</div>
    <div>${isEn ? 'Page 1-2 | Confidential & Official' : 'الصفحة ١-٢ | وثيقة رسمية معتمدة'}</div>
  </div>

</body>
</html>
  `;
}

async function generateReportPdf(schools, stats, lang = 'ar') {
  const edgePath = getEdgePath();
  if (!edgePath) {
    throw new Error('Microsoft Edge executable not found for PDF generation');
  }

  const timestamp = Date.now();
  const htmlContent = renderHtmlReport(schools, stats, lang);
  const htmlPath = path.join(REPORTS_DIR, `temp_report_${timestamp}.html`);
  const pdfPath = path.join(REPORTS_DIR, `School_ERP_Report_${lang.toUpperCase()}_${timestamp}.pdf`);

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  return new Promise((resolve, reject) => {
    execFile(edgePath, [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      htmlPath
    ], (err) => {
      try { fs.unlinkSync(htmlPath); } catch (e) {}

      if (err) {
        return reject(err);
      }

      if (!fs.existsSync(pdfPath) || fs.statSync(pdfPath).size === 0) {
        return reject(new Error('PDF generation produced empty or missing file'));
      }

      resolve(pdfPath);
    });
  });
}

module.exports = {
  renderHtmlReport,
  generateReportPdf
};
