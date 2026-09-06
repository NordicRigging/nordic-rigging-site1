/**
 * All site copy and company facts, FI + EN.
 * Nothing user-visible is hard-coded in components.
 */

export const CONTACT = {
  company: 'Nordic Rigging Company Oy',
  shortName: 'Nordic Rigging',
  businessId: '3540981-8',
  email: 'sales@nordicrigging.fi',
  street: 'Itäinen Rantakatu 74',
  postal: '20810 Turku',
  address: 'Itäinen Rantakatu 74, 20810 Turku',
  phoneDisplay: '050 548 7766',
  phoneIntl: '+358 50 548 7766',
  phoneHref: 'tel:+358505487766',
  whatsapp: 'https://wa.me/358505487766',
  yard: 'Ajolanranta Oy',
  hourly: '100 €',
  // Turku and Helsinki, for the globe
  turku: [22.2666, 60.4518],
  helsinki: [24.9384, 60.1699]
};

export const LANGS = ['fi', 'en'];

/**
 * The crew. `photo` is null until a portrait exists: drop the files at
 * public/images/team/tuomas.webp and lukas.webp and set the paths here. With
 * null the avatar shows initials and no request is made.
 */
export const TEAM = [
  {
    id: 'tuomas',
    name: 'Tuomas Eloranta',
    photo: null,
    fi: { role: 'Rikaaja, perustaja', line: 'Vuosikymmenten kokemus rikaus- ja venetöistä.' },
    en: { role: 'Rigger, founder', line: 'Decades of hands-on rigging and boat work.' }
  },
  {
    id: 'lukas',
    name: 'Lukas Eloranta',
    photo: null,
    fi: { role: 'Rikaaja, perustaja', line: 'Kasvanut ammattiin isänsä rinnalla.' },
    en: { role: 'Rigger, founder', line: 'Learned the trade working beside his father.' }
  }
];

/**
 * Finished-work references for the "Tehdyt työt" tab. Placeholder photos
 * from the customer's own service images until real job photos replace
 * them — drop new files in public/images/portfolio/ and add an entry here;
 * nothing else needs to change for the grid to pick them up.
 */
export const PORTFOLIO = [
  {
    id: 'mastotyo-1',
    image: '/images/portfolio/mastotyo-1.webp',
    fi: { caption: 'Mastonnosto ja vanttien vaihto' },
    en: { caption: 'Mast stepping and shroud replacement' }
  },
  {
    id: 'koysivarasto-1',
    image: '/images/portfolio/koysivarasto-1.webp',
    fi: { caption: 'Mittatilausköysi valmiina noudettavaksi' },
    en: { caption: 'A made-to-measure rope, ready for pick-up' }
  },
  {
    id: 'huolto-1',
    image: '/images/portfolio/huolto-1.webp',
    fi: { caption: 'Kausihuolto ja talvisäilytyksen valmistelu' },
    en: { caption: 'Seasonal service and winter storage prep' }
  },
  {
    id: 'telakkayhteistyo-1',
    image: '/images/portfolio/telakkayhteistyo-1.webp',
    fi: { caption: 'Alihankintatyötä telakalla' },
    en: { caption: 'Subcontracted work at a partner yard' }
  }
];

