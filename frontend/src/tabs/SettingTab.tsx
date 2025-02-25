import { View, Text, TouchableOpacity, Image, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '../constants/icons';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

type Props = {};

const Stack = createStackNavigator();

const SettingTab = (props: Props) => {
  type RootStackParamList = {
    MyOrders: undefined;
    ShippingAddresses: undefined;
    PaymentMethods: undefined;
    Promocodes: undefined;
    Reviews: undefined;
    Settings: undefined;
    CustomerSupport: undefined;
    CustomerSupportAI: undefined;
  };

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [addressCount, setAddressCount] = useState(0);
  const [paymentMethodCount, setPaymentMethodCount] = useState(0);
  const [avatar, setAvatar] = useState('');
  const isFocused = useIsFocused();
  const [processingCount, setProcessingCount] = useState(0);
  const [shippingCount, setShippingCount] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const handlePressSupport = () => {
    setModalVisible(true); // Hiển thị modal khi nhấn vào Support
  };
  const handleSelectOption = (option) => {
    setModalVisible(false); // Ẩn modal sau khi chọn
    if (option === 'bot') {
      navigation.navigate('CustomerSupportAI');
    } else if (option === 'admin') {
      navigation.navigate('CustomerSupport');
    }
  };
  const fetchOrderCounts = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      try {
        const response = await axios.get<{ processingCount: number, shippingCount: number }>(`${BASE_URL}/orders/count-by-status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setProcessingCount(response.data.processingCount);
          setShippingCount(response.data.shippingCount);
        }
      } catch (error) {
        console.error('Failed to fetch order counts:', error);
        Alert.alert('Error', 'Failed to load order counts');
      }
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAddressCount();
    fetchPaymentMethodCount();
    fetchOrderCounts();

  }, []);
  const fetchUserData = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      try {
        const response = await axios.get(`${BASE_URL}/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          const { _id, username, email, avatar } = response.data as { _id: string; username: string; email: string, avatar: string };
          setUserId(_id); // Cập nhật userId vào state
          setUsername(username);
          setEmail(email);
          setAvatar(avatar ? `data:image/png;base64,${avatar}` : ''); // Hiển thị ảnh từ chuỗi Base64
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    }
  };
  const fetchAddressCount = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      try {
        const response = await axios.get(`${BASE_URL}/shipping-addresses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setAddressCount((response.data as any[]).length);
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
        Alert.alert('Error', 'Failed to load addresses');
      }
    }
  };
  // Fetch payment methods count
  const fetchPaymentMethodCount = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      try {
        const response = await axios.get(`${BASE_URL}/payment-methods`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setPaymentMethodCount((response.data as any[]).length);
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
        Alert.alert('Error', 'Failed to load payment methods');
      }
    }
  };


  useEffect(() => {
    if (isFocused) {
      fetchAddressCount();
      fetchPaymentMethodCount();
      fetchOrderCounts();

    }
  }, [isFocused]);




  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUsernameChange = (newName) => {
    setUsername(newName);
  };

  const handleSave = async () => {
    setIsEditing(false);
    const token = await AsyncStorage.getItem('authToken');
    if (token && userId) {
      try {
        const response = await axios.patch(
          `${BASE_URL}/auth/users/${userId}/username`, // Sử dụng đúng đường dẫn
          { username },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          Alert.alert('Success', 'Username updated successfully');
        }
      } catch (error) {
        console.error('Failed to update username:', error);
        Alert.alert('Error', 'Failed to update username');
      }
    } else {
      Alert.alert('Error', 'User ID or Token not found');
    }
  };

  const handleSelectAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "You've refused to allow this app to access your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;

      // Tải ảnh từ URI và chuyển đổi sang chuỗi Base64
      const response = await fetch(selectedImageUri);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.readAsDataURL(blob); // Đọc blob dưới dạng chuỗi Base64
      reader.onloadend = () => {
        // Ép kiểu reader.result thành chuỗi và sử dụng split
        const base64String = (reader.result as string).split(',')[1];
        updateAvatar(base64String); // Gọi hàm lưu Base64 vào MongoDB
      };
    }
  };



  const updateAvatar = async (base64Image) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token && userId) {
      try {
        const response = await axios.patch(
          `${BASE_URL}/auth/users/${userId}/avatar`,
          { avatar: base64Image },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          Alert.alert('Success', 'Avatar updated successfully');
          setAvatar(`data:image/png;base64,${base64Image}`); // Cập nhật UI với Base64 mới
        }
      } catch (error) {
        console.error('Failed to update avatar:', error);
        Alert.alert('Error', 'Failed to update avatar');
      }
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Section */}
      <View className="px-4 pb-4">
        <Text className="text-2xl font-bold">My profile</Text>
      </View>

      {/* Profile Info */}
      <View className="flex-row items-center px-4 pb-4">
        <TouchableOpacity onPress={handleSelectAvatar}>
          <Image
            source={avatar ? { uri: avatar } : icons.profile}
            className="w-16 h-16 rounded-full mr-4"
          />
        </TouchableOpacity>
        <View>
          <View className="flex-row items-center space-x-2">
            {isEditing ? (
              <TextInput
                value={username}
                onChangeText={handleUsernameChange}
                onSubmitEditing={handleSave}
                className="text-lg font-semibold border-b border-gray-400 pb-1"
                autoFocus
              />
            ) : (
              <Text className="text-lg font-semibold">{username}</Text>
            )}
            <TouchableOpacity onPress={handleEditToggle}>
              <Image source={icons.edit} className="w-5 h-5" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-500">{email}</Text>
        </View>
      </View>

      {/* Options List */}
      <View className="bg-white">
        <TouchableOpacity
          className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
          onPress={() => navigation.navigate('MyOrders')}
        >
          <View>
            <Text className="text-lg font-bold">My orders</Text>
            <Text className="text-sm text-gray-400">Already have {processingCount + shippingCount} orders</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#A0A0A0" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
          onPress={() => navigation.navigate('ShippingAddresses')}
        >
          <View>
            <Text className="text-lg font-bold">Shipping addresses</Text>
            <Text className="text-sm text-gray-400">{addressCount} addresses</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#A0A0A0" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
          onPress={() => navigation.navigate('PaymentMethods')}
        >
          <View>
            <Text className="text-lg font-bold">Payment methods</Text>
            <Text className="text-sm text-gray-400">{paymentMethodCount} payment methods</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#A0A0A0" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
          onPress={() => navigation.navigate('Promocodes')}

        >
          <View>
            <Text className="text-lg font-bold">Promocodes</Text>
            <Text className="text-sm text-gray-400">You have special promocodes</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#A0A0A0" />
        </TouchableOpacity>

        {/* <TouchableOpacity
          className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
        // onPress={() => navigation.navigate('Reviews')}
        >
          <View>
            <Text className="text-lg font-bold">My reviews</Text>
            <Text className="text-sm text-gray-400">Reviews for 4 items</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#A0A0A0" />
        </TouchableOpacity> */}

        <TouchableOpacity
          className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
          onPress={handlePressSupport}
        >
          <View>
            <Text className="text-lg font-bold">Support</Text>
            <Text className="text-sm text-gray-400">Help with orders, account, and more</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#A0A0A0" />
        </TouchableOpacity>
        {/* Modal hiển thị lựa chọn */}
        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="fade" // Thay "slide" bằng "fade" để có hiệu ứng chuyển mượt hơn
          onRequestClose={() => setModalVisible(false)}
        >
          {/* Nền mờ */}
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={1} // Để tránh xử lý sự kiện khi bấm vào modal
            onPress={() => setModalVisible(false)} // Đóng modal khi bấm ra ngoài
          >
            <View className="bg-white rounded-lg w-80 p-5" onStartShouldSetResponder={() => true}>
              {/* Nút "X" để tắt modal */}
              <TouchableOpacity
                style={{ position: 'absolute', top: 10, right: 10 }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ fontSize: 18, color: '#333' }}>✕</Text>
              </TouchableOpacity>

              <Text className="text-lg font-bold mb-4 text-center">Select Support Option</Text>
              <TouchableOpacity
                className="flex-row items-center mb-4"
                onPress={() => handleSelectOption('bot')}
              >
                <Image source={icons.bot} className="w-8 h-8" />
                <Text className="ml-3 text-lg">TTBot</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => handleSelectOption('admin')}
              >
                <Image source={icons.admin} className="w-8 h-8" />
                <Text className="ml-3 text-lg">Staff</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>


        <TouchableOpacity
          className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
          onPress={() => navigation.navigate('Settings')}
        >
          <View>
            <Text className="text-lg font-bold">Settings</Text>
            <Text className="text-sm text-gray-400">Notifications, password, logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#A0A0A0" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default SettingTab;