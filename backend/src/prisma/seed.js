/**
 * NEWS.UZ — Database Seed
 * Admin + Kategoriyalar + Har bir kategoriyaga 3 ta maqola
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Slug yaratuvchi funksiya
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

async function main() {
  console.log('🌱 NEWS.UZ bazasi to\'ldirilmoqda...\n')

  // ─── ADMIN YARATISH ──────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 12)

  const admin = await prisma.user.upsert({
    where:  { email: 'admin@news.uz' },
    update: {},
    create: {
      email:        'admin@news.uz',
      username:     'admin',
      fullName:     'Bosh Muharrir',
      passwordHash,
      role:         'SUPER_ADMIN',
      isActive:     true,
      isVerified:   true,
    },
  })
  console.log('✅ Admin yaratildi:', admin.email)

  // ─── ASOSIY KATEGORIYALAR ────────────────────────────────
  const parentCats = [
    { name: "O'zbekiston", nameUz: "O'zbekiston", slug: 'uzbekistan', color: '#1D6FA4', icon: '🇺🇿', order: 1 },
    { name: 'Dunyo',       nameUz: 'Dunyo',       slug: 'world',      color: '#2563EB', icon: '🌍', order: 2 },
    { name: 'Sport',       nameUz: 'Sport',       slug: 'sport',      color: '#DC2626', icon: '⚽', order: 3 },
    { name: 'Texnologiya', nameUz: 'Texnologiya', slug: 'technology', color: '#7C3AED', icon: '💻', order: 4 },
    { name: 'Iqtisodiyot', nameUz: 'Iqtisodiyot', slug: 'economy',   color: '#059669', icon: '📈', order: 5 },
    { name: 'Auto',        nameUz: 'Auto',        slug: 'auto',       color: '#D97706', icon: '🚗', order: 6 },
    { name: 'Madaniyat',   nameUz: 'Madaniyat',   slug: 'culture',   color: '#EC4899', icon: '🎭', order: 7 },
    { name: 'Video',       nameUz: 'Video',       slug: 'video',      color: '#EF4444', icon: '📹', order: 8 },
  ]

  const cats = {}
  for (const cat of parentCats) {
    const c = await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: cat,
    })
    cats[cat.slug] = c
    console.log(`  📁 ${cat.icon} ${cat.name}`)
  }

  // ─── ICHKI KATEGORIYALAR ─────────────────────────────────
  const subCats = [
    { name: 'Siyosat',        nameUz: 'Siyosat',        slug: 'politics',       parentId: cats['uzbekistan'].id, color: '#1D6FA4', order: 1 },
    { name: 'Jamiyat',        nameUz: 'Jamiyat',        slug: 'society',        parentId: cats['uzbekistan'].id, color: '#1D6FA4', order: 2 },
    { name: 'Xalqaro',        nameUz: 'Xalqaro',        slug: 'international',  parentId: cats['world'].id,      color: '#2563EB', order: 1 },
    { name: 'Yevropa',        nameUz: 'Yevropa',        slug: 'europe',         parentId: cats['world'].id,      color: '#2563EB', order: 2 },
    { name: 'Futbol',         nameUz: 'Futbol',         slug: 'football',       parentId: cats['sport'].id,      color: '#DC2626', order: 1 },
    { name: 'UFC',            nameUz: 'UFC',            slug: 'ufc',            parentId: cats['sport'].id,      color: '#DC2626', order: 2 },
    { name: "Sun'iy intellekt", nameUz: "Sun'iy intellekt", slug: 'ai',         parentId: cats['technology'].id, color: '#7C3AED', order: 1 },
    { name: 'Gadgetlar',      nameUz: 'Gadgetlar',      slug: 'gadgets',        parentId: cats['technology'].id, color: '#7C3AED', order: 2 },
    { name: 'Biznes',         nameUz: 'Biznes',         slug: 'business',       parentId: cats['economy'].id,    color: '#059669', order: 1 },
    { name: 'Moliya',         nameUz: 'Moliya',         slug: 'finance',        parentId: cats['economy'].id,    color: '#059669', order: 2 },
    { name: 'Kino',           nameUz: 'Kino',           slug: 'movies',         parentId: cats['culture'].id,    color: '#EC4899', order: 1 },
    { name: 'Musiqa',         nameUz: 'Musiqa',         slug: 'music',          parentId: cats['culture'].id,    color: '#EC4899', order: 2 },
  ]

  for (const sub of subCats) {
    await prisma.category.upsert({
      where:  { slug: sub.slug },
      update: {},
      create: sub,
    })
  }
  console.log(`\n✅ ${subCats.length} ta ichki kategoriya qo'shildi`)

  // ─── TAGLAR ──────────────────────────────────────────────
  const tagList = [
    { name: "O'zbekiston", slug: 'ozbekiston' },
    { name: 'Toshkent',    slug: 'toshkent'   },
    { name: 'Mirziyoyev',  slug: 'mirziyoyev' },
    { name: 'Samarqand',   slug: 'samarqand'  },
    { name: 'UEFA',        slug: 'uefa'        },
    { name: 'NBA',         slug: 'nba'         },
    { name: 'AI',          slug: 'ai'          },
    { name: 'Apple',       slug: 'apple'       },
    { name: 'Tesla',       slug: 'tesla'       },
    { name: 'Dollar',      slug: 'dollar'      },
    { name: 'Kripto',      slug: 'kripto'      },
    { name: 'Jahon kubogi', slug: 'world-cup'  },
  ]

  const tags = {}
  for (const tag of tagList) {
    const t = await prisma.tag.upsert({
      where:  { slug: tag.slug },
      update: {},
      create: tag,
    })
    tags[tag.slug] = t
  }
  console.log(`✅ ${tagList.length} ta tag qo'shildi\n`)

  // ─── MAQOLALAR ───────────────────────────────────────────
  console.log('📰 Maqolalar qo\'shilmoqda...\n')

  const articles = [

    // ════════ O'ZBEKISTON ════════
    {
      title:      "Toshkent shahri 2030-yilgacha yangi master-plan bilan rivojlanadi",
      excerpt:    "Poytaxtimizning kelajak qiyofasi, yangi turar-joy massivlari va zamonaviy transport tizimi.",
      content: `<h2>Toshkent kelajak shahri</h2>
<p>O'zbekiston hukumati Toshkent shahrining 2030-yilgacha bo'lgan rivojlanish master-planini tasdiqladi. Ushbu hujjat bo'yicha shahar chegaralari kengaytiriladi va yangi ko'kalamzorlashtirish loyihalari amalga oshiriladi.</p>
<h2>Asosiy yo'nalishlar</h2>
<p>Master-planga ko'ra, poytaxtda 50 mingdan ortiq yangi uy-joy birliklari quriladi. Bundan tashqari, metro tarmog'i 3 ta yangi yo'nalish bilan to'ldirilishi rejalashtirilmoqda.</p>
<blockquote>Bu loyiha Toshkentni Markaziy Osiyoning eng zamonaviy shahriga aylantiradi — dedi shahar hokimi.</blockquote>
<p>Shuningdek, ekologik masalaga alohida e'tibor qaratildi. Har bir yangi qurilish loyihasida yashil maydon hissasi kamida 30 foiz bo'lishi majburiy.</p>
<h2>Moliyalashtirish</h2>
<p>Loyiha uchun 15 milliard dollar mablag' ajratish ko'zda tutilmoqda. Shundan 40 foizi xorijiy investorlar hissasi tashkil etadi.</p>`,
      categoryId:  cats['uzbekistan'].id,
      coverImage:  'https://images.unsplash.com/photo-1599458252573-56ae36120de1?w=1280&q=80',
      isFeatured:  true,
      isBreaking:  false,
      viewCount:   12430,
      tagIds:      [tags['toshkent'].id, tags['ozbekiston'].id],
    },
    {
      title:      "O'zbekistonda yangi elektr stansiyasi qurilishi boshlandi",
      excerpt:    "Sirdaryo viloyatida 1200 megavatt quvvatga ega issiqlik elektr stansiyasi qurilishi rasman boshlandi.",
      content: `<h2>Yangi energetika loyihasi</h2>
<p>O'zbekiston energetika vazirligining ma'lumotiga ko'ra, Sirdaryo viloyatida yangi issiqlik elektr stansiyasi qurilishi 2024-yil mart oyida boshlandi.</p>
<p>Stansiyaning qurilishi yakunlangach, yiliga 9 milliard kVt/soat elektr energiyasi ishlab chiqariladi. Bu hozirgi yetishmovchilikni to'liq bartaraf etishga yordam beradi.</p>
<h2>Texnologiya</h2>
<p>Germaniyaning Siemens kompaniyasi tomonidan yetkazib beriladigan zamonaviy turbinalar o'rnatiladi. Ushbu turbinalar an'anaviy usullarga nisbatan 40 foiz samaraliroq ishlaydi.</p>
<p>Loyiha 2026-yilda to'liq ishga tushirilishi kutilmoqda va bu O'zbekistonning energetik mustaqilligini ta'minlashda muhim qadam bo'ladi.</p>`,
      categoryId: cats['uzbekistan'].id,
      coverImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1280&q=80',
      isFeatured: false,
      viewCount:  8750,
      tagIds:     [tags['ozbekiston'].id],
    },
    {
      title:      "Samarqandda xalqaro turizm forumlari soni rekord darajaga yetdi",
      excerpt:    "2024-yilda Samarqandga 3 million chet el sayyohi tashrif buyurdi — tarixiy rekord.",
      content: `<h2>Samarqand — turizm markazi</h2>
<p>O'zbekiston Turizm agentligining hisobotiga ko'ra, 2024-yilda Samarqand shahriga 3 million nafar xorijiy mehmon tashrif buyurdi. Bu o'tgan yilga nisbatan 47 foizga ko'pdir.</p>
<p>Eng ko'p sayyohlar Xitoy, Rossiya, Germaniya, Janubiy Koreya va AQShdan keldi. Registon, Shohizinda va Bibi-Xonim majmualari eng mashhur manzillar bo'lib qolmoqda.</p>
<h2>Iqtisodiy ta'sir</h2>
<p>Turizm sohasidan tushgan daromad 850 million dollarni tashkil etdi. Shahrda 40 ta yangi mehmonxona qurildi va 12 000 yangi ish o'rni yaratildi.</p>
<blockquote>Samarqand — dunyoning yetakchi turizm shahrlari qatoriga kirdi — dedi Turizm agentligi rahbari.</blockquote>`,
      categoryId: cats['uzbekistan'].id,
      coverImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1280&q=80',
      isFeatured: false,
      isBreaking: true,
      viewCount:  15200,
      tagIds:     [tags['samarqand'].id, tags['ozbekiston'].id],
    },

    // ════════ DUNYO ════════
    {
      title:      "G7 sammitida sun'iy intellektni tartibga solish bo'yicha yangi kelishuv imzolandi",
      excerpt:    "Yetakchi davlatlar AI texnologiyalarini xavfsiz rivojlantirish bo'yicha tarixiy hujjatni imzoladilar.",
      content: `<h2>Tarixiy kelishuv</h2>
<p>G7 mamlakatlari rahbarlari Italiyada bo'lib o'tgan sammitda sun'iy intellektni tartibga soluvchi global ramkani imzoladilar. Hujjat 2025-yil yanvaridan kuchga kiradi.</p>
<p>Kelishuvga ko'ra, barcha G7 davlatlari AI tizimlarini sertifikatlash va tekshiruvdan o'tkazish mexanizmlarini joriy etishi shart. Fuqarolarning huquqlarini buzadigan AI tizimlari ishlab chiqarishga qat'iy cheklovlar qo'yiladi.</p>
<h2>Asosiy qoidalar</h2>
<p>Hujjatda AI tizimlari shaffof, adolatli va inson nazoratiga tobe bo'lishi zarurligi ta'kidlangan. Shuningdek, harbiy maqsadlarda avtonom qurollar ishlab chiqarishga moratoriy e'lon qilindi.</p>
<p>Ekspertlar bu kelishuvni texnologiya tarixidagi eng muhim xalqaro hujjatlardan biri deb baholamoqda.</p>`,
      categoryId: cats['world'].id,
      coverImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1280&q=80',
      isFeatured: true,
      viewCount:  22100,
      tagIds:     [tags['ai'].id],
    },
    {
      title:      "Yevropada eng katta quyosh elektr stansiyasi ishga tushirildi",
      excerpt:    "Ispaniyada 2.5 gigavatt quvvatli quyosh elektr stansiyasi 1 million oilani elektr bilan ta'minlaydi.",
      content: `<h2>Yevropa yashil energetikada yangi rekord</h2>
<p>Ispaniyaning Murcia viloyatida Yevropaning eng yirik quyosh elektr stansiyasi rasman ishga tushirildi. 2.5 gigavatt quvvatga ega ushbu stansiya 1 million uyni elektr energiyasi bilan ta'minlay oladi.</p>
<p>1,200 gektar maydonda joylashgan stansiyada 4 milliondan ortiq quyosh paneli o'rnatilgan. Loyiha 5 yil davomida qurilib, unga 3 milliard evro sarflandi.</p>
<h2>Ekologik foyda</h2>
<p>Stansiya yiliga 2.1 million tonna CO2 chiqindisini kamaytiradi. Bu 500,000 avtomobilni yo'ldan olib tashlashga teng.</p>
<blockquote>Bu Yevropa yashil kelajak sari ulkan qadamdir — dedi Ispaniya energetika vaziri.</blockquote>`,
      categoryId: cats['world'].id,
      coverImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1280&q=80',
      isFeatured: false,
      viewCount:  9800,
      tagIds:     [],
    },
    {
      title:      "Yaponiya 2025-yildan elektr avtomobillarga o'tishni majburiy qiladi",
      excerpt:    "Yaponiya parlamenti benzinli avtomobillarni bosqichma-bosqich bekor qilish to'g'risida qonun qabul qildi.",
      content: `<h2>Yaponiyada avtomobil inqilobi</h2>
<p>Yaponiya parlamenti 2025-yildan boshlab yangi benzinli avtomobillar sotuvini cheklash to'g'risida qonun qabul qildi. 2035-yilga kelib barcha yangi avtomobillar elektr bo'lishi shart bo'ladi.</p>
<p>Toyota, Honda va Nissan allaqachon elektr avtomobillarga katta investitsiya kiritishni e'lon qildi. Uchala kompaniya birgalikda 50 milliard dollar sarflashni rejalashtirmoqda.</p>
<h2>Iste'molchilar uchun imtiyozlar</h2>
<p>Hukumat elektr avtomobil xaridorlariga 500,000 yen (3,500 dollar) subsidiya beradi. Zaryadlash infratuzilmasiga 2 trillion yen ajratildi.</p>
<p>Ekspertlar bu qaror Yaponiyani 2050-yilga kelib uglerод neytral mamlakatga aylantiradi deb taxmin qilmoqda.</p>`,
      categoryId: cats['world'].id,
      coverImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1280&q=80',
      isFeatured: false,
      viewCount:  11400,
      tagIds:     [tags['tesla'].id],
    },

    // ════════ SPORT ════════
    {
      title:      "Real Madrid UEFA Chempionlar ligasida yana tarixiy g'alaba qozondi",
      excerpt:    "Ispaniyalik gigant to'liq finalda raqibini 3:1 hisobda mag'lub etib, 16-marta Chempionlar ligasi kubogini qo'lga kiritdi.",
      content: `<h2>Real Madrid tarixga kirdi</h2>
<p>UEFA Chempionlar ligasi finali Parij Stade de France stadionida bo'lib o'tdi. Real Madrid raqibini 3:1 hisobda yengib, rekordchi 16-marta Yevropaning eng nufuzli kubogini qo'lga kiritdi.</p>
<p>Kylian Mbappe hat-trik qildi — 23, 67 va 89-daqiqalarda gol urdi. Bu Mbappe karrierasidagi birinchi final goli edi.</p>
<h2>O'yin tahlili</h2>
<p>Madrид o'yinning birinchi yarmida ustunlikni yo'qotdi, ammo tanaffustan so'ng yangi taktika bilan raqibni bosib oldi. Vinicius Junior va Bellingham ham yorqin o'yin ko'rsatdi.</p>
<blockquote>Bu klub tarixining eng yaxshi mavsumidir — dedi bosh murabbiy Carlo Ancelotti.</blockquote>
<p>Stadionni to'ldirgan 80,000 tomoshabin g'alabani katta shov-shuv bilan nishonladi. Ispaniyada butun mamlakat bo'ylab bayram tantanalari bo'lib o'tdi.</p>`,
      categoryId: cats['sport'].id,
      coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1280&q=80',
      isFeatured: true,
      isBreaking: false,
      viewCount:  45200,
      tagIds:     [tags['uefa'].id, tags['world-cup'].id],
    },
    {
      title:      "O'zbek bokschi jahon chempioni unvoniga ega bo'ldi",
      excerpt:    "Bahodir Jalolov professional boks tarixida o'zbekistonlik sifatida birinchi marta jahon chempioniga aylandi.",
      content: `<h2>Bahodir Jalolov — Jahon chempioni</h2>
<p>Las-Vegasdagi MGM Grand Gardenda bo'lib o'tgan tarixiy jangda Bahodir Jalolov amerikalik raqibini 12 raundda yengib, WBA og'ir vazn toifasida jahon chempioni unvonini qo'lga kiritdi.</p>
<p>O'zbekistonlik bokschi 6:0 professional yutuq nisbati bilan ringga chiqdi va ushbu jangovar kechada o'z mahoratini isbotladi. Sudyalar hisobida 115:113, 116:112, 116:112 natijalar qayd etildi.</p>
<h2>Tarix</h2>
<p>Bu O'zbekiston boksi tarixidagi eng ulkan yutuqlardan biri. Jalolov ikki Olimpiada o'yinlarida oltin medal sohibi bo'lib, endi professional boksda ham cho'qqiga chiqdi.</p>
<p>O'zbekiston Prezidenti g'olibni shaxsan tabriklab, unga "Do'stlik" ordeni berishni e'lon qildi.</p>`,
      categoryId: cats['sport'].id,
      coverImage: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1280&q=80',
      isFeatured: false,
      isBreaking: true,
      viewCount:  38900,
      tagIds:     [tags['ozbekiston'].id],
    },
    {
      title:      "NBA: Golden State Warriors yangi rekord o'rnatdi",
      excerpt:    "Steph Curry 3 ochkolik urinishlar bo'yicha NBA rekordini yangiladi va o'yinni g'alaba bilan yakunladi.",
      content: `<h2>Curry yana tarixga kirdi</h2>
<p>Golden State Warriors bilan Sacramento Kings o'rtasidagi o'yinda Steph Curry NBA tarixida eng ko'p 3 ochkolik urinish rekordini yangiladi. U o'yinda 14 ta 3 ochkolik to'p kiritdi.</p>
<p>Warriors bu o'yinni 142:128 hisobda yengib, Gарбiy konferentsiya birinchiligini mustahkamladi. Curry jami 54 ochko to'pladi.</p>
<h2>Jamoaning holati</h2>
<p>Warriors hozirda 68 g'alaba va 14 mag'lubiyat bilan mavsumni davom ettirmoqda. Pley-off bosqichida ularga kuchli raqiblar kutmoqda.</p>
<p>Currining ushbu mavsumgi o'rtacha ko'rsatkichi — har o'yinda 32.4 ochko, 6.1 assist va 5.3 qaytarish.</p>`,
      categoryId: cats['sport'].id,
      coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1280&q=80',
      isFeatured: false,
      viewCount:  19600,
      tagIds:     [tags['nba'].id],
    },

    // ════════ TEXNOLOGIYA ════════
    {
      title:      "OpenAI GPT-5 ni rasman taqdim etdi — inson darajasidagi aql",
      excerpt:    "Yangi model barcha benchmark testlarida insondan ustun ko'rsatkichlarni namoyish etdi.",
      content: `<h2>Sun'iy intellektda yangi era</h2>
<p>OpenAI kompaniyasi GPT-5 modelini rasman taqdim etdi. Yangi model har qanday aqliy testda inson o'rtacha ko'rsatkichidan ustun natija ko'rsatdi.</p>
<p>GPT-5 matematik masalalarni hal qilishda Fields medali sovrindorlari darajasida ishlaydi. Tibbiy diagnostika sohasida esa 97 foizlik aniqlik ko'rsatkichiga erishdi.</p>
<h2>Imkoniyatlari</h2>
<p>Yangi model bir vaqtning o'zida 1 million token (taxminan 750,000 so'z) qayta ishlay oladi. Bu to'liq kitobni bir sekundda o'qib tahlil qilishga qodir demakdir.</p>
<blockquote>GPT-5 inson sivilizatsiyasining eng kuchli intellektual vositasiga aylanadi — dedi Sam Altman.</blockquote>
<p>Model hozircha ChatGPT Plus foydalanuvchilari uchun mavjud. Oyiga 20 dollar narxida cheklanmagan foydalanish imkoniyati beriladi.</p>`,
      categoryId: cats['technology'].id,
      coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1280&q=80',
      isFeatured: true,
      viewCount:  67800,
      tagIds:     [tags['ai'].id],
    },
    {
      title:      "Apple iPhone 17 Pro — eng yangi smartfon taqdimoti",
      excerpt:    "Apple'ning yangi flagman modeli 48 megapiksellik kamera, titanium badan va 3 kunlik batareya bilan keldi.",
      content: `<h2>iPhone 17 Pro — Yangi davr</h2>
<p>Apple kompaniyasi San-Fransiskodagi maxsus tadbirda iPhone 17 Pro'ni taqdim etdi. Bu Apple tarixidagi eng kuchli iPhone bo'lib, A19 Pro chip va butunlay yangi kamera tizimi bilan jihozlangan.</p>
<p>Uch kamerali tizim: 48MP asosiy, 48MP ultrawide va 12MP telephoto linzalar bilan keladi. Optik zum 10 baravar kattalashtirish imkonini beradi.</p>
<h2>Texnik xususiyatlar</h2>
<p>A19 Pro chip 3 nanometr texnologiyada ishlab chiqarilgan va oldingi modelga nisbatan 40 foiz tezroq. Batareya 4500 mAh va 3 kun davomida muammo siz ishlaydi.</p>
<p>Narxi: $1,199 dan boshlab. O'zbekistonda rasmiy vakillar orqali $1,450 ga sotiladi.</p>`,
      categoryId: cats['technology'].id,
      coverImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1280&q=80',
      isFeatured: false,
      viewCount:  33400,
      tagIds:     [tags['apple'].id],
    },
    {
      title:      "O'zbekistonda IT Park rezidentlari 500 million dollar eksport qildi",
      excerpt:    "2024-yilda O'zbekiston IT Park kompaniyalari rekord miqdorda dasturiy ta'minot eksport qildi.",
      content: `<h2>IT sohasida tarixiy yutuq</h2>
<p>O'zbekiston IT Park bosh direktori Firdavs Toshmatovning ma'lumoticha, 2024-yilda park rezidentlari 500 million dollar miqdorida dasturiy ta'minot va IT xizmatlar eksport qildi.</p>
<p>Ushbu ko'rsatkich 2023-yilga nisbatan 2.5 barobar yuqoridir. IT Park da hozirda 1,200 dan ortiq kompaniya faoliyat yuritmoqda.</p>
<h2>Muvaffaqiyatlar</h2>
<p>O'zbek IT kompaniyalari AQSh, Yevropa va Sharqiy Osiyo bozorlarida kuchli mavqe egalladi. Ayniqsa fintech, e-commerce va logistika platformalari katta talab ko'rmoqda.</p>
<p>2025-yilga kelib eksport miqdorini 1 milliard dollarga yetkazish maqsad qilib belgilangan.</p>`,
      categoryId: cats['technology'].id,
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&q=80',
      isFeatured: false,
      viewCount:  14200,
      tagIds:     [tags['ozbekiston'].id, tags['ai'].id],
    },

    // ════════ IQTISODIYOT ════════
    {
      title:      "O'zbekiston iqtisodiyoti 2024-yilda 6.5 foiz o'sdi",
      excerpt:    "Yalpi ichki mahsulot o'sish sur'ati MDH mamlakatlarida eng yuqori ko'rsatkichga ega bo'ldi.",
      content: `<h2>Barqaror o'sish davom etmoqda</h2>
<p>O'zbekiston Statistika agentligining ma'lumotlariga ko'ra, 2024-yilda yalpi ichki mahsulot 6.5 foizga o'sdi. Bu MDH mamlakatlari orasida eng yuqori ko'rsatkich hisoblanadi.</p>
<p>Sanoat ishlab chiqarishi 7.2 foiz, xizmatlar sektori 8.1 foiz, qishloq xo'jaligi esa 5.3 foizga o'sdi. Eksport hajmi 26 milliard dollarga yetdi.</p>
<h2>Investitsiyalar</h2>
<p>Xorijiy to'g'ridan-to'g'ri investitsiyalar 2024-yilda 10 milliard dollardan oshdi. Bu rekord ko'rsatkich. Saudi Arabiya, UAE, Xitoy va Yevropa investorlari eng faol qatlamni tashkil etdi.</p>
<blockquote>Islohotlar mevasi ko'rinmoqda — dedi moliya vaziri Timur Ishmetov.</blockquote>`,
      categoryId: cats['economy'].id,
      coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1280&q=80',
      isFeatured: false,
      viewCount:  18700,
      tagIds:     [tags['ozbekiston'].id, tags['dollar'].id],
    },
    {
      title:      "Bitcoin narxi yangi rekord — 100,000 dollar chegarasini oshdi",
      excerpt:    "Kripto valyutalar bozorida tarixiy voqea: Bitcoin birinchi marta 100 ming dollar chegarasini kesib o'tdi.",
      content: `<h2>Bitcoin — 100K</h2>
<p>2024-yil dekabr oyida Bitcoin kriptovalyutasi birinchi marta 100,000 dollar chegarasini oshib, tarixiy rekord o'rnatdi. So'nggi 24 soatda narx 12 foizga oshdi.</p>
<p>Ekspertlar bu o'sishni AQShda Bitcoin ETF fondlarining rasmiy tasdiqlangani bilan bog'lamoqda. BlackRock, Fidelity va boshqa yirik fondlar jami 50 milliard dollar Bitcoin sotib oldi.</p>
<h2>Bozor holati</h2>
<p>Kripto bozorining umumiy kapitalizatsiyasi 3.5 trillion dollarga yetdi. Ethereum ham o'z rekordi — 7,200 dollardan savdo qilmoqda.</p>
<p>O'zbekistonda kripto valyuta bilan muomala qonunlashtirilib, bir necha lisenziyalangan birja ishlaydi. O'zbekistonlik investorlar sonining o'sishi 300 foizni tashkil etdi.</p>`,
      categoryId: cats['economy'].id,
      coverImage: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1280&q=80',
      isFeatured: true,
      viewCount:  52100,
      tagIds:     [tags['kripto'].id, tags['dollar'].id],
    },
    {
      title:      "O'zbekistonda xorijiy banklar soni ko'paymoqda",
      excerpt:    "2024-yilda 5 ta yangi xorijiy bank o'zbekiston bozorida faoliyat boshladi.",
      content: `<h2>Bank sektori kengaymoqda</h2>
<p>O'zbekiston Markaziy bankining ma'lumotiga ko'ra, 2024-yilda mamlakatda 5 ta yangi xorijiy bank oʻz faoliyatini boshladi. Jumladan, UAE, Xitoy, Turkiya va Rossiyaning yirik banklari kirib keldi.</p>
<p>Hozirda O'zbekistonda 38 ta bank faoliyat ko'rsatmoqda, shundan 12 tasi xorijiy kapital ishtirokidagi banklar. Tijorat banklari aktivlari 70 milliard dollarga yaqinlashdi.</p>
<h2>Raqobat kuchaymoqda</h2>
<p>Xorijiy banklarning kirishi mahalliy banklar uchun raqobatni kuchaytirdi. Natijada kreditlar foiz stavkasi pasayib, aholining qarz olish imkoniyati oshdi.</p>
<p>Markaziy bank 2025-yilda yana 3-4 ta xorijiy bank litsenziya olishi kutilayotganini ma'lum qildi.</p>`,
      categoryId: cats['economy'].id,
      coverImage: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=1280&q=80',
      isFeatured: false,
      viewCount:  9300,
      tagIds:     [tags['ozbekiston'].id, tags['dollar'].id],
    },

    // ════════ AUTO ════════
    {
      title:      "GM Uzbekistan yangi elektr avtomobil ishlab chiqarishni boshladi",
      excerpt:    "Asaka zavodida yillik 50,000 ta elektr avtomobil ishlab chiqarish liniyasi ishga tushirildi.",
      content: `<h2>O'zbekistonda elektr avtomobil ishlab chiqarish</h2>
<p>General Motors Uzbekistan kompaniyasi Asaka shahridagi zavodda elektr avtomobil ishlab chiqarishni boshladi. Birinchi model — Chevrolet Equinox EV O'zbekiston versiyasi deb nomlandi.</p>
<p>Avtomobil bir martalik zaryadda 400 km masofani bosib o'ta oladi. O'rta va biznes sinf segmentiga mo'ljallangan bu model 45,000 dollardan sotiladi.</p>
<h2>Mahalliy tarkib</h2>
<p>Avtomobilning 35 foiz tarkibiy qismlari O'zbekistonda ishlab chiqariladi. 2026-yilga kelib bu ko'rsatkich 60 foizga yetkazilishi rejalashtirilgan.</p>
<p>Birinchi partiyada 5,000 ta avtomobil ishlab chiqarildi. Buyurtmalar allaqachon to'liq — 2025-yil iyulgacha yetkazib berish bron qilingan.</p>`,
      categoryId: cats['auto'].id,
      coverImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1280&q=80',
      isFeatured: false,
      viewCount:  24500,
      tagIds:     [tags['ozbekiston'].id, tags['tesla'].id],
    },
    {
      title:      "Tesla Cybertruck: O'zbekistonga yetib keldi",
      excerpt:    "Elon Musk'ning mashhur elektr yuk mashinasi O'zbekiston yo'llarida birinchi marta paydo bo'ldi.",
      content: `<h2>Cybertruck Toshkentda</h2>
<p>Tesla Cybertruck — dunyoning eng qiziqarli avtomobillaridan biri — O'zbekistonga yetib keldi. Toshkentdagi bir necha boylar bu nodir mashinani maxsus buyurtma orqali oldirdi.</p>
<p>Stainless steel tanasi, o'qqa chidamli oynasi va elektr yuk mashinalar sinfida eng kuchli texnik ko'rsatkichlari bilan Cybertruck haqiqiy muhandislik mo'jizasidir.</p>
<h2>Xususiyatlari</h2>
<p>0-dan 100 km/soatga 2.7 sekundda yetadi. Bir zaryadda 800 km bosib o'tadi. Yuk ko'tarish qobiliyati — 1.5 tonna.</p>
<p>O'zbekistondagi narxi — 120,000 dollar. Ammo ko'pchilik uni qiymati emas, balki o'ziga xos dizayni uchun xarid qilmoqda.</p>`,
      categoryId: cats['auto'].id,
      coverImage: 'https://images.unsplash.com/photo-1652729639615-6ead09f37d3d?w=1280&q=80',
      isFeatured: false,
      isBreaking: false,
      viewCount:  31200,
      tagIds:     [tags['tesla'].id, tags['ozbekiston'].id],
    },
    {
      title:      "Hyundai O'zbekistonda yangi zavodini ochdi",
      excerpt:    "Koreyslik avtomobil giganti Toshkent viloyatida yiliga 100,000 ta avtomobil ishlab chiqaruvchi yangi zavodni rasman ishga tushirdi.",
      content: `<h2>Hyundai va O'zbekiston hamkorligi</h2>
<p>Hyundai Motor Company Toshkent viloyatidagi Yangiyul tumanida zamonaviy avtomobil zavodini rasman ishga tushirdi. Zavod yiliga 100,000 ta avtomobil ishlab chiqarish quvvatiga ega.</p>
<p>Dastlabki bosqichda Hyundai Tucson, Sonata va Elantra modellari yig'iladi. Keyinchalik elektr modellar ham qo'shilishi rejalashtirilgan.</p>
<h2>Iqtisodiy ta'sir</h2>
<p>Zavod 4,000 dan ortiq kishi uchun ish o'rni yaratdi. Yordamchi sanoat korxonalari bilan birga bu raqam 15,000 ga yetadi.</p>
<p>Mahalliy xom ashyo va qismlarga talabning o'sishi O'zbekistonning mashinasozlik sanoatini rivojlantirishga turtki beradi.</p>`,
      categoryId: cats['auto'].id,
      coverImage: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1280&q=80',
      isFeatured: false,
      viewCount:  16800,
      tagIds:     [tags['ozbekiston'].id],
    },

    // ════════ MADANIYAT ════════
    {
      title:      "O'zbek filmi Oskar nominatsiyasiga tavsiya etildi",
      excerpt:    "Yossiqul Sharipovning 'Cho'l ovozi' filmi O'zbekistonning rasmiy Oskar nomzodi sifatida ko'rib chiqilmoqda.",
      content: `<h2>O'zbek kino sanoatida tarixiy yutuq</h2>
<p>O'zbekiston Kinematografchilar uyushmasi "Cho'l ovozi" filmini 2025-yilgi Oskar mukofotiga "Eng yaxshi xorijiy film" toifasida nomzod sifatida tavsiya etdi.</p>
<p>Film Qoraqalpog'iston cho'llarida suratga olinib, Orol dengizi fojiasini va odamlarning tirikchilik uchun kurashini realistik tarzda tasvirlaydi.</p>
<h2>Film haqida</h2>
<p>Rejissyor Yossiqul Sharipov uchun bu birinchi xalqaro miqyosdagi loyiha. Film Kann kinofestivalida "Maxsus e'tibor" mukofotiga sazovor bo'lgan.</p>
<blockquote>Bu filmni qilish uchun 3 yil harakat qildik. Orol dengizi fojiasi dunyo bilishi kerak — dedi rejissyor.</blockquote>
<p>Film hozirda Netflix platformasida 40 mamlakatda namoyish etilmoqda.</p>`,
      categoryId: cats['culture'].id,
      coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&q=80',
      isFeatured: false,
      viewCount:  21300,
      tagIds:     [tags['ozbekiston'].id],
    },
    {
      title:      "Spotify O'zbekiston bozorida rasman faoliyat boshladi",
      excerpt:    "Dunyoning eng yirik musiqa platformasi O'zbekiston foydalanuvchilariga ochildi.",
      content: `<h2>Spotify endi O'zbekistonda</h2>
<p>Spotify musiqa strimming xizmati rasman O'zbekistonda faoliyat boshladi. 100 million qo'shiq, 5 million podcast va audiobook to'plami endi o'zbek foydalanuvchilari uchun mavjud.</p>
<p>Premium obuna narxi — oyiga 29,900 so'm. Bepul versiyada reklama bilan cheksiz tinglash mumkin. Birinchi 3 oy bepul trial taklif etilmoqda.</p>
<h2>O'zbek musiqachilari uchun imkoniyat</h2>
<p>O'zbek musiqachilar allaqachon Spotifyda faol. Sherzod Urinboy, Shahzoda, Jahongir Otajonov kabi ijrochilarning qo'shiqlari platforma orqali dunyoga tarqalmoqda.</p>
<p>Spotify O'zbekistonda maxsus "O'zbekiston Top 50" pleylist ham ishga tushirdi.</p>`,
      categoryId: cats['culture'].id,
      coverImage: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=1280&q=80',
      isFeatured: false,
      viewCount:  28900,
      tagIds:     [tags['ozbekiston'].id],
    },
    {
      title:      "Toshkent xalqaro kitob yarmarkasi rekord ishtirokchilar bilan o'tdi",
      excerpt:    "40 mamlakatdan 500 dan ortiq nashriyot ishtirok etgan kitob yarmarkasi o'z tarixidagi eng katta ko'rsatkichga erishdi.",
      content: `<h2>Kitob bayrami Toshkentda</h2>
<p>Toshkent xalqaro kitob yarmarkasining 12-chiqarilishi O'zbekiston Milliy ko'rgazmalar markazida muvaffaqiyatli yakunlandi. 5 kun davomida 40 mamlakatdan 500 dan ortiq nashriyot ishtirok etdi.</p>
<p>Yarmarkada 1 million nusxadan ortiq kitob sotildi. O'tgan yilga nisbatan savdo hajmi 35 foizga oshdi.</p>
<h2>Diqqatga sazovor kitoblar</h2>
<p>Eng ko'p sotilgan kitoblar orasida: "O'zbekiston tarixi" 3 jildligi, xorijiy bestseller tarjimalari va yosh o'zbek yozuvchilarning asarlari bor.</p>
<p>Yarmarka doirasida 50 ta adabiy uchrashuv, ustoz darslar va prezentatsiyalar o'tkazildi. Kitobga qiziqish kuchayib borayotgani mamnuniyat uyg'otadi.</p>`,
      categoryId: cats['culture'].id,
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1280&q=80',
      isFeatured: false,
      viewCount:  7800,
      tagIds:     [tags['toshkent'].id, tags['ozbekiston'].id],
    },

    // ════════ VIDEO ════════
    {
      title:      "Toshkent metrosining yangi stansiyasi: video reportaj",
      excerpt:    "Toshkent metro qurilishining ichkaridan ko'rinishi — ish jarayoni va zamonaviy texnologiyalar.",
      content: `<h2>Metro qurilishi ichkaridan</h2>
<p>NEWS.UZ guruhi Toshkent metro qurilishining so'nggi bosqichida bo'ldi. Yangi "Sergeli" yo'nalishining qurilishi 85 foizga tugallangan.</p>
<p>Har kuni 2,000 dan ortiq ishchi 24 soat davomida qurilishda band. Ishchi kuchining 60 foizi O'zbekiston fuqarolari, qolganlari xorijiy mutaxassislar.</p>
<h2>Zamonaviy texnologiyalar</h2>
<p>Nemis "Herrenknecht" kompaniyasining maxsus tunnelchi mashinalari ishlatilmoqda. Ushbu mashinalar bir kecha-kunduzda 15-20 metr tunnel kazib o'ta oladi.</p>
<p>Yangi stansiyalar Toshkentning zamonaviy arxitekturasi ruhi bilan bezatiladi. Har bir stansiyada alohida badiiy konsepsiya ishlab chiqilgan.</p>`,
      categoryId: cats['video'].id,
      coverImage: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1280&q=80',
      isFeatured: false,
      viewCount:  19400,
      tagIds:     [tags['toshkent'].id],
    },
    {
      title:      "Intervyu: O'zbekiston milliy terma jamoasi bosh murabbiyi bilan suhbat",
      excerpt:    "Milliy terma jamoamizning yangi bosh murabbiyi Jahon kubogiga tayyorgarlik haqida gapirib berdi.",
      content: `<h2>Yangi murabbiy, yangi orzu</h2>
<p>O'zbekiston futbol terma jamoasining yangi bosh murabbiyi Srecko Katanec bilan maxsus intervyu o'tkаzdik. Sloven mutaxassis jamoaning kelajagi haqida qiziqarli fikrlar baham ko'rdi.</p>
<p>"O'zbekistonda katta iqtidor bor, biz ularni to'g'ri yo'naltira olsak, Jahon kubogiga borish haqiqat bo'ladi" — dedi murabbiy.</p>
<h2>Maqsadlar</h2>
<p>Katanecning asosiy maqsadi — yosh o'yinchilarni asosiy tarkibga kiritish. Hozirda terma jamoada o'rtacha yosh 26, ammo murabbiy buni 23 yoshga tushirmoqchi.</p>
<p>Yaqin 2 yilda 15 ta do'stona o'yin o'tkaziladi. Har bir o'yinda kamida 5 ta yosh o'yinchi maydonga tushadi.</p>`,
      categoryId: cats['video'].id,
      coverImage: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1280&q=80',
      isFeatured: false,
      viewCount:  14600,
      tagIds:     [tags['ozbekiston'].id, tags['world-cup'].id],
    },
    {
      title:      "Video: Samarqandning tungi ko'rinishi drondan",
      excerpt:    "Dron kamerasi orqali Registon, Shohizinda va boshqa tarixiy obidalarning tungi surati.",
      content: `<h2>Samarqand — tungi maftun</h2>
<p>NEWS.UZ operatori dron yordamida Samarqandning tungi ko'rinishini suratga oldi. Ushbu ajoyib videomaterialda shahrning tarixiy markazini professional nur bilan bezatilgan holda ko'rishingiz mumkin.</p>
<p>Registon maydoni, Bibi-Xonim masjidi va Ulug'bek rasadxonasi — hammasi yengil nur va yulduzlar ostida nafis ko'rinadi.</p>
<h2>Texnik ma'lumot</h2>
<p>Suratga olish DJI Mavic 3 Pro dron va 4K kamera bilan amalga oshirildi. 45 daqiqalik parvoz davomida 200 GB material to'plandi.</p>
<p>Video YouTube kanalimizda to'liq formatda joylashtirildi. Bir sutkada 500,000 ko'rishga erishdi.</p>`,
      categoryId: cats['video'].id,
      coverImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1280&q=80',
      isFeatured: true,
      viewCount:  43700,
      tagIds:     [tags['samarqand'].id, tags['ozbekiston'].id],
    },
  ]

  // ─── MAQOLALARNI SAQLASH ─────────────────────────────────
  console.log('\n📝 Maqolalar saqlanmoqda:')
  let articleCount = 0

  for (const art of articles) {
    const { tagIds, ...data } = art

    const slug = slugify(data.title) + '-' + Math.random().toString(36).slice(2, 6)

    try {
      await prisma.article.create({
        data: {
          ...data,
          slug,
          authorId:    admin.id,
          authorName:  admin.fullName,
          status:      'PUBLISHED',
          readTimeMin: Math.ceil(data.content.split(' ').length / 200),
          publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          tags: {
            create: (tagIds || []).map(tagId => ({
              tag: { connect: { id: tagId } }
            })),
          },
        },
      })
      articleCount++
      process.stdout.write('  ✅ ' + data.title.slice(0, 55) + '...\n')
    } catch (err) {
      console.log('  ⚠️  Xato:', data.title.slice(0, 40), '-', err.message)
    }
  }

  // ─── YAKUNIY HISOBOT ─────────────────────────────────────
  console.log('\n════════════════════════════════════════')
  console.log('🎉 SEED MUVAFFAQIYATLI YAKUNLANDI!')
  console.log('════════════════════════════════════════')
  console.log(`✅ Admin:         1 ta  (admin@news.uz / Admin123!)`)
  console.log(`✅ Kategoriyalar: ${parentCats.length} ta asosiy + ${subCats.length} ta ichki`)
  console.log(`✅ Taglar:        ${tagList.length} ta`)
  console.log(`✅ Maqolalar:     ${articleCount} ta (har kategoriyada 3 ta)`)
  console.log('════════════════════════════════════════')
  console.log('\nBrauzerda oching: http://localhost:5173')
  console.log('Admin:            http://localhost:5173/admin\n')
}

main()
  .catch(e => { console.error('❌ Xato:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
