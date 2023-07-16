import { Animated, View, useWindowDimensions } from "react-native";
import { MyText } from "../../components/Components";

const Section = (props) => {
    const { width } = useWindowDimensions();
    const small = width <= 900;
    if (props?.children)
    return(
      <View style={[localStyles.container,{flex:props?.flex,padding:small?5:20,marginLeft:small?5:25},props.style,]}>
        <View style={[{height:50}]}>
          <MyText style={localStyles.sectionText}>{props.title}</MyText>
        </View>
          <Animated.View style={[{ paddingHorizontal:0, flex: props?.flex, height: props.height }]} >
          {props.children}
          </Animated.View>
      </View>
    );
  }

  const localStyles = {
    container: {
      marginTop: 25,
      marginLeft: 25,
      backgroundColor:'white',
      paddingHorizontal:20,
      justifyContent:'center',
      zIndex:'auto' ,
      shadowColor: '#171717',
      shadowOffset: {width: 2, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 10,
      borderRadius:8
    },
    section:{
      height: 50,
      justifyContent: 'center',
      paddingHorizontal:20,
      backgroundColor: 'rgb(245, 209, 66)',
      borderColor: 'black',
      marginTop: 5,
      marginLeft: 5,
      
    },
    sectionText:{
      fontWeight: 'bold',
      fontSize:26,

    },
  }

export default Section;