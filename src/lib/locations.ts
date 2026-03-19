// Districts/regions per country — no towns
export const COUNTRY_DISTRICTS: Record<string, string[]> = {
  Uganda: [
    "Kampala", "Wakiso", "Mukono", "Jinja", "Mbarara", "Gulu", "Lira",
    "Mbale", "Fort Portal", "Masaka", "Soroti", "Hoima", "Arua", "Kabale",
    "Iganga", "Mityana", "Tororo", "Entebbe", "Kasese", "Bushenyi",
    "Ntungamo", "Rukungiri", "Kabarole", "Luwero", "Mpigi",
  ],
  Kenya: [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika",
    "Malindi", "Kitale", "Garissa", "Nyeri", "Machakos", "Nanyuki",
    "Kiambu", "Kajiado", "Meru", "Embu", "Naivasha",
  ],
  Nigeria: [
    "Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City",
    "Kaduna", "Enugu", "Calabar", "Warri", "Owerri", "Abeokuta",
    "Jos", "Ilorin", "Uyo", "Onitsha", "Aba", "Akure", "Osogbo",
  ],
  Ghana: [
    "Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Tema",
    "Sunyani", "Ho", "Koforidua", "Techiman", "Wa", "Bolgatanga",
  ],
  Tanzania: [
    "Dar es Salaam", "Dodoma", "Mwanza", "Arusha", "Mbeya", "Morogoro",
    "Zanzibar", "Tanga", "Iringa", "Kigoma", "Songea",
  ],
  Rwanda: [
    "Kigali", "Butare", "Gisenyi", "Ruhengeri", "Gitarama", "Byumba",
    "Kibungo", "Cyangugu",
  ],
  "South Africa": [
    "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth",
    "Bloemfontein", "Polokwane", "Nelspruit", "Kimberley", "East London",
    "Soweto", "Pietermaritzburg", "Rustenburg",
  ],
  Ethiopia: [
    "Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa",
    "Bahir Dar", "Jimma", "Adama", "Dessie",
  ],
  Cameroon: [
    "Douala", "Yaoundé", "Bamenda", "Garoua", "Maroua", "Bafoussam",
    "Kumba", "Buea", "Limbe",
  ],
  Senegal: [
    "Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Touba",
    "Mbour", "Rufisque",
  ],
  "DR Congo": [
    "Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kisangani", "Kananga",
    "Goma", "Bukavu", "Likasi",
  ],
  "Ivory Coast": [
    "Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro", "Korhogo",
  ],
  Zambia: [
    "Lusaka", "Kitwe", "Ndola", "Livingstone", "Kabwe", "Chipata",
  ],
  Zimbabwe: [
    "Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Kwekwe",
  ],
  Mozambique: [
    "Maputo", "Matola", "Beira", "Nampula", "Chimoio", "Quelimane",
  ],
};

export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_DISTRICTS);

export const getDistricts = (country: string): string[] => {
  return COUNTRY_DISTRICTS[country] || [];
};

// Legacy exports for backward compatibility
export const DISTRICTS = COUNTRY_DISTRICTS["Uganda"] || [];
