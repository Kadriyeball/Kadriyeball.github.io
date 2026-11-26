/* ==========================================================================
   Dil sistemi (TR | EN)
   - [data-i18n]        → öğenin düz metnini çevirir
   - [data-i18n-html]   → öğenin içeriğini HTML olarak çevirir (abbr, code gibi
                          etiketler içeren metinler için; yalnızca bu dosyadaki
                          güvenilir metinler kullanılır)
   - [data-i18n-attr]   → nitelikleri çevirir: "alt:anahtar;aria-label:anahtar"
   - <body data-page="about"> → o sayfanın <title> ve meta açıklamasını günceller
   Seçim localStorage'da saklanır.
   ========================================================================== */

/* ===== KİŞİSEL BİLGİLER: burayı kendi bilgilerinle güncelle =====
   (Not: her sayfanın <head> bölümündeki JSON-LD bloklarında da adını güncelle.) */
window.SITE_PROFILE = {
  name: 'Kadriye Bal',
  email: 'kadriyebal357@gmail.com',
  phone: '+90 534 660 35 07',          // görünen numara
  phoneHref: '+905346603507',          // tel: bağlantısı için boşluksuz numara
  city: 'Antalya / Muratpaşa',
  url: 'https://kadriyeball.github.io',
  school: 'Akdeniz Üniversitesi',
  /* İletişim formu: Formspree vb. bir servisin adresini yazarsan form oraya
     gönderilir (ör. 'https://formspree.io/f/abcdwxyz'). Boş kalırsa form,
     doğrulamadan sonra e-posta uygulamasını hazır mesajla açar. */
  formEndpoint: '',
  social: {
    instagram: 'https://www.instagram.com/kadriyeebal/',
    github: 'https://github.com/Kadriyeball'
  }
};

