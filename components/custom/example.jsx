import { Image } from "react-native";
import BasePage from "../BasePage";
import { MyText, Row } from "../Components";

const banana = ({page,id}) => {


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