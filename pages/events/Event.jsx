/* eslint-disable quotes */
import { Image, View } from "react-native"
import BasePage from "../../components/BasePage"
import { MyText, NewButton, Row } from "../../components/Components"
import Icon from '@expo/vector-icons/Ionicons';


const Event = () => {

  const data = {
    title: 'Esemény neve',
    image: require('../../assets/img-main.jpg'),
    category: 'Techno',
    cost: 5000,
    date: 'Január 11. 14:00-15:00',
    place: 'Turbina, Budapest',
    text : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."


  }
  return (
    <BasePage>
      <Row>
        <Image source={data.image} style={{width:50,height:50,margin:4}} />
        <View>
          <MyText>{data.title}</MyText>
          <Row style={{alignItems:'center'}}>
            <MyText style={{backgroundColor:'red',padding:4,margin:4,borderRadius:8,color:'white',fontSize:15}}>{data.category}</MyText>
            <MyText>{data.cost} Ft</MyText>
          </Row>
        </View>
      </Row>
      <Row>
        <Icon name="calendar" size={14} style={{margin:4}}/>
        <MyText>Január 11. 14:00-15:00</MyText>
        <MyText style={{flexGrow:1,textAlign:'right'}}>2 nap múlva</MyText>
      </Row>
      <Row>
        <Icon name="earth" size={14} style={{margin:4}} />
        <MyText>{data.place}</MyText>
        <MyText style={{flexGrow:1,textAlign:'right'}}>10 km-re tőled</MyText>
      </Row>
      <Row>
        <NewButton icon title={<Icon size={20} name="share-social-outline"/>} />
        <NewButton style={{flexGrow:1}} title="Érdekel" />
        <NewButton style={{flexGrow:1}} title="Jegyek" />
      </Row>
      <MyText contained>{data.text}</MyText>

    </BasePage>
  )
}

export default Event;