(function () {
  'use strict';

  var P = window.SITE_PROFILE;

  var dict = {
    tr: {
      /* ---------- Sayfa başlıkları ve açıklamaları ---------- */
      'meta.home.title': '{name} | Bilgisayar Programcılığı Öğrencisi Portfolyosu',
      'meta.home.desc': '{school} Teknik Bilimler MYO Bilgisayar Programcılığı öğrencisi {name}: Python, SQL, web tasarımı ve Grafik Animasyon 1 projeleri. Gün batımında bir gül bahçesinden geçen kaydırmalı portfolyo.',
      'meta.about.title': 'Hakkımda ve Özgeçmiş | {name}',
      'meta.about.desc': '{name}: {school} Teknik Bilimler MYO Bilgisayar Programcılığı öğrencisi. Özgeçmiş, haftalık ders programı, ilgi alanları ve Python, SQL, HTML/CSS, Photoshop yetenekleri.',
      'meta.projects.title': 'Grafik Animasyon 1 Projeleri | {name}',
      'meta.projects.desc': 'Ürün tanıtımı tasarımı, History Brush ile seçici renklendirme, Image Stack tekniği ve 960.gs ızgara sistemiyle web arayüzü: {name} tarafından hazırlanan Photoshop projeleri.',
      'meta.blog.title': 'Blog: Python, Photoshop ve Yapay Zekâ | {name}',
      'meta.blog.desc': 'Python ile algoritma ve döngü mantığı, Photoshop’ta katman ve akıllı nesne teknikleri, yapay zekâ araçlarıyla modern web tasarımı üzerine yazılar.',
      'meta.gallery.title': 'Galeri | {name}',
      'meta.gallery.desc': '{name} fotoğraf galerisi: palmiyeli yol, kahve molası, meşaleli yürüyüş, konser ve daha fazlası. Büyütmek için fotoğrafa tıklayın.',
      'meta.contact.title': 'İletişim | {name}',
      'meta.contact.desc': '{name} ile iletişim: Antalya, Türkiye. Telefon, e-posta ve iletişim formu ile staj, proje ve iş birliği talepleri.',

      /* ---------- Kişisel ---------- */
      'profile.name': '{name}',
      'profile.dept': 'Bilgisayar Programcılığı',
      'profile.school': '{school}',

      /* ---------- Menü ---------- */
      'nav.skip': 'İçeriğe geç',
      'nav.primary': 'Ana menü',
      'nav.home': 'Anasayfa',
      'nav.about': 'Hakkımda',
      'nav.projects': 'Projeler',
      'nav.blog': 'Blog',
      'nav.gallery': 'Galeri',
      'nav.contact': 'İletişim',
      'nav.open': 'Menüyü aç',
      'nav.close': 'Menüyü kapat',
      'nav.homeLabel': '{name}, anasayfa',
      'lang.label': 'Dil seçimi',
      'lang.tr': 'Türkçe',
      'lang.en': 'İngilizce',

      /* ---------- Anasayfa: hero ---------- */
      'hero.canvasLabel': 'Gün batımında pastel pembe, krem ve gül kurusu güllerle dolu bir bahçe. Havada gül yaprakları ve altın ışık parçacıkları süzülüyor.',
      'hero.c1.hello': 'Merhaba, ben',
      'hero.c1.line': 'Kodla ve renkle hikâyeler kuruyorum.',
      'hero.c2.kicker': 'Bölümüm',
      'hero.c2.line': '{school} Teknik Bilimler MYO. Python, veritabanı ve grafik animasyonun buluştuğu yer.',
      'hero.c3.title': 'Her satır kod, bir sonrakine açılan bir kapı.',
      'hero.c3.line': 'Biraz daha kaydır: projelerim, fotoğraflarım ve beni anlatan birkaç satır seni bekliyor.',

      /* ---------- Anasayfa: Hakkımda özeti ---------- */
      'about.title': 'Hakkımda',
      'about.lead': 'Kodun mantığını, tasarımın estetiğiyle buluşturmayı seviyorum.',
      'about.body': '{school} Teknik Bilimler MYO’da Bilgisayar Programcılığı okuyorum. Python ve veritabanlarıyla mantık kurmayı, Photoshop ve grafik animasyonla da o mantığa görünür bir yüz vermeyi öğreniyorum.',
      'about.focusLabel': 'Odaklandığım alanlar',
      'about.f1': 'Python',
      'about.f2': 'Veritabanı',
      'about.f3': 'Web tasarımı',
      'about.f4': 'Grafik animasyon',
      'about.cta': 'Hakkımda Sayfasına Git',
      'about.portraitAlt': '{name} vesikalık fotoğrafı',

      /* ---------- Projeler (anasayfa + projeler.html) ---------- */
      'projects.title': 'Grafik Animasyon 1',
      'projects.lead': 'Adobe Photoshop ve web arayüzü üzerine dönem boyunca ürettiğim çalışmalardan bir seçki.',
      'projects.cta': 'Tüm Projeler',
      'proj.1.title': 'Ürün Tanıtımı Tasarımı',
      'proj.1.sub': 'Tanıtım görseli ve afiş',
      'proj.1.short': 'Bir ürünü öne çıkaran, sade ve dikkat çekici bir tanıtım görseli çalışması.',
      'proj.1.desc': 'Ürün fotoğrafını arka plandan ayırıp yeni bir kompozisyona yerleştirdim. Işık, gölge ve renk ayarlarıyla ürünü öne çıkardım; başlık ve kısa açıklamayı okunaklı bir tipografiyle düzenleyerek tanıtıma hazır bir afiş oluşturdum.',
      'proj.1.alt': 'Ürün tanıtım afişi tasarımı',
      'proj.2.title': 'Seçici Renklendirme',
      'proj.2.sub': 'History Brush uygulaması',
      'proj.2.short': 'Siyah beyaz bir fotoğrafta yalnızca seçilen nesneyi renkli bırakan çalışma.',
      'proj.2.desc': 'Fotoğrafı önce Black & White ayarıyla tamamen gri tonlara çevirdim. Ardından History (Geçmiş) panelinde renkli duruma kaynak noktası koyup History Brush ile yalnızca ana nesnenin üzerini boyadım; böylece rengi ana nesneye geri getirip bakışı ona yönlendirdim.',
      'proj.2.alt': 'History Brush ile seçici renklendirilmiş fotoğraf',
      'proj.3.title': 'Görüntü Yığını',
      'proj.3.sub': 'Image Stack tekniği',
      'proj.3.short': 'Aynı açıdan çekilmiş karelerden, kalabalığı silinmiş temiz bir sahne elde etme.',
      'proj.3.desc': 'Sabit açıyla çekilmiş birden fazla kareyi Load Files into Stack ile katmanlara yükledim ve Auto-Align ile hizaladım. Katmanları tek bir akıllı nesnede topladıktan sonra Stack Mode olarak Median seçtim; kareden kareye yer değiştiren insanlar ve araçlar sahneden kendiliğinden kayboldu.',
      'proj.3.alt': 'Image Stack tekniğiyle temizlenmiş sahne',
      'proj.4.title': '960.gs Izgara Sistemi ile Web Arayüzü',
      'proj.4.sub': 'Izgara tabanlı arayüz tasarımı',
      'proj.4.short': '960 piksellik, 12 sütunlu ızgara üzerinde düzenli bir web sayfası arayüzü.',
      'proj.4.desc': '960 Grid System’in 12 sütunlu şablonunu Photoshop kılavuzlarına aktardım. Üst menü, içerik alanı, kenar çubuğu ve alt bilgiyi sütunlara oturtarak hizası tutarlı, geliştiriciye kolayca aktarılabilecek bir arayüz taslağı hazırladım.',
      'proj.4.alt': '960.gs ızgarası üzerinde tasarlanmış web arayüzü',
      'orbit.sun': 'Projelerim',
      'orbit.pause': 'Durdur',
      'orbit.play': 'Döndür',
      'pr.title': 'Projeler',
      'pr.lead': 'Grafik Animasyon 1 dersinde Adobe Photoshop teknikleri ve ızgara tabanlı web arayüzü üzerine yaptığım çalışmalar. Her kartta ne yaptığımı ve nasıl yaptığımı kısaca anlattım.',
      'pr.tech': 'Kullanılan teknikler',
      'pr.course': 'Ders',
      'pr.cta.title': 'Bir sonraki projede birlikte çalışalım.',
      'pr.cta.text': 'Staj, ödev iş birliği ya da küçük bir web projesi için bana yazabilirsin.',
      'pr.cta.btn': 'İletişime Geç',

      /* ---------- Galeri (anasayfa + galeri.html) ---------- */
      'gallery.title': 'Galeri',
      'gallery.lead': 'Beni yansıtan anlar: yürüyüşlerden, konserden, kahve molalarından ve mutfaktan.',
      'gallery.cta': 'Galeriye Git',
      'g1.cap': 'Kampüste palmiyeler',
      'g1.desc': 'Akdeniz Üniversitesi kampüsünde, süs havuzu boyunca uzanan palmiyeli yürüyüş yolu.',
      'g2.cap': 'Kahve molası',
      'g2.desc': 'Üzerinde adım yazan bir bardak kahveyle akşam molası.',
      'g3.cap': 'Meşaleli yürüyüş',
      'g3.desc': 'Bayraklar, meşaleler ve Atatürk portreleriyle bir akşam yürüyüşü.',
      'g4.cap': 'Ayna karesi',
      'g4.desc': 'Bir kafenin ahşap çerçeveli aynasından günün karesi.',
      'g5.cap': 'Konser gecesi',
      'g5.desc': 'Kırmızı ışıklar altında canlı müzik.',
      'g6.cap': 'Pizza workshop’u',
      'g6.desc': 'Yaptığım pizza workshop’undan: sos, sebze ve peynirle hazırlanmış, fırına girmeye hazır iki pizza.',
      'ga.title': 'Galeri',
      'ga.lead': 'Kamera arkasından ve önünden, beni anlatan altı kare. Büyütmek için bir fotoğrafa tıkla; ok tuşlarıyla gezinebilirsin.',
      'ga.zoom': 'Fotoğrafı büyüt',
      'ga.close': 'Kapat',
      'ga.prev': 'Önceki fotoğraf',
      'ga.next': 'Sonraki fotoğraf',
      'ga.dialog': 'Büyütülmüş fotoğraf',
      'bq.open': 'Kurdeleyi çöz, fotoğrafları aç',
      'bq.hint': 'Kurdeleye dokun, buket açılsın',
      'bq.close': 'Buketi Topla',

      /* ---------- Ortak ---------- */
      'ph.soon': 'Görsel yakında',

      /* ---------- Alt bilgi ---------- */
      'footer.closing': 'Bir proje, bir soru ya da sadece merhaba.',
      'footer.lead': 'Staj fırsatlarına, ödev iş birliklerine ve yeni fikirlere her zaman açığım.',
      'footer.pages': 'Sayfalar',
      'footer.social': 'Sosyal',
      'footer.contact': 'İletişim',
      'footer.rights': 'Tüm hakları saklıdır.',
      'footer.top': 'Başa dön',

      /* ---------- hakkimda.html ---------- */
      'ab.title': 'Hakkımda',
      'ab.role': 'Bilgisayar Programcılığı Öğrencisi',
      'ab.school': '{school} · Teknik Bilimler <abbr title="Meslek Yüksekokulu">MYO</abbr>',
      'ab.intro': 'Merhaba! Ben Kadriye. Akdeniz Üniversitesi Bilgisayar Programcılığı bölümü 1.sınıf öğrencisiyim. Web tasarımı ve yazılım geliştirme alanlarında kendimi geliştiriyor; HTML, CSS, Python ve temel veritabanı teknolojileriyle işlevsel projeler üretiyorum.<br><br>Yeniliklere açık, yeni insanlarla tanışmayı ve takım çalışmalarında sorumluluk almayı seven biriyim. Farklı bakış açılarından beslenerek ve öğrendiklerimi pratiğe dökerek modern, kullanıcı dostu web deneyimleri oluşturmayı hedefliyorum.',
      'ab.ctaProjects': 'Projelerimi İncele',
      'ab.ctaContact': 'Bana Yaz',
      'ab.cv.title': 'Özgeçmiş',
      'ab.cv.p1': '{school} Teknik Bilimler <abbr title="Meslek Yüksekokulu">MYO</abbr> bünyesinde Bilgisayar Programcılığı okuyorum. Programlamaya Python ile başladım; ilk satırım, herkes gibi <code>print("Merhaba Dünya")</code> oldu.',
      'ab.cv.p2': 'Veritabanı Yönetimi dersinde verinin nasıl saklandığını ve sorgulandığını öğreniyorum: <code>SELECT</code>, <code>WHERE</code> ve <code>JOIN</code> artık günlük kelimelerim. Web tarafında <abbr title="HyperText Markup Language">HTML</abbr> ve <abbr title="Cascading Style Sheets">CSS</abbr> ile anlamlı ve erişilebilir sayfalar kurmaya çalışıyorum; bu site de o çalışmanın bir parçası.',
      'ab.cv.p3': 'Grafik Animasyon 1 dersinde Adobe Photoshop ile katman, maske ve akıllı nesne tekniklerini öğrendim. Kodun mantığını görselin estetiğiyle buluşturmak, bilgi teknolojileri (<abbr title="Information Technology">IT</abbr>) alanında en çok ilgimi çeken şey.',
      'ab.cv.quote': 'Önce çalışır hale getir, sonra doğru hale getir, en son da hızlı hale getir.',
      'ab.cv.quoteBy': 'Kent Beck',
      'ab.cv.quoteNote': 'Kod yazarken kendime en sık hatırlattığım cümle.',
      'ab.cv.codeTitle': 'Kısaca ben, bir Python sözlüğü olarak:',
      'ab.sched.title': 'Haftalık Ders Programı',
      'ab.sched.caption': 'Güz dönemi haftalık ders programı',
      'ab.sched.time': 'Saat',
      'ab.sched.hint': 'Tabloyu yana kaydırarak tüm günleri görebilirsin.',
      'day.mon': 'Pazartesi',
      'day.tue': 'Salı',
      'day.wed': 'Çarşamba',
      'day.thu': 'Perşembe',
      'day.fri': 'Cuma',
      'c.python': 'Python Programlama',
      'c.db': 'Veritabanı Yönetimi',
      'c.office': 'Ofis Yazılımları',
      'c.math': 'Temel Matematik 1',
      'c.anim': 'Grafik Animasyon 1',
      'c.lab': 'Uygulama',
      'c.theory': 'Teori',
      'c.free': 'Boş',
      'ab.int.title': 'İlgi Alanlarım ve Yeteneklerim',
      'ab.int.olTitle': 'En çok ilgilendiğim alanlar (öncelik sırasıyla)',
      'ab.int.o1': 'Python ile yazılım geliştirme',
      'ab.int.o2': 'Veritabanı tasarımı ve SQL sorguları',
      'ab.int.o3': 'Web arayüz tasarımı (HTML ve CSS)',
      'ab.int.o4': 'Fotoğraf düzenleme ve grafik animasyon',
      'ab.int.o5': 'Yapay zekâ destekli üretim araçları',
      'ab.int.ulTitle': 'Kişisel yeteneklerim',
      'ab.int.u1': 'Problem çözme ve analitik düşünme',
      'ab.int.u2': 'Takım çalışması',
      'ab.int.u3': 'Hızlı öğrenme ve araştırma',
      'ab.int.u4': 'Detaylara dikkat',
      'ab.int.u5': 'Zaman yönetimi',
      'ab.sk.title': 'Teknik Yetenekler',
      'ab.sk.lead': 'Derslerde ve kendi projelerimde edindiğim deneyime göre kendi değerlendirmem.',

      /* ---------- blog.html ---------- */
      'bl.title': 'Blog',
      'bl.lead': 'Yazılım, tasarım ve yapay zekâ üzerine öğrendiklerimi not ettiğim yazılar.',
      'bl.read': 'Yazıyı oku',
      'bl.back': 'Yazı listesine dön',
      'bl.toc': 'Yazılar',
      'bl.p1.title': 'Python ile Algoritma ve Döngü Mantığı',
      'bl.p1.meta': '6 dk okuma · Python',
      'bl.p1.excerpt': 'Bir problemi adımlara bölmek ve bu adımları for ve while döngüleriyle tekrar ettirmek: programlamanın temel düşünme biçimi.',
      'bl.p1.alt': 'Python for döngüsü kodu ve döngü simgesi çizimi',
      'bl.p1.intro': 'Programlamaya başladığımda en çok zorlandığım şey sözdizimi değil, düşünme biçimiydi. Bilgisayara “bunu yap” demek yetmiyor; ne yapacağını, hangi sırayla ve ne zaman duracağını tek tek söylemek gerekiyor. İşte bu sıralı talimatlar dizisine algoritma diyoruz.',
      'bl.p1.s1.h': 'Algoritma nedir?',
      'bl.p1.s1.p': 'Algoritma, bir problemi çözmek için izlenen sonlu ve açık adımlar dizisidir. Çay demlemek bile bir algoritmadır: suyu kaynat, demliği ısıt, çayı ekle, bekle. Kod yazmadan önce adımları düz Türkçe ile yazmak (buna <em>sözde kod</em> denir) hatalarımı ciddi ölçüde azalttı.',
      'bl.p1.s2.h': 'for döngüsü: sayısı belli tekrarlar',
      'bl.p1.s2.p': 'Bir işlemi kaç kez tekrar edeceğimizi biliyorsak <code>for</code> kullanırız. <code>range(1, 11)</code> ifadesi 1’den 10’a kadar sayılar üretir; 11 dahil değildir. Aşağıdaki örnek 1 ile 10 arasındaki çift sayıları toplar:',
      'bl.p1.s3.h': 'while döngüsü: koşul sürdükçe',
      'bl.p1.s3.p': 'Kaç tekrar olacağını bilmediğimiz durumlarda <code>while</code> kullanırız: koşul doğru olduğu sürece döngü devam eder. Koşulu hiç yanlış yapmayan bir döngü sonsuza kadar çalışır, bu yüzden deneme sayısı gibi bir sınır koymak iyi bir alışkanlık.',
      'bl.p1.s4.h': 'break ve continue',
      'bl.p1.s4.p': '<code>break</code> döngüyü hemen bitirir, <code>continue</code> ise o turun geri kalanını atlayıp bir sonraki tura geçer. Örneğin bir listede ilk negatif sayıyı bulduğumuzda <code>break</code>, boş değerleri atlamak istediğimizde <code>continue</code> işimizi görür.',
      'bl.p1.end': 'Benim için en faydalı alıştırma, her döngüyü yazmadan önce kâğıda “kaç kez dönecek, ne zaman duracak?” sorularının cevabını yazmak oldu. Döngüyü bu iki soru ile düşündüğünüzde hataların çoğu daha klavyeye dokunmadan çözülüyor.',
      'bl.p2.title': 'Adobe Photoshop’ta Katman ve Akıllı Nesne Teknikleri',
      'bl.p2.meta': '5 dk okuma · Photoshop',
      'bl.p2.excerpt': 'Tahribatsız düzenlemenin iki temel taşı: katmanlar ve akıllı nesneler. Grafik Animasyon 1 projelerimde nasıl kullandığımı anlatıyorum.',
      'bl.p2.alt': 'Photoshop katmanları ve katmanlar paneli çizimi',
      'bl.p2.intro': 'Photoshop’u ilk açtığımda her şeyi tek bir katmanda yapıyor, yanlış bir adımda dosyayı baştan açıyordum. Grafik Animasyon 1 dersinde öğrendiğim en önemli fikir şu oldu: iyi bir dosya, geri alınabilir bir dosyadır.',
      'bl.p2.s1.h': 'Katmanlar: her şey ayrı bir yaprak',
      'bl.p2.s1.p': 'Katmanları üst üste konmuş saydam asetatlar gibi düşünebilirsiniz. <code>Ctrl + J</code> ile bir katmanı kopyalayıp orijinali korurum. Silgi yerine <strong>katman maskesi</strong> kullanırım: siyah boyadığım yer gizlenir, beyaz boyadığım yer geri gelir. Böylece hiçbir piksel gerçekten silinmez.',
      'bl.p2.s2.h': 'Akıllı nesne: orijinali koruyan kutu',
      'bl.p2.s2.p': 'Bir katmana sağ tıklayıp <code>Convert to Smart Object</code> dediğimde Photoshop orijinal görüntüyü bir kutunun içinde saklar. Nesneyi küçültüp tekrar büyüttüğümde bulanıklaşmaz, çünkü her seferinde orijinal veriden hesaplanır. Akıllı nesneye uygulanan filtreler de <em>akıllı filtre</em> olur; ayarlarını istediğim an değiştirebilir ya da kapatabilirim.',
      'bl.p2.s3.h': 'Projelerimde nasıl kullandım?',
      'bl.p2.s3.p': 'Smart Object çalışmasında görseli akıllı nesneye çevirip Puppet Warp ile duruşunu defalarca değiştirdim; hiçbir denemede kalite kaybı olmadı. Image Stack projesinde ise birden fazla kareyi tek bir akıllı nesne yığınında toplayıp Median modu ile hareketli nesneleri sahneden temizledim.',
      'bl.p2.end': 'Kısacası: önce katmanı kopyala, silgi yerine maske kullan, ölçeklemeden önce akıllı nesneye çevir. Bu üç alışkanlık dosyalarımı hem daha düzenli hem de çok daha esnek hale getirdi.',
      'bl.p3.title': 'Yapay Zekâ Araçlarıyla Modern Web Tasarımı',
      'bl.p3.meta': '7 dk okuma · Web ve yapay zekâ',
      'bl.p3.excerpt': 'Fikirden taslağa, taslaktan koda: yapay zekâ araçları web tasarım sürecini nasıl hızlandırıyor ve nerede durmamız gerekiyor?',
      'bl.p3.alt': 'Web sayfası taslağı ve yapay zekâ yardımcısı çizimi',
      'bl.p3.intro': 'Bu portfolyo sitesini hazırlarken yapay zekâ araçlarını bir yardımcı olarak kullandım. Deneyimim şu: yapay zekâ hızlı bir başlangıç noktası sunuyor, ama iyi bir sonuç için hâlâ ne istediğinizi bilmeniz ve çıkan sonucu anlamanız gerekiyor.',
      'bl.p3.s1.h': 'Fikirden taslağa',
      'bl.p3.s1.p': 'Bir sayfanın amacını, hedef kitlesini ve havasını net cümlelerle tarif ettiğinizde araçlar dakikalar içinde renk paleti, yazı tipi eşleşmesi ve sayfa yapısı önerebiliyor. Benim için en işe yarayan yöntem, istediğim duyguyu (örneğin “gün batımında sakin bir gül bahçesi”) ve kaçınmak istediklerimi birlikte yazmak oldu.',
      'bl.p3.s2.h': 'Kod yardımcıları: hızlı ama kör değil',
      'bl.p3.s2.p': 'Yapay zekâ <abbr title="HyperText Markup Language">HTML</abbr> ve <abbr title="Cascading Style Sheets">CSS</abbr> kodunu saniyeler içinde üretebiliyor. Yine de her satırı okuyup anlamadan kullanmamaya dikkat ediyorum: <code>&lt;div&gt;</code> yerine <code>&lt;nav&gt;</code>, <code>&lt;article&gt;</code> gibi anlamlı etiketlerin seçilip seçilmediğini, mobilde düzenin bozulup bozulmadığını kendim kontrol ediyorum.',
      'bl.p3.s3.h': 'Erişilebilirlik ve kontrol',
      'bl.p3.s3.p': 'Yapay zekâ araçları renk kontrastını ölçmek, görsellere alternatif metin önermek ve klavye ile gezinmeyi test etmek için de kullanışlı. Ama son kararı her zaman gerçek bir tarayıcıda, gerçek bir telefonda deneyerek veriyorum.',
      'bl.p3.s4.h': 'Sınırları bilmek',
      'bl.p3.s4.p': 'Üretilen içeriğin telif durumunu, doğruluğunu ve kişisel verilerin gizliliğini kontrol etmek bizim sorumluluğumuzda. Yapay zekâya hiçbir zaman şifre ya da başkasına ait kişisel bilgi vermiyorum.',
      'bl.p3.quote': 'Araç ne kadar akıllı olursa olsun, neyi neden yaptığını bilen kişi tasarımcıdır.',
      'bl.p3.end': 'Bence gelecekte iyi web tasarımcısı, yapay zekâyı en çok kullanan değil, ona en doğru soruyu soran ve cevabı en iyi değerlendiren kişi olacak.',

      /* ---------- iletisim.html ---------- */
      'co.title': 'İletişim',
      'co.lead': 'Bir proje, staj fırsatı ya da sadece merhaba demek için yazabilirsin. Genellikle bir iki gün içinde dönüş yaparım.',
      'co.address.label': 'Adres',
      'co.phone.label': 'Telefon',
      'co.email.label': 'E-posta',
      'co.social.label': 'Sosyal medya',
      'co.form.title': 'Mesaj gönder',
      'co.form.note': 'Tüm alanlar zorunludur.',
      'co.f.name': 'Ad Soyad',
      'co.f.email': 'E-posta',
      'co.f.subject': 'Konu',
      'co.f.message': 'Mesaj',
      'co.f.send': 'Gönder',
      'co.f.sending': 'Gönderiliyor…',
      'co.err.name': 'Lütfen adını ve soyadını yaz (en az 3 karakter).',
      'co.err.email': 'Geçerli bir e-posta adresi yaz (ör. ad@alanadi.com).',
      'co.err.subject': 'Konu en az 3 karakter olmalı.',
      'co.err.message': 'Mesajın en az 10 karakter olmalı.',
      'co.err.summary': 'Lütfen işaretli alanları düzelt.',
      'co.ok': 'Teşekkürler! Mesajın gönderildi, en kısa sürede dönüş yapacağım.',
      'co.mailto': 'E-posta uygulaman hazır mesajla açıldı. Göndermek için oradaki Gönder düğmesine basman yeterli.',
      'co.fail': 'Mesaj şu an gönderilemedi. Lütfen doğrudan {email} adresine yaz.',
      'co.privacy': 'Bilgilerin yalnızca sana dönüş yapmak için kullanılır, kimseyle paylaşılmaz.'
    },

    en: {
      'meta.home.title': '{name} | Computer Programming Student Portfolio',
      'meta.home.desc': 'Computer Programming student {name} at {school}, Vocational School of Technical Sciences: Python, SQL, web design and Motion Graphics 1 projects. A scroll portfolio through a rose garden at sunset.',
      'meta.about.title': 'About and CV | {name}',
      'meta.about.desc': '{name}: Computer Programming student at {school}, Vocational School of Technical Sciences. CV, weekly timetable, interests and Python, SQL, HTML/CSS and Photoshop skills.',
      'meta.projects.title': 'Motion Graphics 1 Projects | {name}',
      'meta.projects.desc': 'Product promotion design, selective colour with the History Brush, the Image Stack technique and a web interface on the 960.gs grid: Photoshop projects by {name}.',
      'meta.blog.title': 'Blog: Python, Photoshop and AI | {name}',
      'meta.blog.desc': 'Posts on algorithms and loops in Python, layers and Smart Objects in Photoshop, and modern web design with AI tools.',
      'meta.gallery.title': 'Gallery | {name}',
      'meta.gallery.desc': 'Photo gallery of {name}: a palm-lined walk, a coffee break, a torchlight march, a concert and more. Click a photo to enlarge it.',
      'meta.contact.title': 'Contact | {name}',
      'meta.contact.desc': 'Contact {name} in Antalya, Türkiye. Phone, email and a contact form for internships, projects and collaborations.',

      'profile.name': '{name}',
      'profile.dept': 'Computer Programming',
      'profile.school': '{school}',

      'nav.skip': 'Skip to content',
      'nav.primary': 'Main menu',
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.projects': 'Projects',
      'nav.blog': 'Blog',
      'nav.gallery': 'Gallery',
      'nav.contact': 'Contact',
      'nav.open': 'Open menu',
      'nav.close': 'Close menu',
      'nav.homeLabel': '{name}, home',
      'lang.label': 'Language',
      'lang.tr': 'Turkish',
      'lang.en': 'English',

      'hero.canvasLabel': 'A garden at sunset full of pastel pink, cream and dusty rose flowers, with drifting petals and golden specks of light.',
      'hero.c1.hello': 'Hello, I am',
      'hero.c1.line': 'I build stories with code and colour.',
      'hero.c2.kicker': 'My field',
      'hero.c2.line': '{school}, Vocational School of Technical Sciences. Where Python, databases and motion graphics meet.',
      'hero.c3.title': 'Every line of code is a door to the next.',
      'hero.c3.line': 'Keep scrolling: my projects, my photographs and a few lines about me are waiting.',

      'about.title': 'About me',
      'about.lead': 'I love bringing the logic of code together with the beauty of design.',
      'about.body': 'I study Computer Programming at {school}, Vocational School of Technical Sciences. I am learning to build logic with Python and databases, and to give that logic a visible face with Photoshop and motion graphics.',
      'about.focusLabel': 'What I focus on',
      'about.f1': 'Python',
      'about.f2': 'Databases',
      'about.f3': 'Web design',
      'about.f4': 'Motion graphics',
      'about.cta': 'Go to About page',
      'about.portraitAlt': 'Portrait photo of {name}',

      'projects.title': 'Motion Graphics 1',
      'projects.lead': 'A selection of my semester work in Adobe Photoshop and web interface design.',
      'projects.cta': 'All Projects',
      'proj.1.title': 'Product Promotion Design',
      'proj.1.sub': 'Promotional visual and poster',
      'proj.1.short': 'A clean, eye-catching promotional visual that puts a product in the spotlight.',
      'proj.1.desc': 'I cut the product photo out of its background and placed it in a new composition. I made the product stand out with light, shadow and colour adjustments, then set the headline and short copy in readable typography to create a poster ready for promotion.',
      'proj.1.alt': 'Product promotion poster design',
      'proj.2.title': 'Selective Colour',
      'proj.2.sub': 'History Brush exercise',
      'proj.2.short': 'A black and white photo where only the chosen subject keeps its colour.',
      'proj.2.desc': 'First I turned the photo fully grey with a Black & White adjustment. Then I set the History source to the colour state and painted only the main subject with the History Brush, bringing its colour back and guiding the eye to it.',
      'proj.2.alt': 'Photo selectively coloured with the History Brush',
      'proj.3.title': 'Image Stack',
      'proj.3.sub': 'The Image Stack technique',
      'proj.3.short': 'A clean scene, free of crowds, built from frames shot from the same angle.',
      'proj.3.desc': 'I loaded several frames shot from a fixed angle as layers with Load Files into Stack and aligned them with Auto-Align. After gathering the layers into one Smart Object I chose Median as the Stack Mode, and the people and cars that moved between frames simply disappeared.',
      'proj.3.alt': 'Scene cleaned with the Image Stack technique',
      'proj.4.title': 'Web Interface on the 960.gs Grid',
      'proj.4.sub': 'Grid based interface design',
      'proj.4.short': 'A tidy web page interface on a 960 pixel, 12 column grid.',
      'proj.4.desc': 'I moved the 12 column template of the 960 Grid System into Photoshop guides. Placing the header, content area, sidebar and footer on the columns, I made an interface mockup with consistent alignment that is easy to hand over to a developer.',
      'proj.4.alt': 'Web interface designed on the 960.gs grid',
      'orbit.sun': 'My projects',
      'orbit.pause': 'Pause',
      'orbit.play': 'Rotate',
      'pr.title': 'Projects',
      'pr.lead': 'My Motion Graphics 1 work on Adobe Photoshop techniques and a grid based web interface. Each card briefly explains what I did and how.',
      'pr.tech': 'Techniques used',
      'pr.course': 'Course',
      'pr.cta.title': "Let's work together on the next project.",
      'pr.cta.text': 'Write to me about an internship, a class collaboration or a small web project.',
      'pr.cta.btn': 'Get in touch',

      'gallery.title': 'Gallery',
      'gallery.lead': 'Moments that reflect me: from walks, a concert, coffee breaks and the kitchen.',
      'gallery.cta': 'Go to Gallery',
      'g1.cap': 'Palms on campus',
      'g1.desc': 'The palm-lined walk along an ornamental pool on the Akdeniz University campus.',
      'g2.cap': 'Coffee break',
      'g2.desc': 'An evening break with a cup of coffee that has my name on it.',
      'g3.cap': 'Torchlight march',
      'g3.desc': 'An evening march with flags, torches and portraits of Atatürk.',
      'g4.cap': 'Mirror shot',
      'g4.desc': 'A snapshot of the day in a wood-framed café mirror.',
      'g5.cap': 'Concert night',
      'g5.desc': 'Live music under red lights.',
      'g6.cap': 'Pizza workshop',
      'g6.desc': 'From the pizza workshop I did: two pizzas topped with sauce, vegetables and cheese, ready for the oven.',
      'ga.title': 'Gallery',
      'ga.lead': 'Six frames about me, from behind and in front of the camera. Click a photo to enlarge it; use the arrow keys to browse.',
      'ga.zoom': 'Enlarge photo',
      'ga.close': 'Close',
      'ga.prev': 'Previous photo',
      'ga.next': 'Next photo',
      'ga.dialog': 'Enlarged photo',
      'bq.open': 'Untie the ribbon to open the photos',
      'bq.hint': 'Tap the ribbon to open the bouquet',
      'bq.close': 'Gather the bouquet',

      'ph.soon': 'Image coming soon',

      'footer.closing': 'A project, a question, or just hello.',
      'footer.lead': 'Always open to internships, class collaborations and new ideas.',
      'footer.pages': 'Pages',
      'footer.social': 'Social',
      'footer.contact': 'Contact',
      'footer.rights': 'All rights reserved.',
      'footer.top': 'Back to top',

      'ab.title': 'About me',
      'ab.role': 'Computer Programming Student',
      'ab.school': '{school} · Vocational School of Technical Sciences (<abbr title="Meslek Yüksekokulu">MYO</abbr>)',
      'ab.intro': 'Hello! I am Kadriye, a first-year Computer Programming student at Akdeniz University. I am developing my skills in web design and software development, and I build functional projects with HTML, CSS, Python and basic database technologies.<br><br>I am open to new ideas, and I enjoy meeting new people and taking responsibility in teamwork. By drawing on different perspectives and putting what I learn into practice, I aim to create modern, user-friendly web experiences.',
      'ab.ctaProjects': 'See my projects',
      'ab.ctaContact': 'Write to me',
      'ab.cv.title': 'CV',
      'ab.cv.p1': 'I study Computer Programming at {school}, Vocational School of Technical Sciences (<abbr title="Meslek Yüksekokulu">MYO</abbr>). I started programming with Python; like everyone, my first line was <code>print("Hello World")</code>.',
      'ab.cv.p2': 'In Database Management I am learning how data is stored and queried: <code>SELECT</code>, <code>WHERE</code> and <code>JOIN</code> are now everyday words for me. On the web side I try to build meaningful, accessible pages with <abbr title="HyperText Markup Language">HTML</abbr> and <abbr title="Cascading Style Sheets">CSS</abbr>; this site is part of that work.',
      'ab.cv.p3': 'In Motion Graphics 1 I learned layers, masks and Smart Objects in Adobe Photoshop. Bringing the logic of code together with the beauty of visuals is what interests me most in information technology (<abbr title="Information Technology">IT</abbr>).',
      'ab.cv.quote': 'Make it work, make it right, make it fast.',
      'ab.cv.quoteBy': 'Kent Beck',
      'ab.cv.quoteNote': 'The sentence I remind myself of most often while coding.',
      'ab.cv.codeTitle': 'Me in short, as a Python dictionary:',
      'ab.sched.title': 'Weekly Timetable',
      'ab.sched.caption': 'Autumn semester weekly timetable',
      'ab.sched.time': 'Time',
      'ab.sched.hint': 'Scroll the table sideways to see every day.',
      'day.mon': 'Monday',
      'day.tue': 'Tuesday',
      'day.wed': 'Wednesday',
      'day.thu': 'Thursday',
      'day.fri': 'Friday',
      'c.python': 'Python Programming',
      'c.db': 'Database Management',
      'c.office': 'Office Software',
      'c.math': 'Basic Mathematics 1',
      'c.anim': 'Motion Graphics 1',
      'c.lab': 'Lab',
      'c.theory': 'Theory',
      'c.free': 'Free',
      'ab.int.title': 'Interests and Skills',
      'ab.int.olTitle': 'What interests me most (in order of priority)',
      'ab.int.o1': 'Software development with Python',
      'ab.int.o2': 'Database design and SQL queries',
      'ab.int.o3': 'Web interface design (HTML and CSS)',
      'ab.int.o4': 'Photo editing and motion graphics',
      'ab.int.o5': 'AI assisted creative tools',
      'ab.int.ulTitle': 'Personal skills',
      'ab.int.u1': 'Problem solving and analytical thinking',
      'ab.int.u2': 'Teamwork',
      'ab.int.u3': 'Fast learning and research',
      'ab.int.u4': 'Attention to detail',
      'ab.int.u5': 'Time management',
      'ab.sk.title': 'Technical Skills',
      'ab.sk.lead': 'My own assessment, based on what I have done in classes and in my own projects.',

      'bl.title': 'Blog',
      'bl.lead': 'Notes on what I learn about software, design and artificial intelligence.',
      'bl.read': 'Read the post',
      'bl.back': 'Back to the list',
      'bl.toc': 'Posts',
      'bl.p1.title': 'Algorithms and Loop Logic in Python',
      'bl.p1.meta': '6 min read · Python',
      'bl.p1.excerpt': 'Breaking a problem into steps and repeating those steps with for and while loops: the basic way of thinking in programming.',
      'bl.p1.alt': 'Illustration of a Python for loop and a loop symbol',
      'bl.p1.intro': 'When I started programming, the hardest part was not the syntax but the way of thinking. Telling a computer “do this” is not enough; you have to say what to do, in which order and when to stop. That ordered list of instructions is what we call an algorithm.',
      'bl.p1.s1.h': 'What is an algorithm?',
      'bl.p1.s1.p': 'An algorithm is a finite, clear sequence of steps that solves a problem. Brewing tea is an algorithm: boil the water, warm the pot, add the tea, wait. Writing the steps in plain language before coding (this is called <em>pseudocode</em>) has cut my mistakes a lot.',
      'bl.p1.s2.h': 'The for loop: a known number of repeats',
      'bl.p1.s2.p': 'When we know how many times to repeat something, we use <code>for</code>. <code>range(1, 11)</code> produces the numbers from 1 to 10; 11 is not included. The example below adds up the even numbers between 1 and 10:',
      'bl.p1.s3.h': 'The while loop: as long as a condition holds',
      'bl.p1.s3.p': 'When we do not know how many repeats there will be, we use <code>while</code>: the loop runs as long as the condition is true. A loop that never makes its condition false runs forever, so adding a limit such as a number of attempts is a good habit.',
      'bl.p1.s4.h': 'break and continue',
      'bl.p1.s4.p': '<code>break</code> ends the loop immediately, while <code>continue</code> skips the rest of the current round and moves to the next one. For example, <code>break</code> helps when we find the first negative number in a list, and <code>continue</code> when we want to skip empty values.',
      'bl.p1.end': 'The most useful exercise for me has been writing down, before every loop, the answers to “how many times will it run, and when will it stop?” Thinking about a loop with these two questions solves most bugs before you even touch the keyboard.',
      'bl.p2.title': 'Layers and Smart Object Techniques in Adobe Photoshop',
      'bl.p2.meta': '5 min read · Photoshop',
      'bl.p2.excerpt': 'The two cornerstones of non-destructive editing: layers and Smart Objects. How I used them in my Motion Graphics 1 projects.',
      'bl.p2.alt': 'Illustration of Photoshop layers and the Layers panel',
      'bl.p2.intro': 'When I first opened Photoshop I did everything on a single layer and reopened the file after every wrong step. The most important idea I learned in Motion Graphics 1 was this: a good file is a file you can undo.',
      'bl.p2.s1.h': 'Layers: everything on its own sheet',
      'bl.p2.s1.p': 'Think of layers as transparent sheets stacked on top of each other. I duplicate a layer with <code>Ctrl + J</code> to keep the original safe. Instead of the eraser I use a <strong>layer mask</strong>: where I paint black is hidden, where I paint white comes back. No pixel is ever really deleted.',
      'bl.p2.s2.h': 'Smart Objects: a box that keeps the original',
      'bl.p2.s2.p': 'When I right-click a layer and choose <code>Convert to Smart Object</code>, Photoshop keeps the original image inside a container. If I shrink the object and enlarge it again it does not blur, because it is recalculated from the original data each time. Filters applied to a Smart Object become <em>Smart Filters</em>, which I can change or switch off at any time.',
      'bl.p2.s3.h': 'How I used them in my projects',
      'bl.p2.s3.p': 'In my Smart Object study I turned the image into a Smart Object and changed its pose with Puppet Warp again and again without losing quality. In the Image Stack project I gathered several frames into one Smart Object stack and removed moving objects from the scene with the Median mode.',
      'bl.p2.end': 'In short: duplicate the layer first, use a mask instead of the eraser, and convert to a Smart Object before scaling. These three habits made my files both tidier and far more flexible.',
      'bl.p3.title': 'Modern Web Design with AI Tools',
      'bl.p3.meta': '7 min read · Web and AI',
      'bl.p3.excerpt': 'From idea to draft, from draft to code: how AI tools speed up web design, and where we should stop.',
      'bl.p3.alt': 'Illustration of a web page draft and an AI assistant',
      'bl.p3.intro': 'I used AI tools as an assistant while building this portfolio. My experience: AI gives you a fast starting point, but for a good result you still need to know what you want and understand what comes out.',
      'bl.p3.s1.h': 'From idea to draft',
      'bl.p3.s1.p': 'When you describe a page’s purpose, audience and mood in clear sentences, tools can suggest a colour palette, a font pairing and a page structure within minutes. What worked best for me was writing down the feeling I wanted (for example “a calm rose garden at sunset”) together with what I wanted to avoid.',
      'bl.p3.s2.h': 'Code assistants: fast, but not blind',
      'bl.p3.s2.p': 'AI can write <abbr title="HyperText Markup Language">HTML</abbr> and <abbr title="Cascading Style Sheets">CSS</abbr> in seconds. Still, I make sure I read and understand every line before using it: I check myself whether meaningful elements like <code>&lt;nav&gt;</code> and <code>&lt;article&gt;</code> were chosen instead of <code>&lt;div&gt;</code>, and whether the layout holds up on mobile.',
      'bl.p3.s3.h': 'Accessibility and review',
      'bl.p3.s3.p': 'AI tools are also handy for measuring colour contrast, suggesting alternative text for images and testing keyboard navigation. But I always make the final decision by trying the page in a real browser, on a real phone.',
      'bl.p3.s4.h': 'Knowing the limits',
      'bl.p3.s4.p': 'Checking the copyright status and accuracy of generated content, and the privacy of personal data, is our responsibility. I never give an AI tool passwords or someone else’s personal information.',
      'bl.p3.quote': 'However smart the tool, the designer is the one who knows what they are doing and why.',
      'bl.p3.end': 'I think the good web designer of the future will not be the one who uses AI the most, but the one who asks it the right question and judges the answer best.',

      'co.title': 'Contact',
      'co.lead': 'Write to me about a project, an internship or just to say hello. I usually reply within a day or two.',
      'co.address.label': 'Address',
      'co.phone.label': 'Phone',
      'co.email.label': 'Email',
      'co.social.label': 'Social media',
      'co.form.title': 'Send a message',
      'co.form.note': 'All fields are required.',
      'co.f.name': 'Full name',
      'co.f.email': 'Email',
      'co.f.subject': 'Subject',
      'co.f.message': 'Message',
      'co.f.send': 'Send',
      'co.f.sending': 'Sending…',
      'co.err.name': 'Please enter your full name (at least 3 characters).',
      'co.err.email': 'Please enter a valid email address (e.g. name@domain.com).',
      'co.err.subject': 'The subject must be at least 3 characters.',
      'co.err.message': 'Your message must be at least 10 characters.',
      'co.err.summary': 'Please fix the marked fields.',
      'co.ok': 'Thank you! Your message was sent and I will reply as soon as I can.',
      'co.mailto': 'Your email app opened with the message ready. Just press Send there.',
      'co.fail': 'The message could not be sent right now. Please write directly to {email}.',
      'co.privacy': 'Your details are only used to reply to you and are never shared.'
    }
  };

  var STORAGE_KEY = 'site-lang';
  var LOCALES = { tr: 'tr_TR', en: 'en_US' };

  function detect() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && dict[saved]) return saved;
    } catch (e) { /* gizli mod vb. */ }
    return 'tr';
  }

  var current = detect();

  function t(key, lang) {
    var l = lang || current;
    var v = (dict[l] && dict[l][key]);
    if (v == null) v = dict.tr[key];
    if (v == null) return key;
    return String(v).replace(/\{(\w+)\}/g, function (m, k) {
      return P[k] != null ? P[k] : m;
    });
  }

  function setMeta(selector, attr, value) {
    var el = document.head.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  function apply(root) {
    var scope = root || document;
    document.documentElement.lang = current;

    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });

    scope.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });

    scope.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var i = pair.indexOf(':');
        var attr = pair.slice(0, i).trim();
        var key = pair.slice(i + 1).trim();
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });

    var page = document.body && document.body.getAttribute('data-page');
    if (page) {
      var title = t('meta.' + page + '.title');
      var desc = t('meta.' + page + '.desc');
      document.title = title;
      setMeta('meta[name="description"]', 'content', desc);
      setMeta('meta[property="og:title"]', 'content', title);
      setMeta('meta[property="og:description"]', 'content', desc);
      setMeta('meta[name="twitter:title"]', 'content', title);
      setMeta('meta[name="twitter:description"]', 'content', desc);
      setMeta('meta[property="og:locale"]', 'content', LOCALES[current]);
    }

    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-btn') === current));
    });
  }

  function set(lang) {
    if (!dict[lang] || lang === current) return;
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* yok say */ }
    apply();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-lang-btn]');
    if (btn) set(btn.getAttribute('data-lang-btn'));
  });

  window.I18n = {
    t: t,
    apply: apply,
    set: set,
    dict: dict,
    get lang() { return current; }
  };

  apply();
})();
