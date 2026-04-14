import { getEgyptTodayIso } from "@/lib/date";
import type { DressImageShotType } from "@/lib/dress-image-types";

export type DressStatus = "متاح" | "محجوز";
export type BookingStatus = "محجوز" | "تم التسليم" | "تم الاسترجاع";
export type PaymentStatus = "مدفوع" | "غير مدفوع";

export type DressGalleryImage = {
  id: string;
  path: string;
  url: string;
  sortOrder: number;
  shotType: DressImageShotType;
};

export type Dress = {
  id: string;
  code: string;
  name: string;
  category: string;
  size: string;
  color: string;
  price: number;
  status: DressStatus;
  imageTone: string;
  imagePath?: string;
  imageUrl?: string | null;
  gallery: DressGalleryImage[];
  notes: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  area: string;
  lastDress: string;
  historyCount: number;
  balanceDue: number;
  preferredSize: string;
  initials: string;
};

export type Booking = {
  id: string;
  customerId: string;
  dressId: string;
  customerName: string;
  phone: string;
  dressName: string;
  dressCode: string;
  pickupDate: string;
  returnDate: string;
  timeLabel: string;
  status: BookingStatus;
  deposit: number;
  total: number;
  paymentStatus: PaymentStatus;
  note: string;
  fittingStage: string;
  bookingSource?: "admin" | "website";
};

export const today = getEgyptTodayIso();

export const atelierProfile = {
  name: "منصة الفساتين",
  owner: "صاحبة الحساب",
  phone: "01000011223"
};

export const dresses: Dress[] = [
  {
    id: "rose-2024-01",
    code: "POWDER-2024-01",
    name: 'فستان سواريه "بودر فيلفت"',
    category: "سواريه",
    size: "M (38-40)",
    color: "وردي بودري",
    price: 4500,
    status: "محجوز",
    imageTone: "rose",
    gallery: [],
    notes: "خفيف ومريح في اللبس، مناسب للسهرات والقاعات المقفولة."
  },
  {
    id: "silk-882",
    code: "SILK-882",
    name: 'فستان زفاف "شامبين لايس"',
    category: "زفاف",
    size: "L (40-42)",
    color: "شامبين",
    price: 6200,
    status: "محجوز",
    imageTone: "champagne",
    gallery: [],
    notes: "شغل صدر يدوي مع ديل خفيف، مناسب للتسليم السريع."
  },
  {
    id: "vel-red-05",
    code: "VEL-RED-05",
    name: 'فستان سهرة "ريد فلفت"',
    category: "سهرة",
    size: "S (36)",
    color: "أحمر غامق",
    price: 5100,
    status: "متاح",
    imageTone: "velvet",
    gallery: [],
    notes: "قماشة مخمل ناعمة وتفصيل يبرز الخصر."
  },
  {
    id: "tulle-pk-12",
    code: "TULLE-PK-12",
    name: 'فستان خطوبة "تول بلاش"',
    category: "خطوبة",
    size: "L (42)",
    color: "بينك فاتح",
    price: 6000,
    status: "متاح",
    imageTone: "blush",
    gallery: [],
    notes: "مناسب للتصوير والفرح الصغير، سهل التعديل السريع."
  },
  {
    id: "pearl-a1",
    code: "PEARL-A1",
    name: 'فستان زفاف "بيرل A-Line"',
    category: "زفاف",
    size: "XL (44)",
    color: "أوف وايت",
    price: 6800,
    status: "متاح",
    imageTone: "pearl",
    gallery: [],
    notes: "قصة كلاسيك مريحة مع خامة لامعة خفيفة."
  }
];

export const customers: Customer[] = [
  {
    id: "cust-sara",
    name: "سارة أحمد",
    phone: "01012345678",
    area: "مدينة نصر",
    lastDress: 'فستان خطوبة "تول بلاش"',
    historyCount: 3,
    balanceDue: 2500,
    preferredSize: "M",
    initials: "س"
  },
  {
    id: "cust-maryam",
    name: "مريم محمود",
    phone: "01122334455",
    area: "التجمع",
    lastDress: 'فستان زفاف "شامبين لايس"',
    historyCount: 2,
    balanceDue: 0,
    preferredSize: "L",
    initials: "م"
  },
  {
    id: "cust-nourhan",
    name: "نورهان علي",
    phone: "01298765432",
    area: "المهندسين",
    lastDress: 'فستان سهرة "بودر فيلفت"',
    historyCount: 1,
    balanceDue: 2200,
    preferredSize: "S",
    initials: "ن"
  },
  {
    id: "cust-yasmin",
    name: "ياسمين حسن",
    phone: "01566778899",
    area: "الشروق",
    lastDress: 'فستان زفاف "بيرل A-Line"',
    historyCount: 4,
    balanceDue: 1800,
    preferredSize: "XL",
    initials: "ي"
  }
];

