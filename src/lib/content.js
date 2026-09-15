export const CONTACT = {
  phoneHref: 'tel:+358505487766',
  phoneIntl: '+358 50 548 7766',
  email: 'sales@nordicrigging.fi',
  whatsapp: 'https://wa.me/358505487766',
  street: 'Itäinen Rantakatu 74',
  postal: '20810 Turku',
  turku: [22.2666, 60.4518],
  helsinki: [24.9384, 60.1699]
};

export const CONTENT = {
  fi: {
    htmlLang: 'fi',
    meta: {
      title: 'Nordic Rigging — Takilointi ja mastotyöt, Turku',
      description: 'Purjeveneesi paras miehistö maalla. Mastotyöt, köysivarasto ja huolto Turusta käsin, koko Saaristomerellä.'
    },
    hud: { headingLabel: 'SUUNTA' },
    hero: {
      wordmarkSr: 'Nordic Rigging',
      tagline: 'Purjeveneesi paras miehistö maalla.',
      scrollCue: 'Vieritä'
    },
    trust: {
      stats: [
        { to: 20, suffix: '+', label: 'Vuotta' },
        { to: 100, suffix: '+', label: 'Huollettua venettä' },
        { to: 24, suffix: 'h', label: 'Vasteaika' }
      ]
    },
    services: {
      eyebrow: 'Palvelut',
      cards: [
        { title: 'Mastotyöt', copy: 'Ammattitason takilointi ja mastopalvelut.', to: '/services/mast-work', view: 'Katso' },
        { title: 'Köysivarasto', copy: 'Korkealaatuiset köydet ja pletointi.', to: '/services/rope-stock', view: 'Katso' },
        { title: 'Huolto', copy: 'Kausihuolto ja telakointi.', to: '/services/maintenance', view: 'Katso' }
      ],
      kinetic: ['Mitattu', 'Viritetty', 'Luotettu']
    },
    spinlock: {
      eyebrow: 'Mitattu, ei arvioitu',
      title: 'Spinlock Rig-Sense Pro',
      body: 'Mittaamme takilan jännityksen newtonin tarkkuudella sen sijaan että arvioisimme sen tuntumalta.',
      readMore: 'Lue lisää',
      watchVideo: 'Katso video'
    },
    story: {
      eyebrow: 'Turku, Suomi',
      sentences: [
        'Nordic Rigging on isä ja poika.',
        'Työskentelemme takiloiden parissa Turusta käsin, veneillä jotka purjehtivat Saaristomerellä.',
        'Kaksi ihmistä, yksi standardi.'
      ]
    },
    contact: {
      title: 'Ota yhteyttä',
      who: {
        legend: 'Olen',
        private: 'Yksityinen asiakas',
        yard: 'Telakka tai satama'
      },
      subjectPrivate: 'Yhteydenotto veneenomistajalta',
      subjectYard: 'Yhteistyötiedustelu telakalta tai satamalta',
      bodyPrivate: 'Hei, ottaisin mielelläni yhteyttä koskien venettäni.',
      bodyYard: 'Hei, ottaisin mielelläni yhteyttä yhteistyömahdollisuudesta.',
      waPrivate: 'Hei, ottaisin mielelläni yhteyttä koskien venettäni.',
      waYard: 'Hei, ottaisin mielelläni yhteyttä yhteistyömahdollisuudesta.',
      channels: {
        call: { label: 'Soita', action: 'Suora linja' },
        email: { label: 'Sähköposti', action: 'Myynti ja huolto' },
        whatsapp: { label: 'WhatsApp', action: 'Viesti' }
      },
      globeAria: 'Karttapallo joka kääntyy Suomeen ja tarkentaa Turkuun ja Helsinkiin',
      globeLabel: 'Turku',
      globeSecondary: 'Helsinki'
    },
    servicePage: {
      titles: { 'mast-work': 'Mastotyöt', 'rope-stock': 'Köysivarasto', maintenance: 'Huolto' },
      eyebrow: 'Palvelut',
      notFoundEyebrow: 'Ei löytynyt',
      notFoundTitle: 'Ulkona kartalta',
      placeholder: 'Sivu on vielä paikkamerkki.',
      notFoundBody: 'Tässä osoitteessa ei ole sivua.',
      back: 'Takaisin'
    },
    langToggle: { fi: 'FI', en: 'EN' }
  },
  en: {
    htmlLang: 'en',
    meta: {
      title: 'Nordic Rigging — Mast Work & Rigging, Turku',
      description: "Your sailboat's best crew on land. Mast work, rope stock and maintenance out of Turku, across the archipelago."
    },
    hud: { headingLabel: 'HDG' },
    hero: {
      wordmarkSr: 'Nordic Rigging',
      tagline: "Your Sailboat's Best Crew on Land.",
      scrollCue: 'Scroll'
    },
    trust: {
      stats: [
        { to: 20, suffix: '+', label: 'Years' },
        { to: 100, suffix: '+', label: 'Boats serviced' },
        { to: 24, suffix: 'h', label: 'Response' }
      ]
    },
    services: {
      eyebrow: 'Services',
      cards: [
        { title: 'Mast Work', copy: 'Professional rigging and mast services.', to: '/services/mast-work', view: 'View' },
        { title: 'Rope Stock', copy: 'High-quality rope and splicing.', to: '/services/rope-stock', view: 'View' },
        { title: 'Maintenance', copy: 'Seasonal service and docking.', to: '/services/maintenance', view: 'View' }
      ],
      kinetic: ['Measured', 'Tuned', 'Trusted']
    },
    spinlock: {
      eyebrow: 'Measured, not estimated',
      title: 'Spinlock Rig-Sense Pro',
      body: 'We measure rig tension to the newton instead of estimating it by feel.',
      readMore: 'Read more',
      watchVideo: 'Watch video'
    },
    story: {
      eyebrow: 'Turku, Finland',
      sentences: [
        'Nordic Rigging is a father and a son.',
        'We work rigs out of Turku, on boats that sail the Finnish archipelago.',
        'Two people, one standard.'
      ]
    },
    contact: {
      title: 'Contact',
      who: {
        legend: 'I am',
        private: 'A boat owner',
        yard: 'A yard or marina'
      },
      subjectPrivate: 'Enquiry from a boat owner',
      subjectYard: 'Partnership enquiry from a yard or marina',
      bodyPrivate: 'Hi, I would like to get in touch about my boat.',
      bodyYard: 'Hi, I would like to get in touch about a partnership.',
      waPrivate: 'Hi, I would like to get in touch about my boat.',
      waYard: 'Hi, I would like to get in touch about a partnership.',
      channels: {
        call: { label: 'Call', action: 'Direct line' },
        email: { label: 'Email', action: 'Sales and service' },
        whatsapp: { label: 'WhatsApp', action: 'Message' }
      },
      globeAria: 'Globe turning to Finland and zooming in on Turku and Helsinki',
      globeLabel: 'Turku',
      globeSecondary: 'Helsinki'
    },
    servicePage: {
      titles: { 'mast-work': 'Mast Work', 'rope-stock': 'Rope Stock', maintenance: 'Maintenance' },
      eyebrow: 'Services',
      notFoundEyebrow: 'Not found',
      notFoundTitle: 'Off chart',
      placeholder: 'Placeholder page.',
      notFoundBody: 'No page at this address.',
      back: 'Back'
    },
    langToggle: { fi: 'FI', en: 'EN' }
  }
};
