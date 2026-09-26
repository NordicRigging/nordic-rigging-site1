export const CONTACT = {
  company: 'Nordic Rigging Company Oy',
  businessId: '3540981-8',
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
      title: 'Nordic Rigging | Rikaus ja mastotyöt, Turku',
      description: 'Purjeveneesi paras miehistö maalla. Mastotyöt, köysivarasto ja huolto Turusta käsin, koko Saaristomerellä.'
    },
    hud: { headingLabel: 'SUUNTA' },
    nav: {
      home: 'Etusivu',
      services: 'Palvelut',
      contact: 'Ota yhteyttä',
      about: 'Meistä',
      menu: 'Valikko',
      close: 'Sulje',
      language: 'Kieli'
    },
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
      kinetic: ['Mitattu', 'Viritetty', 'Luotettu']
    },
    spinlock: {
      eyebrow: 'Mitattu, ei arvioitu',
      title: 'Spinlock Rig-Sense Pro',
      body: 'Mittaamme rikin jännityksen prosentin tarkkuudella sen sijaan että arvioisimme sen tuntumalta.',
      readMore: 'Lue lisää',
      watchVideo: 'Katso video'
    },
    story: {
      eyebrow: 'Turku, Suomi',
      sentences: [
        'Nordic Rigging on isä ja poika.',
        'Työskentelemme rikien parissa Turusta käsin, veneillä jotka purjehtivat Saaristomerellä.',
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
        call: { label: 'Soita', action: 'Suora linja', cta: 'Soita nyt' },
        email: { label: 'Sähköposti', action: 'Myynti ja huolto', cta: 'Lähetä sähköposti' },
        whatsapp: { label: 'WhatsApp', action: 'Viesti', cta: 'Avaa WhatsApp' }
      },
      globeAria: 'Karttapallo joka kääntyy Suomeen ja tarkentaa Turkuun ja Helsinkiin',
      globeLabel: 'Turku',
      globeSecondary: 'Helsinki'
    },
    servicePage: {
      eyebrow: 'Palvelut',
      includesTitle: 'Mitä tähän kuuluu',
      outcomeTitle: 'Lopputulos',
      processTitle: 'Näin työ etenee',
      pricingTitle: 'Hinta',
      readMore: 'Lue lisää palvelusta',
      askCta: 'Kysy tästä palvelusta',
      callCta: 'Soita',
      back: 'Takaisin etusivulle',
      otherServices: 'Muut palvelut',
      notFoundEyebrow: 'Ei löytynyt',
      notFoundTitle: 'Ulkona kartalta',
      notFoundBody: 'Tässä osoitteessa ei ole sivua.',
      items: {
        'mast-work': {
          name: 'Mastotyöt',
          short: 'Maston nosto ja lasku, vanttien ja köysien vaihto, rikin tarkastus.',
          lead: 'Masto ylös keväällä ja alas syksyllä ilman säätöä. Vantit vaihdetaan ajoissa ja kiristetään mittarilla oikeaan kireyteen, ei tuntumalla.',
          includes: [
            'Maston nosto ja lasku',
            'Vanttien ja staagien vaihto',
            'Köysien eli juoksevan rikin vaihto',
            'Rikin tarkastus ja kireyden mittaus',
            'Huolto- ja korjaustyöt mastoon ja puomiin'
          ],
          outcome: 'Masto suorassa, vantit oikeassa kireydessä ja lukemat kirjattuna seuraavaa kevättä varten.',
          process: [
            { title: 'Tarkastus', text: 'Käymme maston, vantit ja helat läpi ja kerromme, mitä kannattaa vaihtaa.' },
            { title: 'Nosto ja trimmaus', text: 'Masto nostetaan, vantit kiristetään Spinlock Rig-Sense Pro -mittarilla ja lukemat kirjataan.' },
            { title: 'Yhteenveto', text: 'Saat havainnot ja lukemat veneesi huoltokirjaan.' }
          ],
          pricing: '100 € / h sis. alv. Suuremmat rikaustyöt myös urakkahintaan, sovitaan etukäteen.'
        },
        'rope-stock': {
          name: 'Köysivarasto',
          short: 'Pleissaukset, mittatilausköydet sekä köysien ja rikitarvikkeiden myynti.',
          lead: 'Oikea köysi oikeaan paikkaan, valmiiksi pleissattuna ja mitoitettuna veneesi mukaan. Varastosta löytyvät laadukkaat köydet ja rikitarvikkeet.',
          includes: [
            'Pleissaustyöt: silmukat, jatkokset ja ohennetut köydet',
            'Köysien mittatilaustyöt veneesi mittojen mukaan',
            'Fallit, jalukset ja muut juoksevan rikin köydet',
            'Köysien ja rikitarvikkeiden myynti',
            'Asennus suoraan veneeseen tarvittaessa'
          ],
          outcome: 'Köydet, jotka istuvat helaan, kestävät kauden ja on mitoitettu juuri sinun veneellesi.',
          process: [
            { title: 'Mitoitus', text: 'Käydään läpi tarvittavat köydet: pituudet, paksuudet ja venymä.' },
            { title: 'Valmistus', text: 'Pleissaukset tehdään käsityönä varastollamme.' },
            { title: 'Toimitus tai asennus', text: 'Noudat valmiit köydet tai asennamme ne veneeseesi.' }
          ],
          pricing: '100 € / h sis. alv työstä. Köydet ja tarvikkeet hinnoitellaan erikseen, pyydä tarjous.'
        },
        maintenance: {
          name: 'Huolto',
          short: 'Kausitelakointi, pesu, vahaus, maalaus ja muut kausihuollot.',
          lead: 'Vene talveksi turvaan ja keväällä vesille ajallaan. Hoidamme kausihuollot sekä nostot ja siirrot yhteistyössä telakoiden kanssa.',
          includes: [
            'Kausitelakointi ja talvisäilytyksen valmistelu',
            'Pohjan ja kansien pesu',
            'Vahaus ja kiillotus',
            'Pohjamaalaus ja muut maalaustyöt',
            'Muut kausihuollot',
            'Nostot ja siirrot yhteistyössä telakoiden kanssa'
          ],
          outcome: 'Vene säilyttää arvonsa ja on valmis, kun purjehduskausi alkaa.',
          process: [
            { title: 'Syksy', text: 'Nosto, pesu ja talvisäilytyksen valmistelu.' },
            { title: 'Talvi', text: 'Sovitut huollot ja korjaukset säilytyksen aikana.' },
            { title: 'Kevät', text: 'Vahaus, pohjamaalaus, mastonnosto ja vesillelasku.' }
          ],
          pricing: '100 € / h sis. alv. Materiaalit ja telakkamaksut erikseen.'
        }
      }
    },
    footer: {
      tagline: 'Purjeveneesi paras miehistö maalla.',
      servicesCol: 'Palvelut',
      yardsLink: 'Telakoille',
      contactCol: 'Yhteystiedot',
      companyCol: 'Yritys',
      businessId: 'Y-tunnus',
      area: 'Varsinais-Suomi ja Uusimaa',
      rights: 'Kaikki oikeudet pidätetään.'
    },
    langToggle: { fi: 'FI', en: 'EN' }
  },
  en: {
    htmlLang: 'en',
    meta: {
      title: 'Nordic Rigging | Mast Work & Rigging, Turku',
      description: "Your sailboat's best crew on land. Mast work, rope stock and maintenance out of Turku, across the archipelago."
    },
    hud: { headingLabel: 'HDG' },
    nav: {
      home: 'Home',
      services: 'Services',
      contact: 'Contact',
      about: 'About',
      menu: 'Menu',
      close: 'Close',
      language: 'Language'
    },
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
      kinetic: ['Measured', 'Tuned', 'Trusted']
    },
    spinlock: {
      eyebrow: 'Measured, not estimated',
      title: 'Spinlock Rig-Sense Pro',
      body: 'We measure rig tension to within one percent instead of estimating it by feel.',
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
        call: { label: 'Call', action: 'Direct line', cta: 'Call now' },
        email: { label: 'Email', action: 'Sales and service', cta: 'Send an email' },
        whatsapp: { label: 'WhatsApp', action: 'Message', cta: 'Open WhatsApp' }
      },
      globeAria: 'Globe turning to Finland and zooming in on Turku and Helsinki',
      globeLabel: 'Turku',
      globeSecondary: 'Helsinki'
    },
    servicePage: {
      eyebrow: 'Services',
      includesTitle: "What's included",
      outcomeTitle: 'Outcome',
      processTitle: 'How the work goes',
      pricingTitle: 'Price',
      readMore: 'Read more about this service',
      askCta: 'Ask about this service',
      callCta: 'Call',
      back: 'Back to home',
      otherServices: 'Other services',
      notFoundEyebrow: 'Not found',
      notFoundTitle: 'Off chart',
      notFoundBody: 'No page at this address.',
      items: {
        'mast-work': {
          name: 'Mast work',
          short: 'Stepping and unstepping, shroud and rope replacement, rig inspection.',
          lead: 'Mast up in spring and down in autumn without fuss. Shrouds are replaced in time and tensioned with a gauge, not by feel.',
          includes: [
            'Stepping and unstepping the mast',
            'Shroud and stay replacement',
            'Running rigging replacement',
            'Rig inspection and tension measurement',
            'Repairs and service on mast and boom'
          ],
          outcome: 'Mast straight, shrouds at the right tension, readings logged for next spring.',
          process: [
            { title: 'Inspection', text: 'We go through the mast, shrouds and fittings and tell you what is worth replacing.' },
            { title: 'Step and tune', text: 'The mast goes up, shrouds are tensioned with the Spinlock Rig-Sense Pro and readings are logged.' },
            { title: 'Summary', text: 'You get the findings and readings for your boat’s maintenance log.' }
          ],
          pricing: '€100 / h incl. VAT. Larger rigging jobs also at a fixed price, agreed in advance.'
        },
        'rope-stock': {
          name: 'Rope stock',
          short: 'Splicing, made-to-measure ropes, rope and rigging hardware sales.',
          lead: 'The right rope in the right place, spliced and measured for your boat. Quality ropes and rigging hardware in stock.',
          includes: [
            'Splicing: eyes, joins and tapered ropes',
            'Made-to-measure ropes for your boat',
            'Halyards, sheets and other running rigging',
            'Rope and rigging hardware sales',
            'Fitted directly on the boat when needed'
          ],
          outcome: 'Ropes that fit the hardware, last the season and are sized for your boat.',
          process: [
            { title: 'Sizing', text: 'We go through what is needed: lengths, diameters and stretch.' },
            { title: 'Making', text: 'Splices are made by hand at our stock.' },
            { title: 'Pick-up or fitting', text: 'Collect the finished ropes or have us fit them on the boat.' }
          ],
          pricing: '€100 / h incl. VAT for the work. Ropes and hardware priced separately, ask for a quote.'
        },
        maintenance: {
          name: 'Maintenance',
          short: 'Seasonal haul-out, washing, waxing, painting and other seasonal service.',
          lead: 'Boat safely ashore for winter and back on the water on time. Seasonal service, lifts and moves together with the yards.',
          includes: [
            'Seasonal haul-out and winter storage preparation',
            'Hull and deck washing',
            'Waxing and polishing',
            'Antifouling and other painting',
            'Other seasonal service',
            'Lifts and moves together with partner yards'
          ],
          outcome: 'The boat keeps its value and is ready when the season starts.',
          process: [
            { title: 'Autumn', text: 'Haul-out, wash and winter storage preparation.' },
            { title: 'Winter', text: 'Agreed service and repairs during storage.' },
            { title: 'Spring', text: 'Waxing, antifouling, mast stepping and launch.' }
          ],
          pricing: '€100 / h incl. VAT. Materials and yard fees separately.'
        }
      }
    },
    footer: {
      tagline: "Your sailboat's best crew on land.",
      servicesCol: 'Services',
      yardsLink: 'For yards',
      contactCol: 'Contact',
      companyCol: 'Company',
      businessId: 'Business ID',
      area: 'Varsinais-Suomi and Uusimaa',
      rights: 'All rights reserved.'
    },
    langToggle: { fi: 'FI', en: 'EN' }
  }
};