export const SERVICES = [
  {
    slug: 'mastotyot',
    image: '/images/mastotyot.webp',
    fi: {
      name: 'Mastotyöt',
      short: 'Maston nosto ja lasku, vanttien ja köysien vaihto, rikin tarkastus.',
      lead:
        'Masto ylös keväällä ja alas syksyllä ilman säätöä. Vantit vaihdetaan ajoissa ja kiristetään mittarilla oikeaan kireyteen, ei tuntumalla.',
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
    en: {
      name: 'Mast work',
      short: 'Stepping and unstepping, shroud and rope replacement, rig inspection.',
      lead:
        'Mast up in spring and down in autumn without fuss. Shrouds are replaced in time and tensioned with a gauge, not by feel.',
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
    }
  },
  {
    slug: 'koysivarasto',
    image: '/images/koysivarasto.webp',
    fi: {
      name: 'Köysivarasto',
      short: 'Pleissaukset, mittatilausköydet sekä köysien ja rikitarvikkeiden myynti.',
      lead:
        'Oikea köysi oikeaan paikkaan, valmiiksi pleissattuna ja mitoitettuna veneesi mukaan. Varastosta löytyvät laadukkaat köydet ja rikitarvikkeet.',
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
    en: {
      name: 'Rope stock',
      short: 'Splicing, made-to-measure ropes, rope and rigging hardware sales.',
      lead:
        'The right rope in the right place, spliced and measured for your boat. Quality ropes and rigging hardware in stock.',
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
    }
  },
  {
    slug: 'huolto',
    image: '/images/huolto.webp',
    fi: {
      name: 'Huolto',
      short: 'Kausitelakointi, pesu, vahaus, maalaus ja muut kausihuollot.',
      lead:
        'Vene talveksi turvaan ja keväällä vesille ajallaan. Hoidamme kausihuollot sekä nostot ja siirrot yhteistyössä telakoiden kanssa.',
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
    },
    en: {
      name: 'Maintenance',
      short: 'Seasonal haul-out, washing, waxing, painting and other seasonal service.',
      lead:
        'Boat safely ashore for winter and back on the water on time. Seasonal service, lifts and moves together with the yards.',
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
];

export const serviceBySlug = slug => SERVICES.find(s => s.slug === slug);

export const CONTENT = {
  fi: {
    htmlLang: 'fi',
    langName: 'Suomi',
    meta: {
      title: 'Nordic Rigging | Mastotyöt, köysivarasto ja huolto, Turku',
      description:
        'Nordic Rigging Company Oy: purjeveneiden mastotyöt, köysivarasto ja kausihuolto Turussa. Vanttien kireys mitataan Spinlock Rig-Sense Pro -mittarilla. 100 € / h sis. alv. Varsinais-Suomi ja Uusimaa.'
    },
    skip: 'Siirry sisältöön',
    nav: {
      services: 'Palvelut',
      yards: 'Telakoille',
      portfolio: 'Tehdyt työt',
      about: 'Meistä',
      contact: 'Ota Yhteyttä',
      call: 'Soita',
      menu: 'Valikko',
      close: 'Sulje',
      language: 'Kieli',
      home: 'Etusivulle'
    },
    tabs: {
      sectionTitle: 'Palvelut, telakkayhteistyö, referenssit ja tekijät'
    },
    hero: {
      eyebrow: 'Purjeveneesi paras miehistö maalla',
      title: 'Purjeveneesi rikki kuntoon Turussa.',
      lead:
        'Mastotyöt, köysivarasto ja kausihuolto. Tulemme veneesi luo satamaan tai telakalle Varsinais-Suomessa ja Uudellamaalla.',
      callCta: 'Soita 050 548 7766',
      messageCta: 'Lähetä viesti',
      facts: [
        { label: 'Tuntihinta', value: '100 € sis. alv' },
        { label: 'Toimialue', value: 'Varsinais-Suomi ja Uusimaa' },
        { label: 'Tekijät', value: 'Tuomas ja Lukas Eloranta' }
      ],
      videoLabel: 'Masto ja rikki teknisenä piirroksena'
    },
    services: {
      eyebrow: 'Palvelut',
      title: 'Kolme palvelua, yksi puhelinnumero.',
      lede: 'Kaikki työ samalla tuntihinnalla: 100 € / h sis. alv. Rikaustöissä myös urakkahinta työn vaativuuden mukaan.',
      includesTitle: 'Mitä tähän kuuluu',
      outcomeTitle: 'Lopputulos',
      processTitle: 'Näin työ etenee',
      pricingTitle: 'Hinta',
      readMore: 'Lue lisää palvelusta',
      askCta: 'Kysy tästä palvelusta',
      callCta: 'Soita',
      backHome: 'Takaisin etusivulle',
      otherServices: 'Muut palvelut'
    },
    servicesTab: {
      priceLabel: 'Hinnoitteluperiaate',
      priceNote: '100 € / h sis. alv kaikessa työssä. Rikaustöissä myös urakkahinta työn vaativuuden mukaan.',
      areaLabel: 'Toimialue',
      contactCta: 'Ota yhteyttä'
    },
    team: {
      eyebrow: 'Tekijät',
      title: 'Isä ja poika, Turku.',
      body:
        'Nordic Rigging on Tuomas ja Lukas Elorannan yritys. Sovit työstä suoraan tekijän kanssa, ja sama tekijä on myös veneesi luona.',
      pageLine: 'Työn tekee'
    },
    story: {
      eyebrow: 'Tietoa meistä',
      intro:
        'Nordic Rigging on isän ja pojan yritys Turusta. Tuomaksella on vuosikymmenten kokemus veneistä ja rikaustöistä, Lukas on kasvanut ammattiin hänen rinnallaan. Yhdessä he varmistavat veneesi turvallisuuden sukupolvelta toiselle siirtyneellä ammattitaidolla.',
      highlight:
        'Tämä on meille enemmän kuin työtä. Se on elämäntapa, joka perustuu taitoon, meren kunnioittamiseen ja siihen, että jokainen vene ansaitsee asiantuntevaa huolta.'
    },
    rigsense: {
      eyebrow: 'Spinlock Rig-Sense Pro',
      title: 'Mittaamme vanttien kireyden. Emme arvaa.',
      body:
        'Jokaisessa mastonnostossa vantit säädetään Spinlock Rig-Sense Pro -rikimittarilla. Mittari näyttää kireyden numeroina, joten säätö perustuu lukemiin, ei tuntumaan.',
      points: [
        {
          title: 'Masto pysyy suorassa',
          text: 'Oikein kiristetty rikki pitää maston paikallaan myös kovassa tuulessa, ja purjeet vetävät kuten pitää.'
        },
        {
          title: 'Vantit ja helat kestävät pidempään',
          text: 'Liian löysä rikki nykii ja väsyttää vaijeria, liian kireä rasittaa runkoa. Mitattu kireys osuu oikeaan.'
        },
        {
          title: 'Sama säätö joka kevät',
          text: 'Lukemat kirjataan talteen. Seuraavana keväänä masto trimmataan samoihin arvoihin ilman arvailua.'
        }
      ],
      badge: 'Kuuluu jokaiseen mastonnostoon',
      imageAlt: 'Spinlock Rig-Sense Pro -rikimittari kiinnitettynä vanttiin',
      readingLabel: 'Mitattu kireys',
      readingUnit: '% murtolujuudesta'
    },
    partners: {
      eyebrow: 'Telakoille ja satamille',
      title: 'Tarvitsetko luotettavan alihankkijan telakallesi?',
      body:
        'Kevään ja syksyn ruuhkassa käsipari loppuu kesken. Me hoidamme mastonostot ja -laskut, rikitarkastukset ja huoltotyöt asiakasveneisiisi sovitulla hinnalla ja aikataululla. Toimimme jo Ajolanranta Oy:n telakalla ja liikumme koko Varsinais-Suomessa ja Uudellamaalla.',
      points: [
        'Mastonostot ja -laskut ruuhkaviikkoina',
        'Rikitarkastukset ja mittaukset asiakasveneisiin',
        'Köysi- ja rikitarviketoimitukset',
        'Lisäkädet huoltotöihin',
        'Ympärivuotinen yhteistyösopimus'
      ],
      cta: 'Keskustellaan yhteistyöstä',
      call: 'Soita 050 548 7766',
      reference: 'Kiinteä toimipiste Ajolanranta Oy:n telakalla, Turku'
    },
    portfolio: {
      eyebrow: 'Tehdyt työt',
      title: 'Referenssejä valmiista töistä',
      lede: 'Kuvia mastotöistä, köysivarastosta, huolloista ja telakkayhteistyöstä. Lisäämme uusia kuvia sitä mukaa kun projekteja valmistuu.'
    },
    location: {
      eyebrow: 'Yhteystiedot',
      title: 'Turussa, liikkeellä koko rannikolla.',
      body:
        'Kotisatamamme on Turussa, Ajolanranta Oy:n telakalla. Tulemme veneesi luo satamaan tai telakalle Varsinais-Suomessa ja Uudellamaalla.',
      phone: 'Puhelin',
      email: 'Sähköposti',
      whatsapp: 'WhatsApp',
      whatsappCta: 'Avaa WhatsApp',
      address: 'Käyntiosoite',
      area: 'Toiminta-alue',
      areaValue: 'Varsinais-Suomi ja Uusimaa, painopiste Turussa',
      base: 'Toimipiste',
      baseValue: 'Ajolanranta Oy:n telakka, Turku. Muuten liikkuva palvelu.',
      businessId: 'Y-tunnus',
      globeLabel: 'Turku',
      globeSecondary: 'Helsinki',
      globeAria: 'Maapallo, jossa Turku ja Etelä-Suomen rannikko korostettuna'
    },
    form: {
      title: 'Lähetä viesti',
      lede: 'Kerro lyhyesti, mitä tarvitset. Vastaamme mahdollisimman pian.',
      who: 'Kuka olet?',
      whoPrivate: 'Yksityinen veneenomistaja',
      whoPrivateHint: 'Kertaluontoinen työ omaan veneeseen',
      whoYard: 'Telakka tai satama',
      whoYardHint: 'Alihankinta tai ympärivuotinen yhteistyö',
      name: 'Nimi',
      phone: 'Puhelin',
      email: 'Sähköposti',
      boat: 'Vene (merkki ja koko)',
      org: 'Telakka tai satama',
      needs: 'Mitä tarvitset?',
      needOptions: [
        { id: 'mast', label: 'Mastotyöt' },
        { id: 'rope', label: 'Köydet ja pleissaukset' },
        { id: 'service', label: 'Huolto ja telakointi' },
        { id: 'partner', label: 'Yhteistyö telakalle tai satamaan' }
      ],
      message: 'Viesti',
      messagePlaceholder: 'Esim. masto alas lokakuussa, vene Airistolla.',
      optional: 'valinnainen',
      submit: 'Lähetä viesti',
      sending: 'Lähetetään…',
      success: 'Kiitos! Viestisi on lähetetty. Vastaamme mahdollisimman pian.',
      successMail: 'Sähköpostiohjelmasi avautuu valmiiksi täytettynä. Jos se ei avaudu, soita tai lähetä sähköpostia suoraan.',
      error: 'Lähetys ei onnistunut. Soita tai lähetä sähköpostia suoraan.',
      privacy: 'Tietojasi käytetään vain tähän yhteydenottoon.',
      orCall: 'Tai soita suoraan',
      required: 'Täytä nimi ja vähintään puhelin tai sähköposti.',
      subjectPrivate: 'Yhteydenotto veneenomistajalta',
      subjectYard: 'Yhteistyötiedustelu telakalta tai satamalta',
      fields: {
        who: 'Asiakas',
        name: 'Nimi',
        phone: 'Puhelin',
        email: 'Sähköposti',
        boat: 'Vene',
        org: 'Telakka tai satama',
        needs: 'Tarve',
        message: 'Viesti'
      }
    },
    footer: {
      tagline: 'Purjeveneesi paras miehistö maalla.',
      navHeading: 'Sivusto',
      contactHeading: 'Yhteystiedot',
      companyHeading: 'Yritys',
      businessId: 'Y-tunnus',
      area: 'Varsinais-Suomi ja Uusimaa',
      base: 'Toimipiste Ajolanranta Oy:n telakalla, Turku',
      rights: 'Kaikki oikeudet pidätetään.'
    }
  },

  en: {
    htmlLang: 'en',
    langName: 'English',
    meta: {
      title: 'Nordic Rigging | Mast work, rope stock and maintenance, Turku',
      description:
        'Nordic Rigging Company Oy: sailboat mast work, rope stock and seasonal maintenance in Turku, Finland. Shroud tension measured with the Spinlock Rig-Sense Pro. €100 / h incl. VAT. Varsinais-Suomi and Uusimaa.'
    },
    skip: 'Skip to content',
    nav: {
      services: 'Services',
      yards: 'For yards',
      portfolio: 'Our work',
      about: 'About',
      contact: 'Get in Touch',
      call: 'Call',
      menu: 'Menu',
      close: 'Close',
      language: 'Language',
      home: 'Home'
    },
    tabs: {
      sectionTitle: 'Services, yard partnerships, past work and the crew'
    },
    hero: {
      eyebrow: 'Your sailboat’s best crew on land',
      title: 'Your rig, sorted. In Turku.',
      lead:
        'Mast work, rope stock and seasonal maintenance. We come to your boat at the marina or the yard, across Varsinais-Suomi and Uusimaa.',
      callCta: 'Call +358 50 548 7766',
      messageCta: 'Send a message',
      facts: [
        { label: 'Hourly rate', value: '€100 incl. VAT' },
        { label: 'Service area', value: 'Varsinais-Suomi and Uusimaa' },
        { label: 'The crew', value: 'Tuomas and Lukas Eloranta' }
      ],
      videoLabel: 'Mast and rigging as a technical drawing'
    },
    services: {
      eyebrow: 'Services',
      title: 'Three services, one phone number.',
      lede: 'All work at the same hourly rate: €100 / h incl. VAT. Rigging jobs also at a fixed price depending on the job.',
      includesTitle: 'What is included',
      outcomeTitle: 'The result',
      processTitle: 'How the work goes',
      pricingTitle: 'Price',
      readMore: 'Read more about this service',
      askCta: 'Ask about this service',
      callCta: 'Call',
      backHome: 'Back to the front page',
      otherServices: 'Other services'
    },
    servicesTab: {
      priceLabel: 'Pricing principle',
      priceNote: '€100 / h incl. VAT for all work. Rigging jobs also at a fixed price depending on the job.',
      areaLabel: 'Service area',
      contactCta: 'Get in touch'
    },
    team: {
      eyebrow: 'The crew',
      title: 'Father and son, Turku.',
      body:
        'Nordic Rigging is Tuomas and Lukas Eloranta’s company. You agree the job with the person who does it, and the same person shows up at your boat.',
      pageLine: 'Done by'
    },
    story: {
      eyebrow: 'About us',
      intro:
        "Nordic Rigging is a father-and-son company from Turku. Tuomas has decades of experience with boats and rigging, and Lukas grew up learning the trade at his side. Together they keep your boat safe with skill passed down through generations.",
      highlight:
        "This is more than a job for us. It's a way of life based on skill, respect for the sea, and the belief that every boat deserves expert care."
    },
    rigsense: {
      eyebrow: 'Spinlock Rig-Sense Pro',
      title: 'We measure shroud tension. We don’t guess.',
      body:
        'On every mast stepping the shrouds are set with the Spinlock Rig-Sense Pro rig tension gauge. It shows tension as a number, so the tune is based on readings, not feel.',
      points: [
        {
          title: 'The mast stays straight',
          text: 'A correctly tensioned rig keeps the mast in column even in a blow, and the sails pull the way they should.'
        },
        {
          title: 'Shrouds and fittings last longer',
          text: 'Too slack and the rig snatches and fatigues the wire; too tight and it loads the hull. A measured tension lands in the right place.'
        },
        {
          title: 'The same tune every spring',
          text: 'Readings are logged. Next spring the mast is tuned to the same values without guesswork.'
        }
      ],
      badge: 'Part of every mast stepping',
      imageAlt: 'Spinlock Rig-Sense Pro rig tension gauge clamped on a shroud',
      readingLabel: 'Measured tension',
      readingUnit: '% of breaking load'
    },
    partners: {
      eyebrow: 'For boatyards and marinas',
      title: 'Need a reliable subcontractor for your yard?',
      body:
        'In the spring and autumn rush there are never enough hands. We handle mast stepping and unstepping, rig inspections and service work on your customers’ boats at an agreed price and schedule. We already operate at Ajolanranta Oy’s yard and cover all of Varsinais-Suomi and Uusimaa.',
      points: [
        'Mast stepping and unstepping in peak weeks',
        'Rig inspections and measurements on customer boats',
        'Rope and rigging hardware supply',
        'Extra hands for service work',
        'Year-round partnership agreement'
      ],
      cta: 'Let’s talk about working together',
      call: 'Call +358 50 548 7766',
      reference: 'Fixed base at Ajolanranta Oy’s yard, Turku'
    },
    portfolio: {
      eyebrow: 'Our work',
      title: 'References from finished jobs',
      lede: 'Photos from mast work, the rope stock, seasonal service and yard partnerships. We add new photos as projects finish.'
    },
    location: {
      eyebrow: 'Contact',
      title: 'Based in Turku, working the whole coast.',
      body:
        'Our home base is Ajolanranta Oy’s yard in Turku. We come to your boat at the marina or the yard across Varsinais-Suomi and Uusimaa.',
      phone: 'Phone',
      email: 'Email',
      whatsapp: 'WhatsApp',
      whatsappCta: 'Open WhatsApp',
      address: 'Address',
      area: 'Service area',
      areaValue: 'Varsinais-Suomi and Uusimaa, centred on Turku',
      base: 'Base',
      baseValue: 'Ajolanranta Oy’s yard, Turku. Otherwise mobile.',
      businessId: 'Business ID',
      globeLabel: 'Turku',
      globeSecondary: 'Helsinki',
      globeAria: 'Globe with Turku and the south coast of Finland highlighted'
    },
    form: {
      title: 'Send a message',
      lede: 'Tell us briefly what you need. We reply as soon as we can.',
      who: 'Who are you?',
      whoPrivate: 'Private boat owner',
      whoPrivateHint: 'A one-off job on your own boat',
      whoYard: 'Boatyard or marina',
      whoYardHint: 'Subcontracting or a year-round partnership',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      boat: 'Boat (make and size)',
      org: 'Yard or marina',
      needs: 'What do you need?',
      needOptions: [
        { id: 'mast', label: 'Mast work' },
        { id: 'rope', label: 'Ropes and splicing' },
        { id: 'service', label: 'Maintenance and haul-out' },
        { id: 'partner', label: 'Partnership for a yard or marina' }
      ],
      message: 'Message',
      messagePlaceholder: 'E.g. mast down in October, boat at Airisto.',
      optional: 'optional',
      submit: 'Send message',
      sending: 'Sending…',
      success: 'Thank you! Your message has been sent. We reply as soon as we can.',
      successMail: 'Your email app opens with the message filled in. If it does not open, call or email us directly.',
      error: 'Sending failed. Please call or email us directly.',
      privacy: 'Your details are used only to reply to you.',
      orCall: 'Or call directly',
      required: 'Please fill in your name and at least a phone number or an email.',
      subjectPrivate: 'Enquiry from a boat owner',
      subjectYard: 'Partnership enquiry from a yard or marina',
      fields: {
        who: 'Customer',
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        boat: 'Boat',
        org: 'Yard or marina',
        needs: 'Needs',
        message: 'Message'
      }
    },
    footer: {
      tagline: 'Your sailboat’s best crew on land.',
      navHeading: 'Site',
      contactHeading: 'Contact',
      companyHeading: 'Company',
      businessId: 'Business ID',
      area: 'Varsinais-Suomi and Uusimaa',
      base: 'Based at Ajolanranta Oy’s yard, Turku',
      rights: 'All rights reserved.'
    }
  }
};
