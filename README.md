# Asnany — نظام إدارة عيادات الأسنان

منصة SaaS احترافية مبنية على **Next.js 15 + Supabase**.

## الميزات

- 🔐 تسجيل دخول بالإيميل والباسورد — عزل كامل بين العيادات
- 📊 لوحة تحكم متقدمة مع إحصائيات وإيرادات
- 👥 إدارة المرضى + مخطط سني SVG تفاعلي
- 📅 مواعيد + تقويم شهري
- 💰 فواتير + طباعة PDF
- 📈 تقارير شهرية
- 👨‍⚕️ صلاحيات حسب الدور (مالك، طبيب، استقبال، محاسب)
- 🔍 بحث سريع Ctrl+K
- 📱 responsive — يعمل على الجوال
- 🛡️ Super Admin — تفعيل/إيقاف العيادات
- 🖼️ رفع شعار العيادة

## الإعداد

### 1. Supabase
نفّذ بالترتيب في SQL Editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_platform_upgrade.sql`

### 2. متغيرات البيئة
```bash
cp .env.example .env.local
```

### 3. Super Admin
```sql
UPDATE profiles SET is_super_admin = true WHERE id = 'YOUR-USER-UUID';
```

### 4. تشغيل
```bash
npm install
npm run dev
```

## الإعدادات

| المتغير | الوصف |
|---------|--------|
| `NEXT_PUBLIC_ALLOW_REGISTRATION` | `false` للإنتاج (أنت تنشئ الحسابات) |
| `SUPABASE_SERVICE_ROLE_KEY` | لإضافة أعضاء الفريق |

## النشر

```bash
npm run build && npm start
```

Domain: **asnany.ps**
