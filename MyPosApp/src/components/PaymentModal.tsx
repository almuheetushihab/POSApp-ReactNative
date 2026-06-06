import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    amount: number;
    onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ visible, onClose, amount, onPaymentSuccess }) => {
    const { confirmPayment } = useStripe();
    const [loading, setLoading] = useState(false);
    const [cardDetailsComplete, setCardDetailsComplete] = useState(false);

    const fetchPaymentIntentClientSecret = async () => {
        // NOTE: In an emulator, you should use your local IP address (e.g., http://192.168.1.X:4242/create-payment-intent) 
        // instead of localhost or 10.0.2.2 if you are testing on a physical device.
        // For Android emulator, use: http://10.0.2.2:4242/create-payment-intent
        // For iOS simulator, use: http://localhost:4242/create-payment-intent
        
        // I am using 10.0.2.2 which is default for Android emulator
        const response = await fetch('http://10.0.2.2:4242/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: amount }),
        });

        const { clientSecret, error } = await response.json();
        
        if(error) {
            console.error("Error from backend:", error);
            Alert.alert("Server Error", "Could not connect to payment server.");
            return null;
        }
        return clientSecret;
    };

    const handlePayPress = async () => {
        if (!cardDetailsComplete) {
            Alert.alert('Incomplete details', 'Please enter your complete card details');
            return;
        }

        setLoading(true);

        const clientSecret = await fetchPaymentIntentClientSecret();

        if (!clientSecret) {
            setLoading(false);
            return;
        }

        const { error, paymentIntent } = await confirmPayment(clientSecret, {
            paymentMethodType: 'Card',
        });

        setLoading(false);

        if (error) {
            Alert.alert(`Payment failed`, error.message);
        } else if (paymentIntent) {
            Alert.alert('Success', 'Payment was successful!');
            onPaymentSuccess();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white p-6 rounded-lg w-11/12 max-w-md">
                    <Text className="text-xl font-bold mb-4 text-center">Card Payment</Text>
                    <Text className="text-gray-600 mb-6 text-center">Amount to Pay: ${amount.toFixed(2)}</Text>

                    <CardField
                        postalCodeEnabled={false}
                        onCardChange={(cardDetails) => {
                            setCardDetailsComplete(cardDetails.complete);
                        }}
                        style={{
                            width: '100%',
                            height: 50,
                            marginVertical: 30,
                        }}
                    />

                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity
                            className={`p-4 rounded-lg mt-4 ${cardDetailsComplete ? 'bg-blue-600' : 'bg-gray-400'}`}
                            onPress={handlePayPress}
                            disabled={!cardDetailsComplete}
                        >
                            <Text className="text-white text-center font-bold">Pay Now</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        className="mt-4 p-2 rounded-lg border border-red-500"
                        onPress={onClose}
                        disabled={loading}
                    >
                        <Text className="text-red-500 text-center font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};