import ExpoFastImage from "expo-fast-image";
import { MyText } from "../Components";
import { Pressable, View } from "react-native";
import { useRef } from "react";
import { useHover } from "react-native-web-hooks";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

const AuthoredImage = (props) => {
    const ref = useRef(null);
    const navigation = useNavigation()
    const { authorUid, authorName } = props;
    const uid = useSelector((state) => state.user.uid)
    const isHovered = useHover(ref);

    const handlePress = () => {
        if (authorUid && uid)
            navigation.push('profil',{uid:authorUid})
    }
    return (                
        <View ref={ref} >
            <ExpoFastImage {...props} />
            {isHovered && <Pressable onPress={handlePress}
            style={{position:'absolute',bottom:0,width:'100%',backgroundColor:'#000000aa'}}>
                <MyText style={{color:'white'}}>készítette: {authorName}</MyText>
            </Pressable>}
        </View>
    )
}

export default AuthoredImage;