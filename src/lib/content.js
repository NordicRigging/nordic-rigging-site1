/**
 * All site copy, ported from the previous build (src/translations.js + App.jsx)
 * and adapted to the new structure. Bilingual FI/EN throughout.
 *
 * Contact facts are single-sourced here so the contact section, service pages
 * and footer can never drift apart.
 */

export const CONTACT = {
  company: 'Nordic Rigging Company Oy',
  businessId: '3540981-8',
  email: 'sales@nordicrigging.fi',
  address: 'Itäinen Rantakatu 74, 20810 Turku',

  // Confirmed correct number. The old site's tel:/wa.me links pointed at a
  // different number and were wrong — do not restore them from that source.
  phoneDisplay: '+358 50 548 7766',
  phoneHref: 'tel:+358505487766',
  whatsapp: 'https://wa.me/358505487766'
};

export const LANGS = ['fi', 'en'];

export const CONTENT = {
  fi: {
    langName: 'Suomi',
    htmlLang: 'fi',

    hero: {
      title: 'Nordic Rigging',
      tagline: 'Purjeveneesi paras miehistö maalla.',
      scroll: 'Vieritä alas'
    },

    territory: {
      base: 'Kotisatama',
      legend: 'Toiminta-alue — Varsinais-Suomi & Uusimaa',
      regionA: 'Varsinais-Suomi',
      regionB: 'Uusimaa'
    },

    services: {
      eyebrow: 'Palvelut',
      title: 'Kokonaisvaltaiset ratkaisut purjeveneellesi',
      lede: 'Kolme palvelualuetta, yksi standardi: rikisi lähtee käsistämme säänkestävänä. Avaa paneeli lukeaksesi lisää.',
      readMore: 'Lue lisää',
      backHome: 'Takaisin etusivulle',
      processTitle: 'Työprosessi',
      pricingTitle: 'Hinnoittelu',
      price: '100 € sis. alv / työtunti',
      ctaHeading: 'Ole meihin yhteydessä jo tänään',
      ctaButton: 'Ota yhteyttä'
    },

    spinlock: {
      eyebrow: 'Moderni rikaus & teknologia',
      title: 'Spinlock Rig-Sense Pro',
      body: 'Hyödynnämme uusinta teknologiaa, kuten Spinlock Rig-Sense Pro -laitetta. Säädämme vantit numeroiden eikä tuntuman mukaan — mitattuna, kirjattuna ja samana jokaisen maston noston jälkeen.',
      badge: 'Digitaalinen mittaus',
      readMore: 'Lue lisää',
      watchVideo: 'Katso video',
      gaugeAlt: 'Spinlock Rig-Sense Pro -kireysmittari'
    },

    story: {
      eyebrow: 'Historia',
      title: 'Meidän tarina',
      heading: 'Kokemus kohtaa uuden energian',
      intro:
        'Nordic Rigging on isän ja pojan perustama yritys, jossa vuosikymmenten kokemus kohtaa modernin teknologian. Tuomas ja Lukas Eloranta varmistavat veneesi turvallisuuden sukupolvelta toiselle siirtyneellä ammattitaidolla.',
      paragraphs: [
        'Nordic Rigging syntyi elinikäisestä yhteydestä veneisiin ja sukupolvelta toiselle siirtyneestä kädentaitojen perinteestä. Yrityksen perustivat Lukas ja Tuomas Eloranta – isä ja poika -tiimi – joita yhdistää jaettu intohimo yrittämiseen, purjehdukseen ja veneiden merikelpoisuuden varmistamiseen.',
        'Tuomaksella on vuosikymmenten kokemus veneistä ja rikaustöistä. Hänen vesillä karttunut tietotaitonsa loi pohjan Lukakselle, joka kasvoi oppien ammattia isänsä rinnalla. Ajan myötä Lukas kehitti oman osaamisensa ja näkemyksensä, ja yhdessä he rakensivat yrityksen, jossa vankka kokemus kohtaa uuden energian.',
        'Nordic Riggingillä työskentelemme usein yhdessä, mutta otamme vastaan myös omia projektejamme. Jaamme työkalut, ideat ja yhteisen sitoutumisen laatuun.'
      ],
      highlight:
        'Tämä on meille enemmän kuin vain työtä. Se on elämäntapa, joka perustuu taitoon, meren kunnioittamiseen ja uskoon siihen, että jokainen vene ansaitsee asiantuntevaa huolta.',
      values: [
        { label: '01 / Asiantuntemus', text: 'Taitavien ammattilaistemme tiimillä on vuosien kokemus.' },
        { label: '02 / Tehokkuus', text: 'Työskentelemme tehokkaasti sovitussa aikataulussa.' }
      ]
    },

    contact: {
      eyebrow: 'Ota yhteyttä',
      heading: 'Ole meihin yhteydessä jo tänään',
      lede: 'Kotisatamamme on Turussa ja liikumme rannikolla Varsinais-Suomessa ja Uudellamaalla. Kerro veneesi, rikisi ja mitä on tehtävä.',
      tabs: { call: 'Soita', email: 'Sähköposti', whatsapp: 'WhatsApp' },
      callLabel: 'Puhelin',
      emailLabel: 'Sähköposti',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Viesti suoraan WhatsAppissa',
      callButton: 'Soita nyt',
      emailButton: 'Lähetä sähköposti',
      whatsappButton: 'Avaa WhatsApp',
      mailSubject: 'Yhteydenotto',
      addressLabel: 'Käyntiosoite',
      areaLabel: 'Toiminta-alue',
      area: 'Varsinais-Suomi & Uusimaa'
    },

    footer: {
      tagline: 'Purjeveneesi paras miehistö maalla.',
      navHeading: 'Navigaatio',
      contactHeading: 'Yhteystiedot',
      detailsHeading: 'Yritystiedot',
      businessIdLabel: 'Y-tunnus',
      nav: [
        { label: 'Palvelut', href: '/#services' },
        { label: 'Meistä', href: '/#story' },
        { label: 'Ota yhteyttä', href: '/#contact' }
      ],
      rights: 'Kaikki oikeudet pidätetään.'
    },

    langPicker: {
      title: 'Valitse kieli',
      fi: 'Suomi (FI)',
      en: 'English (EN)'
    }
  },

  en: {
    langName: 'English',
    htmlLang: 'en',

    hero: {
      title: 'Nordic Rigging',
      tagline: "Your Sailboat's Best Crew on Land.",
      scroll: 'Scroll down'
    },

    territory: {
      base: 'Home base',
      legend: 'Service area — Varsinais-Suomi & Uusimaa',
      regionA: 'Varsinais-Suomi',
      regionB: 'Uusimaa'
    },

    services: {
      eyebrow: 'Services',
      title: 'Comprehensive solutions for your boat',
      lede: 'Three lines of work, one standard: your rig leaves our hands ready for weather. Open a panel to read more.',
      readMore: 'Read more',
      backHome: 'Back to home',
      processTitle: 'Work process',
      pricingTitle: 'Pricing',
      price: '€100 incl. VAT / hour',
      ctaHeading: 'Get in touch with us today',
      ctaButton: 'Get in touch'
    },

    spinlock: {
      eyebrow: 'Modern rigging & tech',
      title: 'Spinlock Rig-Sense Pro',
      body: 'We utilize the latest technology, such as the Spinlock Rig-Sense Pro. We set shrouds by numbers, not by feel — measured, logged, and the same after every re-step.',
      badge: 'Digital measurement',
      readMore: 'Read more',
      watchVideo: 'Watch video',
      gaugeAlt: 'Spinlock Rig-Sense Pro rig tension gauge'
    },

    story: {
      eyebrow: 'History',
      title: 'Our story',
      heading: 'Experience meets new energy',
      intro:
        "Nordic Rigging is a father-and-son company where decades of experience meet modern technology. Tuomas and Lukas Eloranta ensure your boat's safety with skills passed down through generations.",
      paragraphs: [
        'Nordic Rigging was born from a lifelong connection to boats and a tradition of craftsmanship passed down from generation to generation. Founded by Lukas and Tuomas Eloranta, a father-and-son team united by a passion for sailing and rigging.',
        "Tuomas has decades of experience. His knowledge gained on the water laid the foundation for Lukas, who grew up learning the trade by his father's side. Together they built a company where solid experience meets new energy.",
        'At Nordic Rigging, we often work together but also take on our own projects. We share tools, ideas, and a common commitment to quality.'
      ],
      highlight:
        "This is more than just a job for us. It's a way of life based on skill, respect for the sea, and the belief that every boat deserves expert care.",
      values: [
        { label: '01 / Expertise', text: 'Our team of skilled professionals has years of experience.' },
        { label: '02 / Efficiency', text: 'We work efficiently within the agreed schedule.' }
      ]
    },

    contact: {
      eyebrow: 'Contact',
      heading: 'Get in touch with us today',
      lede: 'Based in Turku, working the coast across Varsinais-Suomi and Uusimaa. Tell us your boat, your rig, and what needs doing.',
      tabs: { call: 'Call', email: 'Email', whatsapp: 'WhatsApp' },
      callLabel: 'Phone',
      emailLabel: 'Email',
      whatsappLabel: 'WhatsApp',
      whatsappValue: 'Message us directly on WhatsApp',
      callButton: 'Call now',
      emailButton: 'Send email',
      whatsappButton: 'Open WhatsApp',
      mailSubject: 'Inquiry',
      addressLabel: 'Address',
      areaLabel: 'Service area',
      area: 'Varsinais-Suomi & Uusimaa'
    },

    footer: {
      tagline: "Your boat's best crew on land.",
      navHeading: 'Navigation',
      contactHeading: 'Contact',
      detailsHeading: 'Company details',
      businessIdLabel: 'Business ID',
      nav: [
        { label: 'Services', href: '/#services' },
        { label: 'About', href: '/#story' },
        { label: 'Contact', href: '/#contact' }
      ],
      rights: 'All rights reserved.'
    },

    langPicker: {
      title: 'Select language',
      fi: 'Suomi (FI)',
      en: 'English (EN)'
    }
  }
};

