// Lagnamn (football-data.co.uk) -> engelsk Wikipedia-artikel. Arena + koordinater hamtas via Wikidata.
export const TEAM_WIKI = {
  // England
  'Arsenal': 'Arsenal F.C.', 'Aston Villa': 'Aston Villa F.C.', 'Bournemouth': 'AFC Bournemouth',
  'Brentford': 'Brentford F.C.', 'Brighton': 'Brighton & Hove Albion F.C.', 'Burnley': 'Burnley F.C.',
  'Chelsea': 'Chelsea F.C.', 'Coventry': 'Coventry City F.C.', 'Crystal Palace': 'Crystal Palace F.C.',
  'Everton': 'Everton F.C.', 'Fulham': 'Fulham F.C.', 'Hull': 'Hull City A.F.C.', 'Ipswich': 'Ipswich Town F.C.',
  'Leeds': 'Leeds United F.C.', 'Leicester': 'Leicester City F.C.', 'Liverpool': 'Liverpool F.C.',
  'Luton': 'Luton Town F.C.', 'Man City': 'Manchester City F.C.', 'Man United': 'Manchester United F.C.',
  'Newcastle': 'Newcastle United F.C.', "Nott'm Forest": 'Nottingham Forest F.C.',
  'Sheffield United': 'Sheffield United F.C.', 'Southampton': 'Southampton F.C.', 'Sunderland': 'Sunderland A.F.C.',
  'Tottenham': 'Tottenham Hotspur F.C.', 'West Ham': 'West Ham United F.C.', 'Wolves': 'Wolverhampton Wanderers F.C.',
  'Birmingham': 'Birmingham City F.C.', 'Blackburn': 'Blackburn Rovers F.C.', 'Bolton': 'Bolton Wanderers F.C.',
  'Bristol City': 'Bristol City F.C.', 'Cardiff': 'Cardiff City F.C.', 'Charlton': 'Charlton Athletic F.C.',
  'Derby': 'Derby County F.C.', 'Huddersfield': 'Huddersfield Town A.F.C.', 'Lincoln': 'Lincoln City F.C.',
  'Middlesbrough': 'Middlesbrough F.C.', 'Millwall': 'Millwall F.C.', 'Norwich': 'Norwich City F.C.',
  'Oxford': 'Oxford United F.C.', 'Plymouth': 'Plymouth Argyle F.C.', 'Portsmouth': 'Portsmouth F.C.',
  'Preston': 'Preston North End F.C.', 'QPR': 'Queens Park Rangers F.C.', 'Rotherham': 'Rotherham United F.C.',
  'Sheffield Weds': 'Sheffield Wednesday F.C.', 'Stoke': 'Stoke City F.C.', 'Swansea': 'Swansea City A.F.C.',
  'Watford': 'Watford F.C.', 'West Brom': 'West Bromwich Albion F.C.', 'Wrexham': 'Wrexham A.F.C.',
  // Nederlanderna
  'AZ Alkmaar': 'AZ Alkmaar', 'Ajax': 'AFC Ajax', 'Almere City': 'Almere City FC', 'Cambuur': 'SC Cambuur',
  'Den Haag': 'ADO Den Haag', 'Excelsior': 'Excelsior Rotterdam', 'Feyenoord': 'Feyenoord',
  'For Sittard': 'Fortuna Sittard', 'Go Ahead Eagles': 'Go Ahead Eagles', 'Groningen': 'FC Groningen',
  'Heerenveen': 'SC Heerenveen', 'Heracles': 'Heracles Almelo', 'NAC Breda': 'NAC Breda', 'Nijmegen': 'NEC Nijmegen',
  'PSV Eindhoven': 'PSV Eindhoven', 'Sparta Rotterdam': 'Sparta Rotterdam', 'Telstar': 'SC Telstar',
  'Twente': 'FC Twente', 'Utrecht': 'FC Utrecht', 'Volendam': 'FC Volendam', 'Waalwijk': 'RKC Waalwijk',
  'Willem II': 'Willem II (football club)', 'Zwolle': 'PEC Zwolle',
  // Spanien
  'Alaves': 'Deportivo Alavés', 'Ath Bilbao': 'Athletic Bilbao', 'Ath Madrid': 'Atlético Madrid',
  'Barcelona': 'FC Barcelona', 'Betis': 'Real Betis', 'Celta': 'RC Celta de Vigo', 'Elche': 'Elche CF',
  'Espanol': 'RCD Espanyol', 'Getafe': 'Getafe CF', 'Girona': 'Girona FC', 'La Coruna': 'Deportivo de La Coruña',
  'Las Palmas': 'UD Las Palmas', 'Leganes': 'CD Leganés', 'Levante': 'Levante UD', 'Malaga': 'Málaga CF',
  'Mallorca': 'RCD Mallorca', 'Osasuna': 'CA Osasuna', 'Oviedo': 'Real Oviedo', 'Real Madrid': 'Real Madrid CF',
  'Santander': 'Racing de Santander', 'Sevilla': 'Sevilla FC', 'Sociedad': 'Real Sociedad', 'Valencia': 'Valencia CF',
  'Valladolid': 'Real Valladolid', 'Vallecano': 'Rayo Vallecano', 'Villarreal': 'Villarreal CF',
  // Frankrike
  'Angers': 'Angers SCO', 'Auxerre': 'AJ Auxerre', 'Brest': 'Stade Brestois 29', 'Le Havre': 'Le Havre AC',
  'Le Mans': 'Le Mans FC', 'Lens': 'RC Lens', 'Lille': 'Lille OSC', 'Lorient': 'FC Lorient',
  'Lyon': 'Olympique Lyonnais', 'Marseille': 'Olympique de Marseille', 'Metz': 'FC Metz', 'Monaco': 'AS Monaco FC',
  'Montpellier': 'Montpellier HSC', 'Nantes': 'FC Nantes', 'Nice': 'OGC Nice', 'Paris FC': 'Paris FC',
  'Paris SG': 'Paris Saint-Germain F.C.', 'Reims': 'Stade de Reims', 'Rennes': 'Stade Rennais F.C.',
  'St Etienne': 'AS Saint-Étienne', 'Strasbourg': 'RC Strasbourg Alsace', 'Toulouse': 'Toulouse FC', 'Troyes': 'ES Troyes AC',
  // Italien
  'Atalanta': 'Atalanta BC', 'Bologna': 'Bologna FC 1909', 'Cagliari': 'Cagliari Calcio', 'Como': 'Como 1907',
  'Cremonese': 'US Cremonese', 'Empoli': 'Empoli FC', 'Fiorentina': 'ACF Fiorentina', 'Frosinone': 'Frosinone Calcio',
  'Genoa': 'Genoa CFC', 'Inter': 'Inter Milan', 'Juventus': 'Juventus FC', 'Lazio': 'SS Lazio', 'Lecce': 'US Lecce',
  'Milan': 'AC Milan', 'Monza': 'AC Monza', 'Napoli': 'SSC Napoli', 'Parma': 'Parma Calcio 1913', 'Pisa': 'Pisa SC',
  'Roma': 'AS Roma', 'Sassuolo': 'US Sassuolo Calcio', 'Torino': 'Torino FC', 'Udinese': 'Udinese Calcio',
  'Venezia': 'Venezia FC', 'Verona': 'Hellas Verona FC',
  // Tyskland
  'Augsburg': 'FC Augsburg', 'Bayern Munich': 'FC Bayern Munich', 'Bochum': 'VfL Bochum', 'Dortmund': 'Borussia Dortmund',
  'Ein Frankfurt': 'Eintracht Frankfurt', 'Elversberg': 'SV Elversberg', 'FC Koln': '1. FC Köln', 'Freiburg': 'SC Freiburg',
  'Hamburg': 'Hamburger SV', 'Heidenheim': '1. FC Heidenheim', 'Hoffenheim': 'TSG Hoffenheim', 'Holstein Kiel': 'Holstein Kiel',
  'Leverkusen': 'Bayer 04 Leverkusen', "M'gladbach": 'Borussia Mönchengladbach', 'Mainz': '1. FSV Mainz 05',
  'Paderborn': 'SC Paderborn 07', 'RB Leipzig': 'RB Leipzig', 'Schalke 04': 'FC Schalke 04', 'St Pauli': 'FC St. Pauli',
  'Stuttgart': 'VfB Stuttgart', 'Union Berlin': '1. FC Union Berlin', 'Werder Bremen': 'SV Werder Bremen', 'Wolfsburg': 'VfL Wolfsburg',
  // Brasilien (football-data BRA.csv-namn)
  'Athletico-PR': 'Club Athletico Paranaense', 'Atletico GO': 'Atlético Clube Goianiense', 'Atletico-MG': 'Clube Atlético Mineiro',
  'Bahia': 'Esporte Clube Bahia', 'Botafogo RJ': 'Botafogo de Futebol e Regatas', 'Bragantino': 'Red Bull Bragantino',
  'Ceara': 'Ceará Sporting Club', 'Chapecoense-SC': 'Associação Chapecoense de Futebol', 'Corinthians': 'Sport Club Corinthians Paulista',
  'Coritiba': 'Coritiba Foot Ball Club', 'Criciuma': 'Criciúma Esporte Clube', 'Cruzeiro': 'Cruzeiro Esporte Clube',
  'Cuiaba': 'Cuiabá Esporte Clube', 'Flamengo RJ': 'CR Flamengo', 'Fluminense': 'Fluminense FC', 'Fortaleza': 'Fortaleza Esporte Clube',
  'Gremio': 'Grêmio Foot-Ball Porto Alegrense', 'Internacional': 'Sport Club Internacional', 'Juventude': 'Esporte Clube Juventude',
  'Mirassol': 'Mirassol Futebol Clube', 'Palmeiras': 'Sociedade Esportiva Palmeiras', 'Remo': 'Clube do Remo', 'Santos': 'Santos FC',
  'Sao Paulo': 'São Paulo FC', 'Sport Recife': 'Sport Club do Recife', 'Vasco': 'CR Vasco da Gama', 'Vitoria': 'Esporte Clube Vitória',
};

