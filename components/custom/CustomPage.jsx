import { View, useWindowDimensions } from "react-native"
import { Checkbox } from "react-native-paper";
import { Loading, MyText, NewButton, Row, TextInput } from "../Components";
import BasePage from "../BasePage";
import React, { useContext, useEffect, useState } from "react";
import { FirebaseContext } from "../../firebase/firebase";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useFocusEffect } from "expo-router";

const CustomPage = ({page,id}) => {
    const { width } = useWindowDimensions();
    const {database} = useContext(FirebaseContext)

    const [Bricks, setBricks] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            
            // Create a reference with an initial file path and name
            const storage = getStorage();
            const pathReference = ref(storage, 'pages/example.jsx');
            getDownloadURL(pathReference).then(url=>{
                console.log('url',url);
                //setBricks(React.lazy(()=>import(url)))

            }).catch(err=>{
                console.log('err',err);
            })
            /*get(ref(database,'pages/'+id)).then(res=>{
                const pageToLoad = res.val();
                buildPage(pageToLoad)

            })*/
          return () => {
          };
        }, [])
      );

      useEffect(() => {
        console.log('Bricks',Bricks);
      }, [Bricks]);

    const buildPage = () => {

    }

    return (<BasePage>
        {Bricks ? <Bricks/> : <Loading/>}
    </BasePage>)
}



export default CustomPage;