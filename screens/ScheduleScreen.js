import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const ScheduleScreen = () => {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    // Placeholder for API call to fetch schedule
    const fetchSchedule = async () => {
      // Simulate API call
      const data = [
        { day: 'Monday', pairs: [{ number: 1, subject: 'Math', audience: '101', teacher: 'Dr. Smith' }] },
        { day: 'Tuesday', pairs: [{ number: 2, subject: 'Physics', audience: '102', teacher: 'Dr. Johnson' }] },
      ];
      setSchedule(data);
    };
    fetchSchedule();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule</Text>
      <FlatList
        data={schedule}
        keyExtractor={(item) => item.day}
        renderItem={({ item }) => (
          <View style={styles.dayContainer}>
            <Text style={styles.day}>{item.day}</Text>
            {item.pairs.map((pair) => (
              <Text key={pair.number} style={styles.pair}>
                Pair {pair.number}: {pair.subject} - {pair.audience} - {pair.teacher}
              </Text>
            ))}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dayContainer: {
    marginBottom: 20,
  },
  day: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pair: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ScheduleScreen; 