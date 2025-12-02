<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TV Compare Pro - مقارنة التلفزيونات

تطبيق ذكي لمقارنة التلفزيونات باستخدام الذكاء الاصطناعي (Gemini AI)

View your app in AI Studio: https://ai.studio/apps/drive/1GP6cwKiCDNJksQUHOrv2zWWn2Y6l8drq

## 🚀 التشغيل المحلي

**المتطلبات:** Node.js

1. تثبيت المكتبات:
   ```bash
   npm install
   ```

2. إضافة مفتاح Gemini API في ملف [.env.local](.env.local):
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. تشغيل التطبيق:
   ```bash
   npm run dev
   ```

## 📦 النشر والمشاركة

### الطريقة 1: النشر على Vercel (موصى به)

1. قم بإنشاء حساب على [Vercel](https://vercel.com)
2. قم بتثبيت Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. قم بتسجيل الدخول:
   ```bash
   vercel login
   ```
4. انشر المشروع:
   ```bash
   vercel
   ```
5. أضف متغير البيئة `GEMINI_API_KEY` في لوحة تحكم Vercel

**أو استخدم واجهة Vercel:**
- ارفع المشروع على GitHub
- اذهب إلى [vercel.com/new](https://vercel.com/new)
- اختر المستودع وانشره
- أضف `GEMINI_API_KEY` في إعدادات المشروع

### الطريقة 2: النشر على Netlify

1. قم بإنشاء حساب على [Netlify](https://netlify.com)
2. اسحب مجلد المشروع إلى Netlify Drop
3. أو استخدم Netlify CLI:
   ```bash
   npm i -g netlify-cli
   netlify login
   netlify deploy --prod
   ```
4. أضف `GEMINI_API_KEY` في إعدادات البيئة

### الطريقة 3: النشر اليدوي

1. قم ببناء المشروع:
   ```bash
   npm run build
   ```
2. ارفع محتويات مجلد `dist` على أي استضافة ويب

## 🔑 المتغيرات البيئية المطلوبة

- `GEMINI_API_KEY`: مفتاح API من Google AI Studio
- متغيرات Supabase (إذا كنت تستخدمها)

## 🛠️ التقنيات المستخدمة

- React 19
- TypeScript
- Vite
- Gemini AI
- Supabase
- Lucide Icons
