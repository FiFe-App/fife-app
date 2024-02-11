import ExpoFastImage from 'expo-fast-image';
import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import { useHover } from 'react-native-web-hooks';
import { useSelector } from 'react-redux';
import { MyText } from '../Components';
import { router } from 'expo-router';

const AuthoredImage = (props) => {
    const ref = useRef(null);
    const navigation = router;
    const { authorUid, authorName } = props;
    const uid = useSelector((state) => state.user.uid)
    const isHovered = useHover(ref);

    const handlePress = () => {
        if (authorUid && uid)
            navigation.push({pathname:'profil',params:{uid:authorUid}})
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