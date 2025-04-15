-- Insert sample menu items for Golden Fork restaurant
INSERT INTO menu_items (
  restaurant_id,
  name,
  description,
  price,
  category,
  image_urls,
  is_available
) VALUES
  (
    '4e4af569-a67d-4a1f-a1a0-5c3f04657439',
    'Classic Burger',
    'Juicy beef patty with fresh lettuce, tomatoes, and our special sauce',
    12.99,
    'Main Course',
    ARRAY['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3'],
    true
  ),
  (
    '4e4af569-a67d-4a1f-a1a0-5c3f04657439',
    'Caesar Salad',
    'Fresh romaine lettuce, parmesan cheese, croutons, and Caesar dressing',
    8.99,
    'Appetizers',
    ARRAY['https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3'],
    true
  ),
  (
    '4e4af569-a67d-4a1f-a1a0-5c3f04657439',
    'Margherita Pizza',
    'Fresh mozzarella, tomatoes, and basil on our crispy crust',
    14.99,
    'Main Course',
    ARRAY['https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3'],
    true
  ),
  (
    '4e4af569-a67d-4a1f-a1a0-5c3f04657439',
    'Chocolate Cake',
    'Rich chocolate cake with chocolate ganache',
    6.99,
    'Desserts',
    ARRAY['https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3'],
    true
  ),
  (
    '4e4af569-a67d-4a1f-a1a0-5c3f04657439',
    'French Fries',
    'Crispy golden fries with sea salt',
    4.99,
    'Sides',
    ARRAY['https://images.unsplash.com/photo-1630384066958-6131f9ae4b5d?ixlib=rb-4.0.3'],
    true
  ),
  (
    '4e4af569-a67d-4a1f-a1a0-5c3f04657439',
    'Chicken Wings',
    'Spicy buffalo wings with blue cheese dip',
    10.99,
    'Appetizers',
    ARRAY['https://images.unsplash.com/photo-1608039829572-78524f79c4c7?ixlib=rb-4.0.3'],
    true
  ),
  (
    '4e4af569-a67d-4a1f-a1a0-5c3f04657439',
    'Vegetable Pasta',
    'Fresh vegetables with al dente pasta in tomato sauce',
    13.99,
    'Main Course',
    ARRAY['https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3'],
    true
  ),
  (
    '4e4af569-a67d-4a1f-a1a0-5c3f04657439',
    'Ice Cream Sundae',
    'Vanilla ice cream with chocolate sauce and whipped cream',
    5.99,
    'Desserts',
    ARRAY['https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3'],
    true
  ); 