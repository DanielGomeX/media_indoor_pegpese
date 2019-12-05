import React, { useState, useEffect } from 'react';
import { View, AsyncStorage, Image, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import * as Permissions from 'expo-permissions';
import { Chevron } from 'react-native-shapes';

import api from '../services/api';

import logo from '../assets/logo_pegpese-v.png';

export default function Login({ navigation }){

    const [shop, setShop] = useState('');
    const [departament, setDepartament] = useState('');
    const [recivedShop, setRecivedShop] = useState([]);
    const [recivedDepto, setRecivedDepto] = useState([]);

    useEffect(() => {
        async function permissionsAsyncCheck() {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
              throw new Error('CAMERA_ROLL permission not granted');
            }
        }

        async function loadShops(){
            const response = await api.get('/shop');
            
            await setRecivedShop(response.data);
        }
        
        permissionsAsyncCheck(); 
        loadShops(); 
    }, [])

    useEffect(() => {
        AsyncStorage.getItem('selectedShop').then(shop => {
            AsyncStorage.getItem('selectedDepartament').then(depto => {
                if(shop && depto){
                    navigation.navigate('ImageScreen');
                }       
            })
        })
    }, [])

    async function handleShopCB(value){        
        setShop(value);
        const response = await api.get(`/departaments/${value}`);
            
        await setRecivedDepto(response.data);
    }
    
    async function handleSubmit(){
        await AsyncStorage.setItem('selectedShop', shop.toString());
        await AsyncStorage.setItem('selectedDepartament', departament.toString());

        navigation.navigate('ImageScreen');
    }

    return (
        <SafeAreaView behavior="padding" style={style.container}>
            <Image source={logo} style={style.logo}/>

            <View style={style.form}>
                <Text style={style.label}>Loja:</Text>
                <RNPickerSelect                    
                    placeholder={{label:'Selecione a loja'}}
                    onValueChange={(value) => handleShopCB(value)}
                    useNativeAndroidPickerStyle={false}
                    items={recivedShop}
                    style={{...style}}
                    Icon={() => <Chevron size={1.5} color="#000" />}
                />
                <Text style={style.label}>Departamento:</Text>
                <RNPickerSelect
                    placeholder={{label:'Selecione o departamento'}}
                    onValueChange={(value) => setDepartament(value)}
                    useNativeAndroidPickerStyle={false}
                    items={recivedDepto}
                    style={{...style}}
                    Icon={() => <Chevron size={1.5} color="#000" />}
                />

                <TouchableOpacity onPress={handleSubmit} style={style.button}>
                    <Text style={style.buttonText}>Entrar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#c5e1a4'
    },

    logo:{        
       height: 150,
       resizeMode: 'contain',
       alignSelf: 'center',
       marginTop: 10
    },

    form: {
        flexDirection: 'column',
        alignSelf: 'stretch',
        paddingHorizontal: 150,
        marginTop: 10
    },

    label:{
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 8,
    },

    inputAndroid: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        fontSize: 16,
        color: '#444',
        height: 44,
        marginBottom: 20,
        borderRadius: 50,
    },

    iconContainer: {
        top: 20,
        right: 20,
        color: '#000'
    },

    button:{
        height:42,
        backgroundColor: '#f1532c',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
    },

    buttonText:{
        color: "#FFF",
        fontWeight: 'bold',
        fontSize: 16,
    },
})