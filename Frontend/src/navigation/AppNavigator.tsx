import React, { useState } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { EntryExitScreen } from '../screens/EntryExitScreen';
import { ClientsScreen } from '../screens/ClientsScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { UsersScreen } from '../screens/UsersScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AuditScreen } from '../screens/AuditScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const AuthStack = createStackNavigator();

type ScreenKey =
  | 'Dashboard'
  | 'EntryExit'
  | 'Clients'
  | 'Reports'
  | 'Users'
  | 'Settings'
  | 'Audit'
  | 'Profile';

interface MenuItem {
  key: ScreenKey;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'Dashboard',
    label: 'Inicio / Monitoreo',
    iconName: 'stats-chart-outline',
    description: 'Control de aforo y resumen diario',
  },
  {
    key: 'EntryExit',
    label: 'Ingreso y Salida',
    iconName: 'car-sport-outline',
    description: 'Registro de vehículos y cobros',
  },
  {
    key: 'Clients',
    label: 'Mensualidades',
    iconName: 'calendar-outline',
    description: 'Contratos y clientes abonados',
  },
  {
    key: 'Reports',
    label: 'Reportes e Ingresos',
    iconName: 'pie-chart-outline',
    description: 'Métricas financieras y recaudo',
  },
  {
    key: 'Users',
    label: 'Gestión de Usuarios',
    iconName: 'people-outline',
    description: 'Operadores y administradores',
  },
  {
    key: 'Settings',
    label: 'Tarifas y Métodos Pago',
    iconName: 'cash-outline',
    description: 'Ajuste de cobros y medios de pago',
  },
  {
    key: 'Audit',
    label: 'Historial de Auditoría',
    iconName: 'shield-checkmark-outline',
    description: 'Trazabilidad y logs del sistema',
  },
  {
    key: 'Profile',
    label: 'Mi Perfil de Usuario',
    iconName: 'person-circle-outline',
    description: 'Datos del operador y cierre de turno',
  },
];

function ResponsiveMainLayout() {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('Dashboard');
  const [menuVisible, setMenuVisible] = useState(false);

  const isTablet = width >= 768;
  const drawerWidth = isTablet ? 360 : Math.min(width * 0.85, 330);

  const activeMenuItem = MENU_ITEMS.find((item) => item.key === activeScreen);

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'Dashboard':
        return <DashboardScreen />;
      case 'EntryExit':
        return <EntryExitScreen />;
      case 'Clients':
        return <ClientsScreen />;
      case 'Reports':
        return <ReportsScreen />;
      case 'Users':
        return <UsersScreen />;
      case 'Settings':
        return <SettingsScreen />;
      case 'Audit':
        return <AuditScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Encabezado Superior con Botón Hamburguesa e Isotipo RM */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerBrandTitle}>RM PARKING</Text>
          <Text style={styles.headerSubtitle}>{activeMenuItem?.label}</Text>
        </View>

        <TouchableOpacity
          style={styles.profileBadgeHeader}
          onPress={() => setActiveScreen('Profile')}
        >
          <Text style={styles.profileBadgeInitial}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido Dinámico Adaptable */}
      <View style={styles.contentContainer}>{renderActiveScreen()}</View>

      {/* Menú Desplegable Hamburguesa con Marca RM y Ajuste Fluid-Responsive */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.drawerContent, { width: drawerWidth }]}>
            {/* Encabezado del Menú con Logo Marca RM */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerBrandRow}>
                <View style={styles.drawerBadgeLogo}>
                  <Text style={styles.drawerBadgeLogoText}>RM</Text>
                </View>
                <View style={styles.drawerBrandTextGroup}>
                  <Text style={styles.drawerTitleText}>RM Parking</Text>
                  <Text style={styles.drawerSubtitleText}>Gestión de Estacionamientos</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeDrawerButton}
                onPress={() => setMenuVisible(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Ficha de Usuario Activo */}
            <View style={styles.drawerUserSection}>
              <Text style={styles.drawerUserName}>{user?.name || user?.email}</Text>
              <Text style={styles.drawerUserRole}>{user?.role || 'OPERADOR'}</Text>
            </View>

            {/* Lista de Submenús Adaptable */}
            <ScrollView style={styles.drawerScrollView} showsVerticalScrollIndicator={false}>
              {MENU_ITEMS.map((item) => {
                const isActive = activeScreen === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.menuItemButton, isActive && styles.activeMenuItemButton]}
                    onPress={() => {
                      setActiveScreen(item.key);
                      setMenuVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                      <Ionicons
                        name={item.iconName}
                        size={22}
                        color={isActive ? '#FFFFFF' : '#818CF8'}
                      />
                    </View>

                    <View style={styles.menuTextGroup}>
                      <Text style={[styles.menuItemLabel, isActive && styles.activeMenuItemLabel]}>
                        {item.label}
                      </Text>
                      <Text style={styles.menuItemDescription}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Cierre de Sesión */}
            <TouchableOpacity style={styles.drawerLogoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.drawerLogoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <ResponsiveMainLayout />
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topHeaderBar: {
    height: 60,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  hamburgerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerBrandTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  profileBadgeHeader: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBadgeInitial: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },

  // Menú Hamburguesa Desplegable
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  drawerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  drawerBadgeLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerBadgeLogoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  drawerBrandTextGroup: {
    flex: 1,
  },
  drawerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  drawerSubtitleText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  closeDrawerButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  drawerUserSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  drawerUserName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  drawerUserRole: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  drawerScrollView: {
    flex: 1,
  },
  menuItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  activeMenuItemButton: {
    backgroundColor: '#4F46E5',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeIconWrapper: {
    backgroundColor: '#6366F1',
  },
  menuTextGroup: {
    flex: 1,
  },
  menuItemLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  activeMenuItemLabel: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuItemDescription: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  drawerLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  drawerLogoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
