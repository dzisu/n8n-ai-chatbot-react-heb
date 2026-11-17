# n8n AI Chatbot React (Hebrew & RTL)

ממשק צ'אטבוט AI מתקדם בעברית עם תמיכה מלאה ב-RTL, חיבור מרובה סוכנים מול n8n webhooks, אימות משתמשים מאובטח ב-Firebase Authentication, שמירה וסנכרון בזמן אמת ב-Cloud Firestore, והפרדת הרשאות מלאה.

## 🌟 יכולות עיקריות (Key Features)

- 🔒 **אבטחה ואימות מבוסס Firebase Auth**: התחברות והרשמה מאובטחת במייל וסיסמה, ללא שמירת סיסמאות גלויות ב-Firestore או ב-localStorage.
- 🛡️ **כללי אבטחה קשיחים ב-Firestore (Security Rules)**: בידוד שיחות מלא לפי מזהה משתמש (`ownerUid`), מניעת גישה של משתמשים לשיחות של אחרים, והגבלת ניהול סוכנים למנהלי מערכת בלבד.
- 🤖 **ריבוי סוכנים (Multi-Agent Support)**: מעבר מהיר בין סוכנים מוגדרים (שוקי, סופי, מנטור קולנוע, עדנה) עם הגדרת Webhook וערכת צבעים/אייקונים ייחודיים.
- 💬 **ניהול שיחות וארכיון**: יצירה, עריכת כותרת, חיפוש, ארכוב, שחזור ומחיקה של שיחות עם סנכרון דו-כיווני בזמן אמת בין כל המכשירים.
- 📎 **קבצים מצורפים מבוקרים**: תמיכה בהעלאת קבצים ותמונות עם שמירת מטא-דאטה בלבד ב-Firestore (שם, סוג, גודל) למניעת חריגה ממגבלת 1MB של מסמכי מסד הנתונים.
- ⚡ **ביצועים וטעינה מהירה (Code Splitting)**: פיצול חבילות עם `React.lazy` ו-Vite manualChunks להקטנת נפח הטעינה הראשונית והאצת זמני התגובה.
- 🆔 **מזהים ייחודיים בתקן UUID**: יצירת מזהי שיחות והודעות באמצעות `crypto.randomUUID()`.
- 🌐 **RTL ועיצוב מודרני**: התאמה מושלמת לשפה העברית, מצב לילה (Dark Mode) ברירת מחדל, ואפשרות החלפה למצב יום.

---

## 🏗️ ארכיטקטורת המערכת (Architecture)

```
Client (React + Vite)
  │
  ├── Firebase Authentication ──► ניהול משתמשים מאובטח (Token & Credentials)
  │
  ├── Cloud Firestore ──────────► סנכרון שיחות, הודעות ופרופילים בזמן אמת
  │                               (Rules: ownerUid isolation & Admin RBAC)
  │
  └── n8n Webhook API ──────────► ניתוב ישיר לסוכני AI לפי כתובות Webhook
```

### מבנה הנתונים ב-Firestore:
1. `users/{uid}`: פרופיל משתמש הכולל שם, מייל, תפקיד (`admin` / `user`) ורשימת סוכנים מורשים (`allowedAgentIds`).
2. `agents/{agentId}`: הגדרות סוכן, תפקיד, תיאור, ואייקון (עריכה למנהלים בלבד).
3. `chat_sessions/{sessionId}`: מסמך שיחה המשויך ל-`ownerUid`, כותרת, תאריכים והודעות השיחה.

---

## 🚀 התקנה והרצה מקומית (Setup & Installation)

### דרישות קדם:
- Node.js (גרסה 18 ומעלה)
- חשבון Firebase עם פרויקט מוגדר (Firestore & Authentication)
- שרת n8n פעיל

### התקנה:
```bash
# שכפול המאגר
git clone https://github.com/dzisu/n8n-ai-chatbot-react-heb.git
cd n8n-ai-chatbot-react-heb

# התקנת תלויות
npm install

# הגדרת משתני סביבה (ראה .env.example)
cp .env.example .env
# ערוך את ערכי ה-Firebase בקובץ .env

# הרצת שרת פיתוח
npm run dev
```

### בדיקת טיפוסים ובנייה לפרודקשן:
```bash
# בדיקת טיפוסים
npm run type-check

# בנייה לפרודקשן
npm run build
```

---

## 🔒 פריסת כללי אבטחה ל-Firestore

כדי לפרוס את כללי האבטחה המעודכנים מתוך `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

ולפריסת האתר המלא ב-Firebase Hosting:
```bash
firebase deploy --only hosting
```

---

## 🔮 תוכנית לעתיד: השלמת הקשחת אבטחה ב-Firebase (Future Roadmap)

### רקע והצורך באבטחה:
כיום, אפליקציית ה-React מתקשרת ישירות מדפדפן הלקוח מול ה-Webhooks של n8n.
כאשר שרתי n8n דורשים אימות (כגון Header Auth או מפתחות API סודיים), לא נכון להטמיע מפתחות סודיים אלה בתוך קוד ה-Frontend (React). כל ערך המועבר מדפדפן הלקוח חשוף למשתמשים דרך כלי המפתחים (Browser DevTools / Network tab), מה שהופך את הסוד לציבורי בפועל ומאפשר שימוש לא מורשה ב-Webhook.

### הפתרון המתוכנן (Architecture Hardening):
חיבור שכבת Backend מאובטחת באמצעות **Firebase Cloud Functions** (או שירות Proxy מנוהל כגון Cloudflare Worker):
1. **הפרדת תחומי אחריות וסודיות:** קוד ה-React בצד הלקוח יפנה לנקודת קצה מוגנת בפרויקט Firebase (למשל נתיב `/api/chat` או Callable Function), כשהוא מאומת ומאובטח באמצעות ה-Firebase Auth ID Token של המשתמש המחובר.
2. **החזקת סודות בצד שרת בלבד:** פונקציית ה-Cloud Function תחזיק את סודות האימות (Header Auth / Secret Keys של n8n) בתוך מנגנון ניהול סודות מאובטח (Environment Secrets / Secret Manager) של Firebase ו-Google Cloud.
3. **ניתוב ופרוקסי מאובטח:** הפונקציה תאמת את הרשאות המשתמש, תצרף את ה-Header Auth הנדרש ותעביר את הבקשה ל-Webhook של n8n בצורה מאובטחת.
4. **תאימות ל-Cloudflare:** ה-Webhook ב-n8n יוגדר עם Header Auth מלא וייפתח עבורו חריג Cloudflare מדויק לנתיב הייעודי בלבד.

> **סטטוס נוכחי:** תוכנית עתידית להטמעה בעת שדרוג תוכנית ה-Firebase (Blaze Plan) או בעת הצורך בהקשחת סביבות ייצור חיצוניות. כרגע לא מבוצע בפועל.

---

## 📄 רישיון
MIT License.
