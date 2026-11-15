# 📚 7 Schools Auto-Report ERP Telegram Bot (@SchoolERPSystemBot)

## 🔒 Whitelist & Security
- **Authorized User IDs Only:** `639844644`, `1276188382`
- **Any other user:** Completely ignored / silent (will not display or respond to anything).

## 🌐 Bilingual Support (English & Arabic)
- Supports **English (`en`)** and **العربية (`ar`)**.
- Switch language anytime with `/lang`, `/language`, or the `🌐 Language` button.

## 📄 PDF Export Feature
- **Instant Official PDF Generation:** Users can export a print-ready A4 executive PDF document.
- Available via button **"📄 Export as PDF Report"** or command **/pdf**.
- Includes complete network stats, school breakdown, student demographics, faculty compensation directory, and official approval signatures in English or Arabic.

---

## 🏫 Schools Overview (المدارس السبع)

| # | School (English) | المدرسة (عربي) | Staff | Govt | Monthly Allowance | Volunteers | Students | Monthly Total |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | Al-Firdaws School | مدرسة الفردوس | 4 | 1 | 0 | 3 | 110 (B:59, G:51) | $0 |
| 2 | Al-Sulaymaniyyah Islamic School | مدرسة السليمانية الإسلامية | 5 | 1 | 2 ($30+$30) | 2 | 62 (B:22, G:40) | $60 |
| 3 | Al-Rahmaniyyah School | مدرسة الرحمانية | 5 | 0 | 2 ($30+$30) | 3 | 130 (B:79, G:51) | $60 |
| 4 | Al-Da'wah Islamic School | مدرسة الدعوة الإسلامية | 6 | 3 | 3 ($60+$60+$50) | 0 | 213 (B:95, G:118) | $170 |
| 5 | Nur Al-Qaryah School | مدرسة نور القرية | 3 | 0 | 1 ($30) | 2 | 89 (B:49, G:40) | $30 |
| 6 | Al-Sadaqah School for Dev | مدرسة الصدقة للتربية والتطوير | 2 | 0 | 1 ($30) | 1 | 31 (B:18, G:13) | $30 |
| 7 | Al-Amin School | مدرسة الأمين | 3 | 2 | 1 ($50) | 0 | 93 (B:44, G:49) | $50 |
| **Total** | **7 Schools** | **المدارس السبع** | **28** | **7** | **10** | **11** | **728** | **$400 / mo** |

---

## 📱 Bot Commands

| Command | Description (English) | الوصف (عربي) |
|---|---|---|
| `/start` | Open Main Menu | فتح القائمة الرئيسية |
| `/report` | Overall Monthly Summary Report | عرض التقرير الشهري الشامل |
| `/pdf` | Export Official PDF Report Document | استخراج وتحميل تقرير PDF رسمي |
| `/schools` | School-by-School Reports | عرض تقارير المدارس السبع |
| `/salaries` | Teacher Salaries & Allowances Breakdown | تقرير رواتب ومخصصات المعلمين |
| `/students` | Student Enrollment Statistics | إحصائيات وأعداد الطلاب |
| `/admin` | Open Admin Dashboard | فتح لوحة تحكم المشرف |
| `/edit` | Direct School Data Editor | تعديل مباشر لبيانات المدارس |
| `/backup` | Download schools.json Backup | تحميل نسخة احتياطية من البيانات |
| `/autoreport` | Send Monthly Auto-Report Now | بث وإرسال التقرير التلقائي فوراً |
| `/lang` | Switch Language (EN / عربي) | تغيير اللغة (الإنجليزية / العربية) |
| `/help` | User Guide | دليل الاستخدام |

---

## ✏️ Easy Real-Time Editing on Telegram (ការកែប្រែទិន្នន័យលើ Telegram យ៉ាងងាយស្រួល)

Authorized users (`639844644`, `1276188382`) can easily edit everything directly through Telegram:

### 1. Interactive Button Editor (ងាយស្រួលបំផុត តាមរយៈប៊ូតុង)
- Open `/admin` or `/edit`, or tap on any school in `/schools` and click **"✏️ Edit School / تعديل مدرسة"**.
- Options available:
  - **👨‍🎓 Edit Student Numbers:** Enter `50 40`, `Boys: 50, Girls: 40`, or Eastern Arabic `٥٠ ٤٠` / `طلاب: 50 طالبات: 40`.
  - **💵 Edit Teacher Salary:** Select teacher, then enter `50`, `$50`, `٥٠ دولاراً`, or `gov` / `حكومي` for government salary, or `0` / `متطوع` for volunteer.
  - **➕ Add New Teacher:** Enter name, then enter salary/status.
  - **🗑 Delete Teacher:** Select school, choose teacher to remove.
  - **📸 Upload Photos:** Send any photo directly to add to the school gallery.

### 2. Full JSON Backup & One-Click Import (កែប្រែទិន្នន័យច្រើនក្នុងពេលតែមួយ)
- Type `/backup` -> The bot immediately sends `schools.json` to Telegram.
- Edit the file on your computer or phone.
- Send the updated `.json` file back to the bot -> The bot validates and updates the database instantly with zero downtime!

---

## 🚀 24/7 Always-On Execution (ជម្រើសដំណើរការ ២៤/៧)

### 🖥️ Option 1: Local Windows Auto-Startup (ដំណើរការស្វ័យប្រវត្តិលើកុំព្យូទ័រ)
- **Automatic Startup:** A shortcut is placed in `shell:startup`. Every time your Windows PC boots, the bot launches silently in the background.
- **Auto-Restart Watchdog:** If the bot stops unexpectedly, `service_runner.bat` restarts it in 5 seconds.
- **Helper Scripts:**
  - `status_bot.bat`: Check if the bot is online and view recent logs.
  - `stop_bot.bat`: Safely terminate the running background bot.
  - `start.bat`: Run manually with visible terminal for debugging.

### ☁️ Option 2: Cloud 24/7 Hosting (ដំណើរការលើ Cloud ឥតគិតថ្លៃ ២៤ម៉ោង/២៤ម៉ោង)
- **Multi-Platform Support:** Ready with `Dockerfile` including Node.js 20, Chromium, and Arabic fonts for PDF generation.
- **Health Check Endpoint:** An HTTP server listens on `PORT` (default 3000) for Render / Koyeb / Fly.io health pings.
- **Easy Deployment:**
  1. Double click `push_to_github.bat` to push code to your GitHub repo.
  2. Create a Free Web Service on [Render.com](https://render.com) or [Koyeb.com](https://www.koyeb.com) connected to that GitHub repo.
  3. Add environment variable: `BOT_TOKEN` = `your_token`.
  4. The bot will run 24/7 on the cloud even when your PC is turned off!
