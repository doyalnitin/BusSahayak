import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ffffff" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="search" />
        <Stack.Screen name="results" />
        <Stack.Screen name="seat-selection" />
        <Stack.Screen name="booking" />
        <Stack.Screen name="tickets" />
      </Stack>
    </>
  );
}
