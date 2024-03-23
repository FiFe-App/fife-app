import { Auto, B, Col, getNameOf, MyText, NewButton, Popup, ProfileImage, Row, TextInput } from '../../components/Components';

import Loading from '../../components/Loading';
import { child, get, getDatabase, onValue, push, ref, set } from 'firebase/database';

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import styles from '../../styles/profileDesign';
import Icon from '@expo/vector-icons/Ionicons';

import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase/firebase';

import axios from 'axios';
import { useWindowDimensions } from 'react-native';
import { config } from '../../firebase/authConfig';
import { SaleListItem } from '../sale/SaleListItem';

import GoBack from '../../components/Goback';
import { useHover } from 'react-native-web-hooks';
import HelpModal from '../../components/help/Modal';
import BasePage from '../../components/BasePage'
import { getAuth } from 'firebase/auth';
import { listToMatrix } from '../../lib/functions';
import BuzinessModal from '../../components/BuzinessModal';
import { removeUnreadMessage, setSettings as setStoreSettings, setTempData, setUnreadMessage } from '../../lib/userReducer';
import { Link, useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Helmet } from 'react-helmet';
import MapElement from '../maps/MapElementNew';
import { useErrorBoundary } from 'react-error-boundary';
import Error from '../../components/tools/Error';
import BuzinessItem from '../buziness/BuzinessItem';
import { categories } from '../../lib/categories';
import CustomInput from '../../components/custom/CustomInput';
import ProfileItem from '../../components/items/ProfileItem';

const bgColor = '#FCF3D4'//'#ffd581dd'

