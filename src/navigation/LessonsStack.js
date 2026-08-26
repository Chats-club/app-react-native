import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LessonsListScreen from '../screens/LessonsListScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';

const Stack = createNativeStackNavigator();

export default function LessonsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LessonsList" component={LessonsListScreen} />
      <Stack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={{ headerShown: true, title: '' }}
      />
    </Stack.Navigator>
  );
}
