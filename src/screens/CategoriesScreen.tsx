import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Text, Title, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { getAllCategories } from '../services/categoryService';
import { Category } from '../types';

// Kategori simge URL'leri
const categoryIcons: Record<string, string> = {
  'Hırdavat/Nalbur': 'https://cdn-icons-png.flaticon.com/512/2947/2947656.png',
  'Elektrik': 'https://cdn-icons-png.flaticon.com/512/2947/2947969.png',
  'Oto Parça': 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png',
  'Ahşap': 'https://cdn-icons-png.flaticon.com/512/2537/2537535.png',
  'Boya': 'https://cdn-icons-png.flaticon.com/512/1648/1648768.png',
  'Tesisat': 'https://cdn-icons-png.flaticon.com/512/1791/1791961.png',
  'Giyim': 'https://cdn-icons-png.flaticon.com/512/863/863684.png',
  'Gıda': 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png',
  'Kırtasiye': 'https://cdn-icons-png.flaticon.com/512/2541/2541988.png',
  'İnşaat Malzemeleri': 'https://cdn-icons-png.flaticon.com/512/1669/1669341.png',
  'Tarım ve Bahçecilik': 'https://cdn-icons-png.flaticon.com/512/862/862039.png',
  'Medikal ve Laboratuvar': 'https://cdn-icons-png.flaticon.com/512/2376/2376100.png',
  'Temizlik ve Hijyen': 'https://cdn-icons-png.flaticon.com/512/995/995053.png'
};

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('Main', {
      screen: 'Ana Sayfa',
      params: { categoryId },
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size={50} 
          color="#4F46E5"
          animating={true}
        />
        <Text style={styles.loadingText}>Kategoriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Title style={styles.title}>Kategoriler</Title>
      <Divider style={styles.divider} />
      
      <View style={styles.categoriesGrid}>
        {categories.map((category: Category) => (
          <TouchableOpacity
            key={category._id}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category._id)}
          >
            <Card style={styles.card}>
              <View style={styles.iconContainer}>
                <Image 
                  source={{ uri: categoryIcons[category.name] || 'https://cdn-icons-png.flaticon.com/512/1178/1178479.png' }}
                  style={styles.categoryIcon}
                  resizeMode="contain"
                />
              </View>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardTitle}>{category.name}</Text>
                {category.description && (
                  <Text style={styles.cardDescription} numberOfLines={1}>
                    {category.description}
                  </Text>
                )}
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#4B5563',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#4F46E5',
  },
  divider: {
    height: 2,
    backgroundColor: '#4F46E5',
    width: 60,
    alignSelf: 'center',
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    width: 60,
    height: 60,
  },
  cardContent: {
    paddingVertical: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default CategoriesScreen; 