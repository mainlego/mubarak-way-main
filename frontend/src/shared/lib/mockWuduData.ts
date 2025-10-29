/**
 * Mock data for Wudu (Ablution) sections
 */

import type { I18nContent } from '@shared/types';

export interface WuduStep {
  id: string;
  step_no: number;
  title_i18n: I18nContent;
  description_i18n: I18nContent;
  arabic_text?: string;
  translit_text?: string;
  notes_i18n?: I18nContent;
}

export interface WuduSection {
  id: string;
  type: 'taharat' | 'ghusl' | 'tayammum';
  title_i18n: I18nContent;
  description_i18n: I18nContent;
  steps: WuduStep[];
}

const createI18n = (ru: string, en: string, ar: string): I18nContent => ({
  ru,
  en,
  ar,
});

// Taharat (Wudu) steps - 11 steps
const taharatSteps: WuduStep[] = [
  {
    id: 'taharat-1',
    step_no: 1,
    title_i18n: createI18n('Намерение (Ният)', 'Intention (Niyyah)', 'النية'),
    description_i18n: createI18n(
      'Намерьтесь совершить малое омовение (вуду) ради Аллаха',
      'Intend to perform ablution (wudu) for the sake of Allah',
      'انوِ الوضوء لوجه الله تعالى'
    ),
    notes_i18n: createI18n(
      'Намерение делается в сердце, произносить вслух не обязательно',
      'The intention is made in the heart, it is not necessary to say it aloud',
      'النية في القلب، ولا يجب النطق بها'
    ),
  },
  {
    id: 'taharat-2',
    step_no: 2,
    title_i18n: createI18n('Бисмиллях', 'Bismillah', 'بسم الله'),
    description_i18n: createI18n(
      'Произнесите "Бисмилляхи-р-Рахмани-р-Рахим"',
      'Say "Bismillahi-r-Rahmani-r-Rahim"',
      'قل بسم الله الرحمن الرحيم'
    ),
    arabic_text: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ',
    translit_text: 'Bismillahi-r-Rahmani-r-Rahim',
  },
  {
    id: 'taharat-3',
    step_no: 3,
    title_i18n: createI18n('Мытьё кистей рук', 'Washing hands', 'غسل اليدين'),
    description_i18n: createI18n(
      'Вымойте обе кисти рук до запястья три раза',
      'Wash both hands up to the wrists three times',
      'اغسل كلتا اليدين إلى الرسغين ثلاث مرات'
    ),
    notes_i18n: createI18n(
      'Промывайте между пальцами, убедитесь что вода достигла всех участков',
      'Wash between fingers, make sure water reaches all areas',
      'اغسل بين الأصابع، وتأكد من وصول الماء لجميع المناطق'
    ),
  },
  {
    id: 'taharat-4',
    step_no: 4,
    title_i18n: createI18n('Полоскание рта', 'Rinsing mouth', 'المضمضة'),
    description_i18n: createI18n(
      'Прополощите рот три раза',
      'Rinse your mouth three times',
      'تمضمض ثلاث مرات'
    ),
    notes_i18n: createI18n(
      'Используйте правую руку для набора воды',
      'Use your right hand to take water',
      'استخدم يدك اليمنى لأخذ الماء'
    ),
  },
  {
    id: 'taharat-5',
    step_no: 5,
    title_i18n: createI18n('Промывание носа', 'Rinsing nose', 'الاستنشاق'),
    description_i18n: createI18n(
      'Промойте нос три раза, втягивая воду и выдувая её',
      'Rinse your nose three times by inhaling water and blowing it out',
      'استنشق الماء في أنفك ثلاث مرات ثم استنثر'
    ),
  },
  {
    id: 'taharat-6',
    step_no: 6,
    title_i18n: createI18n('Мытьё лица', 'Washing face', 'غسل الوجه'),
    description_i18n: createI18n(
      'Вымойте лицо три раза (от линии роста волос до подбородка, от уха до уха)',
      'Wash your face three times (from hairline to chin, from ear to ear)',
      'اغسل وجهك ثلاث مرات من منابت الشعر إلى الذقن ومن الأذن إلى الأذن'
    ),
  },
  {
    id: 'taharat-7',
    step_no: 7,
    title_i18n: createI18n('Мытьё рук до локтей', 'Washing arms', 'غسل اليدين إلى المرفقين'),
    description_i18n: createI18n(
      'Вымойте правую руку до локтя три раза, затем левую руку три раза',
      'Wash right arm up to elbow three times, then left arm three times',
      'اغسل اليد اليمنى إلى المرفق ثلاث مرات، ثم اليد اليسرى ثلاث مرات'
    ),
    notes_i18n: createI18n(
      'Начинайте с правой стороны. Убедитесь что вода достигла локтя',
      'Start with the right side. Make sure water reaches the elbow',
      'ابدأ باليمين. تأكد من وصول الماء إلى المرفق'
    ),
  },
  {
    id: 'taharat-8',
    step_no: 8,
    title_i18n: createI18n('Протирание головы (масх)', 'Wiping head (Mash)', 'مسح الرأس'),
    description_i18n: createI18n(
      'Протрите мокрыми руками голову один раз от макушки к затылку',
      'Wipe your head with wet hands once from front to back',
      'امسح رأسك بيديك المبللتين مرة واحدة من الأمام إلى الخلف'
    ),
  },
  {
    id: 'taharat-9',
    step_no: 9,
    title_i18n: createI18n('Протирание ушей', 'Wiping ears', 'مسح الأذنين'),
    description_i18n: createI18n(
      'Протрите внутреннюю часть ушей указательными пальцами, а внешнюю — большими пальцами',
      'Wipe inside of ears with index fingers and outside with thumbs',
      'امسح داخل الأذنين بالسبابتين وخارجهما بالإبهامين'
    ),
  },
  {
    id: 'taharat-10',
    step_no: 10,
    title_i18n: createI18n('Мытьё стоп', 'Washing feet', 'غسل القدمين'),
    description_i18n: createI18n(
      'Вымойте правую стопу до щиколотки три раза, затем левую стопу три раза',
      'Wash right foot up to ankle three times, then left foot three times',
      'اغسل القدم اليمنى إلى الكعبين ثلاث مرات، ثم القدم اليسرى ثلاث مرات'
    ),
    notes_i18n: createI18n(
      'Промывайте между пальцами ног. Начинайте с мизинца правой ноги',
      'Wash between toes. Start with little toe of right foot',
      'اغسل بين الأصابع. ابدأ بخنصر القدم اليمنى'
    ),
  },
  {
    id: 'taharat-11',
    step_no: 11,
    title_i18n: createI18n('Дуа после вуду', 'Dua after wudu', 'دعاء بعد الوضوء'),
    description_i18n: createI18n(
      'Произнесите дуа после завершения омовения',
      'Recite the dua after completing ablution',
      'اقرأ الدعاء بعد إتمام الوضوء'
    ),
    arabic_text: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    translit_text: 'Ash-hadu an la ilaha illa-Llahu wahdahu la sharika lah, wa ash-hadu anna Muhammadan \'abduhu wa rasuluh',
    notes_i18n: createI18n(
      'Это дуа открывает все восемь врат Рая',
      'This dua opens all eight gates of Paradise',
      'هذا الدعاء يفتح أبواب الجنة الثمانية'
    ),
  },
];

