// Uganda districts and their towns/areas
export const LOCATION_DATA: Record<string, string[]> = {
  Kampala: [
    "Kampala Central", "Nakawa", "Makindye", "Rubaga", "Kawempe",
    "Kololo", "Ntinda", "Bukoto", "Naguru", "Bugolobi",
    "Wandegeya", "Makerere", "Kibuye", "Ndeeba", "Kabalagala",
    "Kisementi", "Muyenga", "Buziga", "Bunga", "Namuwongo",
  ],
  Wakiso: [
    "Entebbe", "Nansana", "Kira", "Wakiso Town", "Kasangati",
    "Bweyogerere", "Namugongo", "Mukono Road", "Gayaza", "Abayita Ababiri",
    "Kajjansi", "Buloba", "Matugga", "Kakiri", "Nsangi",
  ],
  Mukono: [
    "Mukono Town", "Seeta", "Namanve", "Goma", "Lugazi",
    "Njeru", "Katosi", "Nagojje",
  ],
  Jinja: [
    "Jinja Town", "Bugembe", "Kakira", "Buwenge", "Magamaga",
  ],
  Mbarara: [
    "Mbarara City", "Kakoba", "Kamukuzi", "Nyamitanga", "Ruti",
  ],
  Gulu: [
    "Gulu City", "Laroo", "Layibi", "Pece", "Bardege",
  ],
  Lira: [
    "Lira City", "Adyel", "Ojwina", "Railway",
  ],
  Mbale: [
    "Mbale City", "Nakaloke", "Malukhu", "Wanale",
  ],
  "Fort Portal": [
    "Fort Portal City", "Kabarole", "Rwimi", "Kijura",
  ],
  Masaka: [
    "Masaka City", "Nyendo", "Kimanya", "Katwe",
  ],
  Soroti: [
    "Soroti City", "Gweri", "Arapai",
  ],
  Hoima: [
    "Hoima City", "Bujumbura", "Kigorobya",
  ],
  Arua: [
    "Arua City", "Manibe", "Oli", "Pangisa",
  ],
  Kabale: [
    "Kabale Town", "Kikungiri", "Makanga",
  ],
  Iganga: [
    "Iganga Town", "Nakavule", "Busesa",
  ],
  Mityana: [
    "Mityana Town", "Ttamu", "Busimbi",
  ],
  Tororo: [
    "Tororo Town", "Nagongera", "Malaba",
  ],
};

export const DISTRICTS = Object.keys(LOCATION_DATA);

export const getTowns = (district: string): string[] => {
  return LOCATION_DATA[district] || [];
};
