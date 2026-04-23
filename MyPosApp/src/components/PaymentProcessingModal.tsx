import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { PaymentMethod, SplitPaymentDetails, CardType, MFSType, CardPaymentDetails, MFSPaymentDetails } from "../types/order";

interface PaymentProcessingModalProps {
    visible: boolean;
    totalAmount: number;
    onClose: () => void;
    onConfirm: (
        method: PaymentMethod,
        details?: {
            splitDetails?: SplitPaymentDetails;
            cardDetails?: CardPaymentDetails;
            mfsDetails?: MFSPaymentDetails;
        }
    ) => void;
}

export function PaymentProcessingModal({ visible, totalAmount, onClose, onConfirm }: PaymentProcessingModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CASH');
    
    // Non-Split States
    const [singleCashAmount, setSingleCashAmount] = useState('');
    const [singleCardAmount, setSingleCardAmount] = useState('');
    const [singleMfsAmount, setSingleMfsAmount] = useState('');

    // Split Payment States
    const [cashAmount, setCashAmount] = useState('');
    const [cardAmount, setCardAmount] = useState('');
    const [mfsAmount, setMfsAmount] = useState('');

    // Card Details States
    const [selectedCardType, setSelectedCardType] = useState<CardType>('VISA');
    const [cardLast4, setCardLast4] = useState('');
    const [cardTransactionId, setCardTransactionId] = useState('');

    // MFS Details States
    const [selectedMFSType, setSelectedMFSType] = useState<MFSType>('BKASH');
    const [mfsPhoneNumber, setMfsPhoneNumber] = useState('');
    const [mfsTransactionId, setMfsTransactionId] = useState('');

    useEffect(() => {
        if (visible) {
            // Reset states when modal opens
            setSelectedMethod('CASH');
            setSingleCashAmount(totalAmount.toString());
            setSingleCardAmount(totalAmount.toString());
            setSingleMfsAmount(totalAmount.toString());
            setCashAmount('');
            setCardAmount('');
            setMfsAmount('');
            setSelectedCardType('VISA');
            setCardLast4('');
            setCardTransactionId('');
            setSelectedMFSType('BKASH');
            setMfsPhoneNumber('');
            setMfsTransactionId('');
        }
    }, [visible, totalAmount]);

    // Live calculation for Non-Split payments (Return change)
    const getChangeAmount = () => {
        if (selectedMethod === 'CASH') return Math.max(0, (parseFloat(singleCashAmount) || 0) - totalAmount);
        if (selectedMethod === 'CARD') return Math.max(0, (parseFloat(singleCardAmount) || 0) - totalAmount);
        if (selectedMethod === 'MFS') return Math.max(0, (parseFloat(singleMfsAmount) || 0) - totalAmount);
        return 0;
    };

    // Live calculation for SPLIT payment
    const getSplitTotalEntered = () => {
        const cash = parseFloat(cashAmount) || 0;
        const card = parseFloat(cardAmount) || 0;
        const mfs = parseFloat(mfsAmount) || 0;
        return cash + card + mfs;
    };
    const splitTotalEntered = getSplitTotalEntered();
    const splitRemaining = Math.max(0, totalAmount - splitTotalEntered);
    const splitChange = Math.max(0, splitTotalEntered - totalAmount);

    const isConfirmEnabled = () => {
        if (selectedMethod === 'CASH') {
            return (parseFloat(singleCashAmount) || 0) >= totalAmount;
        }
        
        if (selectedMethod === 'CARD') {
            if ((parseFloat(singleCardAmount) || 0) < totalAmount) return false;
            return cardLast4.length === 4;
        }
        
        if (selectedMethod === 'MFS') {
            if ((parseFloat(singleMfsAmount) || 0) < totalAmount) return false;
            return mfsPhoneNumber.length >= 11;
        }
        
        if (selectedMethod === 'SPLIT') {
            if (splitTotalEntered < totalAmount) return false;
            const card = parseFloat(cardAmount) || 0;
            const mfs = parseFloat(mfsAmount) || 0;
            if (card > 0 && cardLast4.length !== 4) return false;
            if (mfs > 0 && mfsPhoneNumber.length < 11) return false;
            return true;
        }
        return false;
    };

    const handleConfirm = () => {
        if (!isConfirmEnabled()) return;

        if (selectedMethod === 'CASH') {
            onConfirm('CASH');
        } else if (selectedMethod === 'CARD') {
            onConfirm('CARD', {
                cardDetails: {
                    cardType: selectedCardType,
                    lastFourDigits: cardLast4 || undefined,
                    transactionId: cardTransactionId || undefined,
                }
            });
        } else if (selectedMethod === 'MFS') {
            onConfirm('MFS', {
                mfsDetails: {
                    mfsType: selectedMFSType,
                    phoneNumber: mfsPhoneNumber || undefined,
                    transactionId: mfsTransactionId || undefined,
                }
            });
        } else if (selectedMethod === 'SPLIT') {
            const cash = parseFloat(cashAmount) || 0;
            const card = parseFloat(cardAmount) || 0;
            const mfs = parseFloat(mfsAmount) || 0;

            onConfirm('SPLIT', {
                splitDetails: {
                    cashAmount: cash,
                    cardAmount: card,
                    cardDetails: card > 0 ? {
                        cardType: selectedCardType,
                        lastFourDigits: cardLast4 || undefined,
                        transactionId: cardTransactionId || undefined,
                    } : undefined,
                    mfsAmount: mfs,
                    mfsDetails: mfs > 0 ? {
                        mfsType: selectedMFSType,
                        phoneNumber: mfsPhoneNumber || undefined,
                        transactionId: mfsTransactionId || undefined,
                    } : undefined
                }
            });
        }
    };

    // Helper to auto-fill the remaining amount into a split field
    const autoFillRemaining = (setter: (val: string) => void, fieldKey: 'cash' | 'card' | 'mfs') => {
        let cash = parseFloat(cashAmount) || 0;
        let card = parseFloat(cardAmount) || 0;
        let mfs = parseFloat(mfsAmount) || 0;
        
        if(fieldKey === 'cash') cash = 0;
        if(fieldKey === 'card') card = 0;
        if(fieldKey === 'mfs') mfs = 0;

        const currentTotal = cash + card + mfs;
        const remaining = totalAmount - currentTotal;
        
        if (remaining > 0) {
            setter(remaining.toString());
        }
    };

    const renderPaymentOption = (method: PaymentMethod, iconName: keyof typeof Ionicons.glyphMap, title: string, colorClass: string) => (
        <TouchableOpacity
            onPress={() => setSelectedMethod(method)}
            className={`flex-1 items-center justify-center p-4 rounded-2xl border-2 mb-3 ${selectedMethod === method ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
        >
            <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${colorClass}`}>
                <Ionicons name={iconName} size={24} color="white" />
            </View>
            <Text className={`font-bold ${selectedMethod === method ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    const renderCardTypePills = () => (
        <View className="flex-row flex-wrap gap-2 mb-4">
            {(['VISA', 'MASTERCARD', 'AMEX', 'OTHER'] as CardType[]).map((type) => (
                <TouchableOpacity
                    key={type}
                    onPress={() => setSelectedCardType(type)}
                    className={`px-4 py-2 rounded-full border ${selectedCardType === type ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}
                >
                    <Text className={`text-xs font-bold ${selectedCardType === type ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {type}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderMFSTypePills = () => (
        <View className="flex-row flex-wrap gap-2 mb-4">
            {(['BKASH', 'NAGAD', 'ROCKET', 'UPAY', 'OTHER'] as MFSType[]).map((type) => (
                <TouchableOpacity
                    key={type}
                    onPress={() => setSelectedMFSType(type)}
                    className={`px-4 py-2 rounded-full border ${selectedMFSType === type ? 'bg-rose-600 border-rose-600' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}
                >
                    <Text className={`text-xs font-bold ${selectedMFSType === type ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {type}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderCardInputs = (isSplit = false) => (
        <View className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl mb-4 border border-indigo-100 dark:border-indigo-900/20">
            <Text className="font-bold text-indigo-800 dark:text-indigo-400 mb-3 text-sm">Card Details <Text className="text-red-500">*</Text></Text>
            {renderCardTypePills()}
            
            <View className="flex-row gap-3">
                <View className="flex-1">
                    <Text className="text-slate-600 dark:text-slate-400 text-xs mb-1 font-medium">Last 4 Digits <Text className="text-red-500">*</Text></Text>
                    <TextInput
                        className={`bg-white dark:bg-slate-900 border ${cardLast4.length !== 4 && cardLast4.length > 0 ? 'border-red-400' : 'border-gray-200 dark:border-slate-700'} rounded-xl p-3 text-slate-800 dark:text-white font-bold`}
                        placeholder="e.g. 4242"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        maxLength={4}
                        value={cardLast4}
                        onChangeText={setCardLast4}
                    />
                </View>
                <View className="flex-[2]">
                    <Text className="text-slate-600 dark:text-slate-400 text-xs mb-1 font-medium">Transaction ID / Auth Code</Text>
                    <TextInput
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white font-bold"
                        placeholder="TRX..."
                        placeholderTextColor="#94a3b8"
                        value={cardTransactionId}
                        onChangeText={setCardTransactionId}
                        autoCapitalize="characters"
                    />
                </View>
            </View>
        </View>
    );

    const renderMFSInputs = (isSplit = false) => (
        <View className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-2xl mb-4 border border-rose-100 dark:border-rose-900/20">
            <Text className="font-bold text-rose-800 dark:text-rose-400 mb-3 text-sm">Mobile Banking Details <Text className="text-red-500">*</Text></Text>
            {renderMFSTypePills()}
            
            <View className="flex-row gap-3">
                <View className="flex-1">
                    <Text className="text-slate-600 dark:text-slate-400 text-xs mb-1 font-medium">Customer Phone Number <Text className="text-red-500">*</Text></Text>
                    <TextInput
                        className={`bg-white dark:bg-slate-900 border ${mfsPhoneNumber.length > 0 && mfsPhoneNumber.length < 11 ? 'border-red-400' : 'border-gray-200 dark:border-slate-700'} rounded-xl p-3 text-slate-800 dark:text-white font-bold`}
                        placeholder="01XXXXXXXXX"
                        placeholderTextColor="#94a3b8"
                        keyboardType="phone-pad"
                        maxLength={11}
                        value={mfsPhoneNumber}
                        onChangeText={setMfsPhoneNumber}
                    />
                </View>
            </View>
            <View className="mt-3">
                <Text className="text-slate-600 dark:text-slate-400 text-xs mb-1 font-medium">Transaction ID (TrxID)</Text>
                <TextInput
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white font-bold"
                    placeholder="e.g. 9JA2..."
                    placeholderTextColor="#94a3b8"
                    value={mfsTransactionId}
                    onChangeText={setMfsTransactionId}
                    autoCapitalize="characters"
                />
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/60">
                <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 h-[90%]">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-2xl font-bold text-slate-800 dark:text-white">Payment</Text>
                            <Text className="text-slate-500">Select payment method</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-gray-100 dark:bg-slate-800 p-2 rounded-full">
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Total Amount Badge */}
                    <View className="bg-blue-600 p-5 rounded-2xl mb-4 shadow-md shadow-blue-500/30">
                        <View className="flex-row justify-between items-center">
                             <View>
                                 <Text className="text-blue-100 font-medium mb-1">Total Due</Text>
                                 <Text className="text-white text-3xl font-extrabold">৳{totalAmount.toLocaleString()}</Text>
                             </View>
                             
                             <View className="items-end">
                                 {selectedMethod === 'SPLIT' ? (
                                     <>
                                         <Text className="text-blue-100 font-medium mb-1">
                                             {splitRemaining === 0 ? 'Change' : 'Remaining'}
                                         </Text>
                                         <Text className={`text-2xl font-extrabold ${splitRemaining === 0 ? (splitChange > 0 ? 'text-yellow-300' : 'text-green-300') : 'text-red-200'}`}>
                                             ৳{splitRemaining === 0 ? splitChange.toLocaleString() : splitRemaining.toLocaleString()}
                                         </Text>
                                     </>
                                 ) : (
                                     <>
                                         <Text className="text-blue-100 font-medium mb-1">Change Return</Text>
                                         <Text className="text-yellow-300 text-2xl font-extrabold">৳{getChangeAmount().toLocaleString()}</Text>
                                     </>
                                 )}
                             </View>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                        {/* Payment Method Grids */}
                        <View className="flex-row flex-wrap gap-x-3 mb-2">
                            {renderPaymentOption('CASH', 'cash-outline', 'Cash', 'bg-emerald-500')}
                            {renderPaymentOption('CARD', 'card-outline', 'Card', 'bg-indigo-500')}
                        </View>
                        <View className="flex-row flex-wrap gap-x-3 mb-6">
                            {renderPaymentOption('MFS', 'phone-portrait-outline', 'Mobile (MFS)', 'bg-rose-500')}
                            {renderPaymentOption('SPLIT', 'pie-chart-outline', 'Split Pay', 'bg-purple-500')}
                        </View>

                        {/* SINGLE CASH UI */}
                        {selectedMethod === 'CASH' && (
                             <View className="mb-4">
                                <Text className="text-slate-600 dark:text-slate-300 font-medium flex-row items-center mb-2">
                                    <Ionicons name="cash-outline" size={16} color="#10b981" /> Received Cash Amount <Text className="text-red-500">*</Text>
                                </Text>
                                <TextInput
                                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white font-bold text-xl"
                                    placeholder="৳0.00"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    value={singleCashAmount}
                                    onChangeText={setSingleCashAmount}
                                />
                                {(parseFloat(singleCashAmount) || 0) < totalAmount && (
                                    <Text className="text-red-500 text-xs mt-1 font-medium">Received amount is less than total due.</Text>
                                )}
                            </View>
                        )}

                        {/* SINGLE CARD UI */}
                        {selectedMethod === 'CARD' && (
                            <>
                                <View className="mb-4">
                                    <Text className="text-slate-600 dark:text-slate-300 font-medium flex-row items-center mb-2">
                                        <Ionicons name="card-outline" size={16} color="#6366f1" /> Charged Card Amount <Text className="text-red-500">*</Text>
                                    </Text>
                                    <TextInput
                                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white font-bold text-xl"
                                        placeholder="৳0.00"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                        value={singleCardAmount}
                                        onChangeText={setSingleCardAmount}
                                    />
                                    {(parseFloat(singleCardAmount) || 0) < totalAmount && (
                                        <Text className="text-red-500 text-xs mt-1 font-medium">Charged amount is less than total due.</Text>
                                    )}
                                </View>
                                {renderCardInputs(false)}
                            </>
                        )}

                        {/* SINGLE MFS UI */}
                        {selectedMethod === 'MFS' && (
                            <>
                                <View className="mb-4">
                                    <Text className="text-slate-600 dark:text-slate-300 font-medium flex-row items-center mb-2">
                                        <Ionicons name="phone-portrait-outline" size={16} color="#f43f5e" /> Received MFS Amount <Text className="text-red-500">*</Text>
                                    </Text>
                                    <TextInput
                                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white font-bold text-xl"
                                        placeholder="৳0.00"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                        value={singleMfsAmount}
                                        onChangeText={setSingleMfsAmount}
                                    />
                                    {(parseFloat(singleMfsAmount) || 0) < totalAmount && (
                                        <Text className="text-red-500 text-xs mt-1 font-medium">Received amount is less than total due.</Text>
                                    )}
                                </View>
                                {renderMFSInputs(false)}
                            </>
                        )}

                        {/* SPLIT PAYMENT UI */}
                        {selectedMethod === 'SPLIT' && (
                            <View className="bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl mb-4 border border-gray-200 dark:border-slate-700">
                                <View className="flex-row justify-between items-center mb-4">
                                     <Text className="font-bold text-slate-800 dark:text-white text-lg">Enter Split Amounts</Text>
                                     <Text className="text-slate-500 text-xs font-medium">Entered: ৳{splitTotalEntered}</Text>
                                </View>
                                
                                {/* Cash Split */}
                                <View className="mb-4">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-slate-600 dark:text-slate-300 font-medium flex-row items-center">
                                            <Ionicons name="cash-outline" size={16} color="#10b981" /> Cash Amount
                                        </Text>
                                        {splitRemaining > 0 && (
                                            <TouchableOpacity onPress={() => autoFillRemaining(setCashAmount, 'cash')}>
                                                <Text className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded">Auto-fill (৳{splitRemaining})</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <TextInput
                                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white font-bold text-lg"
                                        placeholder="৳0.00"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                        value={cashAmount}
                                        onChangeText={setCashAmount}
                                    />
                                </View>

                                {/* Card Split */}
                                <View className="mb-4">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-slate-600 dark:text-slate-300 font-medium flex-row items-center">
                                            <Ionicons name="card-outline" size={16} color="#6366f1" /> Card Amount
                                        </Text>
                                        {splitRemaining > 0 && (
                                            <TouchableOpacity onPress={() => autoFillRemaining(setCardAmount, 'card')}>
                                                <Text className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded">Auto-fill (৳{splitRemaining})</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <TextInput
                                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white font-bold text-lg mb-2"
                                        placeholder="৳0.00"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                        value={cardAmount}
                                        onChangeText={setCardAmount}
                                    />
                                    {parseFloat(cardAmount) > 0 && renderCardInputs(true)}
                                </View>

                                {/* MFS Split */}
                                <View className="mb-2">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-slate-600 dark:text-slate-300 font-medium flex-row items-center">
                                            <Ionicons name="phone-portrait-outline" size={16} color="#f43f5e" /> MFS Amount
                                        </Text>
                                        {splitRemaining > 0 && (
                                            <TouchableOpacity onPress={() => autoFillRemaining(setMfsAmount, 'mfs')}>
                                                <Text className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded">Auto-fill (৳{splitRemaining})</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <TextInput
                                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white font-bold text-lg mb-2"
                                        placeholder="৳0.00"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                        value={mfsAmount}
                                        onChangeText={setMfsAmount}
                                    />
                                    {parseFloat(mfsAmount) > 0 && renderMFSInputs(true)}
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Confirm Button */}
                    <View className="pt-4 border-t border-gray-100 dark:border-slate-800">
                        <TouchableOpacity
                            onPress={handleConfirm}
                            disabled={!isConfirmEnabled()}
                            className={`${isConfirmEnabled() ? 'bg-slate-900 dark:bg-blue-600' : 'bg-gray-300 dark:bg-slate-700'} p-5 rounded-2xl items-center shadow-lg flex-row justify-center gap-2`}
                        >
                            <Ionicons name="checkmark-circle-outline" size={24} color={isConfirmEnabled() ? 'white' : '#9ca3af'} />
                            <Text className={`${isConfirmEnabled() ? 'text-white' : 'text-gray-400'} font-bold text-lg`}>
                                Confirm Payment
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}