import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import Papa from 'papaparse';

const App = () => {
  const [location, setLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [showMarkers, setShowMarkers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Efeito para obter a localização atual do usuário ao carregar o componente
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão de localização não concedida', 'Por favor, conceda permissão de localização para obter a localização.');
        return;
      }
      let locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);
    })();
  }, []);

  // Função para buscar e carregar os dados das estações de bicicleta
  const handleSearch = async () => {
    setIsLoading(true); // Mostrar indicador de carregamento ao iniciar busca
    setShowMarkers(false); // Ocultar marcadores ao iniciar busca

    try {
      const response = await fetch('http://dados.recife.pe.gov.br/dataset/7fac73fa-c0bb-4bae-9c21-2a45b82016a2/resource/e6e4ac72-ff15-4c5a-b149-a1943386c031/download/estacoesbike.csv');
      const csvText = await response.text();
      const parsedData = Papa.parse(csvText, { header: true, dynamicTyping: true });
      setStations(parsedData.data); // Armazenar os dados das estações de bicicleta no estado
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar os dados das estações de bicicletas.');
    }

    setIsLoading(false); // Esconder indicador de carregamento ao completar busca
    setShowMarkers(true); // Mostrar marcadores ao completar busca
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>BikePark</Text>
        <Text style={styles.appDescription}>
          Encontre facilmente as estações de bicicletas do Itaú próximas a você.
        </Text>
      </View>
      <Button title="Buscar Bicicletários Próximos" onPress={handleSearch} color="#ff6600" style={styles.button} />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6600" />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      )}
      {location && showMarkers && !isLoading && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Sua Localização"
            pinColor="#ff6600"
          >
            <Callout>
              <Text style={styles.calloutText}>Você está aqui</Text>
            </Callout>
          </Marker>

          {stations.map((station, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
              title={station.nome}
              description={station.localizacao}
              pinColor="#00529c"
            >
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{station.nome}</Text>
                  <Text>Capacidade: {station.capacidade}</Text>
                  <Text>{station.localizacao}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    backgroundColor: '#00529c',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'sans-serif',
  },
  appDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 400,
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 40,
    paddingVertical: 12,
    backgroundColor: '#ff6600',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  calloutContainer: {
    width: 200,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  calloutText: {
    fontSize: 14,
    color: '#333',
  },
});

export default App;
