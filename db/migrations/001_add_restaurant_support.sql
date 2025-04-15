-- Create restaurants table
create table public.restaurants (
  id uuid not null default extensions.uuid_generate_v4(),
  name text not null,
  description text,
  address text not null,
  phone text,
  email text,
  logo_url text,
  cover_image_url text,
  opening_hours jsonb,
  owner_id uuid not null references auth.users(id),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint restaurants_pkey primary key (id)
);

-- Add restaurant_id to menu_items
alter table public.menu_items
add column restaurant_id uuid not null references restaurants(id),
add column is_available boolean not null default true;

-- Add restaurant and delivery info to orders
alter table public.orders
add column restaurant_id uuid not null references restaurants(id),
add column delivery_address text not null,
add column delivery_instructions text,
add column estimated_delivery_time timestamp with time zone;

-- Update profiles table
alter table public.profiles
add column restaurant_id uuid references restaurants(id),
add column phone_number text,
add column address text;

-- Create indexes for better performance
create index if not exists restaurants_owner_id_idx on public.restaurants using btree (owner_id);
create index if not exists menu_items_restaurant_id_idx on public.menu_items using btree (restaurant_id);
create index if not exists orders_restaurant_id_idx on public.orders using btree (restaurant_id);

-- Add trigger for updated_at on restaurants
create trigger handle_restaurants_updated_at before update on restaurants
  for each row execute function handle_updated_at(); 