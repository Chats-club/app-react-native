import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LessonsStack from './src/navigation/LessonsStack';
import VocabularyScreen from './src/screens/VocabularyScreen';
import SentencesScreen from './src/screens/SentencesScreen';
import ListeningScreen from './src/screens/ListeningScreen';
import SpeakingScreen from './src/screens/SpeakingScreen';
import QuizScreen from './src/screens/QuizScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import ProgressScreen from './src/screens/ProgressScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Lessons: 'book-outline',
  Vocabulary: 'reader-outline',
  Sentences: 'chatbubble-outline',
  Listening: 'headset-outline',
  Speaking: 'mic-outline',
  Quiz: 'help-circle-outline',
  Review: 'refresh-outline',
  Progress: 'bar-chart-outline',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: '#b91c1c',
            tabBarInactiveTintColor: '#9ca3af',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
            ),
            tabBarLabelStyle: { fontSize: 10 },
          })}
        >
          <Tab.Screen name="Lessons" component={LessonsStack} />
          <Tab.Screen name="Vocabulary" component={VocabularyScreen} />
          <Tab.Screen name="Sentences" component={SentencesScreen} />
          <Tab.Screen name="Listening" component={ListeningScreen} />
          <Tab.Screen name="Speaking" component={SpeakingScreen} />
          <Tab.Screen name="Quiz" component={QuizScreen} />
          <Tab.Screen name="Review" component={ReviewScreen} />
          <Tab.Screen name="Progress" component={ProgressScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
