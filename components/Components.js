import React, { useRef, useEffect } from 'react';
import { Animated, View, Image, Easing } from 'react-native';
import { ref as sRef, getStorage, getDownloadURL } from "firebase/storage";

const Loading = (props) => {
  const sweepAnim = useRef(new Animated.Value(0)).current  // Initial value for opacity: 0
  const fadeAnim = useRef(new Animated.Value(1)).current  // Initial value for opacity: 0

  useEffect(() => {
    Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 100,
        easing: Easing.sin,
        duration: 2000,
        useNativeDriver: false
      })
    ).start();
  }, [sweepAnim])

  useEffect(() => {
    Animated.loop(
      Animated.timing(fadeAnim, {
        toValue: 0.1,
        duration: 2000,
        useNativeDriver: false
      })
    ).start();
  }, [sweepAnim])

  return (
    <View style={{ flexDirection: "row" }}>
      <Animated.View style={[{ flex: (1) }]} />
      <Animated.View style={[{ flex: sweepAnim, opacity: (fadeAnim), backgroundColor: props.color, height: 5 }]} />
      <Animated.View style={[{ flex: (1) }]} />
    </View>
  );
}

const LoadImage = (props) => {
  const [url, setUrl] = React.useState(require('../assets/profile.jpeg'));
  const storage = getStorage();
  const starsRef = sRef(storage, 'profiles/' + props.uid + '/profile.jpg');

  getDownloadURL(starsRef)
    .then((url) => {
      console.log("success");
      setUrl(url);
    })
    .catch((error) => {
      console.error(error);

    });

  var size = 40;
  if (props.size) size = props.size;

  return <Image
    style={[{ margin: 5, width: size, height: size, borderRadius: size }, props.style]}
    source={{ uri: url }} />;
}


function Row(props) {
  return (
    <View style={[props.style, { flexDirection: "row" }]}>
      {props.children}
    </View>
  );
}

function Col(props) {
  return (
    <View style={[props.style, { flexDirection: "column" }]}>
      {props.children}
    </View>
  );
}

export {
  LoadImage,
  Loading,
  Row,
  Col
}