// Ghusl (Major Ablution) steps - 8 steps
const ghuslSteps: WuduStep[] = [
  {
    id: 'ghusl-1',
    step_no: 1,
    title_i18n: createI18n('Намерение', 'Intention', 'النية'),
    description_i18n: createI18n(
      'Намерьтесь совершить полное омовение (гусль) для очищения от большой нечистоты',
      'Intend to perform major ablution (ghusl) to purify from major impurity',
      'انوِ الغسل لرفع الحدث الأكبر'
    ),
  },
  {
    id: 'ghusl-2',
    step_no: 2,
    title_i18n: createI18n('Бисмиллях', 'Bismillah', 'بسم الله'),
    description_i18n: createI18n(
      'Произнесите "Бисмилляхи-р-Рахмани-р-Рахим"',
      'Say "Bismillahi-r-Rahmani-r-Rahim"',
      'قل بسم الله الرحمن الرحيم'
    ),
    arabic_text: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ',
    translit_text: 'Bismillahi-r-Rahmani-r-Rahim',
  },
  {
    id: 'ghusl-3',
    step_no: 3,
    title_i18n: createI18n('Мытьё рук и частей тела', 'Washing hands and private parts', 'غسل اليدين والفرج'),
    description_i18n: createI18n(
      'Вымойте кисти рук три раза и очистите интимные места',
      'Wash hands three times and clean private parts',
      'اغسل كفيك ثلاث مرات ونظف الفرج'
    ),
  },
  {
    id: 'ghusl-4',
    step_no: 4,
    title_i18n: createI18n('Совершить вуду', 'Perform wudu', 'الوضوء'),
    description_i18n: createI18n(
      'Совершите полное малое омовение (вуду), кроме мытья ног (их помоете в конце)',
      'Perform complete ablution (wudu), except washing feet (wash them at the end)',
      'توضأ وضوءاً كاملاً إلا غسل القدمين (تغسلهما في النهاية)'
    ),
  },
  {
    id: 'ghusl-5',
    step_no: 5,
    title_i18n: createI18n('Полить воду на голову три раза', 'Pour water over head three times', 'صب الماء على الرأس ثلاثاً'),
    description_i18n: createI18n(
      'Полейте водой на голову три раза, убедившись что вода достигла корней волос',
      'Pour water over head three times, ensuring it reaches the roots',
      'صب الماء على رأسك ثلاث مرات مع التأكد من وصوله إلى أصول الشعر'
    ),
  },
  {
    id: 'ghusl-6',
    step_no: 6,
    title_i18n: createI18n('Омыть правую сторону тела', 'Wash right side of body', 'غسل الجانب الأيمن'),
    description_i18n: createI18n(
      'Полейте водой и протрите всю правую сторону тела',
      'Pour water and wipe entire right side of body',
      'صب الماء وامسح الجانب الأيمن من جسدك بالكامل'
    ),
  },
  {
    id: 'ghusl-7',
    step_no: 7,
    title_i18n: createI18n('Омыть левую сторону тела', 'Wash left side of body', 'غسل الجانب الأيسر'),
    description_i18n: createI18n(
      'Полейте водой и протрите всю левую сторону тела',
      'Pour water and wipe entire left side of body',
      'صب الماء وامسح الجانب الأيسر من جسدك بالكامل'
    ),
  },
  {
    id: 'ghusl-8',
    step_no: 8,
    title_i18n: createI18n('Помыть стопы', 'Wash feet', 'غسل القدمين'),
    description_i18n: createI18n(
      'Вымойте обе стопы до щиколоток',
      'Wash both feet up to ankles',
      'اغسل كلتا القدمين إلى الكعبين'
    ),
  },
];

