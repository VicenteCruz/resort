/* ==========================================================================
   Platinum Yucatán Princess — Dados Oficiais & Estrutura da Viagem (PT)
   Estadia: 28 Nov – 8 Dez 2026 (10 Noites)
   Voos: AC 811 -> AC 1812 (Ida) | AC 1373 -> AC 810 (Regresso)
   ========================================================================== */

window.DEFAULT_TRIP_DATA = {
  version: 3,
  trip: {
    title: 'Platinum Yucatán Princess',
    destination: 'Riviera Maya',
    country: 'México',
    subtitle: 'Playa del Carmen · Adults-Only 5★ Tudo Incluído',
    headline: '',
    travelers: '',
    startDate: '2026-11-28',
    endDate: '2026-12-08',
    homeCity: 'Lisboa',
    homeCode: 'LIS',
    homeTz: 'Europe/Lisbon',
    destCity: 'Cancún',
    destCode: 'CUN',
    destTz: 'America/Cancun',
    currencyCode: 'MXN',
    currencyName: 'Pesos Mexicanos',
    extraCurrencyCode: 'CAD',
    extraCurrencyName: 'Dólares Canadá',
    publicShowStay: true,
    publicNote: '',
    venueScopeNote: 'No vosso hotel só as mesas Teppanyaki do Kotatsu pedem reserva. Nos dois hotéis vizinhos, todos os restaurantes à la carte pedem marcação na WebApp do Wi-Fi do hotel.',
    tips: [
      {
        id: 'tip-1',
        title: 'Acesso aos Hotéis Vizinhos Incluído',
        desc: 'Podem usar os restaurantes, bares e piscinas do Grand Riviera Princess e Grand Sunset Princess (porta interna e comboio gratuito). Os à la carte ao lado pedem reserva na WebApp do hotel.'
      },
      {
        id: 'tip-2',
        title: 'Dress Code ao Jantar (À La Carte)',
        desc: 'Homens: calças compridas, sapatos fechados e camisa/polo/t-shirt com mangas. Senhoras: casual elegante. No Yucatán Buffet são permitidos calções.'
      },
      {
        id: 'tip-3',
        title: 'Chegada à Noite & Serviço 24h',
        desc: 'O Yucatán Buffet serve snacks das 22:30 às 07:00, o Plaza Bar funciona 24h e o Room Service 24/7 está incluído sem custos extra.'
      },
      {
        id: 'tip-4',
        title: 'Escala no Canadá & Tomadas',
        desc: 'É obrigatório ter o eTA do Canadá para a escala em Toronto (YYZ). No quarto as tomadas são americanas Tipo A/B (110V).'
      }
    ]
  },
  wallet: {
    airCanadaPnr: '',
    resortBookingRef: '',
    suiteBuilding: 'Suite a atribuir no Check-in',
    transferProvider: 'A definir / Transfer Aeroporto–Hotel',
    canadaEta: 'Pendente',
    mexicoVisitax: 'Pendente',
    documents: [
      { id: 'doc-eta', label: 'eTA Canadá', status: 'Pendente' },
      { id: 'doc-visitax', label: 'Visitax Quintana Roo', status: 'Pendente' }
    ],
    notes: ''
  },

  flights: {
    outbound: {
      dateLabel: 'Sábado, 28 de Novembro de 2026',
      summary: 'Lisboa (LIS) → Toronto (YYZ) → Cancún (CUN)',
      totalJourney: 'Transfer CUN → Hotel: ~45–50 min',
      legs: [
        {
          id: 'ac811',
          dateIso: '2026-11-28',
          flightNumber: 'AC 811',
          airline: 'Air Canada',
          aircraft: 'Longo Curso Internacional',
          fromCode: 'LIS',
          fromCity: 'Lisboa (Humberto Delgado)',
          fromTerminal: 'Terminal 1',
          depTime: '10:55',
          depTz: 'WET',
          toCode: 'YYZ',
          toCity: 'Toronto Pearson Intl',
          toTerminal: 'Terminal 1',
          arrTime: '14:00',
          arrTz: 'EST',
          duration: '8h 05m',
          gate: 'A definir',
          seat: 'A definir',
          baggageNote: 'Confirmar no check-in em Lisboa que as malas seguem etiquetadas até CUN.'
        },
        {
          id: 'ac1812',
          dateIso: '2026-11-28',
          flightNumber: 'AC 1812',
          airline: 'Air Canada',
          aircraft: 'Voo Direto Toronto–Cancún',
          fromCode: 'YYZ',
          fromCity: 'Toronto Pearson Intl',
          fromTerminal: 'Terminal 1',
          depTime: '17:10',
          depTz: 'EST',
          toCode: 'CUN',
          toCity: 'Cancún Internacional',
          toTerminal: 'Terminal 3',
          arrTime: '20:10',
          arrTz: 'EST',
          duration: '4h 00m',
          gate: 'Portas E/F',
          seat: 'A definir',
          baggageNote: 'Recolher bagagem no Terminal 3 após controlo de passaportes.'
        }
      ],
      layovers: [
        {
          afterLegId: 'ac811',
          title: 'Escala em Toronto Pearson (YYZ Terminal 1)',
          badge: 'Mesmo Terminal (T1)',
          steps: [
            'Seguir as placas roxas "Connections — International (E Gates)" dentro do Terminal 1 (não sair para recolha de bagagem).',
            'Ter passaporte e eTA do Canadá prontos para validação no quiosque de trânsito.',
            'Toronto e Cancún têm exatamente a mesma hora em novembro/dezembro (EST, -5h que Lisboa).'
          ]
        },
        {
          afterLegId: 'ac1812',
          title: 'Chegada a Cancún (Terminal 3) → Platinum Yucatán Princess',
          badge: '~45–50 min até ao hotel',
          steps: [
            'Após recolher malas, caminhar direto até ao exterior do Terminal 3 onde estão os operadores oficiais de transfer (evitar balcões interiores de timeshare/táxi).',
            'À chegada ao resort à noite: o Yucatán Buffet serve snacks das 22:30 às 07:00, o Plaza Bar está aberto 24h e o Room Service 24h é gratuito.'
          ]
        }
      ]
    },

    inbound: {
      dateLabel: 'Terça-feira, 8 de Dezembro de 2026 (Chegada a 9 Dez)',
      summary: 'Cancún (CUN) → Toronto (YYZ) → Lisboa (LIS)',
      totalJourney: 'Voo noturno · Chegada a Lisboa dia 9 Dez',
      legs: [
        {
          id: 'ac1373',
          dateIso: '2026-12-08',
          flightNumber: 'AC 1373',
          airline: 'Air Canada',
          aircraft: 'Voo Direto Cancún–Toronto',
          fromCode: 'CUN',
          fromCity: 'Cancún Internacional',
          fromTerminal: 'Terminal 3',
          depTime: '15:10',
          depTz: 'EST',
          toCode: 'YYZ',
          toCity: 'Toronto Pearson Intl',
          toTerminal: 'Terminal 1',
          arrTime: '19:05',
          arrTz: 'EST',
          duration: '3h 55m',
          gate: 'A definir',
          seat: 'A definir',
          baggageNote: 'Despachar malas no balcão Air Canada (CUN T3) direto até Lisboa.'
        },
        {
          id: 'ac810',
          dateIso: '2026-12-08',
          flightNumber: 'AC 810',
          airline: 'Air Canada',
          aircraft: 'Longo Curso Noturno',
          fromCode: 'YYZ',
          fromCity: 'Toronto Pearson Intl',
          fromTerminal: 'Terminal 1',
          depTime: '20:55',
          depTz: 'EST',
          toCode: 'LIS',
          toCity: 'Lisboa (Humberto Delgado)',
          toTerminal: 'Terminal 1',
          arrTime: '08:55 +1',
          arrTz: 'WET',
          duration: '7h 00m',
          gate: 'Portas E',
          seat: 'A definir',
          baggageNote: 'Aterra em Lisboa na manhã de quarta-feira, 9 de dezembro.'
        }
      ],
      layovers: [
        {
          beforeFirstLeg: true,
          title: 'Check-Out no Resort & Ida para o Aeroporto de Cancún (T3)',
          badge: 'Dia 8 Dezembro',
          steps: [
            'Prever ~50 min de estrada até ao Terminal 3 + antecedência recomendada de 3h para voos internacionais.',
            'Ter o comprovativo QR da taxa estadual Visitax Quintana Roo guardado no telemóvel.'
          ]
        },
        {
          afterLegId: 'ac1373',
          title: 'Escala em Toronto Pearson (YYZ Terminal 1)',
          badge: 'Trânsito Internacional',
          steps: [
            'Seguir placas roxas de ligações internacionais dentro do Terminal 1 até às portas E.',
            'Bagagem segue automaticamente para o voo AC 810 rumo a Lisboa.'
          ]
        }
      ]
    }
  },

  venues: [
    {
      id: 'yucatan-buffet',
      name: 'Yucatán Buffet',
      category: 'pyp',
      cuisine: 'Buffet Internacional (Platinum Yucatán)',
      included: true,
      reservationRequired: false,
      dressCode: 'Casual (roupa seca, t-shirt/camisa com mangas)',
      hoursLabel: '07:00–10:30 · 12:00–15:00 · 18:00–22:00 · Snacks 22:30–07:00',
      openIntervals: [
        { start: '07:00', end: '10:30' },
        { start: '12:00', end: '15:00' },
        { start: '18:00', end: '22:00' },
        { start: '22:30', end: '07:00' }
      ],
      description: 'Restaurante buffet principal do vosso hotel, com estações ao vivo e serviço de snacks durante toda a madrugada.',
      visited: false
    },
    {
      id: 'kotatsu',
      name: 'Kotatsu',
      category: 'pyp',
      cuisine: 'Asiático & Teppanyaki (Platinum Yucatán)',
      included: true,
      reservationRequired: true,
      dressCode: 'Smart Casual (Homens: calças compridas, sapato fechado e mangas)',
      hoursLabel: 'Jantar 18:00–22:00',
      openIntervals: [{ start: '18:00', end: '22:00' }],
      description: 'Restaurante asiático à la carte do vosso hotel. As mesas Teppanyaki exigem reserva prévia no concierge.',
      visited: false
    },
    {
      id: 'bruschetta',
      name: 'La Bruschetta',
      category: 'pyp',
      cuisine: 'Italiano À La Carte (Platinum Yucatán)',
      included: true,
      reservationRequired: false,
      dressCode: 'Smart Casual (Homens: calças compridas, sapato fechado e mangas)',
      hoursLabel: 'Jantar 18:00–22:00',
      openIntervals: [{ start: '18:00', end: '22:00' }],
      description: 'Massas frescas, risottos e especialidades italianas à carta, sem necessidade de reserva.',
      visited: false
    },
    {
      id: 'rodeo-grill',
      name: 'Rodeo Grill',
      category: 'pyp',
      cuisine: 'Steakhouse & Tex-Mex (Platinum Yucatán)',
      included: true,
      reservationRequired: false,
      dressCode: 'Dia: Casual · Jantar: Smart Casual (calças compridas e sapato fechado)',
      hoursLabel: '07:00–10:00 · 12:00–15:00 · Jantar 18:00–22:00',
      openIntervals: [
        { start: '07:00', end: '10:00' },
        { start: '12:00', end: '15:00' },
        { start: '18:00', end: '22:00' }
      ],
      description: 'Aberto para pequeno-almoço, almoço e jantar à carta de carnes grelhadas. Dispõe de mesas sobre a água ("Canopy", marcadas no concierge).',
      visited: false
    },
    {
      id: 'aroma',
      name: 'Aroma',
      category: 'pyp',
      cuisine: 'Gourmet Internacional (Platinum Yucatán)',
      included: true,
      reservationRequired: false,
      dressCode: 'Smart Casual (Homens: calças compridas, sapato fechado e mangas)',
      hoursLabel: 'Jantar 18:00–22:00',
      openIntervals: [{ start: '18:00', end: '22:00' }],
      description: 'Cozinha internacional gourmet à la carte no edifício principal, sem reserva.',
      visited: false
    },
    {
      id: 'la-hacienda',
      name: 'La Hacienda',
      category: 'sister',
      cuisine: 'Mexicano À La Carte (Grand Riviera Princess)',
      included: true,
      reservationRequired: true,
      dressCode: 'Smart Casual (Homens: calças compridas, sapato fechado e mangas)',
      hoursLabel: 'Jantar 18:00–22:00',
      openIntervals: [{ start: '18:00', end: '22:00' }],
      description: 'Gastronomia tradicional mexicana no hotel vizinho Grand Riviera (incluído; reservar na WebApp do Wi-Fi do hotel ou concierge).',
      visited: false
    },
    {
      id: 'sumauma',
      name: 'Sumauma',
      category: 'sister',
      cuisine: 'Rodízio Brasileiro (Grand Sunset Princess)',
      included: true,
      reservationRequired: true,
      dressCode: 'Smart Casual (Homens: calças compridas, sapato fechado e mangas)',
      hoursLabel: 'Jantar 18:30–22:30',
      openIntervals: [{ start: '18:30', end: '22:30' }],
      description: 'Cortes brasileiros servidos na espada no hotel vizinho Grand Sunset Princess (incluído mediante reserva).',
      visited: false
    },
    {
      id: 'hikari-nikkei',
      name: 'Hikari Nikkei & Wok',
      category: 'sister',
      cuisine: 'Fusão Japão-Peru & Oriental (Grand Sunset)',
      included: true,
      reservationRequired: true,
      dressCode: 'Smart Casual (sapato fechado e camisa com mangas)',
      hoursLabel: 'Jantar 18:00–21:15',
      openIntervals: [{ start: '18:00', end: '21:15' }],
      description: 'Dois restaurantes asiáticos incluídos no hotel vizinho: Hikari Nikkei (fusão peruano-japonesa) e Wok (tailandês/coreano/vietnamita), além de Teppanyaki.',
      visited: false
    },
    {
      id: 'la-vaqueria-volta-galerie',
      name: 'La Vaquería, La Volta & Galerie',
      category: 'sister',
      cuisine: 'Grelhados, Italiano & Gourmet (Grand Sunset/Riviera)',
      included: true,
      reservationRequired: true,
      dressCode: 'Smart Casual (Homens: calças compridas e sapato fechado)',
      hoursLabel: 'Jantar 18:00–21:15 / 22:00',
      openIntervals: [{ start: '18:00', end: '22:00' }],
      description: 'Três restaurantes adicionais à la carte incluídos nos resorts ao lado (reservar na WebApp do hotel).',
      visited: false
    },
    {
      id: 'swimup-beach-bars',
      name: 'Bares de Piscina, Praia & Gelataria',
      category: 'bars',
      cuisine: 'Swim-Up Bars, Beach Bar & Gelato House',
      included: true,
      reservationRequired: false,
      dressCode: 'Fato de banho (piscina/praia) · Casual seco (Gelataria)',
      hoursLabel: 'Piscina/Praia 09:00–18:00 · Gelato & Café 16:00–20:00',
      openIntervals: [{ start: '09:00', end: '20:00' }],
      description: 'Platinum Pool Bar (molhado), Main Pool Bar (molhado), Beach Bar na praia e Gelato & Coffee House à tarde.',
      visited: false
    },
    {
      id: 'plaza-salsa-night',
      name: 'Plaza Bar (24h), Lobby & Discoteca Salsa',
      category: 'bars',
      cuisine: 'Cocktails, Música ao Vivo, Teatro & Noite',
      included: true,
      reservationRequired: false,
      dressCode: 'Casual',
      hoursLabel: 'Plaza Bar 24h · Lobby 08:00–22:00 · Salsa Disco 22:00–01:00',
      openIntervals: [{ start: '00:00', end: '24:00' }],
      description: 'Bares noturnos no Platinum Yucatán (mais Sports Bar 24h e discoteca Areíto nos hotéis vizinhos).',
      visited: false
    },
    {
      id: 'extras-skylights-chillout',
      name: 'Skylights & UMA Chill Out (Pagos à parte)',
      category: 'extra',
      cuisine: 'Restaurantes Exclusivos Não Incluídos',
      included: false,
      reservationRequired: true,
      dressCode: 'Smart Elegant',
      hoursLabel: '18:00–23:00 (Custo adicional)',
      openIntervals: [{ start: '18:00', end: '23:00' }],
      description: 'As únicas duas exceções pagas à parte no complexo: Skylights (terraço no Platinum Yucatán) e UMA Chill Out (em cima da praia no Grand Sunset).',
      visited: false
    }
  ],

  days: [
    {
      dayNumber: 1,
      date: '2026-11-28',
      shortDate: 'Sáb 28 Nov',
      theme: 'Viagem de Ida & Check-in',
      dinnerChoice: 'Sem restaurante marcado',
      notes: '',
      items: [
        { id: 'd1-1', time: '10:55', title: 'Voo AC 811: Lisboa (LIS T1) → Toronto (YYZ T1)', note: 'Escala internacional no Terminal 1.', done: false },
        { id: 'd1-2', time: '17:10', title: 'Voo AC 1812: Toronto (YYZ T1) → Cancún (CUN T3)', note: 'Chegada prevista ~20:10 + transfer para o resort.', done: false }
      ]
    },
    { dayNumber: 2, date: '2026-11-29', shortDate: 'Dom 29 Nov', theme: 'Dia 2 no Resort', dinnerChoice: 'Sem restaurante marcado', notes: '', items: [] },
    { dayNumber: 3, date: '2026-11-30', shortDate: 'Seg 30 Nov', theme: 'Dia 3 no Resort', dinnerChoice: 'Sem restaurante marcado', notes: '', items: [] },
    { dayNumber: 4, date: '2026-12-01', shortDate: 'Ter 1 Dez', theme: 'Dia 4 no Resort', dinnerChoice: 'Sem restaurante marcado', notes: '', items: [] },
    { dayNumber: 5, date: '2026-12-02', shortDate: 'Qua 2 Dez', theme: 'Dia 5 no Resort', dinnerChoice: 'Sem restaurante marcado', notes: '', items: [] },
    { dayNumber: 6, date: '2026-12-03', shortDate: 'Qui 3 Dez', theme: 'Dia 6 no Resort', dinnerChoice: 'Sem restaurante marcado', notes: '', items: [] },
    { dayNumber: 7, date: '2026-12-04', shortDate: 'Sex 4 Dez', theme: 'Dia 7 no Resort', dinnerChoice: 'Sem restaurante marcado', notes: '', items: [] },
    { dayNumber: 8, date: '2026-12-05', shortDate: 'Sáb 5 Dez', theme: 'Dia 8 no Resort', dinnerChoice: 'Sem restaurante marcado', notes: '', items: [] },
    { dayNumber: 9, date: '2026-12-06', shortDate: 'Dom 6 Dez', theme: 'Dia 9 no Resort', dinnerChoice: 'Sem restaurante marcado', notes: '', items: [] },
    { dayNumber: 10, date: '2026-12-07', shortDate: 'Seg 7 Dez', theme: 'Dia 10 no Resort', dinnerChoice: 'Sem restaurante marcado', notes: '', items: [] },
    {
      dayNumber: 11,
      date: '2026-12-08',
      shortDate: 'Ter 8 Dez',
      theme: 'Check-Out & Voos de Regresso',
      dinnerChoice: 'Em viagem',
      notes: '',
      items: [
        { id: 'd11-1', time: '15:10', title: 'Voo AC 1373: Cancún (CUN T3) → Toronto (YYZ T1)', note: 'Chegada prevista a Toronto ~19:05.', done: false },
        { id: 'd11-2', time: '20:55', title: 'Voo AC 810: Toronto (YYZ T1) → Lisboa (LIS T1)', note: 'Chegada a Lisboa na manhã de quarta-feira, 9 Dez.', done: false }
      ]
    }
  ],

  packing: [
    // Documentos & Viagem
    { id: 'p1', category: 'Documentos', item: 'Passaportes válidos + Cartões de embarque Air Canada', checked: false },
    { id: 'p2', category: 'Documentos', item: 'eTA do Canadá aprovado (obrigatório para a escala em Toronto!)', checked: false },
    { id: 'p3', category: 'Documentos', item: 'Comprovativo QR da taxa Visitax Quintana Roo', checked: false },
    { id: 'p4', category: 'Documentos', item: 'Reserva do hotel + Voucher do transfer aeroporto–hotel', checked: false },
    { id: 'p9', category: 'Documentos', item: 'Apólice do seguro de viagem (com contacto de emergência 24h) + Cartão Europeu / Saúde', checked: false },
    { id: 'p10', category: 'Documentos', item: 'Cartões sem taxas (Revolut/Wise) + notas pequenas (USD/MXN) para gorjetas', checked: false },

    // Saúde & Farmácia (Refluxo & Pós-Gastroenterite)
    { id: 'p11', category: 'Saúde (Refluxo & Estômago)', item: 'Medicação habitual para o refluxo (ex: omeprazol/esomeprazol — levar na mala de mão + receita)', checked: false },
    { id: 'p12', category: 'Saúde (Refluxo & Estômago)', item: 'Antiácido / alginato de ação rápida (ex: Gaviscon / Rennie) para após refeições ou noite', checked: false },
    { id: 'p13', category: 'Saúde (Refluxo & Estômago)', item: 'Probióticos para proteger a flora intestinal (ex: UL-250 / BioGaia durante a viagem)', checked: false },
    { id: 'p14', category: 'Saúde (Refluxo & Estômago)', item: 'Saquetas de sais de reidratação oral (soro oral, ex: Dioralyte)', checked: false },
    { id: 'p15', category: 'Saúde (Refluxo & Estômago)', item: 'Antidiarreico SOS (ex: loperamida) e antiemético/cólicas (confirmar com médico/farmacêutico)', checked: false },
    { id: 'p16', category: 'Saúde (Refluxo & Estômago)', item: 'Paracetamol (mais suave para o estômago do que ibuprofeno), pensos rápidos e gel desinfetante', checked: false },
    { id: 'p17', category: 'Saúde (Refluxo & Estômago)', item: 'Snacks leves e neutros para os voos (bolachas de água e sal / tostas) para evitar jejum prolongado', checked: false },

    // Dress Code Jantar
    { id: 'p5', category: 'Dress Code Jantar', item: 'Calças compridas e sapatos fechados para homem (exigido nos à la carte)', checked: false },
    { id: 'p6', category: 'Dress Code Jantar', item: 'Camisas / polos / t-shirts com mangas e roupa casual elegante para as 10 noites', checked: false },

    // Roupa — Dia & Voo (10 Dias)
    { id: 'p18', category: 'Roupa (10 Dias)', item: '3 a 4 fatos de banho / calções de banho (a humidade demora a secar)', checked: false },
    { id: 'p19', category: 'Roupa (10 Dias)', item: '8 a 10 t-shirts / tops leves + 4 a 5 calções frescos para o dia', checked: false },
    { id: 'p20', category: 'Roupa (10 Dias)', item: 'Roupa interior e meias para 10–12 dias + pijama leve', checked: false },
    { id: 'p21', category: 'Roupa (10 Dias)', item: 'Chinelos de praia/piscina + ténis confortáveis (para viagem e passeios)', checked: false },
    { id: 'p22', category: 'Roupa (10 Dias)', item: '1 casaco leve / sweatshirt (para o avião, escala em Toronto e ar condicionado forte)', checked: false },

    // Praia & Resort
    { id: 'p8', category: 'Praia & Resort', item: 'Protetor solar biodegradável (FPS 50), after-sun / aloé vera e protetor labial', checked: false },
    { id: 'p23', category: 'Praia & Resort', item: 'Óculos de sol, chapéu/boné e saco de praia', checked: false },
    { id: 'p24', category: 'Praia & Resort', item: 'Repelente de mosquitos (DEET ou Icaridina, útil ao fim da tarde)', checked: false },
    { id: 'p25', category: 'Praia & Resort', item: 'Copo térmico / garrafa reutilizável (água fresca na praia e piscina) + capa estanque para telemóvel', checked: false },

    // Eletrónica
    { id: 'p7', category: 'Eletrónica', item: 'Adaptadores de tomada Europa → América Tipo A/B (110V)', checked: false },
    { id: 'p26', category: 'Eletrónica', item: 'Carregadores, powerbank (na mala de mão) e auscultadores para os voos', checked: false },

    // Higiene & Conforto no Voo
    { id: 'p27', category: 'Higiene & Voo', item: 'Nécessaire de higiene (escova/pasta de dentes, desodorizante, perfume, lâmina, etc.)', checked: false },
    { id: 'p28', category: 'Higiene & Voo', item: 'Almofada de pescoço, máscara de olhos e tampões de ouvidos para os voos longos', checked: false }
  ],

  rates: {
    eurToDest: 21.6,
    eurToMxn: 21.6,
    eurToUsd: 1.06,
    eurToCad: 1.48
  },

  expenses: [],

  cocktails: []
};