const Profile = () => {
	const { showBoundary } = useErrorBoundary();

	const {database, api} = useContext(FirebaseContext);
	const dispatch = useDispatch()
	const { width } = useWindowDimensions();
	const small = width <= 900;
	const router = useRouter();
	const params = useLocalSearchParams();
	const navigaton = useNavigation();

	const myuid = useSelector((state) => state.user.uid)
	const myName = useSelector((state) => state.user.name)
	const tempData = useSelector((state) => state.user.tempData)
	const uid = params?.uid ||params?.id || myuid 
	const myProfile = uid === myuid;
  
	const [profile, setProfile] = React.useState(myProfile ? tempData : null);
	const [selected, setSelected] = useState(params?.tab || 0);
	const [saleList, setSaleList] = React.useState([]);
	const maxSaleWidth = width > 1200 ? 6 : (width < 500 ? (width < 350 ? 2 : 3) : 4)
	const [followButtonState, setFollowButtonState] = React.useState(false);
	const [followers, setFollowers] = React.useState([]);
	const [rates, setRates] = useState([]);
	const [reportOpen, setReportOpen] = useState(false);
	const [reportData, setReportData] = useState({
		uid:uid,
		message:null
	});

	useEffect(() => {
		if (selected != params?.tab)
		router.setParams({tab:selected})
	}, [selected]);


	const report = (data) => {
		console.log(reportData);
		console.log(getAuth())
		push(ref(database,`report/${myuid}`),reportData).then(()=>{
			setReportOpen(false);
			setReportData({
				uid:uid,
				message:''
			})
		})
	}

	const follow = async () => {
		if (!followButtonState) {
			const res = await axios.post('users/friend/'+uid,undefined,config())
			if (!res.data?.error)
				setFollowButtonState(!followButtonState);

		} else {
			const res = await axios.delete('users/friend/'+uid,config())
			if (!res.data?.error)
				setFollowButtonState(!followButtonState);

		}
	}

	useFocusEffect(
		useCallback(() => {
			if (database) {
				//hulyr vagy 
				// if (!profile)
				axios.get(`users/all/${uid}`,config()).then((res) => {
					console.log('getDAta',res);
					if (res.data) {
						if (myuid == uid)
							dispatch(setTempData(res.data))

						getFollowers(res.data?.friendship)
            
						var data = res.data;
						//navigaton.setOptions({ title: 'Profil: '+data.name })

						setProfile(data);
					} else {
						if (myuid == uid)
							router.push('profil-szerkesztese')
					}
				}).catch((error) => {
					console.error('getDataError',error);
					if (myuid == uid && error.message=='Not found')
						router.push('profil-szerkesztese')
					else setProfile({error})
					
				});
			}
			axios.get('/sale',{...config(),params: {
				author: uid,
				category: -1
			}}).then(res=>{
				setSaleList(res.data)
			}).catch(err=>{
				if (err?.response?.data == 'Token expired') {
					console.log('Token expired');
					api.logout();
					return
				}
			})
		}, [uid])
	);

	const getFollowers = async (friends) => {



		const flls = await Promise.all(friends.map(async (e)=>{
			if (e.uid == myuid || e.uid2 == myuid) setFollowButtonState(true)

			const u = e.uid == uid ?
				e.uid2 : e.uid
			const name = await getNameOf(u)
        
			return {uid:u,name}
		}))
		console.log('flls',flls);

		setFollowers(
			flls
		)
	}

	useEffect(() => {
		console.log('profile',profile);
	}, [profile]);


    const [settings, setSettings] = useState(useSelector((state) => state.user.settings));

    const [filterModal, setFilterModal] = useState(null);
    const [filter, setFilter] = useState([]);



    useFocusEffect(
		useCallback(() => {
		  const filterRef = ref(getDatabase(),'/users/'+uid+'/settings/homeFilter')
		  get(filterRef).then(snapshot=>{
			if (snapshot.exists())
			setFilter(snapshot.val())
			else 
			setFilter({
			  newPeople: true,
			  news: true,
			  places: true,
			  saleSeek: true,
			  saleGive: true,
			  rentSeek: true,
			  rentGive: true,
			  workSeek: true,
			  workGive: true,
			  
			})
		  }).catch(err=>{
			setFilter({
			  sale: true,
			  work: true,
			  rent: false,
			  places: true
			})
			
		  }).finally(()=>{
			setFilterModal(false)
		  })
  
		}, [])
	  );

    useEffect(() => {
        if (uid) {
            if (database && settings) {
                const dbRef = ref(database,'users/' + uid + '/settings/snowfall');
                set(dbRef,settings?.snowfall||false)
                dispatch(setStoreSettings (settings))
                
            }
        }
    }, [settings]);

    const save = () => {
		const saveRef = ref(getDatabase(),'users/'+uid+'/settings/homeFilter')
		set(saveRef,filter).then(()=>{
		  setFilterModal(false)
		})
	  }

	console.log(profile);
	if (profile?.error) return <BasePage>
		<Error text={profile.error.message}/>
	</BasePage>
	if (profile)
		return(
			<>	
				<BasePage full style={{padding:0}}>
					<Auto flex={0}>
						<View style={[localStyles.container,{width:150,paddingLeft:0,marginLeft:5,alignSelf:'center'}]}>
							<ProfileImage modal uid={uid} size={150} style={[{paddingHorizontal:0,borderRadius:8}]}/>
						</View>
						<View style={{flex:width <= 900 ? undefined : 2,zIndex:10,elevation: 10}}>
							<View style={[localStyles.fcontainer,{marginLeft:5}]}>
								<MyText style={localStyles.text}>{profile.name} <MyText light>{profile?.title}</MyText></MyText>
							</View>
							<Row style={{flex:width <= 900 ? undefined : 1}}>
								{profile.username && <View style={[localStyles.fcontainer,{marginLeft:5}]}><MyText style={localStyles.text}>{profile.username}</MyText></View>}
							</Row>
						</View>
						{false && <View>
							{ !myProfile && <Auto breakPoint={500}>
								<Col style={{flex:small?3:1}}>
									<NewButton onPress={() => router.push('uzenetek',{uid})}
										title="Üzenetküldés" color='#ffde7e'
										style={[localStyles.containerNoBg, {flex:width <= 900 ? undefined : 1,alignItems:'center' ,shadowOpacity:0.5,marginLeft:5}]}
									/>
									<NewButton onPress={follow}
										title={(followButtonState ? 'Már a pajtásom ' : 'Legyen a pajtásom ')+profile.name}
										color={!followButtonState ? '#ffde7e' : '#fff6dc'}
										style={[localStyles.containerNoBg, {flex:width <= 900 ? undefined : 1,alignItems:'center',shadowOpacity:0.5,marginLeft:5}]}
									/>
								</Col>
								<View>
									<NewButton onPress={()=>setReportOpen(true)}
										title={<Icon name='alert-circle-outline' size={50} style={{}}/>} color={'#ffde7e'}
										style={[localStyles.containerNoBg, {flex:1,alignItems:'center',shadowOpacity:0.5,height:'80%',maxWidth:small?'none':100,marginLeft:0}]}
									/>
								</View>
							</Auto>}
							{myProfile &&
								<NewButton onPress={() => router.push('profil-szerkesztese')}
									title="Módosítás"
									style={[localStyles.containerNoBg, {alignItems:'center',flex:1,shadowOpacity:0.5,height:20,marginLeft:5}]}
								/>
							}
						</View>}
					</Auto>
					<Row>
						<NewButton title="Adataim" color={selected!=0?'#ffffff90':undefined} onPress={()=>setSelected(0)} style={{borderBottomLeftRadius:0,borderBottomRightRadius:0,marginBottom:0}}/>
						<NewButton title="Bizniszeim" color={selected!=1?'#ffffff90':undefined} onPress={()=>setSelected(1)} style={{borderBottomLeftRadius:0,borderBottomRightRadius:0,marginBottom:0}}/>
						<NewButton title="Cserebere" color={selected!=2?'#ffffff90':undefined} onPress={()=>setSelected(2)} style={{borderBottomLeftRadius:0,borderBottomRightRadius:0,marginBottom:0}}/>
						<NewButton title={'Pajtásaim ('+followers.length+')'} color={selected!=3?'#ffffff90':undefined} onPress={()=>setSelected(3)} style={{borderBottomLeftRadius:0,borderBottomRightRadius:0,marginBottom:0}}/>
						{myProfile && <NewButton title="Beállítások" color={selected!=4?'#ffffff90':undefined} onPress={()=>setSelected(4)} style={{borderBottomLeftRadius:0,borderBottomRightRadius:0,marginBottom:0}}/>}
						
					</Row>
					<View style={{backgroundColor:'#ffffff00'}} >
						{selected==0&&<View style={{flex:width > 900 ? undefined : 1,backgroundColor:''}}>

							<Auto>
							
								<Section flex={width <= 900 ? 'none' : 2} >
									<MyText size={16} bold style={{marginTop:16}}>Publikus elérhetőségeim</MyText>
									<View style={{paddingLeft:16}}>
										<Auto style={{gap:8}} breakPoint={1100}>
											<View>
												<MyText>Email</MyText>
												<TextInput
													style={{fontSize:17,padding:10,margin:0,backgroundColor:'white',borderRadius:8}}
													placeholder="fifeapp@gmail.com"
													value={profile.email}
													disabled={!myProfile}
												/>
											</View>
											<View>
												<MyText>Telefonszám</MyText>
												<TextInput
													style={{fontSize:17,padding:10,margin:0,backgroundColor:'white',borderRadius:8}}
													placeholder="0620123456789"
													disabled={!myProfile}
													value={profile.email}
												/>
											</View>
										</Auto>
										<MyText>Egyéb fontos linkek</MyText>
										<View>
											{(profile?.linkList||['']).map((e,i)=><TextInput key={'link'+i}
												style={{fontSize:17,padding:10,margin:0,backgroundColor:'white',borderRadius:8}}
												placeholder="instagram.com/fifeapp"
												value={e}
												disabled={!myProfile}
												onChangeText={(text)=>setProfile({linkList:(profile?.linkList||['']).map((l,li)=>i==li?text:l),...profile})}
											/>)}
										</View>
									</View>
									{myProfile && <View>
										<MyText size={16} bold style={{marginTop:16}}>Hozzáférési adatok</MyText>
										<MyText>kristofakos1229@gmail.com</MyText>
										<Row>
											<NewButton title="Email megváltoztatása"/>
											<NewButton title="Jelszó megváltoztatása"/>
										</Row>
									</View>}
								</Section>
								<Section title="Helyzetem" flex={width <= 900 ? 'none' : 2}>
									{/* eslint-disable-next-line no-constant-condition*/}
									{profile?.page?.location?.length ? (
										<MapElement style={{flex: width > 900 ? undefined : 1,height:300,width:'100%'}} data={profile?.page} index='1'/>)
										: <View style={{justifyContent:'center',alignItems:'center'}}>
											<MyText style={localStyles.subText}>Nincs megadva helyzeted</MyText>
										</View>
									}
								</Section>
							</Auto>
						</View>}
						{selected==1&&<View style={{flex:(width <= 900 ? undefined : 1)}}>

							<Section title="Bizniszeim" link={myProfile?"Új feltöltése":null} flex={1} onPress={()=>router.push('biznisz/uj')}>
								<Row style={{marginLeft:small?5:20,gap:16}}>
									{profile.page?.buziness && profile.page.buziness.map((prof,i,arr) =>
										<BuzinessItem data={prof} key={i+'prof'} />
									)}
								</Row>
							</Section>
						</View>}
						{selected==2 && 
						<Section title="Cserebere" link={myProfile?"Új feltöltése":null} flex={1} onPress={()=>router.push('cserebere/uj')}>
								{listToMatrix(saleList,maxSaleWidth).map((row,i)=>{
									return (
										<Row key={'sale'+i}>
											{row.map((el,ind,rowL)=>
												<SaleListItem key={el._id} data={el} editable={myProfile}/>
											)}
											<View style={{flex:maxSaleWidth-row.length}}/>
										</Row>
									)
								})}
						</Section>}
						{selected==3 && <Section title={'Pajtásaim'}>
							<MyText>Ők azok, akik <B>{profile.name}t</B> megbízhatónak jelölték. <Link href={'cikk'} style={{color:'#fd8900'}}>Kik is azok a pajtások?</Link></MyText>
							<Row style={{flexWrap:'wrap',marginTop:16}}>
								{followers.map((f,i)=>
									<ProfileItem key={'follower'+i} uid={f.uid} height={200}/>
								)}
							</Row>
						</Section> }
						{selected==4 && <Section title={"Mi érdekel?"}>
							{<ScrollView style={{maxWidth:300}}>
								{[
								{type:'checkbox',attribute:'snowfall',label:'Hóesés',data:settings,setData:setSettings},
								...categories.options.reduce((r, e) => r.push(
								{type:'checkbox',attribute:e.key,label:e.name,data:filter,setData:setFilter},  
								{type:'null',attribute:e.key+'key',placeholder:'kulcs',data:filter,setData:setFilter,render:e.key,style:{marginBottom:16}},
								) && r, [])].map((input,ind)=>{
									return (
										<View style={{padding:0}} key={'helpModal-'+ind}>
											<CustomInput {...input} style={[{padding:10},input.style]}/>
										</View>
									)
								})}
							</ScrollView>}
						</Section> }
					</View>
				</BasePage>
				<HelpModal 
					title="Valami nem okés?"
					text={`Ha ${profile.name} nem az irányelveinknek megfelelően viselkedett veled, vagy a profilja kifogásolható, fejtsd ki, hogy mi történt vagy mi nem felel meg a profiljában. Majd a JELENTÉS gombra kattintva elküldheted nekünk a panaszod.`}
					actions={[
						{title:'mégse',onPress:()=>setReportOpen(false)},
						{title:'jelent',onPress:report,color:'#ff462b'}
					]}
					open={reportOpen}
					setOpen={setReportOpen}
					inputs={[
						{type:'text-input',attribute:'message',label:null,data:reportData,setData:setReportData,style:{backgroundColor:'#fbf1e0'}}
					]}
				/></>
		)
	else return (<View style={{backgroundColor:bgColor,flex:1}}><Loading color={'#fff'}/></View>)
}

