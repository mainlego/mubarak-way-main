#!/usr/bin/env python3
"""
Script to add missing translations to JSON files
Extracts defaultValue strings from code and adds them to translation files
"""

import json
import re
import os
from pathlib import Path

# New translations to add
MISSING_TRANSLATIONS = {
    "ru": {
        "common": {
            "copy": "Копировать",
            "share": "Поделиться",
            "create": "Создать",
            "updated": "Обновлено",
            "delete": "Удалить",
            "edit": "Редактировать",
            "play": "Воспроизвести",
            "pause": "Пауза",
            "stop": "Остановить"
        },
        "library": {
            "favorite": "Избранное",
            "noFavorites": "Нет избранных нашидов",
            "artist": "Исполнитель",
            "duration": "Длительность"
        },
        "category": {
            "all": "Все",
            "spiritual": "Духовные",
            "family": "Семейные",
            "gratitude": "Благодарность",
            "prophetic": "О Пророке ﷺ",
            "tawhid": "Единобожие",
            "general": "Общие",
            "nasheed": "Нашиды",
            "anasheed": "Анашиды",
            "quranRecitation": "Чтение Корана",
            "dua": "Дуа",
            "favorite": "Избранное",
            "prophet": "О Пророке ﷺ",
            "quran": "Коран"
        },
        "playlist": {
            "myPlaylists": "Мои плейлисты",
            "createNew": "Создать новый плейлист",
            "create": "Создать",
            "addTo": "Добавить в плейлист",
            "namePlaceholder": "Название плейлиста",
            "noPlaylists": "У вас пока нет плейлистов",
            "noPlaylistsYet": "У вас пока нет плейлистов",
            "createFirst": "Создать первый плейлист",
            "confirmDelete": "Удалить плейлист?",
            "confirmRemoveTrack": "Удалить трек из плейлиста?",
            "empty": "Плейлист пуст",
            "nowPlaying": "Сейчас играет"
        },
        "nasheed": {
            "tracks": "треков"
        },
        "usage": {
            "favorites": "Избранное",
            "offline": "Офлайн",
            "remaining": "осталось",
            "unlimited": "Неограниченно",
            "of": "из",
            "upgradePrompt": "Улучшите подписку для расширения лимитов"
        },
        "upgrade": {
            "title": "Улучшить подписку",
            "favoritesLimit": {
                "title": "Лимит избранного достигнут",
                "description": "Вы достигли лимита избранных нашидов ({{limit}}). Улучшите подписку для неограниченного доступа."
            },
            "offlineLimit": {
                "title": "Лимит офлайн достигнут",
                "description": "Вы достигли лимита офлайн загрузок ({{limit}}). Улучшите подписку для неограниченного доступа."
            },
            "categoryLimit": {
                "title": "Лимит категории достигнут",
                "description": "Вы достигли лимита для категории \"{{category}}\" ({{limit}} нашидов). Улучшите подписку для снятия ограничений."
            },
            "general": {
                "title": "Расширьте возможности",
                "description": "Получите доступ ко всем функциям и контенту без ограничений."
            },
            "currentTier": "Текущий тариф",
            "month": "в месяц",
            "choose": "Выбрать",
            "current": "Текущий тариф",
            "note": "Все платежи безопасны и обрабатываются через Telegram Payments"
        },
        "network": {
            "online": "Соединение восстановлено",
            "offline": "Нет подключения",
            "workingOffline": "Работаем в офлайн режиме"
        }
    },
    "en": {
        "common": {
            "copy": "Copy",
            "share": "Share",
            "create": "Create",
            "updated": "Updated",
            "delete": "Delete",
            "edit": "Edit",
            "play": "Play",
            "pause": "Pause",
            "stop": "Stop"
        },
        "library": {
            "favorite": "Favorite",
            "noFavorites": "No favorite nashids",
            "artist": "Artist",
            "duration": "Duration"
        },
        "category": {
            "all": "All",
            "spiritual": "Spiritual",
            "family": "Family",
            "gratitude": "Gratitude",
            "prophetic": "About the Prophet ﷺ",
            "tawhid": "Tawhid",
            "general": "General",
            "nasheed": "Nasheed",
            "anasheed": "Anasheed",
            "quranRecitation": "Quran Recitation",
            "dua": "Dua",
            "favorite": "Favorites",
            "prophet": "About Prophet ﷺ",
            "quran": "Quran"
        },
        "playlist": {
            "myPlaylists": "My Playlists",
            "createNew": "Create New Playlist",
            "create": "Create",
            "addTo": "Add to Playlist",
            "namePlaceholder": "Playlist name",
            "noPlaylists": "You don't have any playlists yet",
            "noPlaylistsYet": "You don't have any playlists yet",
            "createFirst": "Create your first playlist",
            "confirmDelete": "Delete playlist?",
            "confirmRemoveTrack": "Remove track from playlist?",
            "empty": "Playlist is empty",
            "nowPlaying": "Now Playing"
        },
        "nasheed": {
            "tracks": "tracks"
        },
        "usage": {
            "favorites": "Favorites",
            "offline": "Offline",
            "remaining": "remaining",
            "unlimited": "Unlimited",
            "of": "of",
            "upgradePrompt": "Upgrade your subscription to expand limits"
        },
        "upgrade": {
            "title": "Upgrade Subscription",
            "favoritesLimit": {
                "title": "Favorites Limit Reached",
                "description": "You've reached your favorites limit ({{limit}}). Upgrade your subscription for unlimited access."
            },
            "offlineLimit": {
                "title": "Offline Limit Reached",
                "description": "You've reached your offline downloads limit ({{limit}}). Upgrade your subscription for unlimited access."
            },
            "categoryLimit": {
                "title": "Category Limit Reached",
                "description": "You've reached your limit for \"{{category}}\" category ({{limit}} nashids). Upgrade to remove restrictions."
            },
            "general": {
                "title": "Expand Your Capabilities",
                "description": "Get access to all features and content without restrictions."
            },
            "currentTier": "Current Tier",
            "month": "per month",
            "choose": "Choose",
            "current": "Current Plan",
            "note": "All payments are secure and processed through Telegram Payments"
        },
        "network": {
            "online": "Connection Restored",
            "offline": "No Connection",
            "workingOffline": "Working Offline"
        }
    },
    "ar": {
        "common": {
            "copy": "نسخ",
            "share": "مشاركة",
            "create": "إنشاء",
            "updated": "محدث",
            "delete": "حذف",
            "edit": "تعديل",
            "play": "تشغيل",
            "pause": "إيقاف مؤقت",
            "stop": "توقف",
            "language": "ar"
        },
        "library": {
            "favorite": "المفضلة",
            "noFavorites": "لا توجد أناشيد مفضلة",
            "artist": "الفنان",
            "duration": "المدة",
            "description": "مجموعة من الكتب والأناشيد الإسلامية",
            "pages": "صفحات",
            "page": "صفحة",
            "author": "المؤلف",
            "searchBooksPlaceholder": "البحث عن الكتب...",
            "searchNashidsPlaceholder": "البحث عن الأناشيد...",
            "categoryQuran": "علوم القرآن",
            "categoryHadith": "الحديث",
            "categoryFiqh": "الفقه",
            "categoryAqeedah": "العقيدة",
            "categorySeerah": "السيرة",
            "categoryDua": "الدعاء",
            "noBooksFound": "لم يتم العثور على كتب",
            "noNashidsFound": "لم يتم العثور على أناشيد",
            "loadMore": "تحميل المزيد",
            "goToPage": "الانتقال إلى الصفحة",
            "viewFullPdf": "عرض نسخة PDF كاملة",
            "openPdf": "فتح PDF",
            "bookContentPlaceholder": "محتوى الكتاب يُعرض هنا. في الإصدار الإنتاجي، سيتم تحميل محتوى الصفحة الفعلي من الخادم."
        },
        "category": {
            "all": "الكل",
            "spiritual": "روحانية",
            "family": "عائلية",
            "gratitude": "شكر",
            "prophetic": "عن النبي ﷺ",
            "tawhid": "توحيد",
            "general": "عامة",
            "nasheed": "نشيد",
            "anasheed": "أناشيد",
            "quranRecitation": "تلاوة القرآن",
            "dua": "دعاء",
            "favorite": "المفضلة",
            "prophet": "عن النبي ﷺ",
            "quran": "القرآن"
        },
        "playlist": {
            "myPlaylists": "قوائم التشغيل الخاصة بي",
            "createNew": "إنشاء قائمة تشغيل جديدة",
            "create": "إنشاء",
            "addTo": "إضافة إلى قائمة التشغيل",
            "namePlaceholder": "اسم قائمة التشغيل",
            "noPlaylists": "ليس لديك أي قوائم تشغيل بعد",
            "noPlaylistsYet": "ليس لديك أي قوائم تشغيل بعد",
            "createFirst": "إنشاء قائمة التشغيل الأولى",
            "confirmDelete": "حذف قائمة التشغيل؟",
            "confirmRemoveTrack": "إزالة المقطع من قائمة التشغيل؟",
            "empty": "قائمة التشغيل فارغة",
            "nowPlaying": "قيد التشغيل الآن"
        },
        "nasheed": {
            "tracks": "مقاطع"
        },
        "usage": {
            "favorites": "المفضلة",
            "offline": "دون اتصال",
            "remaining": "متبقي",
            "unlimited": "غير محدود",
            "of": "من",
            "upgradePrompt": "قم بترقية اشتراكك لتوسيع الحدود"
        },
        "upgrade": {
            "title": "ترقية الاشتراك",
            "favoritesLimit": {
                "title": "تم الوصول إلى حد المفضلة",
                "description": "لقد وصلت إلى حد الأناشيد المفضلة ({{limit}}). قم بترقية اشتراكك للوصول غير المحدود."
            },
            "offlineLimit": {
                "title": "تم الوصول إلى حد عدم الاتصال",
                "description": "لقد وصلت إلى حد التنزيلات دون اتصال ({{limit}}). قم بترقية اشتراكك للوصول غير المحدود."
            },
            "categoryLimit": {
                "title": "تم الوصول إلى حد الفئة",
                "description": "لقد وصلت إلى حدك لفئة \"{{category}}\" ({{limit}} نشيد). قم بالترقية لإزالة القيود."
            },
            "general": {
                "title": "وسّع قدراتك",
                "description": "احصل على الوصول إلى جميع الميزات والمحتوى بدون قيود."
            },
            "currentTier": "المستوى الحالي",
            "month": "شهرياً",
            "choose": "اختر",
            "current": "الخطة الحالية",
            "note": "جميع المدفوعات آمنة وتتم معالجتها عبر Telegram Payments"
        },
        "network": {
            "online": "تم استعادة الاتصال",
            "offline": "لا يوجد اتصال",
            "workingOffline": "العمل دون اتصال"
        },
        "prayer": {
            "description": "تعلم وأتقن صلاتك",
            "categories": "الفئات",
            "obligatoryDesc": "الصلوات الخمس المفروضة",
            "optionalDesc": "صلوات السنة والنافلة",
            "specialDesc": "صلاة العيد والجنازة والتراويح",
            "ablutionDesc": "كيفية الوضوء",
            "continueLearning": "تابع التعلم",
            "searchLessonsPlaceholder": "البحث عن الدروس...",
            "noLessonsFound": "لم يتم العثور على دروس",
            "totalLessons": "إجمالي الدروس",
            "min": "دقيقة",
            "viewAllLessons": "جميع الدروس",
            "lessonCompleted": "تم إكمال الدرس! أحسنت!",
            "tips": "نصائح",
            "videoPlaceholder": "محتوى الفيديو",
            "imagePlaceholder": "التوضيح",
            "audioPlaceholder": "تلاوة صوتية",
            "nextPrayer": "الصلاة القادمة",
            "in": "في",
            "todaysPrayers": "صلوات اليوم",
            "upcoming": "قريباً",
            "detectingLocation": "تحديد الموقع...",
            "prayerSettings": "إعدادات الصلاة",
            "calculationMethod": "طريقة الحساب",
            "prayerReminders": "تذكيرات الصلاة",
            "qiblaDirection": "اتجاه القبلة",
            "compassDisabled": "البوصلة غير مفعلة",
            "enableCompass": "تفعيل البوصلة",
            "distanceToKaaba": "المسافة إلى الكعبة",
            "yourLocation": "موقعك",
            "qiblaTip": "احمل الجهاز بشكل أفقي واستدر حتى تشير السهم الأخضر لأعلى"
        },
        "progress": {
            "learningProgress": "تقدم التعلم",
            "progress": "التقدم",
            "description": "تتبع رحلة التعلم الخاصة بك",
            "surahs": "سور مقروءة",
            "booksReading": "كتب قيد القراءة",
            "totalFavorites": "المفضلة",
            "firstLesson": "الدرس الأول",
            "firstLessonDesc": "أكمل درسك الأول في الصلاة",
            "weekStreak": "سلسلة 7 أيام",
            "weekStreakDesc": "ادرس لمدة 7 أيام متتالية",
            "tenLessons": "10 دروس",
            "tenLessonsDesc": "أكمل 10 دروس في الصلاة",
            "quranReader": "قارئ القرآن",
            "quranReaderDesc": "اقرأ 5 سور مختلفة",
            "bookLover": "محب الكتب",
            "bookLoverDesc": "اقرأ 100 صفحة",
            "aiExplorer": "مستكشف الذكاء الاصطناعي",
            "aiExplorerDesc": "اطرح 10 أسئلة على الذكاء الاصطناعي",
            "amazingStreak": "سلسلة مذهلة!",
            "amazingStreakDesc": "أنت تقوم بعمل رائع! استمر في العمل الجيد.",
            "keepGoing": "استمر!",
            "keepGoingDesc": "أنت في طريقك! لا تكسر السلسلة.",
            "startStreak": "ابدأ سلسلة التعلم الخاصة بك!",
            "startStreakDesc": "ادرس كل يوم لبناء سلسلة!"
        },
        "settings": {
            "system": "النظام",
            "description": "إدارة تفضيلاتك",
            "support": "الدعم"
        },
        "quran": {
            "bismillah": "بسم الله الرحمن الرحيم",
            "noBookmarks": "لا توجد إشارات مرجعية بعد",
            "noHistory": "سجل القراءة فارغ"
        },
        "ai": {
            "requestsRemaining": "طلبات متبقية",
            "welcomeTitle": "اسألني أي شيء عن الإسلام",
            "welcomeDescription": "يمكنني مساعدتك في فهم القرآن وشرح الآيات والإجابة على الأسئلة حول الإسلام.",
            "suggestedQuestions": "أسئلة مقترحة:",
            "explainAyahRequest": "يرجى شرح الآية {{ayahId}}"
        }
    }
}


def deep_merge(base, updates):
    """Deep merge two dictionaries"""
    for key, value in updates.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            deep_merge(base[key], value)
        else:
            base[key] = value


def update_translations():
    """Update all translation files with missing translations"""
    locales_dir = Path(__file__).parent / "src/shared/i18n/locales"

    for lang in ["ru", "en", "ar"]:
        file_path = locales_dir / f"{lang}.json"

        # Read existing translations
        with open(file_path, 'r', encoding='utf-8') as f:
            existing = json.load(f)

        # Merge with new translations
        if lang in MISSING_TRANSLATIONS:
            deep_merge(existing, MISSING_TRANSLATIONS[lang])

        # Write back with proper formatting
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(existing, f, ensure_ascii=False, indent=2)

        print(f"[OK] Updated {lang}.json")


if __name__ == "__main__":
    update_translations()
    print("\n[SUCCESS] All translation files updated successfully!")
