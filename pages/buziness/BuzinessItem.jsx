import { Pressable, View, useWindowDimensions } from 'react-native'
import { Auto, MyText, ProfileImage, ProfileName, Row } from '../../components/Components'
import Icon from '@expo/vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { styles } from '../../styles/styles';
import { Image, ImageBackground } from 'expo-image';
import { router } from 'expo-router';

const BuzinessItem = ({data}) => {
    const { uid, name, description, category, _id } = data
    const distance =  Math.round(data?.[0]?.distance*10)/10;
    const categories = name.split(' ');
    console.log(categories);

    const small = useWindowDimensions().width <= 900;
    const myuid = useSelector((state) => state.user.uid)
    const myname = useSelector((state) => state.user.name)

    return (
        <View style={[{backgroundColor:'white',borderRadius:8,width:300},styles.p2]}>
            <Pressable style={{flex:1,overflowX:'hidden'}} onPress={()=>router.navigate({pathname:'biznisz',params:{id:_id}})}>
                <MyText size={20} style={{whiteSpace:'pre'}} >{categories[0]}</MyText>
                <View style={{flexWrap:'wrap',flexDirection:'row'}}>
                    {categories.slice(1).map(
                        (e,i)=><View key={'category'+i} style={{backgroundColor:'#FFC372',borderRadius:8,padding:2,margin:2}}>
                            <MyText size={12}>{e}</MyText>
                        </View>
                    )}
                </View>
                <MyText style={{flex:1}}>{description}</MyText>
                <Row>
                    <View style={{marginRight:8}}>
                        <View style={{}}>
                            <Row style={[styles.alignC]}><ProfileImage uid={uid} size={16}  style={[styles.p1,styles.r8]}/><ProfileName uid={uid} /></Row>
                            {!!distance && <Row style={[styles.alignC]}><Icon size={16} name="earth-sharp" style={styles.p1}/><MyText>{distance+'km távolságra'}</MyText></Row>}
                        </View>
                        <View style={{}}>
                            <Row style={[small?styles.justifyS:styles.justifyS,styles.alignC]}><Icon size={16} name="people" style={styles.p1}/><MyText>5 ember ajánlja</MyText></Row>
                        </View>
                    </View>
                    <View style={{flex:1}}>
                        <ProfileImage uid={uid} style={{margin:8,flex:1}}/>
                    </View>
                </Row>
            </Pressable>
        </View>
    )
}

export default BuzinessItem