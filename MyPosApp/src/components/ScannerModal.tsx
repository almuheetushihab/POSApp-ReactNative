import React, {useEffect} from 'react';
import {View, Text, Modal, TouchableOpacity, StyleSheet, Button} from 'react-native';
import {CameraView, useCameraPermissions} from "expo-camera";
import {Ionicons} from '@expo/vector-icons';

interface ScannerModalProps {
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
}

export const ScannerModal = ({visible, onClose, onScan}: ScannerModalProps) => {
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        if (visible && !permission?.granted) {
            requestPermission();
        }
    }, [visible]);

    if (!permission) return <View/>;

    if (!permission.granted) {
        return (
            <Modal visible={visible} animationType="slide">
                <View className="flex-1 justify-center items-center p-5 bg-white">
                    <Text className="text-center mb-4 text-lg">We need your permission to show the camera</Text>
                    <Button onPress={requestPermission} title="Grant Permission"/>
                    <Button onPress={onClose} title="Cancel" color="red"/>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-black">
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    onBarcodeScanned={({data}) => {
                        if (visible) {
                            onScan(data);
                            onClose();
                        }
                    }}
                />

                <View className="flex-1 justify-center items-center">
                    <View className="w-64 h-64 border-2 border-white/50 rounded-3xl bg-transparent"/>
                    <Text className="text-white mt-4 bg-black/50 px-4 py-1 rounded-full overflow-hidden">Scan a
                        barcode</Text>
                </View>

                <TouchableOpacity
                    onPress={onClose}
                    className="absolute top-12 right-5 bg-black/50 p-3 rounded-full"
                >
                    <Ionicons name="close" size={30} color="white"/>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};