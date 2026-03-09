export interface Country {
  name: string;
  code: string;
  flag: string;
  phone: string;
  cities: string[];
}

export const COUNTRIES: Country[] = [
  { name: "Uganda", code: "UG", flag: "🇺🇬", phone: "+256", cities: ["Kampala", "Entebbe", "Jinja", "Mbarara", "Gulu", "Lira", "Mbale", "Fort Portal", "Masaka", "Arua", "Soroti", "Hoima", "Kabale", "Mukono", "Wakiso"] },
  { name: "Kenya", code: "KE", flag: "🇰🇪", phone: "+254", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale", "Garissa", "Nyeri", "Machakos", "Nanyuki"] },
  { name: "Nigeria", code: "NG", flag: "🇳🇬", phone: "+234", cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City", "Kaduna", "Enugu", "Calabar", "Warri", "Owerri", "Abeokuta", "Jos", "Ilorin", "Uyo"] },
  { name: "Ghana", code: "GH", flag: "🇬🇭", phone: "+233", cities: ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Tema", "Sunyani", "Ho", "Koforidua", "Techiman"] },
  { name: "Tanzania", code: "TZ", flag: "🇹🇿", phone: "+255", cities: ["Dar es Salaam", "Dodoma", "Mwanza", "Arusha", "Mbeya", "Morogoro", "Zanzibar", "Tanga", "Iringa"] },
  { name: "Rwanda", code: "RW", flag: "🇷🇼", phone: "+250", cities: ["Kigali", "Butare", "Gisenyi", "Ruhengeri", "Gitarama", "Byumba"] },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", phone: "+27", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "Polokwane", "Nelspruit", "Kimberley", "East London"] },
  { name: "Ethiopia", code: "ET", flag: "🇪🇹", phone: "+251", cities: ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Bahir Dar", "Jimma", "Adama"] },
  { name: "DR Congo", code: "CD", flag: "🇨🇩", phone: "+243", cities: ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kisangani", "Kananga", "Goma", "Bukavu"] },
  { name: "Cameroon", code: "CM", flag: "🇨🇲", phone: "+237", cities: ["Douala", "Yaoundé", "Bamenda", "Garoua", "Maroua", "Bafoussam", "Kumba"] },
  { name: "Ivory Coast", code: "CI", flag: "🇨🇮", phone: "+225", cities: ["Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro", "Korhogo"] },
  { name: "Senegal", code: "SE", flag: "🇸🇳", phone: "+221", cities: ["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Touba"] },
  { name: "Zambia", code: "ZM", flag: "🇿🇲", phone: "+260", cities: ["Lusaka", "Kitwe", "Ndola", "Livingstone", "Kabwe", "Chipata"] },
  { name: "Zimbabwe", code: "ZW", flag: "🇿🇼", phone: "+263", cities: ["Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Kwekwe"] },
  { name: "Mozambique", code: "MZ", flag: "🇲🇿", phone: "+258", cities: ["Maputo", "Matola", "Beira", "Nampula", "Chimoio", "Quelimane"] },
  { name: "Angola", code: "AO", flag: "🇦🇴", phone: "+244", cities: ["Luanda", "Huambo", "Lobito", "Benguela", "Lubango"] },
  { name: "Mali", code: "ML", flag: "🇲🇱", phone: "+223", cities: ["Bamako", "Sikasso", "Mopti", "Ségou", "Timbuktu"] },
  { name: "Malawi", code: "MW", flag: "🇲🇼", phone: "+265", cities: ["Lilongwe", "Blantyre", "Mzuzu", "Zomba"] },
  { name: "Botswana", code: "BW", flag: "🇧🇼", phone: "+267", cities: ["Gaborone", "Francistown", "Maun", "Kasane"] },
  { name: "Namibia", code: "NA", flag: "🇳🇦", phone: "+264", cities: ["Windhoek", "Walvis Bay", "Swakopmund", "Oshakati"] },
  { name: "Somalia", code: "SO", flag: "🇸🇴", phone: "+252", cities: ["Mogadishu", "Hargeisa", "Kismayo", "Marka"] },
  { name: "Burkina Faso", code: "BF", flag: "🇧🇫", phone: "+226", cities: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou"] },
  { name: "Sudan", code: "SD", flag: "🇸🇩", phone: "+249", cities: ["Khartoum", "Omdurman", "Port Sudan", "Kassala"] },
  { name: "South Sudan", code: "SS", flag: "🇸🇸", phone: "+211", cities: ["Juba", "Malakal", "Wau", "Bor"] },
  { name: "Togo", code: "TG", flag: "🇹🇬", phone: "+228", cities: ["Lomé", "Sokodé", "Kara"] },
  { name: "Benin", code: "BJ", flag: "🇧🇯", phone: "+229", cities: ["Cotonou", "Porto-Novo", "Parakou"] },
  { name: "Sierra Leone", code: "SL", flag: "🇸🇱", phone: "+232", cities: ["Freetown", "Bo", "Kenema", "Makeni"] },
  { name: "Liberia", code: "LR", flag: "🇱🇷", phone: "+231", cities: ["Monrovia", "Gbarnga", "Buchanan"] },
  { name: "Niger", code: "NE", flag: "🇳🇪", phone: "+227", cities: ["Niamey", "Zinder", "Maradi"] },
  { name: "Mauritius", code: "MU", flag: "🇲🇺", phone: "+230", cities: ["Port Louis", "Curepipe", "Quatre Bornes"] },
  { name: "Gambia", code: "GM", flag: "🇬🇲", phone: "+220", cities: ["Banjul", "Serekunda", "Brikama"] },
  { name: "Eswatini", code: "SZ", flag: "🇸🇿", phone: "+268", cities: ["Mbabane", "Manzini"] },
  { name: "Lesotho", code: "LS", flag: "🇱🇸", phone: "+266", cities: ["Maseru", "Teyateyaneng"] },
  // Non-African countries
  { name: "United States", code: "US", flag: "🇺🇸", phone: "+1", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin", "Atlanta", "Miami"] },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", phone: "+44", cities: ["London", "Birmingham", "Manchester", "Leeds", "Glasgow", "Liverpool", "Bristol", "Edinburgh"] },
  { name: "Canada", code: "CA", flag: "🇨🇦", phone: "+1", cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg"] },
  { name: "India", code: "IN", flag: "🇮🇳", phone: "+91", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"] },
  { name: "UAE", code: "AE", flag: "🇦🇪", phone: "+971", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"] },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", phone: "+966", cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"] },
  { name: "China", code: "CN", flag: "🇨🇳", phone: "+86", cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou"] },
  { name: "Australia", code: "AU", flag: "🇦🇺", phone: "+61", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"] },
  { name: "Germany", code: "DE", flag: "🇩🇪", phone: "+49", cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"] },
  { name: "France", code: "FR", flag: "🇫🇷", phone: "+33", cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"] },
  { name: "Brazil", code: "BR", flag: "🇧🇷", phone: "+55", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"] },
  { name: "Turkey", code: "TR", flag: "🇹🇷", phone: "+90", cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"] },
  { name: "Malaysia", code: "MY", flag: "🇲🇾", phone: "+60", cities: ["Kuala Lumpur", "George Town", "Johor Bahru", "Kota Kinabalu"] },
  { name: "Singapore", code: "SG", flag: "🇸🇬", phone: "+65", cities: ["Singapore"] },
  { name: "Japan", code: "JP", flag: "🇯🇵", phone: "+81", cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya"] },
  { name: "South Korea", code: "KR", flag: "🇰🇷", phone: "+82", cities: ["Seoul", "Busan", "Incheon", "Daegu"] },
  { name: "Italy", code: "IT", flag: "🇮🇹", phone: "+39", cities: ["Rome", "Milan", "Naples", "Turin", "Florence"] },
  { name: "Spain", code: "ES", flag: "🇪🇸", phone: "+34", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Malaga"] },
  { name: "Netherlands", code: "NL", flag: "🇳🇱", phone: "+31", cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"] },
  { name: "Sweden", code: "SE2", flag: "🇸🇪", phone: "+46", cities: ["Stockholm", "Gothenburg", "Malmö"] },
  { name: "Norway", code: "NO", flag: "🇳🇴", phone: "+47", cities: ["Oslo", "Bergen", "Trondheim"] },
  { name: "Pakistan", code: "PK", flag: "🇵🇰", phone: "+92", cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad"] },
  { name: "Bangladesh", code: "BD", flag: "🇧🇩", phone: "+880", cities: ["Dhaka", "Chittagong", "Khulna", "Rajshahi"] },
  { name: "Egypt", code: "EG", flag: "🇪🇬", phone: "+20", cities: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"] },
  { name: "Morocco", code: "MA", flag: "🇲🇦", phone: "+212", cities: ["Casablanca", "Rabat", "Marrakech", "Fez", "Tangier"] },
  { name: "Tunisia", code: "TN", flag: "🇹🇳", phone: "+216", cities: ["Tunis", "Sfax", "Sousse"] },
  { name: "Algeria", code: "DZ", flag: "🇩🇿", phone: "+213", cities: ["Algiers", "Oran", "Constantine"] },
  { name: "Libya", code: "LY", flag: "🇱🇾", phone: "+218", cities: ["Tripoli", "Benghazi", "Misrata"] },
  { name: "Jamaica", code: "JM", flag: "🇯🇲", phone: "+1", cities: ["Kingston", "Montego Bay", "Spanish Town"] },
  { name: "Trinidad & Tobago", code: "TT", flag: "🇹🇹", phone: "+1", cities: ["Port of Spain", "San Fernando", "Chaguanas"] },
  { name: "Mexico", code: "MX", flag: "🇲🇽", phone: "+52", cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Cancún"] },
  { name: "Colombia", code: "CO", flag: "🇨🇴", phone: "+57", cities: ["Bogotá", "Medellín", "Cali", "Barranquilla"] },
  { name: "Argentina", code: "AR", flag: "🇦🇷", phone: "+54", cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza"] },
  { name: "Philippines", code: "PH", flag: "🇵🇭", phone: "+63", cities: ["Manila", "Cebu", "Davao", "Quezon City"] },
  { name: "Indonesia", code: "ID", flag: "🇮🇩", phone: "+62", cities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Bali"] },
  { name: "Thailand", code: "TH", flag: "🇹🇭", phone: "+66", cities: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya"] },
  { name: "Vietnam", code: "VN", flag: "🇻🇳", phone: "+84", cities: ["Ho Chi Minh City", "Hanoi", "Da Nang"] },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿", phone: "+64", cities: ["Auckland", "Wellington", "Christchurch"] },
  { name: "Ireland", code: "IE", flag: "🇮🇪", phone: "+353", cities: ["Dublin", "Cork", "Galway", "Limerick"] },
  { name: "Portugal", code: "PT", flag: "🇵🇹", phone: "+351", cities: ["Lisbon", "Porto", "Braga"] },
  { name: "Poland", code: "PL", flag: "🇵🇱", phone: "+48", cities: ["Warsaw", "Kraków", "Gdańsk", "Wrocław"] },
  { name: "Israel", code: "IL", flag: "🇮🇱", phone: "+972", cities: ["Tel Aviv", "Jerusalem", "Haifa"] },
  { name: "Qatar", code: "QA", flag: "🇶🇦", phone: "+974", cities: ["Doha", "Al Wakrah", "Al Khor"] },
  { name: "Kuwait", code: "KW", flag: "🇰🇼", phone: "+965", cities: ["Kuwait City", "Hawalli", "Salmiya"] },
  { name: "Bahrain", code: "BH", flag: "🇧🇭", phone: "+973", cities: ["Manama", "Riffa", "Muharraq"] },
  { name: "Oman", code: "OM", flag: "🇴🇲", phone: "+968", cities: ["Muscat", "Salalah", "Sohar"] },
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getPhoneCodeForCountry(countryCode: string): string {
  return COUNTRIES.find((c) => c.code === countryCode)?.phone || "+1";
}
