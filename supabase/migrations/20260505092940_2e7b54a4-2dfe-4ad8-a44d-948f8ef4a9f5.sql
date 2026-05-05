
-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null,
  name text not null,
  category text not null default 'general',
  description text,
  price numeric(10,2) not null default 0,
  unit text not null default 'kg',
  stock integer not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "products_select_all" on public.products for select to authenticated using (true);
create policy "products_insert_own" on public.products for insert to authenticated with check (auth.uid() = seller_id);
create policy "products_update_own" on public.products for update to authenticated using (auth.uid() = seller_id);
create policy "products_delete_own" on public.products for delete to authenticated using (auth.uid() = seller_id);

-- orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1,
  total numeric(10,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "orders_select_buyer" on public.orders for select to authenticated using (auth.uid() = buyer_id);
create policy "orders_select_seller" on public.orders for select to authenticated using (
  exists (select 1 from public.products p where p.id = orders.product_id and p.seller_id = auth.uid())
);
create policy "orders_insert_own" on public.orders for insert to authenticated with check (auth.uid() = buyer_id);

-- reminders
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  notes text,
  due_date date not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.reminders enable row level security;
create policy "reminders_all_own" on public.reminders for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- schemes (public catalog)
create table public.schemes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  eligibility text,
  link text,
  region text default 'global',
  created_at timestamptz not null default now()
);
alter table public.schemes enable row level security;
create policy "schemes_select_all" on public.schemes for select using (true);

insert into public.schemes (title, description, eligibility, link, region) values
('PM-KISAN Income Support', 'Direct income support of ₹6000/year to all landholding farmer families.', 'Small & marginal farmers with cultivable land', 'https://pmkisan.gov.in', 'India'),
('Soil Health Card Scheme', 'Free soil testing and crop-specific nutrient recommendations.', 'All farmers', 'https://soilhealth.dac.gov.in', 'India'),
('Pradhan Mantri Fasal Bima Yojana', 'Crop insurance against natural calamities, pests and diseases.', 'Farmers growing notified crops', 'https://pmfby.gov.in', 'India'),
('USDA Farm Loan Programs', 'Loans for purchasing land, equipment, livestock, and operating costs.', 'US-based farmers and ranchers', 'https://www.farmers.gov/loans', 'USA'),
('EU Common Agricultural Policy', 'Direct payments and rural development support for European farmers.', 'EU farmers meeting cross-compliance rules', 'https://agriculture.ec.europa.eu', 'EU');
