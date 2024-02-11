/* eslint-disable no-undef */

import React from 'react';
import { View } from 'react-native';
import { MyText } from '../../components/Components';

import MapView from 'react-native-maps';




const MapElement = ({markers,center,index,editable,data,setData,style}) => {

    //#endregion

    return (<View>
      <MyText>asd</MyText>
      <MapView style={{height:100,flex:1}} provider="google"
      googleMapsApiKey="AIzaSyDqjygaNZxE3FU0aJbQ9v6EOzOdV2waxSo"
    loadingFallback={
      <View>
        <MyText>Loading...</MyText>
      </View>
    } />
    </View>)

}


const localStyles = {
    map: {
      flex:1,
      borderRadius:16,
      zIndex:-10
    }
  }


export default MapElement