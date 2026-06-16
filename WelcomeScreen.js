import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StarAnimation from '../components/StarAnimation';

export default function WelcomeScreen({ onNext }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>somthingreat</Text>

      <StarAnimation />

      <View style={styles.textBlock}>
        <Text style={styles.title}>
          Just show up. We'll handle the rest.
        </Text>

        <Text style={styles.description}>
          Somthingreat removes the decision fatigue from calisthenics.
          Open the app, follow today's workout, and keep making progress.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const BLUE = '#0037FF';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 90,
    paddingBottom: 48,
    backgroundColor: '#F7F7F7',
  },
  logo: {
    fontSize: 24,
    color: BLUE,
    marginBottom: 32,
  },
  textBlock: {
    marginTop: 32,
    marginBottom: 56,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: BLUE,
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    lineHeight: 24,
    color: BLUE,
  },
  button: {
    backgroundColor: BLUE,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
