import { menuService } from '../services/menuService';

const RESTAURANT_ID = '4e4af569-a67d-4a1f-a1a0-5c3f04657439';

async function insertSampleMenu() {
  try {
    console.log('Inserting sample menu items...');
    const result = await menuService.insertSampleMenuItems(RESTAURANT_ID);
    console.log('Successfully inserted menu items:', result);
  } catch (error) {
    console.error('Error inserting sample menu:', error);
  }
}

insertSampleMenu(); 