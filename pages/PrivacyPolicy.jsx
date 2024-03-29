/* eslint-disable react/no-unknown-property */
/* eslint-disable react/no-unescaped-entities */
import { Helmet } from "react-helmet";
import { MyText } from "../components/Components";
import { View, ScrollView } from "react-native";

const PrivacyPolicy = () => {
    return (<>
    <Helmet>
        <title>Fife app</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
    
        <meta content='Nem csak fiataloknak és nem csak felnőtteknek' name='description' ng-if='metadata.description'/>
        <meta content='hu_HU' property='og:locale'/>
        <meta content='483654622684731' ng-if='og_meta.app_id' property='fb:app_id'/>
        <meta content='website' ng-if='og_meta.type' property='og:type'/>
        <meta content='https://fifeapp.hu/adatkezeles' ng-if='og_meta.url' property='og:url'/>
        <meta content='fife app' ng-if='og_meta.title' property='og:title'/>
        <meta content='https://fifeapp.hu/media/fifelogo512.jpg'  ng-if='og_meta.image' property='og:image'/>
        <meta content='512' ng-if='og_meta.image_width' property='og:image:width'/>
        <meta content='512' ng-if='og_meta.image_height' property='og:image:height'/>
        <meta content='Nem csak fiataloknak és nem csak felnőtteknek' ng-if='og_meta.description' property='og:description'/>
        <meta content='fifeApp' property='og:site_name' />
        
    </Helmet>
    
    <View>
        <ScrollView contentContainerStyle={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#fdf8de'}}>
            <View style={{width:'70%',minWidth:500,margin:50,backgroundColor:'#fff',paddingVertical:8,paddingHorizontal:50}}>
                <MyText style={{fontSize:24,marginTop:32}}>Privacy Policy for fifeapp.hu</MyText>
        
                <MyText>At fife app, accessible from fifeapp.hu, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by fife app and how we use it.</MyText>
        
                <MyText>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.</MyText>
        
                <MyText>This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in fife app. This policy is not applicable to any information collected offline or via channels other than this website. Our Privacy Policy was created with the help of the <a href="https://www.privacypolicygenerator.info">Free Privacy Policy Generator</a>.</MyText>
        
                <MyText style={{fontSize:17,marginTop:32}}>Consent</MyText>
        
                <MyText>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</MyText>
        
                <MyText style={{fontSize:17,marginTop:32}}>Information we collect</MyText>
        
                <MyText>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</MyText>
                <MyText>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</MyText>
                <MyText>When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</MyText>
        
                <MyText style={{fontSize:17,marginTop:32}}>How we use your information</MyText>
        
                <MyText>We use the information we collect in various ways, including to:</MyText>
        
                <ul>
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our website</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                <li>Send you emails</li>
                <li>Find and prevent fraud</li>
                </ul>
        
                <MyText style={{fontSize:17,marginTop:32}}>Log Files</MyText>
        
                <MyText>fife app follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.</MyText>
        
                <MyText style={{fontSize:17,marginTop:32}}>Cookies and Web Beacons</MyText>
        
                <MyText>Like any other website, fife app uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</MyText>
        
                <MyText>For more general information on cookies, please read <a href="https://www.generateprivacypolicy.com/#cookies">"Cookies" article from the Privacy Policy Generator</a>.</MyText>
        
        
        
                <MyText style={{fontSize:17,marginTop:32}}>Advertising Partners Privacy Policies</MyText>
        
                <MyText>You may consult this list to find the Privacy Policy for each of the advertising partners of fife app.</MyText>
        
                <MyText>Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on fife app, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.</MyText>
        
                <MyText>Note that fife app has no access to or control over these cookies that are used by third-party advertisers.</MyText>
        
                <MyText style={{fontSize:17,marginTop:32}}>Third Party Privacy Policies</MyText>
        
                <MyText>fife app's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options. </MyText>
        
                <MyText>You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.</MyText>
        
                <MyText style={{fontSize:17,marginTop:32}}>CCPA Privacy Rights (Do Not Sell My Personal Information)</MyText>
        
                <MyText>Under the CCPA, among other rights, California consumers have the right to:</MyText>
                <MyText>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</MyText>
                <MyText>Request that a business delete any personal data about the consumer that a business has collected.</MyText>
                <MyText>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</MyText>
                <MyText>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</MyText>
        
                <MyText style={{fontSize:17,marginTop:32}}>GDPR Data Protection Rights</MyText>
        
                <MyText>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</MyText>
                <MyText>The right to access – You have the right to request copies of your personal data. We may charge you a small fee for this service.</MyText>
                <MyText>The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</MyText>
                <MyText>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</MyText>
                <MyText>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</MyText>
                <MyText>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</MyText>
                <MyText>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</MyText>
                <MyText>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</MyText>
        
                <MyText style={{fontSize:17,marginTop:32}}>Children's Information</MyText>
        
                <MyText>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</MyText>
        
                <MyText>fife app does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</MyText>
            </View>
        </ScrollView>
    </View>
    </>)
}

export default PrivacyPolicy;