function Section(props){
	const { width } = useWindowDimensions();
	const small = width <= 900;
	console.log(props?.link);
	return(
		<View style={[props.style,localStyles.container,{flex:props?.flex,padding:small?5:20,marginLeft:5}]}>
			{props?.title && <Row style={[{height:50}]}>
				<MyText style={localStyles.sectionText}>{props.title}</MyText>
				{props?.link && <NewButton title={props?.link} onPress={props?.onPress} style={{marginTop:0,marginLeft:16,height:'auto'}}/> }
			</Row>}
			<Animated.View style={[{ paddingHorizontal:0, flex: props?.flex, height: props.height ,width:'100%'}]} >
				{props?.children}
			</Animated.View>
		</View>
	);
}

const Buziness = ({prof,uid,index,arr}) => {
	const { width } = useWindowDimensions();
	const small = width < 500;
	const db = getDatabase()
	const myuid = useSelector((state) => state.user.uid)
	const [rate,setRate] = useState([]);
	const iRated = rate?.find(e=>e==myuid);
	const allRates = (rate?.filter(r=>r!=myuid)?.length+iRated ? 1 : 0);

	const isHovered = useHover(ref);

	useEffect(() => {
		get(ref(db,'users/'+uid+'/data/profession/'+index+'/rate')).then(res=>{
			setRate(res.exists() ? Object.keys(res.val()): [])
		})
      
	}, []);
    
	const handlePress=()=>{
      
		set(ref(db,'users/'+uid+'/data/profession/'+index+'/rate/'+myuid),
			iRated ? null : true)
			.then(res=>{
				iRated ?
					setRate(rate?.filter(r=>r!=myuid))
					: setRate([...rate,myuid]) 
			})
	}

	const [buzinessModal, setBuzinessModal] = useState(null);
	const getDownToBuziness = () => {
		setBuzinessModal({
			index
		});
	}
    
	if (prof)
		return (<>
			<Auto 
				breakPoint={500}
				style={[
					styles.buziness,
					{//backgroundColor:`hsl(52, 100%, ${100-(allRates*10)}%)`,
						backgroundColor:'#ffffff'
					},
					isHovered && {backgroundColor:'#faffcc'}
				]}>
				<View style={{flex:small?undefined:3,order:small?1:0,flexGrow:1}} key={index+'prof_title'}>
					<MyText title>{prof.name}</MyText>
					<MyText>{prof.description}</MyText>
					<MyText>{allRates} ember ajánlja</MyText>
				</View>
				<Row style={{justifyContent:'center',alignItems:'center'}} key={index+'prof_number'}
					breakPoint={500}>
					{uid != myuid && <View> 
						<NewButton title={iRated ? 'Ajánlottam' :'Ajánlom'} color={iRated?'#fff6dc':undefined} style={{padding:10,borderRadius:8,alignSelf:'center'}} onPress={handlePress}/>
						<NewButton title={'Bizniszelnék'} color="#ffffff" style={{padding:10,borderRadius:8,alignSelf:'center'}} onPress={()=>getDownToBuziness()}/>
					</View>}
				</Row>
			</Auto>
			<BuzinessModal open={buzinessModal} setOpen={setBuzinessModal} user1={myuid} user2={uid} b2={arr} />
		</>
		)
}

