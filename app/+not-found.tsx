import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Sayfa Bulunamadı' }} />
      <View className="flex-1 items-center justify-center bg-light px-6">
        <Text className="text-6xl mb-4">🔍</Text>
        <Text className="text-dark text-2xl font-bold text-center mb-2">
          Sayfa Bulunamadı
        </Text>
        <Text className="text-gray-400 text-center mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </Text>
        <Link href="/(tabs)" className="text-primary font-semibold text-base">
          Ana Sayfaya Dön
        </Link>
      </View>
    </>
  );
}
