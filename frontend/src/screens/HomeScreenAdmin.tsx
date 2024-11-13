import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, View } from 'react-native';
import icons from '../constants/icons';
import { HomeTabAdmin, WishlistTab, CartTab, SearchTab, SettingTab } from '../tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabBarItemProps = {
  source: any;
  focused: boolean;
  cart?: boolean;
  name?: string;
};

const TabBarItem: React.FC<TabBarItemProps> = ({
  source,
  focused,
  cart,
  name,
}) => {
  return (
    <SafeAreaView
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: cart ? -24 : 18,
      }}
    >
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: cart ? 64 : 'auto',
          height: cart ? 64 : 'auto',
          borderRadius: cart ? 32 : 0,
          backgroundColor: focused ? (cart ? 'red' : 'white') : 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: cart ? 5 : 0,
        }}
      >
        <Image
          source={source}
          style={{
            tintColor: focused ? (cart ? 'white' : 'red') : 'black',
            width: 28,
            height: 28,
          }}
        />
      </View>
      {!cart && (
        <Text
          className="font-pthin text-base"
          style={{ color: focused ? 'red' : 'black', fontSize: 12 }}
        >
          {name}
        </Text>
      )}
    </SafeAreaView>
  );
};

type Props = {};

const HomeScreenAdmin = (props: Props) => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      initialRouteName="HomeAdminMain"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: 'grey',
          height: 70,
          borderTopWidth: 0.2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        tabBarIconStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarInactiveTintColor: 'black',
        tabBarActiveTintColor: 'red',
      }}
    >
      <Tab.Screen
        name="HomeAdminMain"
        component={HomeTabAdmin}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabBarItem source={icons.home} focused={focused} name="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistTab}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabBarItem source={icons.heart} focused={focused} name="Wishlist" />
          ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartTab}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabBarItem source={icons.cart} focused={focused} cart name="Cart" />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchTab}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabBarItem source={icons.search} focused={focused} name="Search" />
          ),
        }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingTab}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabBarItem source={icons.setting} focused={focused} name="Setting" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeScreenAdmin;