const localStyles = {
	fcontainer: {
		flex:1,
		marginTop: 5,
		marginLeft: 5,
		backgroundColor:'#ffffff90',
		paddingHorizontal:15,
		justifyContent:'center', 
		zIndex:'auto', 
		borderRadius:8
	},
	container: {
		marginTop: 5,
		marginLeft: 5,
		paddingHorizontal:15,
		paddingTop:0,
		alignItems:'flex-start',
		justifyContent:'flex-start',
		zIndex:'auto' ,
		borderRadius:8
	},
	containerNoBg: {

		marginTop: 5,
		marginLeft: 5,
		paddingHorizontal:5,
		justifyContent:'flex-start',
		zIndex:'auto' ,
		borderRadius:8
	},
	text:{
		fontWeight: 'bold',
		fontSize: 20,
		color: 'black',
		paddingVertical: 8,
	},
	subText: {
	},
	verticleLine: {
		width: 1,
		backgroundColor: '#909090',
	},
	horizontalLine: {
		height: 1,
		backgroundColor: '#909090',
	},
	section:{
		height: 50,
		justifyContent: 'center',
		paddingHorizontal:20,
		backgroundColor: 'rgb(245, 209, 66)',
		borderColor: bgColor,
		marginTop: 5,
		marginLeft: 5,
      
	},
	sectionText:{
		fontWeight: 'bold',
		fontSize:18,

	},
	map: {
		flex:1
	},
}

export default Profile