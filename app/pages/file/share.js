import { Layout, Empty} from "@arco-design/web-react"
import Head from "next/head";
import SideMenu from "../../components/SideMenu";

import {menuConfig} from "../../config/config.js"

const Sider = Layout.Sider;
const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;



export default function FileManager(){
    console.log(menuConfig);
    return (
        <>
            <Head>
                <title>Classy| 我的分享</title>
            </Head>
            <Layout>
                <Sider style={{minHeight: "100vh"}}>
                    <SideMenu menuConfig={menuConfig} defaultKey="my_share"/>
                </Sider>
                <Content style={{marginTop: '100px'}}>
                    <Empty/>
                </Content>
            </Layout>
        </>
    
    )
}