import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, useWindowDimensions } from "react-native"
import { Pages } from "../first/pages"

export default () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { width } = useWindowDimensions();
    const [page, setPage] = useState(route.params?.p || 0);
    const [newData, setNewData] = useState({
      name: '',
      username: '',
      bio: '',
      profession: [],
      links: [],
    });
    const [scrollView, setScrollView] = useState(null);
    const [pageData, setPageData] = useState(null);
    const [backDisabled, setBackDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(false);
    const pages = Pages({newData, setNewData,pageData, setPageData});


    return( 
        <ScrollView horizontal
            ref={ref=>{setScrollView(ref)}}
            pagingEnabled={true}
            scrollsToTop={false}
            scrollEventThrottle={100}
            automaticallyAdjustContentInsets={false}
            directionalLockEnabled={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            {pages}
        </ScrollView>
    )
}