// Namn som forekommer i openfootball-fixtures -> football-data-namn
export const TEAM_ALIASES = {
  "FC Twente '65": 'Twente', 'SC Cambuur-Leeuwarden': 'Cambuur', 'NEC': 'Nijmegen', 'PSV': 'PSV Eindhoven',
  'AZ': 'AZ Alkmaar', 'Telstar 1963': 'Telstar', 'Club Atlético de Madrid': 'Ath Madrid', 'Málaga': 'Malaga',
  'Real Betis Balompié': 'Betis', 'Real Sociedad de Fútbol': 'Sociedad', 'Lille OSC': 'Lille', '1. FC Köln': 'FC Koln',
  'Borussia Mönchengladbach': "M'gladbach", 'FC Bayern München': 'Bayern Munich', 'SV 07 Elversberg': 'Elversberg',
  'Bolton Wanderers': 'Bolton',
};

// Stad for lag som inte hittas via Wikipedia/Wikidata -> geokodas (vader pa stadsniva racker)
export const CITY_HINT = {
  'Norrkoping': 'Norrköping', 'Halmstad': 'Halmstad', 'AVS': 'Vila das Aves', 'Casa Pia': 'Lisbon',
  'Carrarese': 'Carrara', 'Vukovar': 'Vukovar', 'Alverca': 'Alverca do Ribatejo', 'Larisa': 'Larissa',
  'Egnatia': 'Rrogozhinë', "Inter D'Escaldes": 'Escaldes-Engordany',
  // Argentina / Mexiko / Japan
  'Boca Juniors': 'Buenos Aires', 'Platense': 'Vicente López', 'Sarmiento Junin': 'Junín', 'Dep. Riestra': 'Buenos Aires',
  'Atl. Tucuman': 'San Miguel de Tucumán', 'Ind. Rivadavia': 'Mendoza', 'Estudiantes Rio Cuarto': 'Río Cuarto',
  'Atl. San Luis': 'San Luis Potosí', 'Tochigi City': 'Tochigi',
  // Sverige (Div 1) / Norge
  'IFK Haninge': 'Haninge', 'Hässleholms IF': 'Hässleholm', 'BK Olympic': 'Malmö', 'IFK Skövde': 'Skövde', 'Ariana': 'Malmö',
  'Eskilsminne IF': 'Helsingborg', 'Örebro Syrianska': 'Örebro', 'Joenkoeping S.': 'Jönköping',
  'Stockholm Internazionale': 'Stockholm', 'Järfälla': 'Järfälla', 'Hødd': 'Ulsteinvik',
  // Tjeckien
  'Viktoria Plzeň': 'Plzeň', 'Dukla Praha': 'Prague', 'Bohemians 1905': 'Prague', 'Baník Ostrava': 'Ostrava',
  'Slovan Liberec': 'Liberec', 'Slovácko': 'Uherské Hradiště', 'Sigma Olomouc': 'Olomouc',
  'Sparta Prague': 'Prague', 'Slavia Prague': 'Prague', 'Zbrojovka Brno': 'Brno', 'Artis Brno': 'Brno',
  'Järfälla': 'Jakobsberg',
  'United Nordic': 'Stockholm', // osaker ort - kontrollera; stadsniva racker for vader
};

export function canonicalTeam(name) {
  return TEAM_ALIASES[name] ?? name;
}
