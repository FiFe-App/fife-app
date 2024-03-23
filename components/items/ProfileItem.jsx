import Icon from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { MyText, NewButton, ProfileImage, ProfileName, Row } from '../Components';

function ProfileItem({uid,editable,height}) {
    const navigation = router;

    const onPress = (e) => {
        
        navigation.push({pathname:'/profil',params:{uid}})
    }
    return (
        <View style={[localStyles.list, { backgroundColor: '#ffffff',height,width:height}]}>
            <TouchableRipple 
            onPress={onPress} 
            style={{flex:1,aspectRatio:1/1}}
            >    
                <>
                    <ProfileImage uid={uid} style={{margin:5,flex:1,borderRadius:8}}/>
                    <ProfileName uid={uid} style={{marginHorizontal:10}} />
                </>            
            </TouchableRipple>
            {editable && <Row style={{justifyContent:'space-evenly',width:'100%',padding:8}}>
                <NewButton color='#fdcf9955' title={<Icon name="construct" size={30} />} onPress={()=>router.push({pathname:'uj-cserebere',params:{toEdit:id}})}/>
                <NewButton color='#fd9999' title={<Icon name="trash" size={30} />} onPress={()=>router.push({pathname:'uj-cserebere',params:{toEdit:id}})}/>
            </Row>}
        </View>
    );
    
  }

  const localStyles = StyleSheet.create({
        square: {
            width:100,
            marginLeft:5,
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
            height:20,
            padding:20,
            borderRadius: 8
        },
        list: {
            alignItems: "center",
            borderBottomWidth: 0,
            borderTopWidth: 0,
            marginTop: -1,
            margin: 6,
            borderRadius: 8
        }
  })

export default ProfileItem