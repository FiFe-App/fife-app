import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView } from "react-native"
import { useWindowSize } from "../../hooks/window";
import { Pages } from "../first/pages"

export default () => {
    const navigation = useNavigation()
    const route = useRoute()
    const width = useWindowSize().width;
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