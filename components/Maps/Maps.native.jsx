
import React, { useEffect, useContext } from 'react';
import { Dimensions } from 'react-native';

export const Maps = () => {
    const [mapOptions,setMapOptions] = React.useState({
        center: {
        lat: 10,
        lng: 0
        },
        zoom: 4
    })

    navigation = useNavigation()
    const loader = new Loader({
        apiKey: "AIzaSyDqjygaNZxE3FU0aJbQ9v6EOzOdV2waxSo",
        version: "weekly",
        libraries: ["places"]
    });

    loader
        .load()
        .then((google) => {
        //new google.maps.Map(document.getElementById("map"), mapOptions);
        })
        .catch(e => {
        // do something
        });

    return (
        <View>
            {(Platform.OS !== 'web') && <MapView style={localStyles.map} />}
            {(Platform.OS === 'web') && <div id='map' style={localStyles.map} />}
        </View>
    )
}

const localStyles = {
    text:{
      fontWeight: 'bold',
      color: "black",
      fontSize:18,
      paddingHorizontal: 16,
    },
    newButton:{
      borderRadius: 20,
      flex:1,
      margin:10,
      marginHorizontal: 20,
      paddingVertical:10,
      alignItems: 'center',
      justifyContent: "center",
      maxWidth: 500
    },
    verticleLine: {
      height: '100%',
      width: 1,
      backgroundColor: '#909090',
    },
    searchInput: {
        margin: 5,
        borderColor: "black",
        borderWidth: 2,
        borderRadius: 10,
        backgroundColor: "white",
        padding: 10,
        fontWeight: "bold",
        maxWidth: 500,
    },
    sectionText:{
      fontWeight: 'bold',
      fontSize:18,

    },
    map: {
      height: 200,
    },
  }