export const bookings: Booking[] = [
  {
    id: "bk-2407",
    customerId: "cust-sara",
    dressId: "tulle-pk-12",
    customerName: "سارة أحمد",
    phone: "01012345678",
    dressName: 'فستان خطوبة "تول بلاش"',
    dressCode: "TULLE-PK-12",
    pickupDate: "2026-04-07",
    returnDate: "2026-04-10",
    timeLabel: "02:00 م",
    status: "محجوز",
    deposit: 3500,
    total: 6000,
    paymentStatus: "غير مدفوع",
    note: "محتاجة بروفة أخيرة قبل التسليم بساعة.",
    fittingStage: "تأكيد نهائي"
  },
  {
    id: "bk-2408",
    customerId: "cust-maryam",
    dressId: "silk-882",
    customerName: "مريم محمود",
    phone: "01122334455",
    dressName: 'فستان زفاف "شامبين لايس"',
    dressCode: "SILK-882",
    pickupDate: "2026-04-07",
    returnDate: "2026-04-12",
    timeLabel: "04:30 م",
    status: "تم التسليم",
    deposit: 6200,
    total: 6200,
    paymentStatus: "مدفوع",
    note: "العروسة استلمت الطرحة مع الفستان.",
    fittingStage: "تم التسليم"
  },
  {
    id: "bk-2409",
    customerId: "cust-nourhan",
    dressId: "rose-2024-01",
    customerName: "نورهان علي",
    phone: "01298765432",
    dressName: 'فستان سواريه "بودر فيلفت"',
    dressCode: "POWDER-2024-01",
    pickupDate: "2026-04-08",
    returnDate: "2026-04-09",
    timeLabel: "06:00 م",
    status: "محجوز",
    deposit: 2300,
    total: 4500,
    paymentStatus: "غير مدفوع",
    note: "العميلة طالبة شال ساده لو متوفر.",
    fittingStage: "قياس أخير"
  },
  {
    id: "bk-2410",
    customerId: "cust-yasmin",
    dressId: "pearl-a1",
    customerName: "ياسمين حسن",
    phone: "01566778899",
    dressName: 'فستان زفاف "بيرل A-Line"',
    dressCode: "PEARL-A1",
    pickupDate: "2026-04-05",
    returnDate: "2026-04-07",
    timeLabel: "12:30 م",
    status: "تم التسليم",
    deposit: 5000,
    total: 6800,
    paymentStatus: "غير مدفوع",
    note: "استرجاع اليوم مع مراجعة التنضيف.",
    fittingStage: "استرجاع"
  },
  {
    id: "bk-2411",
    customerId: "cust-sara",
    dressId: "vel-red-05",
    customerName: "سارة أحمد",
    phone: "01012345678",
    dressName: 'فستان سهرة "ريد فلفت"',
    dressCode: "VEL-RED-05",
    pickupDate: "2026-04-11",
    returnDate: "2026-04-13",
    timeLabel: "05:00 م",
    status: "محجوز",
    deposit: 2500,
    total: 5100,
    paymentStatus: "غير مدفوع",
    note: "اتفاق مبدئي وتم تأكيد العربون.",
    fittingStage: "حجز جديد"
  }
];

export const todaysBookings = bookings.filter((booking) => booking.pickupDate === today);
export const todaysReturns = bookings.filter((booking) => booking.returnDate === today);

export const dashboardStats = [
  {
    label: "حجوزات النهارده",
    value: todaysBookings.length,
    hint: "مواعيد التسليم والبروفات المؤكدة",
    tone: "bookings" as const
  },
  {
    label: "فساتين التسليم النهارده",
    value: 2,
    hint: "لازم تبقى جاهزة قبل الضهر",
    tone: "delivery" as const
  },
  {
    label: "فساتين الاسترجاع النهارده",
    value: todaysReturns.length,
    hint: "راجعي الحالة والتنضيف أول ما ترجع",
    tone: "return" as const
  },
  {
    label: "إيراد الشهر",
    value: 45200,
    hint: "إجمالي دخل أبريل لحد النهارده",
    tone: "cash" as const
  }
];

export const todayTasks = [
  {
    id: "task-1",
    title: 'تسليم فستان خطوبة "تول بلاش"',
    copy: "سارة جاية 2:00 م - اتأكدي من الشال والكفر.",
    time: "02:00 م",
    status: "مهم"
  },
  {
    id: "task-2",
    title: 'متابعة استرجاع "بيرل A-Line"',
    copy: "ياسمين راجعة الساعة 12:30 م مع مراجعة سريعة.",
    time: "12:30 م",
    status: "استرجاع"
  },
  {
    id: "task-3",
    title: "تأكيد رصيد نورهان",
    copy: "باقي 2200 ج.م قبل استلام الفستان بكرة.",
    time: "06:30 م",
    status: "تحصيل"
  }
];

export const notifications = [
  {
    id: "notif-1",
    title: "تذكير تسليم",
    copy: "فيه 2 فستان لازم يخرجوا النهارده قبل 2:00 م."
  },
  {
    id: "notif-2",
    title: "تذكير استرجاع",
    copy: "فستان بيرل A-Line راجع النهارده ومحتاج مراجعة سريعة."
  }
];

export const paymentSnapshot = {
  bookingsCount: 148,
  bookingsGrowth: "12%+",
  revenue: 45200,
  unpaidAmount: 6500
};

export function getDressById(id: string) {
  return dresses.find((dress) => dress.id === id);
}

export function getCustomerById(id: string) {
  return customers.find((customer) => customer.id === id);
}

export function getBookingById(id: string) {
  return bookings.find((booking) => booking.id === id);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateLabel(value: string, month: "short" | "long" = "long") {
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month
  }).format(new Date(value));
}

export function formatFullDateLabel(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}
