import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, FlatList } from "react-native";
import { searchCities } from "../services/cityData";

interface CityInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (city: { name: string; code: string; state: string }) => void;
}

export default function CityInput({
  label,
  value,
  onChangeText,
  onSelect,
}: CityInputProps) {
  const [suggestions, setSuggestions] = useState<
    { name: string; code: string; state: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (text: string) => {
    onChangeText(text);
    if (text.length > 1) {
      const results = searchCities(text);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (city: { name: string; code: string; state: string }) => {
    onSelect(city);
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.icon}>📍</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter city"
          placeholderTextColor="#cccccc"
          value={value}
          onChangeText={handleChange}
          accessibilityLabel={label}
        />
        {value ? (
          <Pressable
            onPress={() => {
              onChangeText("");
              setShowSuggestions(false);
            }}
            accessibilityLabel="Clear"
          >
            <Text style={styles.clearBtn}>✕</Text>
          </Pressable>
        ) : null}
      </View>
      {showSuggestions && (
        <View style={styles.suggestions}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
                accessibilityLabel={`${item.name}, ${item.state}`}
              >
                <Text style={styles.suggestionName}>{item.name}</Text>
                <Text style={styles.suggestionState}>{item.state}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888888",
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  icon: { fontSize: 18, marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  clearBtn: { fontSize: 18, color: "#cccccc", padding: 4 },
  suggestions: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  suggestionName: { fontSize: 15, fontWeight: "600", color: "#000000" },
  suggestionState: { fontSize: 12, color: "#888888", marginTop: 2 },
});
