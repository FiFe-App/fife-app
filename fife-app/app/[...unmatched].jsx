import { View } from 'react-native';
import BasePage from '../components/BasePage'
import { MyText, NewButton } from '../components/Components';
import { router } from 'expo-router';

const Error = () => {

    return (<BasePage>
        <View style={{alignItems:'center',justifyContent:'center',flex:1}}>
        <MyText>Jaj!</MyText>
        <MyText>Eltévedtél?</MyText>
        <NewButton title='Vissza a főoldalra!' onPress={()=>{
            router.push('/')
        }} />

        </View>
    </BasePage>)
}

export default Error;