import { Image, useWindowDimensions } from "react-native"
import { Checkbox } from "react-native-paper";
import { MyText, NewButton, Row, TextInput } from "../Components";
import BasePage from "../BasePage";
import { useFocusEffect } from "@react-navigation/native";
import { get, ref } from "firebase/database";
import { useContext } from "react";
import { FirebaseContext } from "../../firebase/firebase";

const banana = ({page,id}) => {


    return (<BasePage>
        <Row>
            <Image style={{flex:1,height:200,width:200}} source={{uri:'https://domf5oio6qrcr.cloudfront.net/medialibrary/6372/202ebeef-6657-44ec-8fff-28352e1f5999.jpg'}} />
        </Row>
        <Row>
            <MyText>Banán</MyText>
        </Row>
    </BasePage>)
}



export default banana;