/**
 * The three service lines. Slugs match the routes the old site's newer
 * ServicesSection already pointed at: /services/mast-work | rope-stock | maintenance.
 * `fallback` is the designed solid colour shown until the real photo lands at
 * the exact `image` path.
 */
export const SERVICES = [
  {
    slug: 'mast-work',
    image: '/images/mast-work.webp',
    heroImage: '/images/mast-work-hero.webp',
    fallback: '#152431',
    fi: {
      tag: 'Mastotyöt',
      title: 'Ammattimaiset rikaus- ja mastotyöt',
      lead: 'Tarjoamme asiakkaillemme räätälöitäviä vaihtoehtoja rikaukseen ja huoltoon.',
      steps: [
        { title: 'Esitarkastus', text: 'Maston ja rikin perusteellinen visuaalinen läpikäynti.' },
        { title: 'Digitaalinen mittaus', text: 'Käytämme tarkkoja mittalaitteita kireyden tallentamiseen.' },
        { title: 'Raportointi', text: 'Kirjallinen yhteenveto havainnoista huoltokirjaan.' }
      ],
      checks: [
        { title: 'Erikoistyökalut & mittalaitteet', text: 'Alan moderneimmat laitteet sisältyvät hintaan.' },
        { title: 'Vakuutettu toiminta', text: 'Toimintamme on täysin vakuutettua turvaksesi.' }
      ]
    },
    en: {
      tag: 'Mast Work',
      title: 'Professional rigging and mast services',
      lead: 'We offer our customers customizable options for rigging and maintenance.',
      steps: [
        { title: 'Inspection', text: 'A thorough visual inspection of the mast and rigging.' },
        { title: 'Digital Measurement', text: 'We use precise measuring equipment to record tension.' },
        { title: 'Reporting', text: 'A written summary of findings for the maintenance log.' }
      ],
      checks: [
        { title: 'Specialized Tools', text: 'The most modern equipment in the industry is included in the price.' },
        { title: 'Insured Operations', text: 'Our operations are fully insured for your safety.' }
      ]
    }
  },
  {
    slug: 'rope-stock',
    image: '/images/rope-stock.webp',
    heroImage: '/images/rope-stock-hero.webp',
    fallback: '#2b241d',
    fi: {
      tag: 'Varasto',
      title: 'Laadukas köysivarasto',
      lead: 'Ammattimainen spleicaus ja räätälöidyt köysisarjat kaikkiin tarkoituksiin.',
      steps: [
        { title: 'Mitoitus', text: 'Määritämme oikeat pituudet ja venymäarvot veneesi mukaan.' },
        { title: 'Spleicaus', text: 'Valmistamme silmukat ja jatkokset käsityönä kestävyyden maksimoimiseksi.' },
        { title: 'Toimitus', text: 'Asennamme köydet tarvittaessa suoraan veneeseen.' }
      ],
      checks: []
    },
    en: {
      tag: 'Rope Stock',
      title: 'High-quality rope storage',
      lead: 'Professional splicing and custom rope sets for all purposes.',
      steps: [
        { title: 'Measurement', text: 'We determine the correct lengths and elongation values for your boat.' },
        { title: 'Splicing', text: 'We manufacture loops and splices by hand to maximize durability.' },
        { title: 'Delivery', text: 'We install the ropes directly on the boat if necessary.' }
      ],
      checks: []
    }
  },
  {
    slug: 'maintenance',
    image: '/images/maintenance.webp',
    heroImage: '/images/maintenance-hero.webp',
    fallback: '#1b2a25',
    fi: {
      tag: 'Huolto',
      title: 'Telakointi ja kausihuolto',
      lead: 'Varmista veneesi kunto ja arvon säilyminen ammattimaisella talvisäilytyksellä ja kausihuollolla.',
      steps: [
        { title: 'Nosto & Pesu', text: 'Huolellinen nosto ja pohjan pesu heti nostohetkellä.' },
        { title: 'Ylläpito', text: 'Suoritamme sovitut huollot säilytyksen aikana.' },
        { title: 'Keväthuolto', text: 'Puhdistus, vahaus ja vesillelasku.' }
      ],
      checks: []
    },
    en: {
      tag: 'Maintenance',
      title: 'Docking and seasonal maintenance',
      lead: "Ensure your boat's condition and value with professional winter storage and seasonal maintenance.",
      steps: [
        { title: 'Lift & Wash', text: 'Careful lifting and hull washing immediately upon haul-out.' },
        { title: 'Maintenance', text: 'We perform agreed-upon maintenance during storage.' },
        { title: 'Spring Service', text: 'Cleaning, waxing, and launching.' }
      ],
      checks: []
    }
  }
];

export const serviceBySlug = slug => SERVICES.find(s => s.slug === slug);
