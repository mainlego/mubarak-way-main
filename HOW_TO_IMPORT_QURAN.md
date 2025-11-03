# How to Import All 114 Surahs

## Problem
Database only has 5 surahs instead of all 114.

## Solution
We've added an import endpoint to populate the database with all 114 surahs from Al-Quran Cloud API.

---

## Method 1: Using API Endpoint (Recommended for Production)

### Step 1: Wait for Render Redeploy
After pushing the code changes, Render will automatically redeploy the backend. This takes about 3-5 minutes.

Check deployment status at: https://dashboard.render.com

### Step 2: Trigger the Import

Run this command in terminal:

```bash
curl -X POST "https://mubarak-way-backend.onrender.com/api/v1/quran/import-all?secret=mubarak-way-import-2025" \
  -H "Content-Type: application/json"
```

Or open this URL in browser (it will take ~12 seconds):
```
https://mubarak-way-backend.onrender.com/api/v1/quran/import-all?secret=mubarak-way-import-2025
```

### Expected Response

```json
{
  "success": true,
  "message": "All 114 surahs imported successfully",
  "data": {
    "totalSurahs": 114,
    "totalAyahs": 6236,
    "surahs": [
      {
        "number": 1,
        "name": "Al-Fatihah",
        "nameArabic": "الفاتحة",
        "ayahs": 7
      },
      ...
    ]
  }
}
```

---

## Method 2: Using NPM Script (For Local Development)

### Requirements
- MongoDB running locally or MONGODB_URI in .env
- Node.js installed

### Steps

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Create `.env` file with MongoDB URI:
```bash
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/mubarak-way-unified

# Or for production MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mubarak-way
```

4. Run the import script:
```bash
npm run import:quran
```

5. Wait for completion (~12 seconds)

### Expected Output

```
📥 Starting Quran import...
🔗 Connecting to MongoDB: mongodb://...
✅ Connected to MongoDB
🗑️  Clearing existing Quran data...
✅ Existing data cleared

📖 Importing Surah 1/114...
  ✅ Created Surah: Al-Fatihah (الفاتحة)
     - 7 ayahs
     - meccan
  ✅ Created 7 ayahs

📖 Importing Surah 2/114...
  ✅ Created Surah: Al-Baqarah (البقرة)
     - 286 ayahs
     - medinan
  ✅ Created 286 ayahs

...

📖 Importing Surah 114/114...
  ✅ Created Surah: An-Nas (الناس)
     - 6 ayahs
     - meccan
  ✅ Created 6 ayahs

============================================================
🎉 Import completed successfully!
============================================================
✅ Total Surahs imported: 114
✅ Total Ayahs imported: 6236
============================================================

🔌 Disconnected from MongoDB

✨ All done!
```

---

## Verification

### Check Database Stats

```bash
curl https://mubarak-way-backend.onrender.com/api/v1/quran/stats
```

Expected response:
```json
{
  "success": true,
  "data": {
    "totalSurahs": 114,
    "totalAyahs": 6236,
    "totalJuz": 30
  }
}
```

### Check Frontend

1. Open app: https://mubarak-way-frontend-zibs.onrender.com
2. Navigate to Quran section
3. All 114 surahs should now be visible

---

## Troubleshooting

### Error: "Invalid secret key"

The secret parameter is wrong. Use:
```
?secret=mubarak-way-import-2025
```

### Error: "Cannot POST /api/v1/quran/import-all"

The backend hasn't redeployed yet. Wait 2-3 more minutes and try again.

### Error: "502 Bad Gateway"

Render free tier puts service to sleep after 15 minutes of inactivity. Wait 30-60 seconds and try again.

### Import Succeeds But Frontend Still Shows 5 Surahs

Clear browser cache:
- Chrome: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Or open DevTools (F12) → Network tab → "Disable cache"

Then refresh the Quran page.

---

## Technical Details

### Data Source
**Al-Quran Cloud API**: https://api.alquran.cloud

### What Gets Imported
- ✅ All 114 surahs with:
  - English names (e.g., "Al-Fatihah")
  - Arabic names (e.g., "الفاتحة")
  - Transliteration
  - Number of ayahs
  - Revelation type (Meccan/Medinan)

- ✅ All 6,236 ayahs with:
  - Arabic text
  - Ayah numbers
  - Juz numbers (approximate)
  - References to parent surah

### Import Duration
- **API endpoint**: ~12 seconds (100ms delay between requests)
- **NPM script**: ~12 seconds

### Rate Limiting
Import includes 100ms delay between each surah request to avoid overwhelming the Al-Quran Cloud API.

---

## Security Note

After importing successfully, you may want to:

1. Remove the import endpoint from `backend/src/routes/quran.ts`
2. Or change the secret key in environment variables

---

## Автоматический перевод на русский

После импорта всех 114 сур, вы можете добавить русские переводы, используя:

```bash
npm run sync:quran:ereplika
```

Это добавит переводы от e-replika.ru для всех аятов.

---

**Status**: Ready to import ✅
**Last Updated**: 2025-11-03
