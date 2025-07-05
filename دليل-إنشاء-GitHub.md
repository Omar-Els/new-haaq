# 📚 دليل إنشاء GitHub Repository وربط المشروع

## 🎯 الهدف
إنشاء repository على GitHub لموقع دعوة الحق وربطه بالمشروع المحلي.

## 📋 الخطوات المطلوبة

### 1️⃣ إنشاء Repository على GitHub

#### أ) الدخول إلى GitHub
1. اذهب إلى [GitHub.com](https://github.com)
2. سجل دخولك بحسابك
3. اضغط على زر "+" في الأعلى
4. اختر "New repository"

#### ب) إعداد Repository
```
Repository name: dawaaelhaq
Description: دعوة الحق - نظام إدارة المستفيدين والمبادرات الخيرية
Visibility: Public (أو Private حسب رغبتك)
Initialize with: 
  ✅ Add a README file
  ✅ Add .gitignore (اختر Node)
  ✅ Choose a license (اختر MIT)
```

#### ج) إنشاء Repository
- اضغط "Create repository"

### 2️⃣ ربط المشروع المحلي بـ GitHub

#### أ) في Terminal (PowerShell)
```bash
# تأكد من أنك في مجلد المشروع
cd "C:\Users\DELL\Desktop\كورس javascript\elhaq"

# إضافة Remote Repository
git remote add origin https://github.com/YOUR_USERNAME/dawaaelhaq.git

# رفع الكود إلى GitHub
git branch -M main
git push -u origin main
```

#### ب) استبدل YOUR_USERNAME باسم المستخدم الخاص بك على GitHub

### 3️⃣ إعداد GitHub Pages (اختياري)

#### أ) في إعدادات Repository
1. اذهب إلى Settings
2. اختر Pages من القائمة الجانبية
3. في Source اختر "Deploy from a branch"
4. اختر branch: main
5. اضغط Save

### 4️⃣ إعداد GitHub Actions (اختياري)

#### أ) إنشاء ملف Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🔗 الروابط المهمة

### Repository Links
- **GitHub Repository**: `https://github.com/YOUR_USERNAME/dawaaelhaq`
- **GitHub Pages**: `https://YOUR_USERNAME.github.io/dawaaelhaq`
- **Raw Files**: `https://raw.githubusercontent.com/YOUR_USERNAME/dawaaelhaq/main/`

### Social Links
```markdown
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YOUR_USERNAME/dawaaelhaq)
[![Website](https://img.shields.io/badge/Website-FF5722?style=for-the-badge&logo=todoist&logoColor=white)](https://dawaaelhaq.top)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
```

## 📝 تحديث README.md

### أ) إضافة Badges
```markdown
# 🌟 دعوة الحق - نظام إدارة المستفيدين والمبادرات

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YOUR_USERNAME/dawaaelhaq)
[![Website](https://img.shields.io/badge/Website-FF5722?style=for-the-badge&logo=todoist&logoColor=white)](https://dawaaelhaq.top)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

## 🌐 الروابط
- **الموقع المباشر**: [https://dawaaelhaq.top](https://dawaaelhaq.top)
- **GitHub Repository**: [https://github.com/YOUR_USERNAME/dawaaelhaq](https://github.com/YOUR_USERNAME/dawaaelhaq)
- **Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)
```

### ب) إضافة Installation Section
```markdown
## 🚀 التثبيت والتشغيل

### استنساخ المشروع
```bash
git clone https://github.com/YOUR_USERNAME/dawaaelhaq.git
cd dawaaelhaq
npm install
npm run dev
```
```

## 🔧 إعدادات متقدمة

### 1️⃣ GitHub Secrets (للـ Actions)
```bash
# في إعدادات Repository > Secrets and variables > Actions
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_org_id
PROJECT_ID=your_project_id
```

### 2️⃣ Branch Protection
1. اذهب إلى Settings > Branches
2. اضغط "Add rule"
3. اكتب "main"
4. فعّل:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

### 3️⃣ Issue Templates
```markdown
# .github/ISSUE_TEMPLATE/bug_report.md
---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 10]
 - Browser: [e.g. Chrome, Safari]
 - Version: [e.g. 22]
```

## 🚀 النشر على Vercel

### 1️⃣ ربط GitHub بـ Vercel
1. اذهب إلى [Vercel.com](https://vercel.com)
2. سجل دخولك بحساب GitHub
3. اضغط "New Project"
4. اختر repository `dawaaelhaq`
5. اضغط "Deploy"

### 2️⃣ إعداد الدومين
1. في إعدادات المشروع على Vercel
2. اذهب إلى "Domains"
3. أضف `dawaaelhaq.top`
4. اتبع التعليمات لإعداد DNS

## 📊 إحصائيات Repository

### أ) إضافة GitHub Stats
```markdown
![GitHub Stats](https://github-readme-stats.vercel.app/api?username=YOUR_USERNAME&show_icons=true&theme=radical)

![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=YOUR_USERNAME&layout=compact&theme=radical)

![GitHub Streak](https://github-readme-streak-stats.herokuapp.com/?user=YOUR_USERNAME&theme=radical)
```

### ب) إضافة Visitor Counter
```markdown
![Profile Views](https://komarev.com/ghpvc/?username=YOUR_USERNAME&color=brightgreen)
```

## 🔄 التحديثات المستقبلية

### أ) إضافة Features
```bash
# إنشاء فرع جديد للميزة
git checkout -b feature/new-feature

# إجراء التغييرات
# ...

# رفع الفرع
git push origin feature/new-feature

# إنشاء Pull Request على GitHub
```

### ب) إصدار جديد
```bash
# إنشاء Tag
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# إنشاء Release على GitHub
```

## 📞 الدعم

للمساعدة في إعداد GitHub Repository:
- 📧 البريد الإلكتروني: support@dawaaelhaq.top
- 🌐 الموقع: https://dawaaelhaq.top
- 📱 الهاتف: +20 XXX XXX XXXX

---

**تم إنشاء هذا الدليل لمساعدة فريق دعوة الحق** 🚀 