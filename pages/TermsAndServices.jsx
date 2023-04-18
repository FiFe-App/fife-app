/* eslint-disable react/no-unescaped-entities */
import { ScrollView, View } from "react-native"
import { MyText } from "../components/Components";

const TermsAndServices = () => {
    return (<>
    
    <View>
        <ScrollView contentContainerStyle={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#fdf8de'}}>
            <View style={{width:'70%',minWidth:500,margin:50,backgroundColor:'#fff',paddingVertical:8,paddingHorizontal:50}}>
                <MyText style={{fontSize:24,marginTop:32}}>Website Terms and Conditions of Use</MyText>

                <MyText style={{fontSize:20,marginTop:32}}>1. Terms</MyText>

                <MyText>By accessing this Website, accessible from fifeapp.hu, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site. The materials contained in this Website are protected by copyright and trade mark law.</MyText>

                <MyText style={{fontSize:20,marginTop:32}}>2. Use License</MyText>

                <MyText>Permission is granted to temporarily download one copy of the materials on fifeapp.hu's Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</MyText>

                <ul>
                    <li>modify or copy the materials;</li>
                    <li>use the materials for any commercial purpose or for any public display;</li>
                    <li>attempt to reverse engineer any software contained on fifeapp.hu's Website;</li>
                    <li>remove any copyright or other proprietary notations from the materials; or</li>
                    <li>transferring the materials to another person or "mirror" the materials on any other server.</li>
                </ul>

                <MyText>This will let fifeapp.hu to terminate upon violations of any of these restrictions. Upon termination, your viewing right will also be terminated and you should destroy any downloaded materials in your possession whether it is printed or electronic format. These Terms of Service has been created with the help of the <a href="https://www.termsofservicegenerator.net">Terms Of Service Generator</a>.</MyText>

                <MyText style={{fontSize:20,marginTop:32}}>3. Disclaimer</MyText>

                <MyText>All the materials on fifeapp.hu’s Website are provided "as is". fifeapp.hu makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, fifeapp.hu does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites linked to this Website.</MyText>

                <MyText style={{fontSize:20,marginTop:32}}>4. Limitations</MyText>

                <MyText>fifeapp.hu or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on fifeapp.hu’s Website, even if fifeapp.hu or an authorize representative of this Website has been notified, orally or written, of the possibility of such damage. Some jurisdiction does not allow limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply to you.</MyText>

                <MyText style={{fontSize:20,marginTop:32}}>5. Revisions and Errata</MyText>

                <MyText>The materials appearing on fifeapp.hu’s Website may include technical, typographical, or photographic errors. fifeapp.hu will not promise that any of the materials in this Website are accurate, complete, or current. fifeapp.hu may change the materials contained on its Website at any time without notice. fifeapp.hu does not make any commitment to update the materials.</MyText>

                <MyText style={{fontSize:20,marginTop:32}}>6. Links</MyText>

                <MyText>fifeapp.hu has not reviewed all of the sites linked to its Website and is not responsible for the contents of any such linked site. The presence of any link does not imply endorsement by fifeapp.hu of the site. The use of any linked website is at the user’s own risk.</MyText>

                <MyText style={{fontSize:20,marginTop:32}}>7. Site Terms of Use Modifications</MyText>

                <MyText>fifeapp.hu may revise these Terms of Use for its Website at any time without prior notice. By using this Website, you are agreeing to be bound by the current version of these Terms and Conditions of Use.</MyText>

                <MyText style={{fontSize:20,marginTop:32}}>8. Your Privacy</MyText>

                <MyText>Please read our Privacy Policy.</MyText>

                <MyText style={{fontSize:20,marginTop:32}}>9. Governing Law</MyText>

                <MyText>Any claim related to fifeapp.hu's Website shall be governed by the laws of hu without regards to its conflict of law provisions.</MyText>

            </View>
        </ScrollView>
    </View>
    </>)
}

export default TermsAndServices;