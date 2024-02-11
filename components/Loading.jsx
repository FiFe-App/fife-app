import { View } from "react-native"
import { ActivityIndicator } from "react-native-paper"

const Loading = ({color='#ffde7e',style}) => {
    return (
      <View style={[{flex:1,alignItems:'center',justifyContent:'center'},style]}>
        <ActivityIndicator color={color} size={'large'} />
      </View>
    )
  }

export default Loading;