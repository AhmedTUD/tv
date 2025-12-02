# 🗄️ إعداد قاعدة البيانات Supabase

## الخطوات السريعة

### 1️⃣ إنشاء حساب ومشروع
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل حساب جديد (مجاني)
3. اضغط "New Project"
4. اختر اسم للمشروع وكلمة مرور قوية

### 2️⃣ الحصول على بيانات الاتصال
1. من لوحة تحكم المشروع، اذهب إلى **Settings** → **API**
2. انسخ:
   - **Project URL** (مثل: `https://xyz.supabase.co`)
   - **anon/public key** (يبدأ بـ `eyJhbG...`)

### 3️⃣ إنشاء الجدول
1. اذهب إلى **SQL Editor** في القائمة الجانبية
2. اضغط "New Query"
3. الصق الكود التالي:

```sql
-- Create the app_data table
CREATE TABLE IF NOT EXISTS app_data (
  id INTEGER PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all access to app_data" 
ON app_data 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert initial empty row
INSERT INTO app_data (id, payload) 
VALUES (1, '{"fields": [], "models": [], "last_updated": ""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_app_data_updated_at ON app_data;
CREATE TRIGGER update_app_data_updated_at 
BEFORE UPDATE ON app_data 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

4. اضغط **Run** أو `Ctrl+Enter`

### 4️⃣ الاتصال من التطبيق
1. في التطبيق، اذهب إلى **لوحة التحكم** → **الإعدادات وقاعدة البيانات**
2. الصق **Project URL** و **API Key**
3. اضغط **🔍 اختبار الاتصال** للتأكد
4. إذا نجح، اضغط **💾 حفظ والاتصال**

## ✅ التحقق من النجاح

بعد الاتصال، يجب أن ترى:
- ✅ رسالة "أنت متصل الآن بالسحابة!"
- 🟢 حالة "متصل" باللون الأخضر
- أزرار "رفع البيانات" و "تحديث من السحابة"

## 🔄 المزامنة التلقائية

بعد الاتصال، كل تغيير في:
- ✅ الموديلات
- ✅ الخصائص
- ✅ المواصفات

سيتم حفظه تلقائياً في السحابة!

## 🔒 ملاحظات الأمان

⚠️ **مهم:** الإعداد الحالي يسمح بالوصول العام للبيانات. للإنتاج:

1. أضف نظام مصادقة (Authentication)
2. عدّل سياسات RLS لتقييد الوصول
3. استخدم Environment Variables لحفظ المفاتيح

## 🐛 حل المشاكل

### المشكلة: "Table does not exist"
**الحل:** شغّل كود SQL في الخطوة 3

### المشكلة: "Permission denied"
**الحل:** تأكد من تشغيل سياسة RLS في كود SQL

### المشكلة: "Invalid API key"
**الحل:** تأكد من نسخ **anon/public key** وليس service_role key

## 📚 موارد إضافية

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
