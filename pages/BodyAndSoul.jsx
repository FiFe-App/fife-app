import { useEffect } from 'react';
import { useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useHover } from 'react-native-web-hooks';
import { useWindowDimensions } from 'react-native';
import styles from '../styles/bodyAndSoul'
import { MyText } from '../components/Components';

const list = [
  {
    title: 'Jóga',
    description: '',
    color: '#00ff9d'
  },
  {
    title: 'Safespace',
    description: '',
    color: '#b000ff'
  },
  {
    title: 'Kiszakadás',
    description: '',
    color: '#ffc600'
  },
  {
    title: 'Pszichológia',
    description: '',
    color: '#006eff'
  },
  {
    title: 'Relaxáció',
    description: '',
    color: '#ff4a00'
  }
]
const padding = {
  top: 450-100,
  left: 10
}

const fn = (ind) => {
  return -(Math.pow(ind,2) / 4)
}

const BodyAndSoul = () => {
    const sweepAnim = useRef(new Animated.Value(15)).current  // Initial value for opacity: 0
    const anim2 = useRef(new Animated.Value(40)).current  // Initial value for opacity: 0
    const width = useWindowDimensions().width
    console.log(width);
  
    useEffect(() => {
        Animated.loop(
        Animated.sequence([
          Animated.timing(sweepAnim, {
            toValue: 30,
            easing: Easing.bezier(0.45, 0, 0.55, 1),
            duration: 6500,
            useNativeDriver: false
          }),
          Animated.timing(sweepAnim, {
            toValue: 15,
            easing: Easing.bezier(0.45, 0, 0.55, 1),
            duration: 6500,
            useNativeDriver: false
          })]
        ))
        .start();
      }, [sweepAnim])

    return (
        <View style={styles.container}>
            { width > 900 && false &&
              list.map((el,ind,arr)=>{
                const x = (width/arr.length)*(ind)
                console.log(x)
                return (
                <Animated.View key={ind+'el'} style={[styles.circle,
                {padding:sweepAnim,left:x+padding.left,top:fn((x-width/2)/20)+padding.top,backgroundColor:el.color}]}>
                  <MyText style={[styles.text]}>{el.title}</MyText>
                </Animated.View>
                )
              })
            }
            <Animated.View style={[styles.titleAnimation,{paddingHorizontal:sweepAnim,paddingBottom:sweepAnim}]}>
                <MyText style={[styles.title]}>Test és Lélek</MyText>
            </Animated.View>
            {
              list.map((el,ind,arr)=>{
                const x = (width/arr.length)*(ind)
                const ref = useRef(null);
                const isHovered = useHover(ref);
                return (
                  <Animated.View key={ind+'el'} 
                  style={[{padding:Animated.divide(sweepAnim,anim2),
                  left:x+padding.left,alignSelf:'flex-start',backgroundColor:el.color}]}>
                    <MyText style={[styles.text]}>{el.title}</MyText>
                  </Animated.View>
                )
              })
            }
              {list.map((el,ind,arr)=>{
                return (
                  <MyText key={ind+'el'}>{el.title}</MyText>
                )
              })}
        </View>
    )
}

export default BodyAndSoul;