// Tayammum (Dry Ablution) steps - 6 steps
const tayammumSteps: WuduStep[] = [
  {
    id: 'tayammum-1',
    step_no: 1,
    title_i18n: createI18n('Намерение', 'Intention', 'النية'),
    description_i18n: createI18n(
      'Намерьтесь совершить таяммум вместо вуду или гусля',
      'Intend to perform tayammum instead of wudu or ghusl',
      'انوِ التيمم بدلاً من الوضوء أو الغسل'
    ),
    notes_i18n: createI18n(
      'Таяммум совершается когда нет возможности использовать воду',
      'Tayammum is performed when water is unavailable',
      'يُجرى التيمم عند عدم توفر الماء'
    ),
  },
  {
    id: 'tayammum-2',
    step_no: 2,
    title_i18n: createI18n('Бисмиллях', 'Bismillah', 'بسم الله'),
    description_i18n: createI18n(
      'Произнесите "Бисмилляхи-р-Рахмани-р-Рахим"',
      'Say "Bismillahi-r-Rahmani-r-Rahim"',
      'قل بسم الله الرحمن الرحيم'
    ),
    arabic_text: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ',
    translit_text: 'Bismillahi-r-Rahmani-r-Rahim',
  },
  {
    id: 'tayammum-3',
    step_no: 3,
    title_i18n: createI18n('Ударить руками о чистую землю/песок/камень', 'Strike hands on clean earth/sand/stone', 'الضرب بالكفين على التراب'),
    description_i18n: createI18n(
      'Легко ударьте обеими руками (ладонями) о чистую землю, песок, камень или пыль',
      'Lightly strike both hands (palms) on clean earth, sand, stone or dust',
      'اضرب بكفيك على التراب أو الرمل أو الحجر الطاهر ضربة خفيفة'
    ),
  },
  {
    id: 'tayammum-4',
    step_no: 4,
    title_i18n: createI18n('Протереть лицо', 'Wipe face', 'مسح الوجه'),
    description_i18n: createI18n(
      'Протрите всё лицо обеими руками один раз',
      'Wipe entire face with both hands once',
      'امسح وجهك بكلتا يديك مرة واحدة'
    ),
  },
  {
    id: 'tayammum-5',
    step_no: 5,
    title_i18n: createI18n('Ударить руками снова', 'Strike hands again', 'الضرب بالكفين مرة أخرى'),
    description_i18n: createI18n(
      'Снова легко ударьте обеими руками о чистую землю',
      'Lightly strike both hands on clean earth again',
      'اضرب بكفيك على التراب الطاهر مرة أخرى'
    ),
  },
  {
    id: 'tayammum-6',
    step_no: 6,
    title_i18n: createI18n('Протереть руки до локтей', 'Wipe arms to elbows', 'مسح اليدين إلى المرفقين'),
    description_i18n: createI18n(
      'Протрите левой рукой правую руку до локтя, затем правой рукой левую руку до локтя',
      'Wipe right arm to elbow with left hand, then left arm to elbow with right hand',
      'امسح اليد اليمنى إلى المرفق باليسرى، ثم اليد اليسرى إلى المرفق باليمنى'
    ),
  },
];

