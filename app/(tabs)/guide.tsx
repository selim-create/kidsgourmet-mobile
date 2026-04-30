// Option A: Redirect directly to the Beslenme Rehberi (Ingredient List) page.
// The old 4-card guide menu is removed — the three other guide cards
// (Ek Gıda Rehberi, Büyüme Takibi, Aşı Takvimi) are accessible via the
// "Diğer Rehberler" strip on the Ingredient List page itself.
import { Redirect } from 'expo-router';

export default function GuideScreen() {
  return <Redirect href="/ingredient" />;
}
