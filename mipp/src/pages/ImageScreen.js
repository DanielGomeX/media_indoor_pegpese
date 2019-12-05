import React, { useState, useEffect } from 'react';
import { AsyncStorage, Image, ImageBackground , Text, StyleSheet, SafeAreaView, FlatList, StatusBar } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { Col, Row, Grid } from "react-native-easy-grid";

import api from '../services/api';

export default function ImageScreen(){

    const [background, setBackground] = useState('');
    const [adMedia, setAdMedia] = useState('');
    const [screen, setScreen] = useState({});
    const [products, setProducts] = useState([]);
    const [changeScreen, setChangeScreen] = useState(0);

    useEffect(() => {        
        async function loadBackground(){            
            const shop = await AsyncStorage.getItem('selectedShop');
            const departament = await AsyncStorage.getItem('selectedDepartament');

            const name = `background_${shop}_${departament}`;
            const path = `${FileSystem.documentDirectory}${name}`;     

            const storageData = await FileSystem.getInfoAsync(path);
            
            if(storageData.exists){
                await setBackground(storageData.uri);
            } else{
                const response = await api.get(`/background/${shop}/${departament}`);
                const saveImage = await FileSystem.downloadAsync(response.data, path);
                await setBackground(saveImage.uri);
            }
        }

        loadBackground();
    }, []);
            
    async function loadMedia(media_id, shop_id, depto_id){ 
        await setAdMedia('');  
        const response = await api.get(`/mediaInfo/${media_id}`);
        var name = `${shop_id}_${depto_id}_${media_id}_${response.data.media_version}`;
        response.data.type == 2 ? name = name + ".mp4" : name = name + ".jpeg";
        
        const path = `${FileSystem.documentDirectory}${name}`;
        
        const storageData = await FileSystem.getInfoAsync(path);
        if(storageData.exists){
            await setAdMedia(storageData.uri);
        } else{
            const responseImage = await api.get(`/media/${shop_id}/${depto_id}/${media_id}`);
            const saveImage = await FileSystem.downloadAsync(responseImage.data, path);
            await setAdMedia(saveImage.uri);
        }
    }

    async function loadScreen(){
        const shop = await AsyncStorage.getItem('selectedShop');
        const departament = await AsyncStorage.getItem('selectedDepartament');
        await api.get(`/screens/${shop}/${departament}`).then(async (response) => {        
            let arr = await Object.keys(response.data[changeScreen].products).map((k) => response.data[changeScreen].products[k]);
            await setProducts(arr); 
            await setScreen(response.data[changeScreen]);
            await loadMedia(response.data[changeScreen].media_id, shop, departament);
            await sleep(response.data[changeScreen].timer * 1000);
            if(changeScreen == response.data.length - 1){
                await setChangeScreen(0);
            } else {
                await setChangeScreen(changeScreen + 1);
            }
        }).catch(error => {
            if (!error.status) {
                loadScreen();
                setChangeScreen(0);
            }
        });
    }
    
    useEffect(() => { 
        loadScreen();
    }, [changeScreen]);

    return (
        <SafeAreaView behavior="padding" style={style.container}>                
            <StatusBar hidden />
            {screen && screen['type'] == 0 && adMedia != '' && (
                <>      
                    <ImageBackground style={style.backgroundImage}  source={{uri: background}}> 
                        <Grid style={style.list}>                    
                            <FlatList 
                                data={products}
                                keyExtractor={products => products.id}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => 
                                    (
                                        <Row style={style.listRow}>
                                            <Col size={2}><Text style={style.listID}>{item.id}</Text></Col>
                                            <Col size={4}><Text style={style.listDesc}>{item.description}</Text></Col>
                                            <Col size={1}><Text style={style.listPrice} style={item.price_promo !== "R$ 0.00" ? {
                                                    color: '#' + screen["promotional_product_color"],                                                
                                                    marginLeft: 10,
                                                    fontSize: 18
                                                } 
                                                    : 
                                                {
                                                    color: '#' +screen["normal_product_color"],                                                                                        
                                                    marginLeft: 10,
                                                    fontSize: 18,
                                                }}>{item.price_promo !== "R$ 0.00" ? item.price_promo : item.price}</Text></Col>
                                        </Row>
                                    )
                                }
                            />
                        </Grid>            
                    </ImageBackground>
                    <Image style={style.coverBackground}  source={{uri: adMedia}} />                              
                </>
            )}
            
            {screen && screen['type'] == 2 && adMedia != '' && ( 
                <Video
                    source={{ uri: adMedia }}
                    rate={1.0}
                    isMuted={true}
                    style={style.backgroundVideo}
                    resizeMode="cover"
                    shouldPlay
                    isLooping
                />
            )}

            {screen && screen['type'] == 3 && adMedia != '' && (
                <ImageBackground style={style.adImage} source={{uri: adMedia }}/>
            )}
        </SafeAreaView>
    )
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}  

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#c5e1a4',
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
    },      
    coverBackground: {
        position: 'absolute',
        bottom: 0,
        zIndex: 1,  
        width: '39%',
        height: '93%',
        alignSelf: 'flex-start',
        flexDirection: 'column-reverse'
    },      
    backgroundImage: {    
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        justifyContent: 'flex-end',
    },          
    adImage: {      
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },  
    list: {
        zIndex: 1,
        width: '61%',
        maxHeight: '86.4%',
        alignSelf: 'flex-end', 
    },    
    listRow: {
        borderWidth: 1,
        borderColor: 'rgba(52, 52, 52, 0.0)',
        marginVertical: 5,
    },
    listID: {
        marginLeft: 30,
        fontSize: 18,
    },
    listDesc: {
        marginLeft: 15,
        fontSize: 18,
    },
})