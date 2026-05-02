import { Stack } from 'expo-router';
import React from 'react';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: '#f8fafc', // Tailwind 'slate-50'
      },
      headerTintColor: '#0f172a', // Tailwind 'slate-900'
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen name="index" options={{ title: 'Customers' }} />
      <Stack.Screen name="add" options={{ title: 'Add New Customer', presentation: 'modal' }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Customer', presentation: 'modal' }} />
    </Stack>
  );
}