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

## 📄 רישיון
MIT License.