export const mockWuduData: WuduSection[] = [
  {
    id: 'taharat',
    type: 'taharat',
    title_i18n: createI18n('Вуду (Малое омовение)', 'Wudu (Minor Ablution)', 'الوضوء'),
    description_i18n: createI18n(
      'Ритуальное омовение, необходимое перед намазом',
      'Ritual ablution required before prayer',
      'الطهارة المائية الصغرى المطلوبة قبل الصلاة'
    ),
    steps: taharatSteps,
  },
  {
    id: 'ghusl',
    type: 'ghusl',
    title_i18n: createI18n('Гусль (Полное омовение)', 'Ghusl (Major Ablution)', 'الغسل'),
    description_i18n: createI18n(
      'Полное ритуальное омовение всего тела',
      'Complete ritual washing of the entire body',
      'الاغتسال الكامل للجسد'
    ),
    steps: ghuslSteps,
  },
  {
    id: 'tayammum',
    type: 'tayammum',
    title_i18n: createI18n('Таяммум (Сухое омовение)', 'Tayammum (Dry Ablution)', 'التيمم'),
    description_i18n: createI18n(
      'Альтернативное омовение при отсутствии воды',
      'Alternative purification when water is unavailable',
      'الطهارة البديلة عند عدم توفر الماء'
    ),
    steps: tayammumSteps,
  },
];
