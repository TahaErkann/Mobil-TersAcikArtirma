// Navigasyon tip tanımlamaları
export type RootStackParamList = {
  // Ana ekranlar
  Main: undefined;
  Home: undefined;
  ListingDetail: { id: string };
  CreateListing: undefined;
  
  // Auth ekranları
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  
  // Admin ekranları
  AdminTabs: undefined;
  AdminDashboard: undefined;
}; 