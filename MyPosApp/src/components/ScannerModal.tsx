import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Button, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface ScannerModalProps {
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
}

export const ScannerModal = ({ visible, onClose, onScan }: ScannerModalProps) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (visible) {
            if (!permission?.granted) {
                requestPermission();
            }
            // Reset scanned state when modal becomes visible
            setScanned(false);
        }
    }, [visible, permission]);

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true); // Prevent immediate re-scans
            Vibration.vibrate(100); // Haptic feedback for success
            onScan(data);
            
            // Re-enable scanning after a short delay
            setTimeout(() => {
                setScanned(false);
            }, 1500); // 1.5-second delay
        }
    };

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <Modal visible={visible} animationType="slide">
                <View className="flex-1 justify-center items-center p-5 bg-white dark:bg-slate-900">
                    <Text className="text-center mb-4 text-lg text-slate-800 dark:text-white">We need your permission to show the camera</Text>
                    <View className="w-full max-w-xs">
                        <Button onPress={requestPermission} title="Grant Permission" />
                        <View className="h-3" />
                        <Button onPress={onClose} title="Cancel" color="red" />
                    </View>
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
                    onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128"],
                    }}
                />

                {/* Overlay */}
                <View className="absolute top-0 left-0 right-0 bottom-0">
                    {/* Header with Close Button */}
                    <View className="flex-row justify-end p-4 bg-black/30">
                        <TouchableOpacity
                            onPress={onClose}
                            className="mt-10 bg-black/50 p-3 rounded-full"
                        >
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Scanning Area Indicator */}
                    <View className="flex-1 justify-center items-center">
                        <View className="w-64 h-40 border-4 border-white/60 rounded-3xl bg-transparent" />
                        <Text className="text-white mt-4 bg-black/50 px-4 py-2 rounded-full overflow-hidden text-lg">
                            Scan product barcode
                        </Text>
                    </View>

                    {/* Footer */}
                    <View className="h-24 bg-black/30" />
                </View>
            </View>
        </Modal>
    );
};