insert into public.customers (id, name, phone, area, preferred_size)
values
  ('11111111-1111-1111-1111-111111111111', 'سارة أحمد', '01012345678', 'مدينة نصر', 'M'),
  ('22222222-2222-2222-2222-222222222222', 'مريم محمود', '01122334455', 'التجمع', 'L'),
  ('33333333-3333-3333-3333-333333333333', 'نورهان علي', '01298765432', 'المهندسين', 'S'),
  ('44444444-4444-4444-4444-444444444444', 'ياسمين حسن', '01566778899', 'الشروق', 'XL')
on conflict (id) do update
set
  name = excluded.name,
  phone = excluded.phone,
  area = excluded.area,
  preferred_size = excluded.preferred_size;

insert into public.dresses (id, code, name, category, size, color, price, status, image_tone, notes)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'POWDER-2024-01', 'فستان سواريه "بودر فيلفت"', 'سواريه', 'M (38-40)', 'وردي بودري', 4500, 'محجوز', 'rose', 'خفيف ومريح في اللبس، مناسب للسهرات والقاعات المقفولة.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'SILK-882', 'فستان زفاف "شامبين لايس"', 'زفاف', 'L (40-42)', 'شامبين', 6200, 'محجوز', 'champagne', 'شغل صدر يدوي مع ديل خفيف، مناسب للتسليم السريع.'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'VEL-RED-05', 'فستان سهرة "ريد فلفت"', 'سهرة', 'S (36)', 'أحمر غامق', 5100, 'متاح', 'velvet', 'قماشة مخمل ناعمة وتفصيل يبرز الخصر.'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'TULLE-PK-12', 'فستان خطوبة "تول بلاش"', 'خطوبة', 'L (42)', 'بينك فاتح', 6000, 'متاح', 'blush', 'مناسب للتصوير والفرح الصغير، سهل التعديل السريع.'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'PEARL-A1', 'فستان زفاف "بيرل A-Line"', 'زفاف', 'XL (44)', 'أوف وايت', 6800, 'متاح', 'pearl', 'قصة كلاسيك مريحة مع خامة لامعة خفيفة.')
on conflict (id) do update
set
  code = excluded.code,
  name = excluded.name,
  category = excluded.category,
  size = excluded.size,
  color = excluded.color,
  price = excluded.price,
  status = excluded.status,
  image_tone = excluded.image_tone,
  notes = excluded.notes;

insert into public.bookings (
  id,
  customer_id,
  dress_id,
  pickup_date,
  return_date,
  time_label,
  status,
  deposit,
  total,
  payment_status,
  note,
  fitting_stage
)
values
  ('90000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2026-04-07', '2026-04-10', '02:00 م', 'محجوز', 3500, 6000, 'غير مدفوع', 'محتاج بروفة أخيرة قبل التسليم بساعة.', 'تأكيد نهائي'),
  ('90000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-04-07', '2026-04-12', '04:30 م', 'تم التسليم', 6200, 6200, 'مدفوع', 'العروسة استلمت الطرحة مع الفستان.', 'تم التسليم'),
  ('90000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-04-08', '2026-04-09', '06:00 م', 'محجوز', 2300, 4500, 'غير مدفوع', 'العميلة طالبة شال ساده لو متوفر.', 'قياس أخير'),
  ('90000000-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-04-05', '2026-04-07', '12:30 م', 'تم التسليم', 5000, 6800, 'غير مدفوع', 'استرجاع اليوم مع مراجعة التنضيف.', 'استرجاع'),
  ('90000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-04-11', '2026-04-13', '05:00 م', 'محجوز', 2500, 5100, 'غير مدفوع', 'اتفاق مبدئي وتم تأكيد العربون.', 'حجز جديد')
on conflict (id) do update
set
  customer_id = excluded.customer_id,
  dress_id = excluded.dress_id,
  pickup_date = excluded.pickup_date,
  return_date = excluded.return_date,
  time_label = excluded.time_label,
  status = excluded.status,
  deposit = excluded.deposit,
  total = excluded.total,
  payment_status = excluded.payment_status,
  note = excluded.note,
  fitting_stage = excluded.fitting_stage;
